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
  Select,
  FormControl,
  InputLabel,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  School as SchoolIcon,
  Quiz as QuizIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CourseAPI, TeacherAPI, ProgrammingLanguageAPI } from '../services/api';
import { useAuth } from '../hooks';
import type { 
  Course, 
  CourseStep, 
  ProgrammingLanguage, 
  CreateCourseRequest, 
  CreateCourseStepRequest,
  UpdateCourseRequest,
  UpdateCourseStepRequest 
} from '../types';

// Validation schemas
const courseSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  difficulty_level: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required('Difficulty level is required'),
  estimated_duration_hours: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 hour').max(200, 'Duration cannot exceed 200 hours'),
  programming_language_id: yup.number().required('Programming language is required'),
  program_id: yup.number().optional(),
  prerequisites: yup.array().of(yup.string()).default([]),
  learning_objectives: yup.array().of(yup.string()).default([]),
  tags: yup.array().of(yup.string()).default([]),
  is_published: yup.boolean().default(true),
});

const stepSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  content: yup.string().required('Content is required').min(20, 'Content must be at least 20 characters'),
  step_type: yup.string().oneOf(['lesson', 'exercise', 'quiz', 'project']).required('Step type is required'),
  is_required: yup.boolean().default(true),
  estimated_duration: yup.number().min(1).max(240).optional(),
  difficulty: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).optional(),
  keywords: yup.array().of(yup.string().required()).default([]),
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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const TeacherDashboardPageNew: React.FC = () => {
  const { user } = useAuth();
  
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  // Form instances
  const courseForm = useForm<CourseFormData>({
    resolver: yupResolver(courseSchema),
    defaultValues: {
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

  const stepForm = useForm<StepFormData>({
    resolver: yupResolver(stepSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      step_type: 'lesson',
      is_required: true,
      estimated_duration: 15,
      difficulty: 'beginner',
      keywords: [],
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
    setLoading(true);    try {
      const [coursesResult, languagesResult] = await Promise.all([
        TeacherAPI.listCourses(),
        ProgrammingLanguageAPI.list()
      ]);

      if (coursesResult.success) {
        setCourses(coursesResult.data || []);
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
  };  const loadCourseSteps = async (courseId: number) => {
    try {
      const result = await CourseAPI.getCourseSteps(courseId);
      if (result.success) {
        setCourseSteps(result.data || []);
      } else {
        showSnackbar('Failed to load course steps', 'error');
      }
    } catch (error) {
      console.error('Failed to load course steps:', error);
      showSnackbar('Failed to load course steps', 'error');
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
      program_id: undefined, // TODO: Add program_id to Course type if needed
      prerequisites: [], // TODO: Add to Course type if needed
      learning_objectives: [], // TODO: Add to Course type if needed
      tags: [], // TODO: Add to Course type if needed
      is_published: course.is_active,
    });
    setCourseDialogOpen(true);
  };

  const handleSubmitCourse = async (data: CourseFormData) => {
    setActionLoading(true);    try {
      let result;
      if (editingCourse) {
        result = await TeacherAPI.updateCourse(editingCourse.id, data as UpdateCourseRequest);
      } else {
        result = await TeacherAPI.createCourse(data as CreateCourseRequest);
      }

      if (result.success) {
        showSnackbar(
          editingCourse ? 'Course updated successfully' : 'Course created successfully',
          'success'
        );
        setCourseDialogOpen(false);
        loadInitialData(); // Reload courses
      } else {
        showSnackbar(result.error?.message || 'Failed to save course', 'error');
      }
    } catch (error) {
      console.error('Failed to save course:', error);
      showSnackbar('Failed to save course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }    setActionLoading(true);
    try {
      const result = await TeacherAPI.deleteCourse(courseId);
      if (result.success) {
        showSnackbar('Course deleted successfully', 'success');
        loadInitialData(); // Reload courses
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(null);
          setCourseSteps([]);
        }
      } else {
        showSnackbar(result.error?.message || 'Failed to delete course', 'error');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      showSnackbar('Failed to delete course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Step management
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    loadCourseSteps(course.id);
    setActiveTab(1); // Switch to steps tab
  };

  const handleCreateStep = () => {
    if (!selectedCourse) return;
    
    setEditingStep(null);
    stepForm.reset();
    setStepDialogOpen(true);
  };  const handleEditStep = (step: CourseStep) => {
    setEditingStep(step);
    // Map backend step types to frontend step types
    const mappedStepType = ['lesson', 'exercise', 'quiz', 'project'].includes(step.step_type) 
      ? step.step_type as 'lesson' | 'exercise' | 'quiz' | 'project'
      : 'lesson';
    
    stepForm.reset({
      title: step.title,
      description: step.description,
      content: step.content,
      step_type: mappedStepType,
      is_required: step.is_required,      estimated_duration: (typeof step.metadata === 'object' && step.metadata?.estimated_duration) || 15,
      difficulty: (typeof step.metadata === 'object' && step.metadata?.difficulty) || 'beginner',
      keywords: (typeof step.metadata === 'object' && Array.isArray(step.metadata?.keywords)) ? step.metadata.keywords : [],
      is_published: step.is_active,
    });
    setStepDialogOpen(true);
  };
  const handleSubmitStep = async (data: StepFormData) => {
    if (!selectedCourse) return;

    setActionLoading(true);
    try {
      // Calculate step order for new steps
      const stepData: CreateCourseStepRequest = {
        title: data.title,
        description: data.description,
        content: data.content,
        step_order: editingStep ? editingStep.step_order : (courseSteps.length + 1),
        step_type: data.step_type,
        is_required: data.is_required,        metadata: {
          estimated_duration: data.estimated_duration,
          difficulty: data.difficulty,
          keywords: data.keywords,
        },
        is_published: data.is_published,
      };      let result;
      if (editingStep) {
        result = await TeacherAPI.updateCourseStep(
          selectedCourse.id, 
          editingStep.id, 
          stepData as UpdateCourseStepRequest
        );
      } else {
        result = await TeacherAPI.createCourseStep(
          selectedCourse.id, 
          stepData
        );
      }

      if (result.success) {
        showSnackbar(
          editingStep ? 'Step updated successfully' : 'Step created successfully',
          'success'
        );
        setStepDialogOpen(false);
        loadCourseSteps(selectedCourse.id); // Reload steps
      } else {
        showSnackbar(result.error?.message || 'Failed to save step', 'error');
      }
    } catch (error) {
      console.error('Failed to save step:', error);
      showSnackbar('Failed to save step', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    if (!selectedCourse || !confirm('Are you sure you want to delete this step? This action cannot be undone.')) {
      return;
    }    setActionLoading(true);
    try {
      const result = await TeacherAPI.deleteCourseStep(selectedCourse.id, stepId);
      if (result.success) {
        showSnackbar('Step deleted successfully', 'success');
        loadCourseSteps(selectedCourse.id); // Reload steps
      } else {
        showSnackbar(result.error?.message || 'Failed to delete step', 'error');
      }
    } catch (error) {
      console.error('Failed to delete step:', error);
      showSnackbar('Failed to delete step', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'lesson': return <SchoolIcon />;
      case 'exercise': return <CodeIcon />;
      case 'quiz': return <QuizIcon />;
      case 'project': return <PlayArrowIcon />;
      default: return <DescriptionIcon />;
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

  if (!isTeacher) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. This page is only available for teachers.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Box sx={{ mt: 2 }}>
          <Typography>Loading teacher dashboard...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Teacher Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="My Courses" />
          <Tab label="Course Steps" disabled={!selectedCourse} />
        </Tabs>
      </Box>

      {/* Courses Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            My Courses ({courses.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCourse}
            disabled={actionLoading}
          >
            Create Course
          </Button>
        </Box>

        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} md={6} lg={4} key={course.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { elevation: 8 }
                }}
                onClick={() => handleSelectCourse(course)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip 
                      label={course.difficulty_level} 
                      size="small" 
                      color={getDifficultyColor(course.difficulty_level) as any}
                    />
                    <Chip 
                      label={`${course.estimated_duration_hours}h`} 
                      size="small" 
                      variant="outlined"
                    />                    <Chip 
                      label={course.is_active ? 'Published' : 'Draft'} 
                      size="small" 
                      color={course.is_active ? 'success' : 'default'}
                    />
                  </Stack>                  <Typography variant="body2" color="text.secondary">
                    Steps: {courseSteps.filter(s => s.course_id === course.id).length || 0}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCourse(course);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id);
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {courses.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No courses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first course to start teaching students
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateCourse}>
              Create Your First Course
            </Button>
          </Paper>
        )}
      </TabPanel>

      {/* Steps Tab */}
      <TabPanel value={activeTab} index={1}>
        {selectedCourse && (
          <>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {selectedCourse.title} - Course Steps
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedCourse.description}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateStep}
                disabled={actionLoading}
              >
                Add Step
              </Button>
            </Box>

            <List>
              {courseSteps
                .sort((a, b) => a.step_order - b.step_order)
                .map((step, index) => (
                <React.Fragment key={step.id}>
                  <ListItem>
                    <DragIcon sx={{ mr: 2, color: 'text.secondary' }} />
                    {getStepIcon(step.step_type)}
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {index + 1}. {step.title}
                          </Typography>
                          <Chip 
                            label={step.step_type} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          {step.is_required && (
                            <Chip label="Required" size="small" color="error" />
                          )}                          {!step.is_active && (
                            <Chip label="Draft" size="small" color="default" />
                          )}
                        </Box>
                      }
                      secondary={step.description}
                      sx={{ ml: 2 }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleEditStep(step)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        color="error"
                        onClick={() => handleDeleteStep(step.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < courseSteps.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            {courseSteps.length === 0 && (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No steps yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first step to start building this course
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateStep}>
                  Add First Step
                </Button>
              </Paper>
            )}
          </>
        )}
      </TabPanel>

      {/* Course Dialog */}
      <Dialog 
        open={courseDialogOpen} 
        onClose={() => setCourseDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={courseForm.handleSubmit(handleSubmitCourse)}>
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
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
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={courseForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="difficulty_level"
                  control={courseForm.control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Difficulty Level</InputLabel>
                      <Select {...field} label="Difficulty Level">
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="advanced">Advanced</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCourseDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : (editingCourse ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Step Dialog */}
      <Dialog 
        open={stepDialogOpen} 
        onClose={() => setStepDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={stepForm.handleSubmit(handleSubmitStep)}>
          <DialogTitle>
            {editingStep ? 'Edit Step' : 'Create New Step'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
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
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
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
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="content"
                  control={stepForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Step Content"
                      fullWidth
                      multiline
                      rows={6}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      placeholder="Enter the step content, instructions, code examples, etc."
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="step_type"
                  control={stepForm.control}
                  render={({ field, fieldState }) => (
                    <FormControl fullWidth error={!!fieldState.error}>
                      <InputLabel>Step Type</InputLabel>
                      <Select {...field} label="Step Type">
                        <MenuItem value="lesson">Lesson</MenuItem>
                        <MenuItem value="exercise">Exercise</MenuItem>
                        <MenuItem value="quiz">Quiz</MenuItem>
                        <MenuItem value="project">Project</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStepDialogOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : (editingStep ? 'Update' : 'Create')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeacherDashboardPageNew;
