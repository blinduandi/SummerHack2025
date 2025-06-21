export interface User {
  id: number;
  name: string;
  email: string;
  user_type: 'student' | 'teacher' | 'ong' | null;
  bio?: string | null;
  avatar?: string | null;
  skills?: any | null;
  achievements?: any | null;
  preferences?: any | null;
  is_email_verified: boolean;
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
  user_type: 'student' | 'teacher' | 'ong';
  bio?: string;
  avatar?: string; // URL to uploaded avatar
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    access_token: string; // Laravel Sanctum returns access_token
    token_type: string;
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
