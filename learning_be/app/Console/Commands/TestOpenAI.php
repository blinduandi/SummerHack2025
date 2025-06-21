<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use OpenAI;
use Exception;

class TestOpenAI extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:openai {message?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test OpenAI integration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $apiKey = config('openai.api_key');
        
        if (!$apiKey || $apiKey === 'your_openai_api_key_here') {
            $this->error('OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.');
            return 1;
        }

        $message = $this->argument('message') ?? 'Hello, can you help me learn JavaScript?';

        $this->info("Testing OpenAI with message: {$message}");
        $this->info('Using model: ' . config('openai.model'));

        try {
            $client = OpenAI::client($apiKey);

            $response = $client->chat()->create([
                'model' => config('openai.model'),
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are a helpful programming tutor. Keep responses concise and helpful.'
                    ],
                    [
                        'role' => 'user',
                        'content' => $message
                    ]
                ],
                'max_tokens' => config('openai.chat.max_tokens'),
                'temperature' => config('openai.chat.temperature'),
            ]);

            $this->info('Response:');
            $this->line($response->choices[0]->message->content);
            $this->info('Tokens used: ' . $response->usage->totalTokens);

        } catch (Exception $e) {
            $this->error('OpenAI API Error: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
