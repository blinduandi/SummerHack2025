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
  Tooltip,
  Collapse,
  Divider,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
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
  MenuBook as TheoryIcon,
  RateReview as ReviewIcon,
  Code as CodeIcon,
  Build as SetupIcon,
  CloudUpload as DeploymentIcon,
  BugReport as TestingIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { CourseAPI, ProgressAPI } from '../services/api';
import type { Course, CourseStep, Progress } from '../types';
import Aurora from '../blocks/Aurora/Aurora';
import { useTheme } from '@mui/material/styles';

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

const ExpandedStepContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.6)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(15px)',
  WebkitBackdropFilter: 'blur(15px)',
  border: theme.palette.mode === 'dark'
    ? '2px solid rgba(99, 102, 241, 0.3)'
    : '2px solid rgba(99, 102, 241, 0.2)',
  borderRadius: 20,
  padding: theme.spacing(4),
  marginTop: theme.spacing(2),
  position: 'relative',
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
const getCourseProgress = (_course: Course, courseProgress: Progress | null, steps: CourseStep[], stepProgress: Record<number, Progress>): { progress: number; completed: number; total: number } => {
  const totalSteps = steps.length;
  
  // Count completed steps from step progress
  const completedSteps = Object.values(stepProgress).filter(
    progress => progress.status === 'completed' || progress.status === 'solved'
  ).length;
  
  // Use course progress percentage if available, otherwise calculate from completed steps
  let progressPercentage = 0;
  if (courseProgress?.progress_percentage !== undefined && courseProgress.progress_percentage >= 0) {
    progressPercentage = courseProgress.progress_percentage;
  } else {
    progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  }
    // Calculate completed count from percentage if course progress is available
  let actualCompletedCount = completedSteps;
  if (courseProgress?.progress_percentage !== undefined && courseProgress.progress_percentage >= 0) {
    actualCompletedCount = Math.round((courseProgress.progress_percentage / 100) * totalSteps);
  }
  
  return { 
    progress: progressPercentage, 
    completed: actualCompletedCount, 
    total: totalSteps 
  };
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
  const [steps, setSteps] = useState<CourseStep[]>([]);
  const [stepProgress, setStepProgress] = useState<Record<number, Progress>>({});
  const [courseProgress, setCourseProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [stepsLoading, setStepsLoading] = useState(false);  const [isBookmarked, setIsBookmarked] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<number | null>(null);
  const [markingComplete, setMarkingComplete] = useState<Record<number, boolean>>({});
  const [stepStartTimes, setStepStartTimes] = useState<Record<number, number>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [selectedStepForCompletion, setSelectedStepForCompletion] = useState<CourseStep | null>(null);
  const [userNotes, setUserNotes] = useState('');const theme = useTheme();
  const auroraColorStops = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.primary.dark,
  ];

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      setLoading(true);
      try {
        // Fetch course details
        const courseResponse = await CourseAPI.getCourse(parseInt(courseId));
        if (courseResponse.success && courseResponse.data) {
          setCourse(courseResponse.data);
          
          // Fetch course steps
          setStepsLoading(true);
          try {
            const stepsResponse = await CourseAPI.getCourseSteps(parseInt(courseId));
            if (stepsResponse.success && stepsResponse.data) {
              // Sort steps by step_order
              const sortedSteps = stepsResponse.data.sort((a, b) => a.step_order - b.step_order);
              setSteps(sortedSteps);

              // Fetch progress data if user is enrolled
              if (courseResponse.data.enrollment) {
                await fetchProgressData(parseInt(courseId), sortedSteps);
              }
            }
          } catch (stepsErr) {
            console.error('Steps fetch error:', stepsErr);
            // Don't fail the whole page if steps fail to load
          } finally {
            setStepsLoading(false);
          }
        }
      } catch (err) {
        console.error('Course fetch error:', err);
      } finally {
        setLoading(false);
      }
    };    fetchCourseData();
  }, [courseId]);

  const fetchProgressData = async (courseId: number, _courseSteps: CourseStep[]) => {
    try {
      // Fetch course progress
      const courseProgressResponse = await ProgressAPI.getCourseProgress(courseId);
      if (courseProgressResponse.success && courseProgressResponse.data) {
        setCourseProgress(courseProgressResponse.data);
      }      // Fetch steps progress
      const stepsProgressResponse = await ProgressAPI.getCourseStepsProgress(courseId);
      if (stepsProgressResponse.success && stepsProgressResponse.data) {
        // Create a map of step_id to progress
        const progressMap: Record<number, Progress> = {};
        
        // The backend returns steps with nested progress
        if (Array.isArray(stepsProgressResponse.data)) {
          stepsProgressResponse.data.forEach((item: any) => {
            // Check if it's a step with nested progress or direct progress
            if (item.progress && Array.isArray(item.progress) && item.progress.length > 0) {
              // Step with nested progress array
              const progress = item.progress[0]; // Take the first progress entry
              progressMap[item.id] = progress;
            } else if (item.progress && !Array.isArray(item.progress)) {
              // Step with single nested progress object
              progressMap[item.id] = item.progress;
            } else if (item.step_id || item.course_step_id) {
              // Direct progress object
              const stepId = item.step_id || item.course_step_id;
              if (stepId) {
                progressMap[stepId] = item;
              }
            }
          });
        }
        
        console.log('Processed step progress map:', progressMap);
        setStepProgress(progressMap);
      }
    } catch (err) {
      console.error('Progress fetch error:', err);
    }
  };

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
        <Button sx={{color:'white !important'}} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );  }
  const thumbnail = getCourseThumbnail(course);
  const progress = getCourseProgress(course, courseProgress, steps, stepProgress);
  const isEnrolled = !!course.enrollment;
  // Helper functions for step rendering
  const parseStepMetadata = (metadata: string | Record<string, any> | undefined): Record<string, any> => {
    if (!metadata) return {};
    if (typeof metadata === 'string') {
      try {
        return JSON.parse(metadata);
      } catch {
        return {};
      }
    }
    return metadata;
  };  const getStepIcon = (step: CourseStep) => {
    const progress = stepProgress[step.id];
    const isCompleted = progress?.status === 'completed' || progress?.status === 'solved';
    
    if (isCompleted) return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    return <RadioButtonUncheckedIcon sx={{ color: 'text.secondary' }} />;
  };const getStepTypeChip = (stepType: CourseStep['step_type']) => {
    const typeConfig = {
      theory: { label: 'Theory', color: 'primary' as const, icon: <TheoryIcon sx={{ fontSize: 16 }} /> },
      review: { label: 'Review', color: 'secondary' as const, icon: <ReviewIcon sx={{ fontSize: 16 }} /> },
      code: { label: 'Code', color: 'success' as const, icon: <CodeIcon sx={{ fontSize: 16 }} /> },
      setup: { label: 'Setup', color: 'info' as const, icon: <SetupIcon sx={{ fontSize: 16 }} /> },
      deployment: { label: 'Deploy', color: 'warning' as const, icon: <DeploymentIcon sx={{ fontSize: 16 }} /> },
      testing: { label: 'Testing', color: 'error' as const, icon: <TestingIcon sx={{ fontSize: 16 }} /> },
    };
    
    const config = typeConfig[stepType] || typeConfig.theory;
    return (
      <Chip 
        label={config.label} 
        color={config.color} 
        size="small" 
        variant="outlined"
        icon={config.icon}
      />
    );
  };  const formatStepDuration = (step: CourseStep): string => {
    const metadata = parseStepMetadata(step.metadata);
    
    // Try to extract duration from metadata
    if (metadata.estimated_time) {
      return metadata.estimated_time;
    }
    
    // Estimate based on content length (rough approximation)
    const contentLength = step.content ? step.content.length : 0;
    const estimatedMinutes = Math.max(5, Math.ceil(contentLength / 200)); // ~200 chars per minute reading
    return `${estimatedMinutes} min`;
  };
  const getStepDifficultyChip = (step: CourseStep) => {
    const metadata = parseStepMetadata(step.metadata);
    const difficulty = metadata.difficulty || 'easy';
    
    const difficultyConfig = {
      easy: { label: 'Easy', color: 'success' as const },
      medium: { label: 'Medium', color: 'warning' as const },
      hard: { label: 'Hard', color: 'error' as const },
    };
    
    const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.easy;
    return <Chip label={config.label} color={config.color} size="small" />;
  };  const handleStepClick = (stepId: number) => {
    if (!isEnrolled) return;
    
    if (expandedStepId === stepId) {
      setExpandedStepId(null); // Collapse if already expanded
    } else {
      setExpandedStepId(stepId); // Expand the clicked step
      
      // Track when the step was started/opened
      setStepStartTimes(prev => ({
        ...prev,
        [stepId]: Date.now()
      }));
      
      // Scroll to the step after a brief delay to allow for animation
      setTimeout(() => {
        const stepElement = document.getElementById(`step-${stepId}`);
        if (stepElement) {
          stepElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  };
  const handleCloseStep = () => {
    setExpandedStepId(null);
  };  const handleMarkComplete = async (step: CourseStep) => {
    // Check if step is already completed
    const stepProgressData = stepProgress[step.id];
    if (stepProgressData?.status === 'completed' || stepProgressData?.status === 'solved') {
      setSuccessMessage(`"${step.title}" is already completed!`);
      setShowSuccessMessage(true);
      return;
    }
    
    // Open completion dialog
    setSelectedStepForCompletion(step);
    setUserNotes('');
    setCompletionDialogOpen(true);
  };const handleConfirmCompletion = async () => {
    const step = selectedStepForCompletion;
    if (!courseId || !step || markingComplete[step.id]) return;

    // Check if step is already completed
    const stepProgressData = stepProgress[step.id];
    if (stepProgressData?.status === 'completed' || stepProgressData?.status === 'solved') {
      setSuccessMessage(`"${step.title}" is already completed!`);
      setShowSuccessMessage(true);
      setCompletionDialogOpen(false);
      setSelectedStepForCompletion(null);
      return;
    }    setMarkingComplete(prev => ({ ...prev, [step.id]: true }));
    setCompletionDialogOpen(false);
    
    try {
      // Calculate read time based on when the step was opened
      const startTime = stepStartTimes[step.id];
      const readTime = startTime ? Math.round((Date.now() - startTime) / 1000 / 60) : 5; // Convert to minutes, default 5 if not tracked
      
      const payload = {
        status: 'solved' as const,
        progress_data: {
          read_time: Math.max(1, readTime), // Minimum 1 minute
          notes: userNotes || ''
        },
        notes: userNotes || ''
      };
      
      console.log('Sending step completion payload:', payload);
      
      // Mark step as completed with proper payload structure
      const response = await ProgressAPI.updateStepProgress(step.id, payload);

      if (response.success) {
        // Force refresh all progress data from the server
        await refreshAllProgressData();
        
        // Show success message
        setSuccessMessage(`"${step.title}" completed successfully! 🎉`);
        setShowSuccessMessage(true);
        
        // Close the expanded step after completion and auto-advance
        if (expandedStepId === step.id) {
          setTimeout(() => {
            setExpandedStepId(null);
            
            // Auto-advance to next incomplete step after a delay
            setTimeout(() => {
              const currentIndex = steps.findIndex(s => s.id === step.id);
              const nextStep = steps.slice(currentIndex + 1).find(s => {
                const nextProgress = stepProgress[s.id];
                return !nextProgress || (nextProgress.status !== 'completed' && nextProgress.status !== 'solved');
              });
              
              if (nextStep) {
                setExpandedStepId(nextStep.id);
                setStepStartTimes(prev => ({
                  ...prev,
                  [nextStep.id]: Date.now()
                }));
                const nextStepElement = document.getElementById(`step-${nextStep.id}`);
                if (nextStepElement) {
                  nextStepElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                  });
                }
              }
            }, 1000);
          }, 1000); // Give user time to see the success state
        }
      } else {
        console.error('Step completion failed:', response.error);
        setSuccessMessage(`Failed to mark "${step.title}" as complete. Please try again.`);
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error('Error marking step as complete:', error);
      // Show error message to user
      setSuccessMessage(`Error completing "${step.title}". Please check your connection and try again.`);
      setShowSuccessMessage(true);
    } finally {
      setMarkingComplete(prev => ({ ...prev, [step.id]: false }));
      setSelectedStepForCompletion(null);
    }
  };  // Helper function to refresh all progress data
  const refreshAllProgressData = async () => {
    if (!courseId) return;
    
    try {
      // Add a small delay to ensure backend has processed the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Fetch fresh course progress
      const courseProgressResponse = await ProgressAPI.getCourseProgress(parseInt(courseId));
      if (courseProgressResponse.success && courseProgressResponse.data) {
        setCourseProgress(courseProgressResponse.data);
      }      // Fetch fresh step progress
      const stepsProgressResponse = await ProgressAPI.getCourseStepsProgress(parseInt(courseId));
      if (stepsProgressResponse.success && stepsProgressResponse.data) {
        const progressMap: Record<number, Progress> = {};
        
        // The backend returns steps with nested progress
        if (Array.isArray(stepsProgressResponse.data)) {
          stepsProgressResponse.data.forEach((item: any) => {
            // Check if it's a step with nested progress or direct progress
            if (item.progress && Array.isArray(item.progress) && item.progress.length > 0) {
              // Step with nested progress array
              const progress = item.progress[0]; // Take the first progress entry
              progressMap[item.id] = progress;
            } else if (item.progress && !Array.isArray(item.progress)) {
              // Step with single nested progress object
              progressMap[item.id] = item.progress;
            } else if (item.step_id || item.course_step_id) {
              // Direct progress object
              const stepId = item.step_id || item.course_step_id;
              if (stepId) {
                progressMap[stepId] = item;
              }
            }
          });
        }
        
        setStepProgress(progressMap);
      }
    } catch (error) {
      console.error('Error refreshing progress data:', error);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'transparent',
      position: 'relative',
    }}>
      {/* Aurora animated background */}
      <Box
        sx={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          zIndex: -1,
        }}
      >
        <Aurora
          colorStops={auroraColorStops}
          blend={6}
          speed={1.5}
          amplitude={0.5}
        />
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 3, opacity: 0.8, color: 'white' }}
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
        </HeroSection>        {/* Course Content Section */}
        <GlassCard>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Course Content
            </Typography>
            
            {stepsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : steps.length > 0 ? (
              <>                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {steps.length} lessons • {Object.values(stepProgress).filter(p => p.status === 'completed' || p.status === 'solved').length} completed
                </Typography><Stack spacing={2}>                  {steps.map((step) => {
                    const isExpanded = expandedStepId === step.id;
                    const isCollapsed = expandedStepId !== null && expandedStepId !== step.id;
                    const progress = stepProgress[step.id];
                    const isCompleted = progress?.status === 'completed' || progress?.status === 'solved';
                    const isMarkingComplete = markingComplete[step.id] || false;
                    
                    return (
                      <Box key={step.id} id={`step-${step.id}`}>
                        <StepCard 
                          elevation={0}
                          onClick={() => handleStepClick(step.id)}                          sx={{
                            cursor: isEnrolled ? 'pointer' : 'default',
                            opacity: isEnrolled ? (isCollapsed ? 0.3 : 1) : 0.7,
                            transform: isCollapsed ? 'scale(0.95)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            border: isExpanded ? '2px solid' : '1px solid',
                            borderColor: isExpanded ? 'primary.main' : (isCompleted ? 'success.main' : 'transparent'),
                            backgroundColor: isCompleted ? (theme) => 
                              theme.palette.mode === 'dark' 
                                ? 'rgba(76, 175, 80, 0.1)' 
                                : 'rgba(76, 175, 80, 0.05)'
                              : undefined,
                          }}
                        >
                          <Stack direction="row" alignItems="flex-start" spacing={3}>
                            {/* Step Icon */}
                            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 24, mt: 0.5 }}>
                              {getStepIcon(step)}
                            </Box>

                            {/* Step Number/Order */}
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color={isExpanded ? 'primary.main' : 'text.secondary'}
                              sx={{ minWidth: 32, mt: 0.5 }}
                            >
                              {step.step_order}
                            </Typography>

                            {/* Step Info */}
                            <Box sx={{ flex: 1 }}>
                              <Stack spacing={2}>
                                {/* Title and Type */}
                                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>                                  <Typography 
                                    variant="h6" 
                                    fontWeight="medium"
                                    color={isExpanded ? 'primary.main' : (isCompleted ? 'success.main' : 'text.primary')}
                                    sx={{
                                      textDecoration: isCompleted ? 'line-through' : 'none',
                                      opacity: isCompleted ? 0.8 : 1,
                                    }}
                                  >
                                    {step.title} {isCompleted && '✓'}
                                  </Typography>                                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    {getStepTypeChip(step.step_type)}
                                    {parseStepMetadata(step.metadata).difficulty && getStepDifficultyChip(step)}
                                    <Typography variant="body2" color="text.secondary">
                                      {formatStepDuration(step)}
                                    </Typography>
                                    {step.is_required && (
                                      <Chip label="Required" color="error" size="small" variant="outlined" />
                                    )}
                                    {isCompleted && (
                                      <Chip 
                                        label="Completed" 
                                        color="success" 
                                        size="small" 
                                        icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                                      />
                                    )}
                                  </Stack>
                                </Stack>
                                
                                {/* Description - only show if not expanded or if collapsed */}
                                {!isExpanded && step.description && (
                                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                    {step.description}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>

                            {/* Action Button */}
                            <Stack direction="row" spacing={1} alignItems="center">
                              {isExpanded && (
                                <Tooltip title="Close lesson">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCloseStep();
                                    }}
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    <CloseIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <Tooltip title={isEnrolled ? (isExpanded ? "Collapse lesson" : "Start lesson") : "Enroll to access lesson"}>
                                <span>
                                  <IconButton
                                    disabled={!isEnrolled}
                                    sx={{
                                      bgcolor: isExpanded ? 'success.main' : 'primary.main',
                                      color: 'white',
                                      '&:hover': {
                                        bgcolor: isExpanded ? 'success.dark' : 'primary.dark',
                                      },
                                      '&:disabled': {
                                        bgcolor: 'action.disabledBackground',
                                        color: 'action.disabled',
                                      },
                                    }}
                                  >
                                    {isExpanded ? <ExpandLessIcon /> : <PlayIcon />}
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </StepCard>

                        {/* Expanded Content */}
                        <Collapse in={isExpanded} timeout={300}>
                          <ExpandedStepContent>
                            {/* Close button */}
                            <IconButton
                              onClick={handleCloseStep}
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                bgcolor: 'background.paper',
                                '&:hover': { bgcolor: 'action.hover' }
                              }}
                            >
                              <CloseIcon />
                            </IconButton>

                            <Stack spacing={3}>
                              {/* Step Header */}
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    Step {step.step_order}: {step.title}
                                  </Typography>
                                </Stack>
                                
                                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                  {getStepTypeChip(step.step_type)}
                                  {parseStepMetadata(step.metadata).difficulty && getStepDifficultyChip(step)}
                                  <Chip 
                                    label={formatStepDuration(step)} 
                                    variant="outlined" 
                                    size="small"
                                    icon={<TimeIcon sx={{ fontSize: 16 }} />}
                                  />
                                  {step.is_required && (
                                    <Chip label="Required" color="error" size="small" variant="outlined" />
                                  )}
                                </Stack>
                              </Box>

                              <Divider />

                              {/* Step Description */}
                              {step.description && (
                                <Box>
                                  <Typography variant="h6" gutterBottom fontWeight="medium">
                                    Overview
                                  </Typography>
                                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    {step.description}
                                  </Typography>
                                </Box>
                              )}

                              {/* Step Content */}
                              <Box>
                                <Typography variant="h6" gutterBottom fontWeight="medium">
                                  Lesson Content
                                </Typography>
                                <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                  {step.content}
                                </Typography>
                              </Box>                              {/* Action Buttons */}
                              <Stack direction="row" spacing={2} sx={{ pt: 2 }}>                                <Button
                                  variant="contained"
                                  size="large"
                                  startIcon={isCompleted ? <CheckCircleIcon /> : (isMarkingComplete ? <CircularProgress size={16} /> : <CheckCircleIcon />)}
                                  disabled={isCompleted || isMarkingComplete}
                                  sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    background: isCompleted 
                                      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                    },
                                    '&:disabled': {
                                      background: isCompleted 
                                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                        : 'rgba(0, 0, 0, 0.12)',
                                      color: isCompleted ? 'white' : 'rgba(0, 0, 0, 0.26)',
                                    }
                                  }}
                                  onClick={() => handleMarkComplete(step)}
                                >
                                  {isMarkingComplete ? 'Marking Complete...' : (isCompleted ? 'Completed' : 'Mark Complete')}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="large"
                                  onClick={handleCloseStep}
                                  sx={{ px: 4, py: 1.5, borderRadius: 3 }}
                                >
                                  Close
                                </Button>
                              </Stack>
                            </Stack>
                          </ExpandedStepContent>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No lessons available yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The instructor is still preparing the course content.
                </Typography>
              </Box>
            )}

            {!isEnrolled && steps.length > 0 && (
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
          </CardContent>        </GlassCard>      </Box>
        {/* Completion Dialog */}
      <Dialog 
        open={completionDialogOpen} 
        onClose={() => setCompletionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: (theme) => theme.palette.mode === 'dark' 
              ? 'rgb(30, 41, 59)' 
              : 'rgb(255, 255, 255)',
            opacity: 1,
            backdropFilter: 'none',
            WebkitBackdropFilter: 'none',
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }
        }}
      >
        <DialogTitle>
          Complete Lesson: {selectedStepForCompletion?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Great job on completing this lesson! Share your thoughts or key takeaways (optional).
          </Typography>
          <TextField
            label="Your notes about this lesson"
            multiline
            rows={3}
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="What did you learn? Any questions or insights?"
            fullWidth
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCompletionDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmCompletion}
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              }
            }}
          >
            Mark Complete
          </Button>
        </DialogActions>
      </Dialog>
        {/* Success/Error Snackbar */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={4000}
        onClose={() => setShowSuccessMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessMessage(false)} 
          severity={successMessage.includes('Failed') || successMessage.includes('Error') ? 'error' : 'success'} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CoursePage;
