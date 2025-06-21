export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
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
