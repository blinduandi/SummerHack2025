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
  Chip,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Switch,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  ExpandMore as ExpandMoreIcon,
  Code as CodeIcon,
  Quiz as QuizIcon,
  Description as DescriptionIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks';
import { TeacherAPI, ProgrammingLanguageAPI } from '../services/api';
import { LoadingButton } from '../components/ui/LoadingButton';
import type { 
  Course, 
  CourseStep, 
  Program, 
  ProgrammingLanguage,
  CreateCourseRequest,
  CreateCourseStepRequest,
  CreateProgramRequest,
  Enrollment
} from '../types';

// Validation schemas
const courseSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  content: yup.string().optional().default(''),
  difficulty_level: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required('Difficulty level is required'),
  estimated_duration_hours: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 hour'),
  programming_language_id: yup.number().required('Programming language is required'),
  is_active: yup.boolean().optional().default(true),
});

const stepSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  content: yup.string().required('Content is required').min(20, 'Content must be at least 20 characters'),
  step_order: yup.number().required('Step order is required').min(1, 'Step order must be at least 1'),
  step_type: yup.string().oneOf(['lesson', 'exercise', 'quiz', 'project']).required('Step type is required'),
  is_required: yup.boolean().optional().default(true),
  is_active: yup.boolean().optional().default(true),
});

const programSchema = yup.object({
  title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
  description: yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
  difficulty_level: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required('Difficulty level is required'),
  estimated_duration_weeks: yup.number().required('Duration is required').min(1, 'Duration must be at least 1 week'),
  is_published: yup.boolean().optional().default(false),
});

// Infer types from schemas
type CourseFormData = yup.InferType<typeof courseSchema>;
type StepFormData = yup.InferType<typeof stepSchema>;
type ProgramFormData = yup.InferType<typeof programSchema>;

interface TeacherStats {
  total_courses: number;
  total_students: number;
  total_enrollments: number;
  completion_rate: number;
  recent_enrollments: Enrollment[];
  popular_courses: Course[];
}

const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  // State management
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguage[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingStep, setEditingStep] = useState<CourseStep | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseSteps, setCourseSteps] = useState<CourseStep[]>([]);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItem, setSelectedItem] = useState<Course | Program | null>(null);
  
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
      content: '',
      difficulty_level: 'beginner',
      estimated_duration_hours: 1,
      programming_language_id: 1,
      is_active: true,
    },
  });
  const stepForm = useForm<StepFormData>({
    resolver: yupResolver(stepSchema),
    defaultValues: {
      title: '',
      description: '',
      content: '',
      step_order: 1,
      step_type: 'lesson',
      is_required: true,
      is_active: true,
    },
  });

  const programForm = useForm<ProgramFormData>({
    resolver: yupResolver(programSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty_level: 'beginner',
      estimated_duration_weeks: 1,
      is_published: false,
    },
  });

  // Check if user is teacher
  const isTeacher = user?.user_type === 'teacher';

  // Load initial data
  useEffect(() => {
    if (!isTeacher) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const [coursesResult, programsResult, languagesResult, statsResult] = await Promise.all([
          TeacherAPI.listTeacherCourses(),
          TeacherAPI.listPrograms(),
          ProgrammingLanguageAPI.listProgrammingLanguages(),
          TeacherAPI.getTeacherStats(),
        ]);

        if (coursesResult.success) {
          setCourses(coursesResult.data || []);
        }
        if (programsResult.success) {
          setPrograms(programsResult.data || []);
        }
        if (languagesResult.success) {
          setProgrammingLanguages(languagesResult.data || []);
        }
        if (statsResult.success) {
          setStats(statsResult.data || null);
        }
      } catch (error) {
        console.error('Failed to load teacher data:', error);
        showSnackbar('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isTeacher]);

  // Load course steps when course is selected
  useEffect(() => {
    if (selectedCourse) {
      loadCourseSteps(selectedCourse.id);
    }
  }, [selectedCourse]);

  const loadCourseSteps = async (courseId: number) => {
    try {
      const result = await TeacherAPI.listCourseSteps(courseId);
      if (result.success) {
        setCourseSteps(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load course steps:', error);
      showSnackbar('Failed to load course steps', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: Course | Program) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  // Course handlers
  const handleCreateCourse = () => {
    courseForm.reset();
    setEditingCourse(null);
    setCourseDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    courseForm.reset({
      title: course.title,
      description: course.description,
      content: course.content || '',
      difficulty_level: course.difficulty_level,
      estimated_duration_hours: course.estimated_duration_hours,
      programming_language_id: course.programming_language_id,
      is_active: course.is_active,
    });
    setCourseDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteCourse = async (course: Course) => {
    if (!window.confirm(`Are you sure you want to delete the course "${course.title}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await TeacherAPI.deleteCourse(course.id);
      if (result.success) {
        setCourses(prev => prev.filter(c => c.id !== course.id));
        showSnackbar('Course deleted successfully');
      } else {
        showSnackbar(result.error?.message || 'Failed to delete course', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete course', 'error');
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };
  const handleSubmitCourse = async (data: CourseFormData) => {
    setActionLoading(true);
    try {
      // Convert form data to API request format
      const requestData: CreateCourseRequest = {
        title: data.title,
        description: data.description,
        content: data.content,
        difficulty_level: data.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
        estimated_duration_hours: data.estimated_duration_hours,
        programming_language_id: data.programming_language_id,
        is_active: data.is_active,
      };

      let result;
      if (editingCourse) {
        result = await TeacherAPI.updateCourse(editingCourse.id, requestData);
      } else {
        result = await TeacherAPI.createCourse(requestData);
      }

      if (result.success) {
        if (editingCourse) {
          setCourses(prev => prev.map(c => c.id === editingCourse.id ? result.data! : c));
          showSnackbar('Course updated successfully');
        } else {
          setCourses(prev => [...prev, result.data!]);
          showSnackbar('Course created successfully');
        }
        setCourseDialogOpen(false);
        courseForm.reset();
        setEditingCourse(null);
      } else {
        showSnackbar(result.error?.message || 'Failed to save course', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to save course', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Step handlers
  const handleCreateStep = (course: Course) => {
    setSelectedCourse(course);
    stepForm.reset();
    setEditingStep(null);
    setStepDialogOpen(true);
  };
  const handleEditStep = (step: CourseStep) => {
    setEditingStep(step);
    stepForm.reset({
      title: step.title,
      description: step.description,
      content: step.content,
      step_order: step.step_order,
      step_type: step.step_type as 'lesson' | 'exercise' | 'quiz' | 'project',
      is_required: step.is_required,
      is_active: step.is_active,
    });
    setStepDialogOpen(true);
  };

  const handleDeleteStep = async (step: CourseStep) => {
    if (!window.confirm(`Are you sure you want to delete the step "${step.title}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await TeacherAPI.deleteCourseStep(step.course_id, step.id);
      if (result.success) {
        setCourseSteps(prev => prev.filter(s => s.id !== step.id));
        showSnackbar('Step deleted successfully');
      } else {
        showSnackbar(result.error?.message || 'Failed to delete step', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete step', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  const handleSubmitStep = async (data: StepFormData) => {
    if (!selectedCourse) return;

    setActionLoading(true);
    try {
      // Convert form data to API request format
      const requestData: CreateCourseStepRequest = {
        title: data.title,
        description: data.description,
        content: data.content,
        step_order: data.step_order,
        step_type: data.step_type as 'lesson' | 'exercise' | 'quiz' | 'project',
        is_required: data.is_required,
        is_active: data.is_active,
      };

      let result;
      if (editingStep) {
        result = await TeacherAPI.updateCourseStep(selectedCourse.id, editingStep.id, requestData);
      } else {
        result = await TeacherAPI.createCourseStep(selectedCourse.id, requestData);
      }

      if (result.success) {
        if (editingStep) {
          setCourseSteps(prev => prev.map(s => s.id === editingStep.id ? result.data! : s));
          showSnackbar('Step updated successfully');
        } else {
          setCourseSteps(prev => [...prev, result.data!]);
          showSnackbar('Step created successfully');
        }
        setStepDialogOpen(false);
        stepForm.reset();
        setEditingStep(null);
      } else {
        showSnackbar(result.error?.message || 'Failed to save step', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to save step', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Program handlers
  const handleCreateProgram = () => {
    programForm.reset();
    setEditingProgram(null);
    setProgramDialogOpen(true);
  };
  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    programForm.reset({
      title: program.title,
      description: program.description,
      difficulty_level: program.difficulty_level,
      estimated_duration_weeks: program.estimated_duration_weeks,
      is_published: program.is_published,
    });
    setProgramDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteProgram = async (program: Program) => {
    if (!window.confirm(`Are you sure you want to delete the program "${program.title}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const result = await TeacherAPI.deleteProgram(program.id);
      if (result.success) {
        setPrograms(prev => prev.filter(p => p.id !== program.id));
        showSnackbar('Program deleted successfully');
      } else {
        showSnackbar(result.error?.message || 'Failed to delete program', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to delete program', 'error');
    } finally {
      setActionLoading(false);
      handleMenuClose();
    }
  };
  const handleSubmitProgram = async (data: ProgramFormData) => {
    setActionLoading(true);
    try {
      // Convert form data to API request format
      const requestData: CreateProgramRequest = {
        title: data.title,
        description: data.description,
        difficulty_level: data.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
        estimated_duration_weeks: data.estimated_duration_weeks,
        is_published: data.is_published,
      };

      let result;
      if (editingProgram) {
        result = await TeacherAPI.updateProgram(editingProgram.id, requestData);
      } else {
        result = await TeacherAPI.createProgram(requestData);
      }

      if (result.success) {
        if (editingProgram) {
          setPrograms(prev => prev.map(p => p.id === editingProgram.id ? result.data! : p));
          showSnackbar('Program updated successfully');
        } else {
          setPrograms(prev => [...prev, result.data!]);
          showSnackbar('Program created successfully');
        }
        setProgramDialogOpen(false);
        programForm.reset();
        setEditingProgram(null);
      } else {
        showSnackbar(result.error?.message || 'Failed to save program', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to save program', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper functions
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };
  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <DescriptionIcon />;
      case 'exercise': return <CodeIcon />;
      case 'quiz': return <QuizIcon />;
      case 'project': return <PlayArrowIcon />;
      default: return <DescriptionIcon />;
    }
  };

  // Access control
  if (!isTeacher) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You need to be a teacher to access this page. Please contact your administrator if you believe this is an error.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Loading teacher dashboard...</Typography>
          <LinearProgress sx={{ width: '100%', maxWidth: 400 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Teacher Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your courses, programs, and track student progress
        </Typography>
      </Box>      {/* Statistics Cards */}
      {stats && (        <Grid container spacing={3} sx={{ mb: 4 }}>
          <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <SchoolIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.total_courses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Courses
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.total_students}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Students
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {stats.total_enrollments}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Enrollments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <AnalyticsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div">
                      {Math.round(stats.completion_rate)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completion Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Courses Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            My Courses ({courses.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCourse}
          >
            Create Course
          </Button>
        </Box>        <Grid container spacing={3}>
          {courses.map((course) => (
            <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} md={6} lg={4} key={course.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" noWrap>
                      {course.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, course)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={course.difficulty_level} 
                      size="small" 
                      color={getDifficultyColor(course.difficulty_level) as any}
                    />
                    <Chip 
                      label={`${course.estimated_duration_hours}h`} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={course.is_active ? 'Active' : 'Inactive'} 
                      size="small" 
                      color={course.is_active ? 'success' : 'default'}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {course.enrolled_students_count || 0} students enrolled
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleCreateStep(course)}
                    startIcon={<AddIcon />}
                  >
                    Add Step
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => setSelectedCourse(course)}
                    startIcon={<ViewIcon />}
                  >
                    View Steps
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {courses.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No courses yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create your first course to get started with teaching on our platform.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateCourse}
            >
              Create Your First Course
            </Button>
          </Paper>
        )}
      </Box>

      {/* Course Steps Section */}
      {selectedCourse && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Steps for "{selectedCourse.title}" ({courseSteps.length})
          </Typography>
          
          {courseSteps.map((step, index) => (
            <Accordion key={step.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {getStepTypeIcon(step.step_type)}
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {index + 1}. {step.title}
                    </Typography>
                    <Chip 
                      label={step.step_type} 
                      size="small" 
                      variant="outlined"
                    />
                    <Chip 
                      label={step.is_required ? 'Required' : 'Optional'} 
                      size="small" 
                      color={step.is_required ? 'primary' : 'default'}
                    />
                  </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {step.description}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditStep(step)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteStep(step)}
                  >
                    Delete
                  </Button>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
          
          {courseSteps.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No steps yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add steps to make your course interactive and engaging.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleCreateStep(selectedCourse)}
              >
                Add First Step
              </Button>
            </Paper>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setSelectedCourse(null)}
            >
              Back to Courses
            </Button>
          </Box>
        </Box>
      )}

      {/* Programs Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            My Programs ({programs.length})
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateProgram}
          >
            Create Program
          </Button>
        </Box>        <Grid container spacing={3}>
          {programs.map((program) => (
            <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} md={6} key={program.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>                    <Typography variant="h6" component="h3">
                      {program.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, program)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {program.description}
                  </Typography>
                    <Chip 
                    label={program.is_published ? 'Published' : 'Draft'} 
                    size="small" 
                    color={program.is_published ? 'success' : 'default'}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {programs.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No programs yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create programs to organize your courses into structured learning paths.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleCreateProgram}
            >
              Create Your First Program
            </Button>
          </Paper>
        )}
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedItem && 'title' in selectedItem) {
            handleEditCourse(selectedItem as Course);
          } else if (selectedItem && 'name' in selectedItem) {
            handleEditProgram(selectedItem as Program);
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedItem && 'title' in selectedItem) {
            handleDeleteCourse(selectedItem as Course);
          } else if (selectedItem && 'name' in selectedItem) {
            handleDeleteProgram(selectedItem as Program);
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

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
          <DialogContent>            <Grid container spacing={3} sx={{ mt: 1 }}>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
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
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
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
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
                <Controller
                  name="content"
                  control={courseForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Content (Optional)"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
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
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
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
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
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
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
                <Controller
                  name="is_active"
                  control={courseForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCourseDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={actionLoading}
            >
              {editingCourse ? 'Update' : 'Create'}
            </LoadingButton>
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
          <DialogContent>            <Grid container spacing={3} sx={{ mt: 1 }}>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
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
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
                <Controller
                  name="description"
                  control={stepForm.control}
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
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
                <Controller
                  name="content"
                  control={stepForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Content"
                      fullWidth
                      multiline
                      rows={6}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
                <Controller
                  name="step_order"
                  control={stepForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Step Order"
                      type="number"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
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
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
                <Controller
                  name="is_required"
                  control={stepForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Required"
                    />
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
                <Controller
                  name="is_active"
                  control={stepForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Active"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStepDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={actionLoading}
            >
              {editingStep ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Program Dialog */}
      <Dialog 
        open={programDialogOpen} 
        onClose={() => setProgramDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={programForm.handleSubmit(handleSubmitProgram)}>
          <DialogTitle>
            {editingProgram ? 'Edit Program' : 'Create New Program'}
          </DialogTitle>
          <DialogContent>            <Grid container spacing={3} sx={{ mt: 1 }}>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
                <Controller
                  name="title"
                  control={programForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Program Title"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
                <Controller
                  name="description"
                  control={programForm.control}
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
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
                <Controller
                  name="difficulty_level"
                  control={programForm.control}
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
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12} sm={6}>
                <Controller
                  name="estimated_duration_weeks"
                  control={programForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Duration (weeks)"
                      type="number"
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              </Grid>
              <div className="grid-item" style={{flex: "1", minWidth: "200px"}}><div style={{display: "none"}}>xs={12}>
                <Controller
                  name="is_published"
                  control={programForm.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      }
                      label="Published"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProgramDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={actionLoading}
            >
              {editingProgram ? 'Update' : 'Create'}
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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

export default TeacherDashboardPage;
