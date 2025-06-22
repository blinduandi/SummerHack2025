import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Stack,
  Divider,
  Tab,
  Tabs,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
  Backdrop,
  Fade,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  School as SchoolIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AutoStories as AutoStoriesIcon,
  Psychology as PsychologyIcon,
  Build as BuildIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ProgrammingLanguageAPI, CourseAPI } from '../services/api';
import { useAuth } from '../hooks';
import type { 
  Course, 
  CourseStep, 
  ProgrammingLanguage,
} from '../types';
import Aurora from '../blocks/Aurora/Aurora';

// Simplified validation schemas
const courseSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  difficulty_level: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required('Difficulty is required'),
  estimated_duration_hours: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 hour'),
  programming_language_id: yup.number().required('Programming language is required').min(1, 'Please select a programming language'),
  program_id: yup.number().optional(),
  prerequisites: yup.array().of(yup.string().required()).default([]),
  learning_objectives: yup.array().of(yup.string().required()).default([]),
  tags: yup.array().of(yup.string().required()).default([]),
  is_published: yup.boolean().default(true),
});

const stepSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  content: yup.string().required('Content is required'),
  step_type: yup.string().oneOf(['lesson', 'exercise', 'quiz', 'project']).required(),
  is_required: yup.boolean().default(true),
  estimated_duration: yup.number().min(1).optional(),
  difficulty: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).optional(),
  keywords: yup.array().of(yup.string()).default([]),
  is_published: yup.boolean().default(true),
});

type CourseFormData = yup.InferType<typeof courseSchema>;
type StepFormData = yup.InferType<typeof stepSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`teacher-tabpanel-${index}`}
      aria-labelledby={`teacher-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TeacherDashboardPageSimplified: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguage[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseSteps, setCourseSteps] = useState<CourseStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingStep, setEditingStep] = useState<CourseStep | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });  // Form instances
  const courseForm = useForm<CourseFormData>({
    resolver: yupResolver(courseSchema),    defaultValues: {
      title: '',
      description: '',
      difficulty_level: 'beginner',
      estimated_duration_hours: 1,
      programming_language_id: 0,
      program_id: undefined,
      prerequisites: [],
      learning_objectives: [],
      tags: [],
      is_published: true,
    },
  });
  const stepForm = useForm({
    resolver: yupResolver(stepSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      step_type: 'lesson' as const,
      is_required: true,
      estimated_duration: 15,
      difficulty: 'beginner' as const,
      keywords: [] as string[],
      is_published: true,
    },
  });

  // Check if user is a teacher
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (!isTeacher) {
      showSnackbar('Access denied. Teacher role required.', 'error');
      return;
    }
    loadInitialData();
  }, [isTeacher]);
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const coursesResult = await CourseAPI.listCourses().catch(() => ({ success: false, data: { data: [], total: 0, current_page: 1, last_page: 1 } }));
      const languagesResult = await ProgrammingLanguageAPI.listProgrammingLanguages().catch(() => ({ success: false, data: [] }));

      if (coursesResult.success) {
        setCourses(coursesResult.data?.data || []);
      }

      if (languagesResult.success) {
        setProgrammingLanguages(languagesResult.data || []);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      showSnackbar('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Course management
  const handleCreateCourse = () => {
    setEditingCourse(null);
    courseForm.reset();
    setCourseDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.reset({
      title: course.title,
      description: course.description,
      difficulty_level: course.difficulty_level,
      estimated_duration_hours: course.estimated_duration_hours,
      programming_language_id: course.programming_language_id,
      prerequisites: [],
      learning_objectives: [],
      tags: [],
      is_published: course.is_active,
    });
    setCourseDialogOpen(true);
  };
  const handleSubmitCourse = async (data: CourseFormData) => {
    setActionLoading(true);    try {
      console.log('Submitting course data:', data);
        // Prepare the request payload according to your backend API
      const courseData = {
        title: data.title,
        description: data.description,
        category: 'Programming', // Hardcoded category to fix SQL error
        difficulty_level: data.difficulty_level,
        estimated_duration_hours: data.estimated_duration_hours,
        programming_language_id: data.programming_language_id,
        program_id: data.program_id || undefined,
        prerequisites: data.prerequisites || [],
        learning_objectives: data.learning_objectives || [],
        tags: data.tags || [],
        is_published: data.is_published ?? true,
      };

      console.log('Final courseData payload:', courseData);      let result;
      if (editingCourse) {
        // Update existing course
        console.log('Updating course with ID:', editingCourse.id);
        result = await CourseAPI.updateCourse(editingCourse.id, courseData);
      } else {
        // Create new course
        console.log('Creating new course with data:', courseData);
        result = await CourseAPI.createCourse(courseData);
      }

      console.log('API result:', result);

      if (result.success) {
        showSnackbar(
          editingCourse ? 'Course updated successfully' : 'Course created successfully',
          'success'
        );
        setCourseDialogOpen(false);
        courseForm.reset();
        await loadInitialData(); // Refresh the courses list
      } else {
        throw new Error(result.error?.message || 'Failed to save course');
      }
    } catch (error: any) {
      console.error('Failed to save course:', error);
      showSnackbar(
        error.message || 'Failed to save course. Please try again.',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Step management
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    // Load course steps would go here
    setCourseSteps([]); // Placeholder
    setActiveTab(1);
  };

  const handleCreateStep = () => {
    if (!selectedCourse) return;
    setEditingStep(null);
    stepForm.reset();
    setStepDialogOpen(true);
  };

  const handleEditStep = (step: CourseStep) => {
    setEditingStep(step);
    stepForm.reset({
      title: step.title,
      description: step.description,
      content: step.content,
      step_type: step.step_type as any,
      is_required: step.is_required,
      estimated_duration: 15,
      difficulty: 'beginner',
      keywords: [],
      is_published: step.is_active,
    });
    setStepDialogOpen(true);
  };

  const handleSubmitStep = async (data: StepFormData) => {
    if (!selectedCourse) return;

    setActionLoading(true);
    try {
      console.log('Creating/updating step:', data);
      showSnackbar(
        editingStep ? 'Step updated successfully' : 'Step created successfully',
        'success'
      );
      setStepDialogOpen(false);
    } catch (error) {
      console.error('Failed to save step:', error);
      showSnackbar('Failed to save step', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'lesson': return <AutoStoriesIcon sx={{ color: theme.palette.primary.main }} />;
      case 'exercise': return <CodeIcon sx={{ color: theme.palette.secondary.main }} />;
      case 'quiz': return <PsychologyIcon sx={{ color: theme.palette.info.main }} />;
      case 'project': return <BuildIcon sx={{ color: theme.palette.success.main }} />;
      default: return <DescriptionIcon sx={{ color: theme.palette.text.secondary }} />;
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getStepTypeColor = (stepType: string) => {
    switch (stepType) {
      case 'lesson': return 'primary';
      case 'exercise': return 'secondary';
      case 'quiz': return 'info';
      case 'project': return 'success';
      default: return 'default';
    }
  };
  if (!isTeacher) {
    return (
      <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <Aurora />
        <Container maxWidth="md" sx={{ 
          position: 'relative', 
          zIndex: 1, 
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center',
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}>
            <SchoolIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="error">
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This page is only available for teachers. Please contact an administrator if you need access.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <Aurora />
        <Container maxWidth="xl" sx={{ 
          position: 'relative', 
          zIndex: 1, 
          py: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center',
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            minWidth: 300
          }}>
            <LinearProgress sx={{ mb: 3, borderRadius: 2 }} />
            <Typography variant="h6" gutterBottom>
              Loading Teacher Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Setting up your teaching workspace...
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <Aurora />
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Header Section */}
        <Paper sx={{ 
          p: 4, 
          mb: 4,
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar sx={{ 
              width: 64, 
              height: 64, 
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              fontSize: '2rem'
            }}>
              <SchoolIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" gutterBottom sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>
                Teacher Dashboard
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Welcome back, {user?.name}! Manage your courses and inspire students.
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                background: alpha(theme.palette.success.main, 0.1),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                borderRadius: 2
              }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {courses.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Courses
                </Typography>
              </Paper>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                background: alpha(theme.palette.info.main, 0.1),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 2
              }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {courseSteps.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Steps
                </Typography>
              </Paper>
            </Stack>
          </Stack>
        </Paper>
      
        {/* Tabs Section */}
        <Paper sx={{ 
          mb: 3,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden'
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                fontWeight: 600,
                minHeight: 64,
                textTransform: 'none',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            <Tab 
              label="My Courses" 
              icon={<SchoolIcon />} 
              iconPosition="start"
              sx={{ px: 4 }}
            />
            <Tab 
              label="Course Steps" 
              icon={<AutoStoriesIcon />} 
              iconPosition="start"
              disabled={!selectedCourse}
              sx={{ px: 4 }}
            />
          </Tabs>
        </Paper>        {/* Courses Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              My Courses ({courses.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCourse}
              disabled={actionLoading}
              sx={{ 
                px: 3,
                py: 1.5,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              Create Course
            </Button>
          </Box>          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={6} lg={4} key={course.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  background: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { 
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  }
                }}
                onClick={() => handleSelectCourse(course)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: 'primary.main',
                        width: 48,
                        height: 48,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      }}>
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ mb: 0.5, fontWeight: 600 }}>
                          {course.title}
                        </Typography>
                      </Box>
                    </Stack>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                      {course.description}
                    </Typography>
                    
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={course.difficulty_level} 
                        size="small" 
                        color={getDifficultyColor(course.difficulty_level) as any}
                        sx={{ fontWeight: 600 }}
                      />
                      <Chip 
                        label={`${course.estimated_duration_hours}h`} 
                        size="small" 
                        variant="outlined"
                        icon={<TrendingUpIcon />}
                      />
                      <Chip 
                        label={course.is_active ? 'Published' : 'Draft'} 
                        size="small" 
                        color={course.is_active ? 'success' : 'default'}
                        variant={course.is_active ? 'filled' : 'outlined'}
                      />
                    </Stack>
                    
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 'auto' }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          0 students
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <AutoStoriesIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {courseSteps.filter(s => s.course_id === course.id).length} steps
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Button 
                      size="small" 
                      startIcon={<ViewIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCourse(course);
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      View Steps
                    </Button>
                    <Stack direction="row" spacing={1}>
                      <IconButton 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCourse(course);
                        }}
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          // handleDeleteCourse would go here
                        }}
                        sx={{ 
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {courses.length === 0 && (
            <Paper sx={{ 
              p: 6, 
              textAlign: 'center',
              background: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <SchoolIcon sx={{ 
                fontSize: 120, 
                color: alpha(theme.palette.primary.main, 0.3), 
                mb: 3 
              }} />
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                No courses yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                Create your first course to start teaching students and sharing your knowledge with the world.
              </Typography>
              <Button 
                variant="contained" 
                size="large"
                startIcon={<AddIcon />} 
                onClick={handleCreateCourse}
                sx={{ 
                  px: 4,
                  py: 2,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  }
                }}
              >
                Create Your First Course
              </Button>
            </Paper>
          )}
        </TabPanel>        {/* Steps Tab */}
        <TabPanel value={activeTab} index={1}>
          {selectedCourse && (
            <>
              <Paper sx={{ 
                p: 4, 
                mb: 4,
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}>
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Avatar sx={{ 
                    width: 56, 
                    height: 56,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}>
                    <AutoStoriesIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                      {selectedCourse.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {selectedCourse.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateStep}
                    disabled={actionLoading}
                    sx={{ 
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      }
                    }}
                  >
                    Add Step
                  </Button>
                </Stack>
              </Paper>

              <List sx={{ 
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                p: 2
              }}>
                {courseSteps
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((step, index) => (
                  <React.Fragment key={step.id}>
                    <ListItem sx={{ 
                      py: 2,
                      borderRadius: 2,
                      mb: 1,
                      '&:hover': {
                        background: alpha(theme.palette.primary.main, 0.05),
                      }
                    }}>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                        <DragIcon sx={{ color: 'text.secondary' }} />
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          background: alpha(getStepTypeColor(step.step_type) === 'primary' ? theme.palette.primary.main : 
                                          getStepTypeColor(step.step_type) === 'secondary' ? theme.palette.secondary.main :
                                          getStepTypeColor(step.step_type) === 'info' ? theme.palette.info.main :
                                          getStepTypeColor(step.step_type) === 'success' ? theme.palette.success.main :
                                          theme.palette.grey[500], 0.1)
                        }}>
                          {getStepIcon(step.step_type)}
                        </Box>
                        
                        <ListItemText
                          primary={
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {index + 1}. {step.title}
                              </Typography>
                              <Chip 
                                label={step.step_type} 
                                size="small" 
                                color={getStepTypeColor(step.step_type) as any}
                                variant="outlined"
                              />
                              {step.is_required && (
                                <Chip label="Required" size="small" color="error" />
                              )}
                              {!step.is_active && (
                                <Chip label="Draft" size="small" color="default" />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {step.description}
                            </Typography>
                          }
                        />
                        
                        <ListItemSecondaryAction>
                          <Stack direction="row" spacing={1}>
                            <IconButton 
                              onClick={() => handleEditStep(step)}
                              sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error"
                              onClick={() => {/* handleDeleteStep would go here */}}
                              sx={{ 
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Stack>
                        </ListItemSecondaryAction>
                      </Stack>
                    </ListItem>
                    {index < courseSteps.length - 1 && (
                      <Divider sx={{ my: 1, opacity: 0.3 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>

              {courseSteps.length === 0 && (
                <Paper sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  background: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                  <AutoStoriesIcon sx={{ 
                    fontSize: 120, 
                    color: alpha(theme.palette.primary.main, 0.3), 
                    mb: 3 
                  }} />
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    No steps yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                    Add your first step to start building this course and create an amazing learning experience.
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<AddIcon />} 
                    onClick={handleCreateStep}
                    sx={{ 
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      }
                    }}
                  >
                    Add First Step
                  </Button>
                </Paper>
              )}
            </>
          )}
        </TabPanel>        {/* Enhanced Course Dialog */}
        <Dialog 
          open={courseDialogOpen} 
          onClose={() => setCourseDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          TransitionComponent={Fade}
          transitionDuration={300}
          sx={{
            '& .MuiDialog-paper': {
              background: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            },
            '& .MuiBackdrop-root': {
              backgroundColor: alpha(theme.palette.common.black, 0.5),
              backdropFilter: 'blur(8px)',
            }
          }}
        >
          <Backdrop open={courseDialogOpen} sx={{ color: '#fff', zIndex: -1 }}>
            <Aurora />
          </Backdrop>
          <Paper sx={{
            background: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 3,
            m: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
          }}>
            <form onSubmit={courseForm.handleSubmit(handleSubmitCourse)}>
              <DialogTitle sx={{ 
                p: 4, 
                pb: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                borderRadius: '12px 12px 0 0',
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}>
                    <SchoolIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton onClick={() => setCourseDialogOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Controller
                    name="title"
                    control={courseForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Course Title"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="description"
                    control={courseForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                  />
                  
                  {/* Category field hidden since we hardcode it as 'Programming' in the backend */}
                  
                  <Controller
                    name="difficulty_level"
                    control={courseForm.control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error} sx={{ width: '100%' }}>
                        <InputLabel>Difficulty Level</InputLabel>
                        <Select {...field} label="Difficulty Level" sx={{ borderRadius: 2 }}>
                          <MenuItem value="beginner">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip label="Beginner" color="success" size="small" />
                              <Typography>Beginner</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="intermediate">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip label="Intermediate" color="warning" size="small" />
                              <Typography>Intermediate</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="advanced">
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Chip label="Advanced" color="error" size="small" />
                              <Typography>Advanced</Typography>
                            </Stack>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                  
                  <Controller
                    name="estimated_duration_hours"
                    control={courseForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Estimated Duration (hours)"
                        type="number"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="programming_language_id"
                    control={courseForm.control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error} sx={{ width: '100%' }}>
                        <InputLabel>Programming Language</InputLabel>
                        <Select {...field} label="Programming Language" sx={{ borderRadius: 2 }}>
                          {programmingLanguages.map((lang) => (
                            <MenuItem key={lang.id} value={lang.id}>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                {lang.icon && (
                                  <Avatar sx={{ width: 24, height: 24 }}>
                                    <img src={lang.icon} alt={lang.name} width="16" height="16" />
                                  </Avatar>
                                )}
                                <Typography>{lang.name}</Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ p: 4, pt: 2 }}>
                <Button 
                  onClick={() => setCourseDialogOpen(false)} 
                  disabled={actionLoading}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={actionLoading}
                  sx={{ 
                    px: 4,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  {actionLoading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </Button>
              </DialogActions>
            </form>
          </Paper>
        </Dialog>        {/* Enhanced Step Dialog */}
        <Dialog 
          open={stepDialogOpen} 
          onClose={() => setStepDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          TransitionComponent={Fade}
          transitionDuration={300}
          sx={{
            '& .MuiDialog-paper': {
              background: 'transparent',
              boxShadow: 'none',
              overflow: 'visible',
            },
            '& .MuiBackdrop-root': {
              backgroundColor: alpha(theme.palette.common.black, 0.5),
              backdropFilter: 'blur(8px)',
            }
          }}
        >
          <Backdrop open={stepDialogOpen} sx={{ color: '#fff', zIndex: -1 }}>
            <Aurora />
          </Backdrop>
          <Paper sx={{
            background: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 3,
            m: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.3)}`,
          }}>
            <form onSubmit={stepForm.handleSubmit(handleSubmitStep)}>
              <DialogTitle sx={{ 
                p: 4, 
                pb: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                borderRadius: '12px 12px 0 0',
              }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}>
                    <AutoStoriesIcon />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {editingStep ? 'Edit Step' : 'Create New Step'}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton onClick={() => setStepDialogOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </DialogTitle>
                <DialogContent sx={{ p: 4 }}>
                <Stack spacing={3} sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Controller
                    name="title"
                    control={stepForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Step Title"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="description"
                    control={stepForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={2}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="content"
                    control={stepForm.control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        label="Step Content"
                        fullWidth
                        multiline
                        rows={8}
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                        placeholder="Enter the step content, instructions, code examples, etc."
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    )}
                  />
                  
                  <Controller
                    name="step_type"
                    control={stepForm.control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error} sx={{ width: '100%' }}>
                        <InputLabel>Step Type</InputLabel>
                        <Select {...field} label="Step Type" sx={{ borderRadius: 2 }}>
                          <MenuItem value="lesson">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <AutoStoriesIcon color="primary" />
                              <Typography>Lesson</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="exercise">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <CodeIcon color="secondary" />
                              <Typography>Exercise</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="quiz">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <PsychologyIcon color="info" />
                              <Typography>Quiz</Typography>
                            </Stack>
                          </MenuItem>
                          <MenuItem value="project">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <BuildIcon color="success" />
                              <Typography>Project</Typography>
                            </Stack>
                          </MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Stack>
              </DialogContent>
              
              <DialogActions sx={{ p: 4, pt: 2 }}>
                <Button 
                  onClick={() => setStepDialogOpen(false)} 
                  disabled={actionLoading}
                  sx={{ borderRadius: 2 }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={actionLoading}
                  sx={{ 
                    px: 4,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    }
                  }}
                >
                  {actionLoading ? 'Saving...' : (editingStep ? 'Update Step' : 'Create Step')}
                </Button>
              </DialogActions>
            </form>
          </Paper>
        </Dialog>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              backdropFilter: 'blur(20px)',
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha(theme.palette[snackbar.severity].main, 0.3)}`,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default TeacherDashboardPageSimplified;
