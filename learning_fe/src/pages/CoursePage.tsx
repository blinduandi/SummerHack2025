import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  BookmarkBorder as BookmarkIcon,
  BookmarkBorderOutlined as BookmarkFilledIcon,
  Share as ShareIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { CourseAPI } from '../services/api';
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
}));

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
  borderRadius: 24,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.palette.mode === 'dark'
      ? `radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
         radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%)`
      : `radial-gradient(circle at 30% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
         radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`,
    zIndex: 0,
  },
}));

const StepCard = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.4)' 
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.05)'
    : '1px solid rgba(30, 41, 59, 0.08)',
  borderRadius: 16,
  padding: theme.spacing(3),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 24px rgba(0, 0, 0, 0.4)'
      : '0 12px 24px rgba(30, 41, 59, 0.1)',
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(15, 23, 42, 0.6)' 
      : 'rgba(255, 255, 255, 0.9)',
  },
}));

// Helper function to get course thumbnail
const getCourseThumbnail = (course: Course): { type: 'image' | 'emoji'; value: string } => {
  if (course.thumbnail && course.thumbnail.trim()) {
    return { type: 'image', value: course.thumbnail };
  }
  
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
  
  return { type: 'emoji', value: thumbnails[language] || thumbnails.default };
};

// Helper function to calculate progress
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

export const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        const response = await CourseAPI.getCourse(parseInt(courseId));
        if (response.success && response.data) {
          setCourse(response.data);
        }
      } catch (err) {
        console.error('Course fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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

  if (!course) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        p: 3,
      }}>
        <Typography variant="h4" gutterBottom>Course Not Found</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          The course you're looking for doesn't exist or has been removed.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const thumbnail = getCourseThumbnail(course);
  const progress = getCourseProgress(course);
  const isEnrolled = !!course.enrollment;

  // Mock steps data for now
  const mockSteps = [
    { id: 1, title: 'Introduction to the Course', duration: '5 min', completed: true, type: 'video' },
    { id: 2, title: 'Setting up the Environment', duration: '15 min', completed: true, type: 'text' },
    { id: 3, title: 'Your First Program', duration: '20 min', completed: false, type: 'code' },
    { id: 4, title: 'Understanding Variables', duration: '12 min', completed: false, type: 'video' },
    { id: 5, title: 'Control Structures', duration: '25 min', completed: false, type: 'interactive' },
    { id: 6, title: 'Functions and Methods', duration: '18 min', completed: false, type: 'code' },
    { id: 7, title: 'Final Project', duration: '45 min', completed: false, type: 'project' },
  ];

  const getStepIcon = (_type: string, completed: boolean) => {
    if (completed) return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    return <RadioButtonUncheckedIcon sx={{ color: 'text.secondary' }} />;
  };

  const getStepTypeChip = (type: string) => {
    const typeConfig = {
      video: { label: 'Video', color: 'primary' as const },
      text: { label: 'Reading', color: 'secondary' as const },
      code: { label: 'Code', color: 'success' as const },
      interactive: { label: 'Interactive', color: 'warning' as const },
      project: { label: 'Project', color: 'error' as const },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.text;
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default', 
      position: 'relative',
    }}>
      {/* Animated background */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: (theme) => theme.palette.mode === 'dark'
            ? `radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)`
            : `radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)`,
        }}
      />

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 3, opacity: 0.8 }}
        >
          Back to Dashboard
        </Button>

        {/* Hero Section */}
        <HeroSection sx={{ mb: 4 }}>
          <Box sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="flex-start">
              {/* Course Image */}
              <Box
                sx={{
                  width: { xs: '100%', md: 280 },
                  height: { xs: 200, md: 180 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  backgroundColor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }}
              >
                {thumbnail.type === 'image' ? (
                  <img
                    src={thumbnail.value}
                    alt={course.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '📚';
                        parent.style.fontSize = '4rem';
                      }
                    }}
                  />
                ) : (
                  <Typography sx={{ fontSize: '4rem' }}>
                    {thumbnail.value}
                  </Typography>
                )}
              </Box>

              {/* Course Info */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={3}>
                  {/* Title and actions */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h3" fontWeight="bold" gutterBottom>
                        {course.title}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        by {course.teacher?.name || 'Unknown Instructor'}
                      </Typography>
                    </Box>
                    
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        sx={{ 
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkIcon />}
                      </IconButton>
                      <IconButton
                        sx={{ 
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                      >
                        <ShareIcon />
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Course Stats */}
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <StarIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                      <Typography variant="body1" fontWeight="medium">4.8</Typography>
                      <Typography variant="body2" color="text.secondary">(1,234 reviews)</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body1">{course.enrolled_students_count || 0} students</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TimeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body1">{formatDuration(course.estimated_duration_hours)}</Typography>
                    </Stack>
                  </Stack>

                  {/* Progress Section (only if enrolled) */}
                  {isEnrolled && (
                    <Box>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          Your Progress
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary.main">
                          {progress.completed}/{progress.total} lessons
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={progress.progress}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: alpha('#6366f1', 0.1),
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                            borderRadius: 6,
                          },
                        }}
                      />
                      <Typography variant="body2" color="primary.main" fontWeight="bold" sx={{ mt: 1 }}>
                        {progress.progress}% Complete
                      </Typography>
                    </Box>
                  )}

                  {/* Course Description */}
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {course.description || 'Dive deep into the fundamentals and advanced concepts of programming. This comprehensive course will take you from beginner to expert level with hands-on projects and real-world applications.'}
                  </Typography>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<PlayIcon />}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                      },
                      alignSelf: 'flex-start',
                    }}
                  >
                    {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </HeroSection>

        {/* Course Content Section */}
        <GlassCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Course Content
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {mockSteps.length} lessons • {mockSteps.reduce((acc, step) => acc + parseInt(step.duration), 0)} minutes total
            </Typography>

            <Stack spacing={2}>
              {mockSteps.map((step, index) => (
                <StepCard key={step.id} elevation={0}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    {/* Step Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 24 }}>
                      {getStepIcon(step.type, step.completed)}
                    </Box>

                    {/* Step Number */}
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={step.completed ? 'success.main' : 'text.secondary'}
                      sx={{ minWidth: 32 }}
                    >
                      {index + 1}
                    </Typography>

                    {/* Step Info */}
                    <Box sx={{ flex: 1 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                        <Typography
                          variant="h6"
                          fontWeight="medium"
                          sx={{
                            textDecoration: step.completed ? 'line-through' : 'none',
                            opacity: step.completed ? 0.7 : 1,
                          }}
                        >
                          {step.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {getStepTypeChip(step.type)}
                          <Typography variant="body2" color="text.secondary">
                            {step.duration}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>

                    {/* Play Button */}
                    <IconButton
                      disabled={!isEnrolled}
                      sx={{
                        bgcolor: step.completed ? 'success.main' : 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: step.completed ? 'success.dark' : 'primary.dark',
                        },
                        '&:disabled': {
                          bgcolor: 'action.disabledBackground',
                          color: 'action.disabled',
                        },
                      }}
                    >
                      <PlayIcon />
                    </IconButton>
                  </Stack>
                </StepCard>
              ))}
            </Stack>

            {!isEnrolled && (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Enroll in this course to access all lessons and track your progress
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  }}
                >
                  Enroll Now - Free
                </Button>
              </Box>
            )}
          </CardContent>
        </GlassCard>
      </Box>
    </Box>
  );
};

export default CoursePage;
