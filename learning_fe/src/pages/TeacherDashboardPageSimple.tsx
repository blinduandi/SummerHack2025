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
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../hooks';
import { TeacherAPI, ProgrammingLanguageAPI } from '../services/api';
import { LoadingButton } from '../components/ui/LoadingButton';
import type { 
  Course, 
  Program, 
  ProgrammingLanguage,
  CreateCourseRequest,
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

type CourseFormData = yup.InferType<typeof courseSchema>;

const TeacherDashboardPageSimple: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programmingLanguages, setProgrammingLanguages] = useState<ProgrammingLanguage[]>([]);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Helper function to get user role
  const getUserRole = () => user?.role || user?.user_type;

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
  // Check if user is teacher
  useEffect(() => {
    if (!user || getUserRole() !== 'teacher') {
      // Redirect or show error
      return;
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {      const [coursesResult, programsResult, languagesResult] = await Promise.all([
        TeacherAPI.listTeacherCourses(),
        TeacherAPI.listPrograms(),
        ProgrammingLanguageAPI.listProgrammingLanguages(),
      ]);      if (coursesResult.success && coursesResult.data) setCourses(coursesResult.data);
      if (programsResult.success && programsResult.data) setPrograms(programsResult.data);
      if (languagesResult.success && languagesResult.data) setProgrammingLanguages(languagesResult.data);
    } catch (error) {
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmitCourse = async (data: CourseFormData) => {
    setActionLoading(true);
    try {
      const requestData: CreateCourseRequest = {
        title: data.title,
        description: data.description,
        content: data.content,
        difficulty_level: data.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
        estimated_duration_hours: data.estimated_duration_hours,
        programming_language_id: data.programming_language_id,
        is_active: data.is_active,
      };

      const result = await TeacherAPI.createCourse(requestData);

      if (result.success) {
        setCourses(prev => [...prev, result.data!]);
        showSnackbar('Course created successfully');
        setCourseDialogOpen(false);
        courseForm.reset();
      } else {
        showSnackbar(result.error?.message || 'Failed to create course', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to create course', 'error');
    } finally {
      setActionLoading(false);
    }
  };
  if (!user || getUserRole() !== 'teacher') {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. This page is only available to teachers.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Teacher Dashboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your courses, programs, and track student progress
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Total Courses</Typography>
            <Typography variant="h4">{courses.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent>
            <Typography variant="h6">Total Programs</Typography>
            <Typography variant="h4">{programs.length}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Courses Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Courses</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCourseDialogOpen(true)}
          >
            Create Course
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {courses.map((course) => (
            <Card key={course.id} sx={{ minWidth: 300, maxWidth: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {course.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Difficulty: {course.difficulty_level}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Edit</Button>
                <Button size="small" color="error">Delete</Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Course Create Dialog */}
      <Dialog open={courseDialogOpen} onClose={() => setCourseDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Course</DialogTitle>
        <form onSubmit={courseForm.handleSubmit(handleSubmitCourse)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
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
                    multiline
                    rows={3}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                name="content"
                control={courseForm.control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Content (Optional)"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
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

                <Controller
                  name="estimated_duration_hours"
                  control={courseForm.control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Duration (Hours)"
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
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={actionLoading}
            >
              Create Course
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeacherDashboardPageSimple;
