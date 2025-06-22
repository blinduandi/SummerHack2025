import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { 
  LoginCredentials, 
  RegisterCredentials, 
  AuthResponse, 
  ApiResponse, 
  User,
  Course,
  CourseStep,
  Enrollment,
  ProgrammingLanguage,
  Progress,
  ChatMessage,
  Recommendation,
  Program,
  CreateCourseRequest,
  UpdateCourseRequest,
  CreateCourseStepRequest,
  UpdateCourseStepRequest,
  CreateProgramRequest,
  UpdateProgramRequest,
  EnrollmentRequest,
  UpdateEnrollmentStatusRequest,
  UpdateGithubRepositoryRequest,  UpdateCodeAnalysisRequest,
  UpdateStepProgressRequest,
  UpdateCourseProgressRequest,
  SendChatMessageRequest,
  UpdateProfileRequest,
  PaginatedResponse,
  CourseQueryParams,
  ProgressOverviewResponse
} from '../types';
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
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: false, // Set to true if using CSRF cookies
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
    
    // Only handle 401 for authenticated routes, not login/register
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/register')) {
      
      log('Unauthorized access to protected route - clearing auth store and redirecting to login');
      localStorage.removeItem('auth-store');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

class AuthAPI {
  /**
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
      };    }
  }

  /**
   * Upload a file (avatar, etc.)
   */
  static async uploadFile(file: File, type: 'avatar' | 'document' = 'avatar'): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      log('Uploading file:', { name: file.name, size: file.size, type });

      const response: AxiosResponse<{ success: boolean; data: { url: string } }> = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      log('File upload response:', response.data);

      if (response.data.success && response.data.data?.url) {
        return {
          data: response.data.data,
          success: true,
        };
      } else {
        return {
          error: {
            message: 'Upload failed - invalid response',
            code: 'UPLOAD_ERROR',
            status: response.status,
          },
          success: false,
        };
      }
    } catch (error: any) {
      log('File upload error:', error);
      return {
        error: {
          message: error.response?.data?.message || 'Upload failed',
          code: error.response?.data?.code || 'UPLOAD_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }  /**
   * Login user with email and password
   */  static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      log('Attempting login with credentials:', { email: credentials.email, password: '***' });
      log('Making POST request to:', `${API_BASE_URL}/auth/login`);
      
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      
      log('Login response status:', response.status);
      log('Login response headers:', response.headers);
      log('Login response data:', response.data);
      
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      log('Login error occurred:', error);
      log('Error response status:', error.response?.status);
      log('Error response data:', error.response?.data);
      log('Error message:', error.message);
      
      return {
        error: {
          message: error.response?.data?.message || 'Login failed',
          code: error.response?.data?.code || 'LOGIN_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }  /**
   * Register new user
   */
  static async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      // Map frontend user_type to backend role field
      const payload: any = {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
        password_confirmation: credentials.password_confirmation,
        role: credentials.user_type, // Backend expects 'role' field
      };
      
      // Only include bio if it's provided and not empty
      if (credentials.bio && credentials.bio.trim()) {
        payload.bio = credentials.bio.trim();
      }
      
      // Only include avatar if it's provided and not empty
      if (credentials.avatar && credentials.avatar.trim()) {
        payload.avatar = credentials.avatar.trim();
      }
        log('Register payload:', payload);
      
      // Test API connectivity first
      log('Testing API connectivity...');
      const healthResponse = await api.get('/health').catch(e => {
        log('Health check failed:', e.message);
        return null;
      });
      
      if (healthResponse) {
        log('API is accessible, health check passed');
      } else {
        log('API health check failed, but continuing with registration...');
      }
      
      const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', payload);
      
      log('Registration successful:', response.data);
      return {
        data: response.data,
        success: true,
      };    } catch (error: any) {
      log('Registration failed:', error);
      log('Error response data:', error.response?.data);
      log('Error status:', error.response?.status);
      log('Error config:', error.config);
      
      // More detailed error message from server
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          (typeof error.response?.data === 'string' ? error.response.data : 'Registration failed');
        return {
        error: {
          message: errorMessage,
          code: error.response?.data?.code || 'REGISTRATION_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Test registration with exact payload format
   */
  static async testRegister(): Promise<ApiResponse<any>> {
    try {
      const testPayload = {
        name: "John Student",
        email: "student@example.com",
        password: "password123",
        password_confirmation: "password123",
        user_type: "student",
        bio: "Aspiring developer"
      };
      
      log('Testing registration with payload:', testPayload);
      const response = await api.post('/auth/register', testPayload);
      
      log('Test registration successful:', response.data);
      return {
        data: response.data,
        success: true,
      };
    } catch (error: any) {
      log('Test registration failed:', error);
      log('Error response:', error.response?.data);
      return {
        error: {
          message: error.response?.data?.message || 'Test registration failed',
          code: error.response?.data?.code || 'TEST_REGISTRATION_ERROR',
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
  static async logoutUser(): Promise<ApiResponse<void>> {
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
  static async getCurrentProfile(): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User }> = await api.get('/auth/profile');
      return {
        data: response.data.data,
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

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: User }> = await api.put('/auth/profile', data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update profile',
          code: error.response?.data?.code || 'PROFILE_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

class CourseAPI {
  /**
   * List all courses
   */
  static async listCourses(params: CourseQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Course>>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: PaginatedResponse<Course> }> = await api.get('/courses', { params });
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch courses',
          code: error.response?.data?.code || 'COURSES_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get my enrolled courses
   */
  static async getMyEnrolledCourses(params: CourseQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Course>>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: PaginatedResponse<Course> }> = await api.get('/courses/my-enrolled', { params });
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch enrolled courses',
          code: error.response?.data?.code || 'ENROLLED_COURSES_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get available courses (not enrolled)
   */
  static async getAvailableCourses(params: CourseQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Course>>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: PaginatedResponse<Course> }> = await api.get('/courses/available', { params });
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch available courses',
          code: error.response?.data?.code || 'AVAILABLE_COURSES_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get a specific course
   */
  static async getCourse(id: number): Promise<ApiResponse<Course>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Course }> = await api.get(`/courses/${id}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course',
          code: error.response?.data?.code || 'COURSE_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Create a new course (Teachers only)
   */
  static async createCourse(data: CreateCourseRequest): Promise<ApiResponse<Course>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Course }> = await api.post('/courses', data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to create course',
          code: error.response?.data?.code || 'COURSE_CREATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update a course
   */
  static async updateCourse(id: number, data: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Course }> = await api.put(`/courses/${id}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update course',
          code: error.response?.data?.code || 'COURSE_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Delete a course
   */
  static async deleteCourse(id: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/courses/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to delete course',
          code: error.response?.data?.code || 'COURSE_DELETE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * List course steps
   */
  static async getCourseSteps(courseId: number): Promise<ApiResponse<CourseStep[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep[] }> = await api.get(`/courses/${courseId}/steps`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course steps',
          code: error.response?.data?.code || 'COURSE_STEPS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get a specific course step
   */
  static async getCourseStep(courseId: number, stepId: number): Promise<ApiResponse<CourseStep>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep }> = await api.get(`/courses/${courseId}/steps/${stepId}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course step',
          code: error.response?.data?.code || 'COURSE_STEP_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Create a course step (Teachers only)
   */
  static async createCourseStep(courseId: number, data: CreateCourseStepRequest): Promise<ApiResponse<CourseStep>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep }> = await api.post(`/courses/${courseId}/steps`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to create course step',
          code: error.response?.data?.code || 'COURSE_STEP_CREATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update a course step
   */
  static async updateCourseStep(courseId: number, stepId: number, data: UpdateCourseStepRequest): Promise<ApiResponse<CourseStep>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep }> = await api.put(`/courses/${courseId}/steps/${stepId}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update course step',
          code: error.response?.data?.code || 'COURSE_STEP_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Delete a course step
   */
  static async deleteCourseStep(courseId: number, stepId: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/courses/${courseId}/steps/${stepId}`);
      return { success: true };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to delete course step',
          code: error.response?.data?.code || 'COURSE_STEP_DELETE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

class EnrollmentAPI {
  /**
   * List user enrollments
   */
  static async listEnrollments(): Promise<ApiResponse<Enrollment[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment[] }> = await api.get('/enrollments');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch enrollments',
          code: error.response?.data?.code || 'ENROLLMENTS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Enroll in a course
   */
  static async enrollInCourse(data: EnrollmentRequest): Promise<ApiResponse<Enrollment>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment }> = await api.post('/enrollments', data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to enroll in course',
          code: error.response?.data?.code || 'ENROLLMENT_CREATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get enrollment details
   */
  static async getEnrollment(id: number): Promise<ApiResponse<Enrollment>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment }> = await api.get(`/enrollments/${id}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch enrollment',
          code: error.response?.data?.code || 'ENROLLMENT_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update enrollment status
   */
  static async updateEnrollmentStatus(id: number, data: UpdateEnrollmentStatusRequest): Promise<ApiResponse<Enrollment>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment }> = await api.patch(`/enrollments/${id}/status`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update enrollment status',
          code: error.response?.data?.code || 'ENROLLMENT_STATUS_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update GitHub repository
   */
  static async updateGithubRepository(id: number, data: UpdateGithubRepositoryRequest): Promise<ApiResponse<Enrollment>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment }> = await api.patch(`/enrollments/${id}/github-repository`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update GitHub repository',
          code: error.response?.data?.code || 'GITHUB_REPOSITORY_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update code analysis
   */
  static async updateCodeAnalysis(id: number, data: UpdateCodeAnalysisRequest): Promise<ApiResponse<Enrollment>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment }> = await api.patch(`/enrollments/${id}/code-analysis`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update code analysis',
          code: error.response?.data?.code || 'CODE_ANALYSIS_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Trigger code analysis
   */
  static async triggerCodeAnalysis(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await api.post(`/enrollments/${id}/trigger-analysis`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to trigger code analysis',
          code: error.response?.data?.code || 'CODE_ANALYSIS_TRIGGER_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Delete enrollment
   */
  static async deleteEnrollment(id: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/enrollments/${id}`);
      return { success: true };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to delete enrollment',
          code: error.response?.data?.code || 'ENROLLMENT_DELETE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

class ProgressAPI {
  /**
   * Get user progress overview
   */
  static async getUserProgressOverview(): Promise<ApiResponse<ProgressOverviewResponse>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: ProgressOverviewResponse }> = await api.get('/progress/user');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch user progress overview',
          code: error.response?.data?.code || 'PROGRESS_OVERVIEW_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get course progress
   */
  static async getCourseProgress(courseId: number): Promise<ApiResponse<Progress>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Progress }> = await api.get(`/progress/course/${courseId}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course progress',
          code: error.response?.data?.code || 'COURSE_PROGRESS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
  /**
   * Update course progress
   */
  static async updateCourseProgress(courseId: number, data: UpdateCourseProgressRequest): Promise<ApiResponse<Progress>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Progress }> = await api.put(`/progress/course/${courseId}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update course progress',
          code: error.response?.data?.code || 'COURSE_PROGRESS_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get course steps progress
   */
  static async getCourseStepsProgress(courseId: number): Promise<ApiResponse<Progress[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Progress[] }> = await api.get(`/progress/course/${courseId}/steps`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course steps progress',
          code: error.response?.data?.code || 'COURSE_STEPS_PROGRESS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get step progress
   */
  static async getStepProgress(stepId: number): Promise<ApiResponse<Progress>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Progress }> = await api.get(`/progress/step/${stepId}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch step progress',
          code: error.response?.data?.code || 'STEP_PROGRESS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
  /**
   * Update step progress
   */
  static async updateStepProgress(stepId: number, data: UpdateStepProgressRequest): Promise<ApiResponse<Progress>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Progress }> = await api.put(`/progress/step/${stepId}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update step progress',
          code: error.response?.data?.code || 'STEP_PROGRESS_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

class ChatAPI {
  /**
   * Get chat history
   */
  static async getChatHistory(): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: ChatMessage[] }> = await api.get('/chat');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch chat history',
          code: error.response?.data?.code || 'CHAT_HISTORY_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get course chat history
   */
  static async getCourseChatHistory(courseId: number): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: ChatMessage[] }> = await api.get(`/chat/course/${courseId}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course chat history',
          code: error.response?.data?.code || 'COURSE_CHAT_HISTORY_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Send general chat message
   */
  static async sendMessage(data: SendChatMessageRequest): Promise<ApiResponse<{ user_message: ChatMessage; bot_response: ChatMessage }>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { user_message: ChatMessage; bot_response: ChatMessage } }> = await api.post('/chat', data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to send message',
          code: error.response?.data?.code || 'MESSAGE_SEND_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Send course-specific message
   */
  static async sendCourseMessage(courseId: number, data: SendChatMessageRequest): Promise<ApiResponse<{ user_message: ChatMessage; bot_response: ChatMessage }>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { user_message: ChatMessage; bot_response: ChatMessage } }> = await api.post(`/chat/course/${courseId}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to send course message',
          code: error.response?.data?.code || 'COURSE_MESSAGE_SEND_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Mark message as helpful
   */
  static async markMessageAsHelpful(messageId: number, isHelpful: boolean): Promise<ApiResponse<ChatMessage>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: ChatMessage }> = await api.patch(`/chat/messages/${messageId}/helpful`, { is_helpful: isHelpful });
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to mark message as helpful',
          code: error.response?.data?.code || 'MESSAGE_HELPFUL_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

class RecommendationAPI {
  /**
   * Get course recommendations
   */
  static async getRecommendations(): Promise<ApiResponse<Recommendation[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Recommendation[] }> = await api.get('/recommendations');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch recommendations',
          code: error.response?.data?.code || 'RECOMMENDATIONS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Generate new recommendations
   */
  static async generateRecommendations(): Promise<ApiResponse<{ message: string }>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { message: string } }> = await api.post('/recommendations/generate');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to generate recommendations',
          code: error.response?.data?.code || 'RECOMMENDATIONS_GENERATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Dismiss recommendation
   */
  static async dismissRecommendation(id: number): Promise<ApiResponse<Recommendation>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Recommendation }> = await api.patch(`/recommendations/${id}/dismiss`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to dismiss recommendation',
          code: error.response?.data?.code || 'RECOMMENDATION_DISMISS_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

class ProgrammingLanguageAPI {
  /**
   * List programming languages
   */
  static async listProgrammingLanguages(): Promise<ApiResponse<ProgrammingLanguage[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: ProgrammingLanguage[] }> = await api.get('/programming-languages');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch programming languages',
          code: error.response?.data?.code || 'PROGRAMMING_LANGUAGES_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

class TeacherAPI {
  // =============== Program Management ===============
  
  /**
   * List all programs for the authenticated teacher
   */
  static async listPrograms(): Promise<ApiResponse<Program[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Program[] }> = await api.get('/teacher/programs');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch programs',
          code: error.response?.data?.code || 'PROGRAMS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Create a new program
   */
  static async createProgram(data: CreateProgramRequest): Promise<ApiResponse<Program>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Program }> = await api.post('/teacher/programs', data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to create program',
          code: error.response?.data?.code || 'PROGRAM_CREATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update an existing program
   */
  static async updateProgram(id: number, data: UpdateProgramRequest): Promise<ApiResponse<Program>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Program }> = await api.put(`/teacher/programs/${id}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update program',
          code: error.response?.data?.code || 'PROGRAM_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Delete a program
   */
  static async deleteProgram(id: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/teacher/programs/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to delete program',
          code: error.response?.data?.code || 'PROGRAM_DELETE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  // =============== Course Management ===============
  
  /**
   * List all courses for the authenticated teacher
   */
  static async listTeacherCourses(): Promise<ApiResponse<Course[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Course[] }> = await api.get('/teacher/courses');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch teacher courses',
          code: error.response?.data?.code || 'TEACHER_COURSES_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get a specific course for editing (teacher-owned)
   */
  static async getTeacherCourse(id: number): Promise<ApiResponse<Course>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Course }> = await api.get(`/teacher/courses/${id}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course',
          code: error.response?.data?.code || 'TEACHER_COURSE_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Create a new course
   */
  static async createCourse(data: CreateCourseRequest): Promise<ApiResponse<Course>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Course }> = await api.post('/teacher/courses', data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to create course',
          code: error.response?.data?.code || 'COURSE_CREATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update an existing course
   */
  static async updateCourse(id: number, data: UpdateCourseRequest): Promise<ApiResponse<Course>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Course }> = await api.put(`/teacher/courses/${id}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update course',
          code: error.response?.data?.code || 'COURSE_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Delete a course
   */
  static async deleteCourse(id: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/teacher/courses/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to delete course',
          code: error.response?.data?.code || 'COURSE_DELETE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  // =============== Course Step Management ===============
  
  /**
   * List all steps for a specific course (teacher-owned)
   */
  static async listCourseSteps(courseId: number): Promise<ApiResponse<CourseStep[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep[] }> = await api.get(`/teacher/courses/${courseId}/steps`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course steps',
          code: error.response?.data?.code || 'COURSE_STEPS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get a specific course step for editing (teacher-owned)
   */
  static async getCourseStep(courseId: number, stepId: number): Promise<ApiResponse<CourseStep>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep }> = await api.get(`/teacher/courses/${courseId}/steps/${stepId}`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course step',
          code: error.response?.data?.code || 'COURSE_STEP_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Create a new course step
   */
  static async createCourseStep(courseId: number, data: CreateCourseStepRequest): Promise<ApiResponse<CourseStep>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep }> = await api.post(`/teacher/courses/${courseId}/steps`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to create course step',
          code: error.response?.data?.code || 'COURSE_STEP_CREATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update an existing course step
   */
  static async updateCourseStep(courseId: number, stepId: number, data: UpdateCourseStepRequest): Promise<ApiResponse<CourseStep>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep }> = await api.put(`/teacher/courses/${courseId}/steps/${stepId}`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update course step',
          code: error.response?.data?.code || 'COURSE_STEP_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Delete a course step
   */
  static async deleteCourseStep(courseId: number, stepId: number): Promise<ApiResponse<void>> {
    try {
      await api.delete(`/teacher/courses/${courseId}/steps/${stepId}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to delete course step',
          code: error.response?.data?.code || 'COURSE_STEP_DELETE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Reorder course steps
   */
  static async reorderCourseSteps(courseId: number, stepIds: number[]): Promise<ApiResponse<CourseStep[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: CourseStep[] }> = await api.put(`/teacher/courses/${courseId}/steps/reorder`, {
        step_ids: stepIds
      });
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to reorder course steps',
          code: error.response?.data?.code || 'COURSE_STEPS_REORDER_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  // =============== Enrollment Management ===============
  
  /**
   * List enrollments for teacher's courses
   */
  static async listCourseEnrollments(courseId: number): Promise<ApiResponse<Enrollment[]>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment[] }> = await api.get(`/teacher/courses/${courseId}/enrollments`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course enrollments',
          code: error.response?.data?.code || 'COURSE_ENROLLMENTS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Update enrollment status (approve/reject)
   */
  static async updateEnrollmentStatus(enrollmentId: number, data: UpdateEnrollmentStatusRequest): Promise<ApiResponse<Enrollment>> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Enrollment }> = await api.put(`/teacher/enrollments/${enrollmentId}/status`, data);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to update enrollment status',
          code: error.response?.data?.code || 'ENROLLMENT_STATUS_UPDATE_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  // =============== Analytics & Statistics ===============
  
  /**
   * Get teacher dashboard statistics
   */
  static async getTeacherStats(): Promise<ApiResponse<{
    total_courses: number;
    total_students: number;
    total_enrollments: number;
    completion_rate: number;
    recent_enrollments: Enrollment[];
    popular_courses: Course[];
  }>> {
    try {
      const response = await api.get('/teacher/stats');
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch teacher statistics',
          code: error.response?.data?.code || 'TEACHER_STATS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }

  /**
   * Get course analytics
   */
  static async getCourseAnalytics(courseId: number): Promise<ApiResponse<{
    enrollment_count: number;
    completion_rate: number;
    average_progress: number;
    step_completion_rates: { step_id: number; completion_rate: number; title: string }[];
    recent_activity: any[];
  }>> {
    try {
      const response = await api.get(`/teacher/courses/${courseId}/analytics`);
      return {
        data: response.data.data,
        success: true,
      };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.message || 'Failed to fetch course analytics',
          code: error.response?.data?.code || 'COURSE_ANALYTICS_FETCH_ERROR',
          status: error.response?.status || 500,
        },
        success: false,
      };
    }
  }
}

export default api;

// Export all API classes for easy access
export {
  AuthAPI,
  CourseAPI,
  EnrollmentAPI,
  ProgressAPI,
  ChatAPI,
  RecommendationAPI,
  ProgrammingLanguageAPI,
  TeacherAPI,
};
