<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('user can register', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'role' => 'student',
    ]);

    $response->assertStatus(201);
    $response->assertJsonStructure([
        'success',
        'message',
        'data' => [
            'user' => [
                'id',
                'name',
                'email',
                'role',
            ],
            'access_token',
            'token_type',
        ]
    ]);

    expect(User::where('email', 'test@example.com')->exists())->toBeTrue();
});

test('user can login', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'message',
        'data' => [
            'user',
            'access_token',
            'token_type',
        ]
    ]);
});

test('user cannot login with invalid credentials', function () {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401);
    $response->assertJson([
        'success' => false,
        'message' => 'Invalid credentials'
    ]);
});

test('authenticated user can access profile', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test_token')->plainTextToken;

    $response = $this->getJson('/api/auth/profile', [
        'Authorization' => 'Bearer ' . $token,
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'data' => [
            'id',
            'name',
            'email',
            'role',
        ]
    ]);
});

test('registration validation works', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => '',
        'email' => 'invalid-email',
        'password' => '123',
        'role' => 'invalid',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
});
