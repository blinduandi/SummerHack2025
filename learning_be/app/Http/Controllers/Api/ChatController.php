<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendMessageRequest;
use App\Http\Resources\ChatMessageResource;
use App\Models\ChatMessage;
use App\Models\Course;
use App\Models\CourseStep;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use OpenAI;
use Exception;

class ChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = ChatMessage::where('user_id', $request->user()->id)
            ->with(['course', 'user'])
            ->latest()
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => ChatMessageResource::collection($messages)
        ]);
    }

    public function getCourseChat(Request $request, Course $course): JsonResponse
    {
        $messages = ChatMessage::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->with(['course', 'user'])
            ->latest()
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data' => ChatMessageResource::collection($messages)
        ]);
    }

    public function sendMessage(SendMessageRequest $request, Course $course = null): JsonResponse
    {
        // Create user message
        $userMessage = ChatMessage::create([
            'user_id' => $request->user()->id,
            'course_id' => $course?->id,
            'sender_type' => 'user',
            'message' => $request->validated('message'),
            'context_data' => $request->validated('context_data'),
        ]);

        // Generate AI bot response using OpenAI
        $botResponse = $this->generateOpenAIResponse(
            $request->validated('message'),
            $course,
            $request->validated('context_data'),
            $request->user()
        );

        $botMessage = ChatMessage::create([
            'user_id' => $request->user()->id,
            'course_id' => $course?->id,
            'sender_type' => 'bot',
            'message' => $botResponse,
            'context_data' => [
                'response_to' => $userMessage->id,
                'generated_at' => now()->toISOString(),
                'ai_model' => config('openai.model'),
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Message sent successfully',
            'data' => [
                'user_message' => new ChatMessageResource($userMessage),
                'bot_response' => new ChatMessageResource($botMessage)
            ]
        ], 201);
    }

    public function markAsHelpful(Request $request, ChatMessage $message): JsonResponse
    {
        // Ensure user can only rate their own chat messages
        if ($message->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $request->validate([
            'is_helpful' => 'required|boolean'
        ]);

        $message->markAsHelpful($request->is_helpful);

        return response()->json([
            'success' => true,
            'message' => 'Feedback recorded successfully',
            'data' => new ChatMessageResource($message->fresh())
        ]);
    }

    private function generateOpenAIResponse(string $userMessage, ?Course $course, ?array $context, $user): string
    {
        try {
            // Initialize OpenAI client
            $client = OpenAI::client(config('openai.api_key'));

            // Build context for better responses
            $systemMessage = $this->buildSystemPrompt($course, $user);
            $contextMessage = $this->buildContextMessage($context, $course);

            $messages = [
                ['role' => 'system', 'content' => $systemMessage],
            ];

            if ($contextMessage) {
                $messages[] = ['role' => 'system', 'content' => $contextMessage];
            }

            $messages[] = ['role' => 'user', 'content' => $userMessage];

            // Make API call to OpenAI
            $response = $client->chat()->create([
                'model' => config('openai.model'),
                'messages' => $messages,
                'max_tokens' => config('openai.chat.max_tokens'),
                'temperature' => config('openai.chat.temperature'),
                'top_p' => config('openai.chat.top_p'),
                'frequency_penalty' => config('openai.chat.frequency_penalty'),
                'presence_penalty' => config('openai.chat.presence_penalty'),
            ]);

            return trim($response->choices[0]->message->content);

        } catch (Exception $e) {
            // Fallback to rule-based response if OpenAI fails
            Log::error('OpenAI API Error: ' . $e->getMessage());
            return $this->generateFallbackResponse($userMessage, $course, $context, $user);
        }
    }

    private function buildSystemPrompt(?Course $course, $user): string
    {
        $prompt = "You are a helpful AI programming tutor for a learning platform. ";
        
        if ($course) {
            $prompt .= "You're currently helping with the course '{$course->title}' ";
            if ($course->description) {
                $prompt .= "which is about: {$course->description}. ";
            }
        }
        
        $prompt .= "Your role is to:\n";
        $prompt .= "- Help students understand programming concepts\n";
        $prompt .= "- Debug code issues and explain errors\n";
        $prompt .= "- Provide clear, beginner-friendly explanations\n";
        $prompt .= "- Encourage learning and practice\n";
        $prompt .= "- Give specific, actionable advice\n\n";
        $prompt .= "Keep responses concise but helpful. Use examples when appropriate. ";
        $prompt .= "If you see code or error messages, focus on explaining the issue and how to fix it.";

        return $prompt;
    }

    private function buildContextMessage(?array $context, ?Course $course): ?string
    {
        if (!$context) {
            return null;
        }

        $contextParts = [];

        if (isset($context['step_id'])) {
            $step = CourseStep::find($context['step_id']);
            if ($step) {
                $contextParts[] = "Student is currently working on step: '{$step->title}' ({$step->step_type})";
            }
        }

        if (isset($context['code_snippet'])) {
            $contextParts[] = "Student's code snippet:\n```\n{$context['code_snippet']}\n```";
        }

        if (isset($context['error_message'])) {
            $contextParts[] = "Error message: {$context['error_message']}";
        }

        if (isset($context['user_level'])) {
            $contextParts[] = "Student's level: {$context['user_level']}";
        }

        if (isset($context['topic'])) {
            $contextParts[] = "Current topic: {$context['topic']}";
        }

        if (isset($context['difficulty'])) {
            $contextParts[] = "Difficulty area: {$context['difficulty']}";
        }

        return empty($contextParts) ? null : "Additional context:\n" . implode("\n", $contextParts);
    }

    private function generateFallbackResponse(string $userMessage, ?Course $course, ?array $context, $user): string
    {
        $lowerMessage = strtolower($userMessage);

        // Handle code-related questions
        if (isset($context['code_snippet']) || str_contains($lowerMessage, 'code') || str_contains($lowerMessage, 'syntax')) {
            return "I can see you're working with code. Here are some general tips:\n\n" .
                   "1. Check your syntax carefully - missing semicolons and brackets are common\n" .
                   "2. Make sure variable names are spelled correctly\n" .
                   "3. Test your code step by step\n" .
                   "4. Use console.log() to debug what your variables contain\n\n" .
                   "If you can share your specific error message, I can help you debug it!";
        }

        // Handle error questions
        if (isset($context['error_message']) || str_contains($lowerMessage, 'error') || str_contains($lowerMessage, 'bug')) {
            return "I see you're encountering an error. Here's how to approach debugging:\n\n" .
                   "1. Read the error message carefully - it usually tells you what's wrong\n" .
                   "2. Check the line number mentioned in the error\n" .
                   "3. Look for typos in variable names or missing punctuation\n" .
                   "4. Try running simpler parts of your code to isolate the problem\n\n" .
                   "Can you share the exact error message you're seeing?";
        }

        // Handle greetings
        if (str_contains($lowerMessage, 'hello') || str_contains($lowerMessage, 'hi') || str_contains($lowerMessage, 'help')) {
            $response = "Hello! I'm your AI programming tutor. I'm here to help you learn and debug code. ";
            if ($course) {
                $response .= "I see you're working on {$course->title} - great choice! ";
            }
            $response .= "Feel free to ask me about:\n\n";
            $response .= "• Programming concepts and explanations\n";
            $response .= "• Code debugging and error messages\n";
            $response .= "• Best practices and tips\n";
            $response .= "• Course progress and next steps\n\n";
            $response .= "What can I help you with today?";
            return $response;
        }

        // Default response
        return "I'm here to help with your programming journey! " .
               "You can ask me about code, debugging, concepts, or anything related to your learning. " .
               "What specific question do you have?";
    }
}
