import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
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
  Chip,
  Stack,
  Tab,
  Tabs,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AutoStories as AutoStoriesIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ProgrammingLanguageAPI, CourseAPI } from '../services/api';
import { useAuth } from '../hooks';
import type { 
  Course, 
  ProgrammingLanguage,
} from '../types';
import Aurora from '../blocks/Aurora/Aurora';

// Validation schemas
const courseSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  difficulty_level: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required(),
  estimated_duration_hours: yup.number().min(1).required('Duration is required'),
  programming_language_id: yup.number().required('Programming language is required'),
  is_active: yup.boolean().default(true),
});

type CourseFormData = yup.InferType<typeof courseSchema>;

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

const TeacherDashboardPageFixed: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // State management
  const [tabValue, setTabValue] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguage[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingStep, setEditingStep] = useState<CourseStep | null>(null);
  
  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Forms  const courseForm = useForm({
    resolver: yupResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty_level: 'beginner' as const,
      estimated_duration_hours: 1,
      programming_language_id: 0,
      is_active: true,
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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenCourseDialog = (course?: Course) => {
    setEditingCourse(course || null);
    if (course) {
      courseForm.reset({
        title: course.title,
        description: course.description,
        difficulty: course.difficulty as 'beginner' | 'intermediate' | 'advanced',
        estimated_duration_hours: course.estimated_duration_hours,
        programming_language_id: course.programming_language_id,
        prerequisites: course.prerequisites || [],
        learning_objectives: course.learning_objectives || [],
        tags: course.tags || [],
        is_published: course.is_published,
      });
    } else {
      courseForm.reset();
    }
    setCourseDialogOpen(true);
  };

  const handleOpenStepDialog = (step?: CourseStep) => {
    setEditingStep(step || null);
    if (step) {
      stepForm.reset({
        title: step.title,
        description: step.description,
        content: step.content,
        step_type: step.step_type as 'lesson' | 'exercise' | 'quiz' | 'project',
        is_required: step.is_required,
        estimated_duration: step.estimated_duration,
        difficulty: step.difficulty as 'beginner' | 'intermediate' | 'advanced' | undefined,
        keywords: step.keywords || [],
        is_published: step.is_published,
      });
    } else {
      stepForm.reset();
    }
    setStepDialogOpen(true);
  };

  const handleSubmitCourse = async (data: CourseFormData) => {
    setActionLoading(true);
    try {
      console.log('Creating/updating course:', data);
      showSnackbar(
        editingCourse ? 'Course updated successfully' : 'Course created successfully',
        'success'
      );
      setCourseDialogOpen(false);
    } catch (error) {
      console.error('Failed to save course:', error);
      showSnackbar('Failed to save course', 'error');
    } finally {
      setActionLoading(false);
    }
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
      case 'beginner': return theme.palette.success.main;
      case 'intermediate': return theme.palette.warning.main;
      case 'advanced': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  if (!isTeacher) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Teacher role required to access this dashboard.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Aurora Background */}
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
      }}>
        <Aurora />
      </Box>

      <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Paper sx={{
          p: 4,
          mb: 4,
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
        }}>
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar sx={{ 
              width: 64, 
              height: 64,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}>
              <SchoolIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" component="h1" fontWeight="bold" sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Teacher Dashboard
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your courses, lessons, and student progress
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Navigation Tabs */}
        <Paper sx={{
          mb: 4,
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          borderRadius: 3,
        }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
              },
            }}
          >
            <Tab 
              icon={<AutoStoriesIcon />} 
              label="Courses" 
              iconPosition="start"
            />
            <Tab 
              icon={<TrendingUpIcon />} 
              label="Analytics" 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label="Students" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          {/* Courses Tab */}
          <Stack spacing={4}>
            {/* Course Actions */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                My Courses ({courses.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCourseDialog()}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                }}
              >
                Create Course
              </Button>
            </Box>

            {/* Courses Grid */}
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: 3,
            }}>
              {courses.map((course) => (
                <Card key={course.id} sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  background: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Stack spacing={2}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" fontWeight="bold" sx={{ 
                          flex: 1,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          {course.title}
                        </Typography>
                        <Chip
                          label={course.difficulty}
                          size="small"
                          sx={{
                            backgroundColor: alpha(getDifficultyColor(course.difficulty), 0.1),
                            color: getDifficultyColor(course.difficulty),
                            fontWeight: 600,
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {course.description}
                      </Typography>
                      
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          icon={<SchoolIcon />}
                          label={`${course.estimated_duration_hours}h`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={course.is_published ? 'Published' : 'Draft'}
                          size="small"
                          color={course.is_published ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1} width="100%">
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => setSelectedCourse(course)}
                        sx={{ flex: 1 }}
                      >
                        Manage
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenCourseDialog(course)}
                      >
                        Edit
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => console.log('Delete course:', course.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardActions>
                </Card>
              ))}
            </Box>

            {courses.length === 0 && (
              <Paper sx={{
                p: 6,
                textAlign: 'center',
                background: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                borderRadius: 3,
              }}>
                <AutoStoriesIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No courses yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your first course to start teaching students
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenCourseDialog()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  }}
                >
                  Create First Course
                </Button>
              </Paper>
            )}
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {/* Analytics Tab */}
          <Paper sx={{
            p: 4,
            textAlign: 'center',
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 3,
          }}>
            <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Analytics Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your course performance, student engagement, and learning outcomes
            </Typography>
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {/* Students Tab */}
          <Paper sx={{
            p: 4,
            textAlign: 'center',
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 3,
          }}>
            <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Student Management Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage your students, track their progress, and provide feedback
            </Typography>
          </Paper>
        </TabPanel>

        {/* Course Dialog */}
        <Dialog
          open={courseDialogOpen}
          onClose={() => setCourseDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderRadius: 3,
            }
          }}
        >
          <DialogTitle>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}>
                <AutoStoriesIcon />
              </Avatar>
              <Typography variant="h6">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </Typography>
            </Stack>
          </DialogTitle>
          
          <form onSubmit={courseForm.handleSubmit(handleSubmitCourse)}>
            <DialogContent>
              <Stack spacing={3} sx={{ pt: 1 }}>
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
                    />
                  )}
                />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Controller
                    name="difficulty"
                    control={courseForm.control}
                    render={({ field, fieldState }) => (
                      <FormControl fullWidth error={!!fieldState.error}>
                        <InputLabel>Difficulty</InputLabel>
                        <Select {...field} label="Difficulty">
                          <MenuItem value="beginner">Beginner</MenuItem>
                          <MenuItem value="intermediate">Intermediate</MenuItem>
                          <MenuItem value="advanced">Advanced</MenuItem>
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
                        label="Duration (hours)"
                        type="number"
                        fullWidth
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Box>
                
                <Controller
                  name="programming_language_id"
                  control={courseForm.control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Programming Language</InputLabel>
                      <Select {...field} label="Programming Language">
                        {programmingLanguages.map((lang) => (
                          <MenuItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            </DialogContent>
            
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setCourseDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                {actionLoading ? 'Saving...' : editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default TeacherDashboardPageFixed;
