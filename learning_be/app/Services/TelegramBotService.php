<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class TelegramBotService
{
    protected $botToken;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token');
    }

    public function sendMessage($text)
    {
        $url = "https://api.telegram.org/bot{$this->botToken}/sendMessage";
        return Http::post($url, [
            'chat_id' => 1489939064,
            'text' => $text,
        ]);
    }
}
