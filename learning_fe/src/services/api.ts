import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse, ApiResponse, User } from '../types';
import { getValidatedApiUrl, logEnvironmentInfo } from '../utils';

// Environment configuration
const API_BASE_URL = getValidatedApiUrl();
const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
const ENABLE_LOGGING = import.meta.env.VITE_ENABLE_LOGGING === 'true';

// Log environment info in development
logEnvironmentInfo();

// Helper function for logging in development
const log = (...args: any[]) => {
  if (DEV_MODE && ENABLE_LOGGING) {
    console.log('[API]', ...args);
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Log API configuration in development
if (DEV_MODE) {
  log('API configured with base URL:', API_BASE_URL);
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authStore = localStorage.getItem('auth-store');
    if (authStore) {
      const { state } = JSON.parse(authStore);
      if (state?.tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${state.tokens.accessToken}`;
        log('Request with auth token to:', config.url);
      }
    }
    log('Making API request to:', config.url);
    return config;
  },
  (error) => {
    log('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    log('API response received:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    log('API error:', error.response?.status, error.config?.url, error.message);
    if (error.response?.status === 401) {
      // Handle token refresh or logout
      log('Unauthorized - clearing auth store and redirecting to login');
      localStorage.removeItem('auth-store');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class AuthAPI {  /**
   * Get the current API base URL
   */
  static getApiBaseUrl(): string {
    return API_BASE_URL;
  }

  /**
   * Health check endpoint
   */
  static async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    try {
      const response = await api.get('/health');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Health check failed',
          code: error.response?.data?.code || 'HEALTH_CHECK_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      log('Login successful:', response.data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      log('Login failed:', error);
      return {
        error: {
          message: error.response?.data?.message || 'Login failed',
          code: error.response?.data?.code || 'LOGIN_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Register new user
   */
  static async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.password_confirmation,
        role: credentials.role,
        language_preference: credentials.language_preference || 'en',
      });
      
      log('Registration successful:', response.data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      log('Registration failed:', error);
      return {
        error: {
          message: error.response?.data?.message || 'Registration failed',
          code: error.response?.data?.code || 'REGISTRATION_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<any>> {
    try {
      const response = await api.post('/auth/logout');
      log('Logout successful');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      log('Logout failed:', error);
      return {
        error: {
          message: error.response?.data?.message || 'Logout failed',
          code: error.response?.data?.code || 'LOGOUT_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User }> = await api.get('/auth/profile');
      log('Profile fetch successful:', response.data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      log('Profile fetch failed:', error);
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch profile',
          code: error.response?.data?.code || 'PROFILE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken });
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Token refresh failed',
          code: error.response?.data?.code || 'TOKEN_REFRESH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<ApiResponse<void>> {
    try {
      await api.post('/auth/logout');
      return { success: true };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Logout failed',
          code: error.response?.data?.code || 'LOGOUT_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<User> = await api.get('/auth/profile');
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to get profile',
          code: error.response?.data?.code || 'PROFILE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

export default api;
