import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  LinearProgress,
  IconButton,
  CircularProgress,
  styled,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks';
import { UserAvatar } from '../utils';
import { CourseAPI, EnrollmentAPI } from '../services/api';
import type { Course } from '../types';

// Glass morphism styled components
const GlassCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.6)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(30, 41, 59, 0.1)',
  borderRadius: 20,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(0, 0, 0, 0.6)'
      : '0 20px 40px rgba(30, 41, 59, 0.15)',
  },
}));

// Helper function to get course thumbnail based on programming language
const getCourseThumbnail = (course: Course): string => {
  const language = course.programming_language?.name?.toLowerCase() || '';
  const thumbnails: { [key: string]: string } = {
    javascript: '🚀',
    typescript: '📘',
    python: '🐍',
    java: '☕',
    'c++': '⚡',
    'c#': '🔷',
    react: '⚛️',
    node: '🟢',
    vue: '💚',
    angular: '🔴',
    default: '📚'
  };
  
  return thumbnails[language] || thumbnails.default;
};

// Helper function to get instructor name
const getInstructorName = (course: Course): string => {
  return course.teacher?.name || 'Unknown Instructor';
};

// Helper function to calculate progress from enrollment
const getCourseProgress = (course: Course): { progress: number; completed: number; total: number } => {
  if (course.enrollment?.progress_percentage) {
    return {
      progress: course.enrollment.progress_percentage,
      completed: Math.round((course.enrollment.progress_percentage / 100) * (course.steps_count || 10)),
      total: course.steps_count || 10
    };
  }
  
  return { progress: 0, completed: 0, total: course.steps_count || 10 };
};

// Helper function to format duration
const formatDuration = (hours: number): string => {
  if (hours < 1) return '< 1 hour';
  if (hours === 1) return '1 hour';
  return `${hours} hours`;
};

const CourseCard = styled(GlassCard)(() => ({
  height: '100%',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    '& .course-image': {
      transform: 'scale(1.1)',
    },
  },
}));

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch enrolled courses
        const enrolledResponse = await CourseAPI.getMyEnrolledCourses({ per_page: 6 });
        if (enrolledResponse.success && enrolledResponse.data) {
          setEnrolledCourses(enrolledResponse.data.data);
        }

        // Fetch available courses as recommendations
        const availableResponse = await CourseAPI.getAvailableCourses({ per_page: 8 });
        if (availableResponse.success && availableResponse.data) {
          setRecommendedCourses(availableResponse.data.data);        }
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };    fetchData();
  }, [user]);

  const handleEnrollInCourse = async (courseId: number) => {
    try {
      const response = await EnrollmentAPI.enrollInCourse({ course_id: courseId });
      if (response.success) {
        // Refresh the data to show the updated enrollment
        const enrolledResponse = await CourseAPI.getMyEnrolledCourses({ per_page: 6 });
        if (enrolledResponse.success && enrolledResponse.data) {
          setEnrolledCourses(enrolledResponse.data.data);
        }
        
        const availableResponse = await CourseAPI.getAvailableCourses({ per_page: 8 });
        if (availableResponse.success && availableResponse.data) {
          setRecommendedCourses(availableResponse.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to enroll in course:', err);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      p: { xs: 2, md: 3 },
      position: 'relative',
    }}>
      {/* Animated background particles */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: (theme) => theme.palette.mode === 'dark'
            ? `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
            : `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
               radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 50%)`,
        }}
      />

      {/* Welcome Section */}
      <GlassCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={3}>
            <UserAvatar
              user={user}
              size={100}
              sx={{
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              }}
            />
            <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Welcome back, {user.name || 'User'}! 👋
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {user.email || 'No email'}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>                {user.user_type && (
                  <Chip
                    label={user.user_type.toUpperCase()}
                    color="primary"
                    size="medium"
                    sx={{ fontWeight: 600 }}
                  />
                )}
                <Chip
                  label="🎯 Active Learner"
                  variant="outlined"
                  size="medium"
                />
              </Stack>
            </Box>
          </Stack>        </CardContent>
      </GlassCard>

      {/* Enrolled Courses Section */}
      <GlassCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              📚 Your Courses
            </Typography>
            <Button variant="outlined" size="small">
              View All
            </Button>
          </Stack>
            <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 3
            }}
          >
            {enrolledCourses.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No enrolled courses yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Browse recommended courses below to get started
                </Typography>
              </Box>
            ) : (
              enrolledCourses.map((course) => {
              const progress = getCourseProgress(course);
              return (
              <CourseCard key={course.id}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {/* Course Header */}
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Box
                        className="course-image"
                        sx={{
                          fontSize: '3rem',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        {getCourseThumbnail(course)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {getInstructorName(course)}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <BookmarkIcon />
                      </IconButton>
                    </Stack>

                    {/* Progress */}
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {progress.completed}/{progress.total} lessons
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progress.progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha('#6366f1', 0.1),
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                            borderRadius: 4,
                          },
                        }}
                      />
                      <Typography variant="caption" color="primary.main" fontWeight="bold">
                        {progress.progress}% Complete
                      </Typography>
                    </Box>

                    {/* Course Stats */}
                    <Stack direction="row" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="caption">4.8</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption">{formatDuration(course.estimated_duration_hours)}</Typography>
                      </Stack>
                    </Stack>

                    {/* Continue Button */}
                    <Button
                      variant="contained"
                      startIcon={<PlayIcon />}
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      Continue Learning
                    </Button>
                  </Stack>
                </CardContent>              </CourseCard>
              );
            }))}
          </Box>
        </CardContent>
      </GlassCard>

      {/* Recommended Courses Section */}
      <GlassCard>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              🎯 Recommended for You
            </Typography>
            <Button variant="outlined" size="small">
              Explore More
            </Button>
          </Stack>
            <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 3
            }}
          >
            {recommendedCourses.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No courses available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Check back later for new course recommendations
                </Typography>
              </Box>
            ) : (
              recommendedCourses.map((course) => (
              <CourseCard key={course.id}>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {/* Course Header */}
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Box
                        className="course-image"
                        sx={{
                          fontSize: '2.5rem',
                          transition: 'transform 0.3s ease',
                        }}
                      >
                        {getCourseThumbnail(course)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem' }}>
                          {course.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          by {getInstructorName(course)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Course Stats */}
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="caption">4.8</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          Free
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption">{course.enrolled_students_count || 0} students</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption">{formatDuration(course.estimated_duration_hours)}</Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    {/* Enroll Button */}
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={() => handleEnrollInCourse(course.id)}
                    >
                      Enroll Now
                    </Button>
                  </Stack>
                </CardContent>              </CourseCard>
            )))}
          </Box>
        </CardContent>
      </GlassCard>

      {/* Quick Actions */}
      <GlassCard sx={{ mt: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⚡ Quick Actions
          </Typography>          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button 
              variant="contained" 
              startIcon={<PersonIcon />} 
              size="large"
              onClick={() => navigate('/profile')}
            >
              Edit Profile
            </Button>
            <Button variant="outlined" startIcon={<LanguageIcon />} size="large">
              Language Settings
            </Button>
            <Button variant="outlined" size="large">
              Help & Support
            </Button>
          </Stack>
        </CardContent>
      </GlassCard>
    </Box>
  );
};

export default DashboardPage;
