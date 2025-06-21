<?php

return [
    /*
    |--------------------------------------------------------------------------
    | OpenAI API Key
    |--------------------------------------------------------------------------
    |
    | Your OpenAI API key from https://platform.openai.com/api-keys
    |
    */
    'api_key' => env('OPENAI_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | OpenAI Model
    |--------------------------------------------------------------------------
    |
    | The OpenAI model to use for chat completions.
    | gpt-3.5-turbo is the cheapest option.
    |
    */
    'model' => env('OPENAI_MODEL', 'gpt-3.5-turbo'),

    /*
    |--------------------------------------------------------------------------
    | OpenAI Chat Settings
    |--------------------------------------------------------------------------
    |
    | Settings for chat completions
    |
    */
    'chat' => [
        'max_tokens' => 500, // Limit tokens to control costs
        'temperature' => 0.7, // Creativity level (0-1)
        'top_p' => 1,
        'frequency_penalty' => 0,
        'presence_penalty' => 0,
    ],
];
