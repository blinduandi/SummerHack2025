<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OngProject;
use App\Models\OngProjectApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\TelegramBotService;

class OngProjectController extends Controller
{
    protected TelegramBotService $telegram;

    public function __construct(TelegramBotService $telegram)
    {
        $this->telegram = $telegram;
    }

    // ONG creates a new project post
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isOng()) {
            return response()->json(['success' => false, 'message' => 'Only ONG organizations can create projects.'], 403);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'skills_needed' => 'nullable|array',
            'skills_needed.*' => 'string',
        ]);
        $validated['ong_id'] = $request->user()->id;
        $validated['status'] = 'open';
        $project = OngProject::create($validated);
        return response()->json(['success' => true, 'data' => $project], 201);
    }

    // Student applies to a project
    public function apply(Request $request, OngProject $project): JsonResponse
    {
        if (!$request->user()->isStudent()) {
            return response()->json(['success' => false, 'message' => 'Only students can apply to projects.'], 403);
        }
        $application = OngProjectApplication::firstOrCreate([
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
        ], [
            'status' => 'applied',
        ]);
        // Notify ONG via Telegram
        $ong = $project->ong_id ? \App\Models\User::find($project->ong_id) : null;
        if ($ong && $ong->telegram_chat_id) {
            $this->telegram->sendMessage(
                $ong->telegram_chat_id,
                "A new user has applied to your project: {$project->title}."
            );
        }
        return response()->json(['success' => true, 'data' => $application]);
    }

    // Student submits their final project (repo + images)
    public function submit(Request $request, OngProject $project): JsonResponse
    {
        if (!$request->user()->isStudent()) {
            return response()->json(['success' => false, 'message' => 'Only students can submit projects.'], 403);
        }
        $validated = $request->validate([
            'github_repo' => 'required|url',
            'images' => 'nullable|array',
            'images.*' => 'url',
        ]);
        $application = $project->applications()->where('user_id', $request->user()->id)->firstOrFail();
        $application->update([
            'github_repo' => $validated['github_repo'],
            'images' => $validated['images'] ?? [],
            'status' => 'completed',
        ]);
        return response()->json(['success' => true, 'data' => $application]);
    }

    // ONG views users that applied to their project
    public function applicants(Request $request, OngProject $project): JsonResponse
    {
        if ($request->user()->id !== $project->ong_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }
        $applicants = $project->applications()->with('user')->get();
        return response()->json([
            'success' => true,
            'data' => $applicants
        ]);
    }

    // ONG selects the winning project
    public function selectWinner(Request $request, OngProject $project, OngProjectApplication $application): JsonResponse
    {
        if ($request->user()->id !== $project->ong_id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }
        $project->update([
            'winner_user_id' => $application->user_id,
            'status' => 'closed',
        ]);
        $application->update(['status' => 'winner']);
        // Notify all applicants
        $allApplications = $project->applications()->with('user')->get();
        foreach ($allApplications as $app) {
            $user = $app->user;
            if ($user && $user->telegram_chat_id) {
                if ($app->id == $application->id) {
                    $this->telegram->sendMessage(
                        $user->telegram_chat_id,
                        "Congratulations! Your project submission for '{$project->title}' was selected as the winner!"
                    );
                } else {
                    $this->telegram->sendMessage(
                        $user->telegram_chat_id,
                        "Thank you for participating in '{$project->title}'. Unfortunately, your project was not selected."
                    );
                }
            }
        }
        return response()->json(['success' => true, 'message' => 'Winner selected.', 'data' => $application]);
    }
}
