export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  language_preference: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'student' | 'teacher';
  language_preference?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string; // Laravel Sanctum returns a single token
  };
  message?: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
