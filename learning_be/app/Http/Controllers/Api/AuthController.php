<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(StoreUserRequest $request): JsonResponse
    {
        $validated = $request->validated();

        // Process avatar if provided (base64 data)
        $avatarData = null;
        if (!empty($validated['avatar'])) {
            $avatarData = $this->processBase64Avatar($validated['avatar']);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'bio' => $validated['bio'] ?? null,
            'avatar' => $avatarData,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => new UserResource($user),
                'access_token' => $token,
                'token_type' => 'Bearer',
            ]
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user())
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $request->user()->id,
            'bio' => 'sometimes|string|max:1000',
            'avatar' => 'sometimes|string', // Base64 encoded image data
            'password' => 'sometimes|string|min:8|confirmed',
            'skills' => 'sometimes|array',
            'preferences' => 'sometimes|array',
        ]);

        $user = $request->user();
        $updateData = $request->only(['name', 'email', 'bio', 'skills', 'preferences']);

        // Process avatar if provided (base64 data)
        if ($request->has('avatar') && !empty($request->avatar)) {
            $updateData['avatar'] = $this->processBase64Avatar($request->avatar);
        }

        if ($request->has('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user->fresh())
        ]);
    }

    /**
     * Process base64 avatar data
     *
     * @param string $base64Data
     * @return string
     */
    private function processBase64Avatar(string $base64Data): string
    {
        // Validate base64 data format
        if (!preg_match('/^data:image\/(\w+);base64,/', $base64Data, $matches)) {
            // If it's just base64 without data URI prefix, assume it's a valid image
            if (base64_decode($base64Data, true) !== false) {
                return $base64Data;
            }
            throw new \InvalidArgumentException('Invalid base64 image format');
        }

        // Extract the image type
        $imageType = $matches[1];

        // Validate image type
        $allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
        if (!in_array(strtolower($imageType), $allowedTypes)) {
            throw new \InvalidArgumentException('Unsupported image type');
        }

        // Return the full base64 data URI
        return $base64Data;
    }
}
