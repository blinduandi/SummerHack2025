// Course and Learning related types
import type { User } from './auth';

export interface Course {
  id: number;
  title: string;
  description: string;
  content?: string;
  category?: string; // Course category
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_hours: number;
  is_active: boolean;
  programming_language_id: number;
  teacher_id: number;
  thumbnail?: string; // URL to course thumbnail image
  created_at: string;
  updated_at: string;
  programming_language?: ProgrammingLanguage;
  teacher?: User;
  is_enrolled?: boolean;
  enrollment?: Enrollment;
  steps_count?: number;
  enrolled_students_count?: number;
}

export interface CourseStep {
  id: number;
  course_id: number;
  title: string;
  description: string;
  content: string;
  step_order: number;
  step_type: 'theory' | 'review' | 'code' | 'setup' | 'deployment' | 'testing';
  is_required: boolean;
  metadata?: string | Record<string, any>; // Can be JSON string or parsed object
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  github_repository_url?: string;
  github_repository_name?: string;
  code_analysis_data?: Record<string, any>;
  code_quality_score?: number;
  last_analysis_at?: string;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage?: number;
}

export interface ProgrammingLanguage {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  id: number;
  user_id: number;
  course_id?: number;
  step_id?: number;
  course_step_id?: number; // Added this field based on backend
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'hidden' | 'solved';
  score?: number;
  attempts_count: number;
  progress_data?: Record<string, any>;
  checkpoint_data?: Record<string, any>;
  notes?: string;
  started_at?: string;
  completed_at?: string;
  last_accessed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  course_id?: number;
  step_id?: number;
  message: string;
  sender_type: 'user' | 'bot';
  context_data?: Record<string, any>;
  is_helpful?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recommendation {
  id: number;
  user_id: number;
  course_id: number;
  recommendation_type: 'skill_based' | 'completion_based' | 'trending' | 'similar_users';
  score: number;
  reason?: string;
  is_dismissed: boolean;
  created_at: string;
  updated_at: string;
  course?: Course;
}

// API Request/Response types
export interface CreateCourseRequest {
  title: string;
  description: string;
  category: string; // Make category required
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_hours: number;
  programming_language_id: number;
  program_id?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  tags?: string[];
  is_published?: boolean;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}

export interface CreateCourseStepRequest {
  title: string;
  description: string;
  content: string;
  step_order: number;
  step_type: 'lesson' | 'exercise' | 'quiz' | 'project';
  is_required?: boolean;
  metadata?: {
    estimated_duration?: number;
    difficulty?: string;
    keywords?: string[];
    [key: string]: any;
  };
  is_published?: boolean;
}

export interface UpdateCourseStepRequest extends Partial<CreateCourseStepRequest> {}

export interface EnrollmentRequest {
  course_id: number;
}

export interface UpdateEnrollmentStatusRequest {
  status: 'active' | 'completed' | 'dropped' | 'paused';
}

export interface UpdateGithubRepositoryRequest {
  github_repository_url: string;
  github_repository_name?: string;
}

export interface UpdateCodeAnalysisRequest {
  code_analysis_data: Record<string, any>;
  code_quality_score: number;
}

export interface UpdateStepProgressRequest {
  status?: 'hidden' | 'in_progress' | 'solved' | 'completed';
  progress_data?: {
    read_time?: number;
    notes?: string;
    [key: string]: any;
  };
  score?: number;
  notes?: string;
}

export interface UpdateCourseProgressRequest {
  course_id: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'hidden';
  progress_percentage?: number;
}

// Legacy interface for backward compatibility
export interface UpdateProgressRequest {
  step_id?: number;
  course_id?: number;
  progress_percentage?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'hidden' | 'solved';
  score?: number;
  progress_data?: Record<string, any>;
  checkpoint_data?: Record<string, any>;
  notes?: string;
  increment_attempts?: boolean;
}

export interface SendChatMessageRequest {
  message: string;
  context_data?: Record<string, any>;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  language_preference?: string;
  bio?: string;
}

// Pagination types
export interface PaginationMeta {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  links: Array<{
    url?: string;
    label: string;
    active: boolean;
  }>;
  meta?: PaginationMeta;
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url?: string;
  path: string;
  per_page: number;
  prev_page_url?: string;
  to: number;
  total: number;
}

// Query parameters
export interface CourseQueryParams {
  language_id?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ProgressOverviewResponse {
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  total_hours_spent: number;
  completion_rate: number;
  certificates_earned: number;
  current_streak: number;
  recent_progress: Progress[];
}

// Program types
export interface Program {
  id: number;
  title: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_weeks: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  is_published: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  courses_count?: number;
  enrolled_students_count?: number;
}

// Request types for teacher functionality
export interface CreateProgramRequest {
  title: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_weeks: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  is_published?: boolean;
}

export interface UpdateProgramRequest {
  title?: string;
  description?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration_weeks?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  is_published?: boolean;
}

// ONG Project types
export interface OngProject {
  id: number;
  ong_id: number;
  title: string;
  description: string;
  requirements?: string;
  skills_needed?: string[];
  due_date?: string;
  status: 'open' | 'closed';
  winner_user_id?: number;
  created_at: string;
  updated_at: string;
  applications?: OngProjectApplication[];
  ong?: User;
  winner?: User;
}

export interface OngProjectApplication {
  id: number;
  project_id: number;
  user_id: number;
  status: 'applied' | 'completed' | 'accepted' | 'rejected';
  github_repo?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
  user?: User;
  project?: OngProject;
}

export interface CreateOngProjectRequest {
  title: string;
  description: string;
  requirements?: string;
  skills_needed?: string[];
  due_date?: string;
}

export interface SubmitOngProjectRequest {
  github_repo: string;
  images?: string[];
}
