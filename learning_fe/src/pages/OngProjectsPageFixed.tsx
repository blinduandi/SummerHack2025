import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  styled,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Avatar,
  Badge,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  GitHub as GitHubIcon,
  Image as ImageIcon,
  EmojiEvents as AwardIcon,
  Close as CloseIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Check as CheckIcon,
  Clear as RejectIcon,
} from '@mui/icons-material';
import { OngProjectAPI } from '../services/api';
import type { OngProject, OngProjectApplication, CreateOngProjectRequest } from '../types';
import { useAuth } from '../hooks';
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
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(0, 0, 0, 0.6)'
      : '0 20px 40px rgba(30, 41, 59, 0.15)',
  },
}));

const ProjectCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
  backdropFilter: 'blur(15px)',
  WebkitBackdropFilter: 'blur(15px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(30, 41, 59, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-12px) scale(1.02)',
    '& .course-image': {
      transform: 'scale(1.1)',
    },
  },
}));

export const OngProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // State management
  const [projects, setProjects] = useState<OngProject[]>([]);
  const [myApplications, setMyApplications] = useState<OngProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [applicantsDialogOpen, setApplicantsDialogOpen] = useState(false);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<OngProject | null>(null);
  const [applicants, setApplicants] = useState<OngProjectApplication[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [currentTab, setCurrentTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<CreateOngProjectRequest>({
    title: '',
    description: '',
    requirements: '',
    skills_needed: [],
    due_date: '',
  });
  const [skillInput, setSkillInput] = useState('');

  // Memoized values
  const auroraColorStops = useMemo(() => [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.primary.dark,
  ], [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.primary.dark]);

  const isOng = useMemo(() => user?.role === 'ong', [user]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = isOng 
        ? await OngProjectAPI.getMyProjects()
        : await OngProjectAPI.getAllProjects({
            status: 'open' // Only show open projects for students
          });
      
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        setSnackbar({ open: true, message: 'Failed to load projects', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSnackbar({ open: true, message: 'Error loading projects', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [isOng]);

  // Fetch applicants for a project
  const fetchApplicants = useCallback(async (projectId: number) => {
    setLoadingApplicants(true);
    try {
      const response = await OngProjectAPI.getProjectApplicants(projectId);
      if (response.success && response.data) {
        setApplicants(response.data);
      } else {
        setSnackbar({ open: true, message: 'Failed to load applicants', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching applicants:', error);
      setSnackbar({ open: true, message: 'Error loading applicants', severity: 'error' });
    } finally {
      setLoadingApplicants(false);
    }
  }, []);

  // Fetch student's applications
  const fetchMyApplications = useCallback(async () => {
    if (isOng) return; // Only for students
    
    setLoadingApplications(true);
    try {
      const response = await OngProjectAPI.getMyApplications();
      if (response.success && response.data) {
        setMyApplications(response.data);
      } else {
        setSnackbar({ open: true, message: 'Failed to load your applications', severity: 'error' });
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setSnackbar({ open: true, message: 'Error loading your applications', severity: 'error' });
    } finally {
      setLoadingApplications(false);
    }
  }, [isOng]);

  useEffect(() => {
    fetchProjects();
    if (!isOng) {
      fetchMyApplications();
    }
  }, [fetchProjects, fetchMyApplications, isOng]);

  // Handle create project
  const handleCreateProject = useCallback(async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      setSnackbar({ open: true, message: 'Title and description are required', severity: 'error' });
      return;
    }

    setCreating(true);
    try {
      const response = await OngProjectAPI.createProject(formData);
      if (response.success) {
        setSnackbar({ open: true, message: 'Project created successfully!', severity: 'success' });
        setCreateDialogOpen(false);
        setFormData({
          title: '',
          description: '',
          requirements: '',
          skills_needed: [],
          due_date: '',
        });
        fetchProjects();
      } else {
        setSnackbar({ open: true, message: response.error?.message || 'Failed to create project', severity: 'error' });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setSnackbar({ open: true, message: 'Error creating project', severity: 'error' });
    } finally {
      setCreating(false);
    }
  }, [formData, fetchProjects]);

  // Handle apply to project (for students)
  const handleApplyToProject = useCallback(async (projectId: number) => {
    try {
      const response = await OngProjectAPI.applyToProject(projectId);
      if (response.success) {
        setSnackbar({ open: true, message: 'Applied successfully!', severity: 'success' });
        fetchProjects(); // Refresh to update application count
        fetchMyApplications(); // Refresh user's applications
      } else {
        setSnackbar({ open: true, message: response.error?.message || 'Failed to apply', severity: 'error' });
      }
    } catch (error) {
      console.error('Error applying to project:', error);
      setSnackbar({ open: true, message: 'Error applying to project', severity: 'error' });
    }
  }, [fetchProjects, fetchMyApplications]);

  // Handle select winner
  const handleSelectWinner = useCallback(async (applicationId: number) => {
    if (!selectedProject) return;

    try {
      const response = await OngProjectAPI.selectWinner(selectedProject.id, applicationId);
      if (response.success) {
        setSnackbar({ open: true, message: 'Winner selected successfully!', severity: 'success' });
        setApplicantsDialogOpen(false);
        fetchProjects(); // Refresh the list
      } else {
        setSnackbar({ open: true, message: response.error?.message || 'Failed to select winner', severity: 'error' });
      }
    } catch (error) {
      console.error('Error selecting winner:', error);
      setSnackbar({ open: true, message: 'Error selecting winner', severity: 'error' });
    }
  }, [selectedProject, fetchProjects]);

  // Handle accept application
  const handleAcceptApplication = useCallback(async (applicationId: number) => {
    if (!selectedProject) return;

    try {
      const response = await OngProjectAPI.acceptApplication(selectedProject.id, applicationId);
      if (response.success) {
        setSnackbar({ open: true, message: 'Application accepted successfully!', severity: 'success' });
        fetchApplicants(selectedProject.id); // Refresh applicants
      } else {
        setSnackbar({ open: true, message: response.error?.message || 'Failed to accept application', severity: 'error' });
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      setSnackbar({ open: true, message: 'Error accepting application', severity: 'error' });
    }
  }, [selectedProject, fetchApplicants]);

  // Handle reject application
  const handleRejectApplication = useCallback(async (applicationId: number) => {
    if (!selectedProject) return;

    try {
      const response = await OngProjectAPI.rejectApplication(selectedProject.id, applicationId);
      if (response.success) {
        setSnackbar({ open: true, message: 'Application rejected successfully!', severity: 'success' });
        fetchApplicants(selectedProject.id); // Refresh applicants
      } else {
        setSnackbar({ open: true, message: response.error?.message || 'Failed to reject application', severity: 'error' });
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      setSnackbar({ open: true, message: 'Error rejecting application', severity: 'error' });
    }
  }, [selectedProject, fetchApplicants]);

  // Handle add skill
  const handleAddSkill = useCallback(() => {
    if (skillInput.trim() && !formData.skills_needed?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills_needed: [...(prev.skills_needed || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  }, [skillInput, formData.skills_needed]);

  // Handle remove skill
  const handleRemoveSkill = useCallback((skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills_needed: prev.skills_needed?.filter(s => s !== skill) || []
    }));
  }, []);

  // Handle view applicants
  const handleViewApplicants = useCallback((project: OngProject) => {
    setSelectedProject(project);
    setApplicantsDialogOpen(true);
    fetchApplicants(project.id);
  }, [fetchApplicants]);

  // Handle view project details
  const handleViewProjectDetails = useCallback((project: OngProject) => {
    setSelectedProject(project);
    setProjectDetailsOpen(true);
  }, []);

  // Format date
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // Get project status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'closed': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  }, []);

  // Get application status color
  const getApplicationStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'completed': return 'info';
      default: return 'default';
    }
  }, []);

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
      bgcolor: 'transparent',
      p: { xs: 2, md: 3 },
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
        <Aurora colorStops={auroraColorStops} />
      </Box>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          {isOng ? '🚀 My Projects' : '🌟 Available Projects'}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {isOng 
            ? 'Manage your projects and review applications'
            : 'Discover and apply to exciting ONG projects'
          }
        </Typography>
      </Box>

      {/* Action buttons */}
      {isOng && (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)',
              }
            }}
          >
            Create New Project
          </Button>
        </Box>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
            mb: 4
          }}
        >
          {projects.map((project) => (
            <Box key={project.id}>
              <ProjectCard>
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    {/* Project Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {project.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Chip 
                            label={project.status} 
                            color={getStatusColor(project.status) as any}
                            size="small"
                          />
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <PeopleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {project.applications?.length || 0}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>

                    {/* Project Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {project.description}
                    </Typography>

                    {/* Skills */}
                    {project.skills_needed && project.skills_needed.length > 0 && (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {project.skills_needed.slice(0, 3).map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        ))}
                        {project.skills_needed.length > 3 && (
                          <Chip
                            label={`+${project.skills_needed.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )}
                      </Stack>
                    )}

                    {/* Due Date */}
                    {project.due_date && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ScheduleIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                        <Typography variant="caption" color="warning.main">
                          Due: {formatDate(project.due_date)}
                        </Typography>
                      </Stack>
                    )}

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      {isOng ? (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PeopleIcon />}
                            onClick={() => handleViewApplicants(project)}
                          >
                            View Applicants
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewProjectDetails(project)}
                          >
                            View Details
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AssignmentIcon />}
                            onClick={() => handleApplyToProject(project.id)}
                            sx={{
                              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                            }}
                          >
                            Apply
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewProjectDetails(project)}
                          >
                            View Details
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </ProjectCard>
            </Box>
          ))}
        </Box>
      ) : (
        <GlassCard>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WorkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {isOng ? 'No projects created yet' : 'No projects available'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {isOng 
                ? 'Create your first project to connect with talented students'
                : 'Check back later for new project opportunities'
              }
            </Typography>
            {isOng && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                }}
              >
                Create Your First Project
              </Button>
            )}
          </CardContent>
        </GlassCard>
      )}

      {/* Create Project Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <Typography variant="h6" component="div">
            Create New Project
          </Typography>
          <IconButton
            onClick={() => setCreateDialogOpen(false)}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8, 
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Project Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
              required
            />
            
            <TextField
              label="Requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              multiline
              rows={3}
              fullWidth
            />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Skills Needed
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Add a skill..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill} variant="outlined">
                  Add
                </Button>
              </Stack>
              
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {formData.skills_needed?.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    color="primary"
                  />
                ))}
              </Stack>
            </Box>
            
            <TextField
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProject}
            variant="contained"
            disabled={creating}
            startIcon={creating ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Applicants Dialog */}
      <Dialog 
        open={applicantsDialogOpen} 
        onClose={() => setApplicantsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <Typography variant="h6" component="div">
            Project Applicants - {selectedProject?.title}
          </Typography>
          <IconButton
            onClick={() => setApplicantsDialogOpen(false)}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8, 
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {loadingApplicants ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : applicants.length > 0 ? (
            <Stack spacing={2}>
              {applicants.map((application) => (
                <Paper key={application.id} sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={application.user?.avatar} sx={{ width: 40, height: 40 }}>
                          {application.user?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{application.user?.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Applied on {formatDate(application.created_at)}
                          </Typography>
                        </Box>
                      </Stack>
                      
                      <Chip 
                        label={application.status} 
                        color={getApplicationStatusColor(application.status) as any}
                        size="small"
                      />
                    </Stack>

                    {application.github_repo && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <GitHubIcon sx={{ fontSize: 20 }} />
                        <Button
                          component="a"
                          href={application.github_repo}
                          target="_blank"
                          variant="outlined"
                          size="small"
                        >
                          View Repository
                        </Button>
                      </Stack>
                    )}

                    {application.images && application.images.length > 0 && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ImageIcon sx={{ fontSize: 20 }} />
                        <Typography variant="body2">
                          {application.images.length} image(s) submitted
                        </Typography>
                      </Stack>
                    )}

                    {/* Accept/Reject buttons for pending applications */}
                    {selectedProject?.status === 'open' && application.status === 'pending' && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          startIcon={<CheckIcon />}
                          onClick={() => handleAcceptApplication(application.id)}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                            }
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<RejectIcon />}
                          onClick={() => handleRejectApplication(application.id)}
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                            }
                          }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}

                    {/* Select as Winner button for completed applications */}
                    {selectedProject?.status === 'open' && application.status === 'completed' && (
                      <Button
                        variant="contained"
                        startIcon={<AwardIcon />}
                        onClick={() => handleSelectWinner(application.id)}
                        sx={{
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                          }
                        }}
                      >
                        Select as Winner
                      </Button>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No applicants yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Students will appear here when they apply to your project.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Details Modal */}
      <Dialog 
        open={projectDetailsOpen} 
        onClose={() => setProjectDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(15, 23, 42, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <Typography variant="h6" component="div">
            Project Details
          </Typography>
          <IconButton
            onClick={() => setProjectDetailsOpen(false)}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: 8, 
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedProject && (
            <Stack spacing={4}>
              {/* Title */}
              <Box>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {selectedProject.title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
                  <Chip 
                    label={selectedProject.status} 
                    color={getStatusColor(selectedProject.status) as any}
                    size="small"
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Due: {selectedProject.due_date ? formatDate(selectedProject.due_date) : 'No due date'}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Description */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ 
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  p: 2,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}>
                  {selectedProject.description}
                </Typography>
              </Box>

              {/* Requirements */}
              {selectedProject.requirements && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Requirements
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  }}>
                    {selectedProject.requirements}
                  </Typography>
                </Box>
              )}

              {/* Skills Needed */}
              {selectedProject.skills_needed && selectedProject.skills_needed.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Skills Needed
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    {selectedProject.skills_needed.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        variant="outlined"
                        size="medium"
                        sx={{
                          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                          borderColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Project Stats */}
              <Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Project Information
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PeopleIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="body1">
                      <strong>Applications:</strong> {selectedProject.applications?.length || 0}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1" color="text.secondary">
                      <strong>Created:</strong> {formatDate(selectedProject.created_at)}
                    </Typography>
                  </Stack>
                  {selectedProject.winner_user_id && (
                    <Stack direction="row" spacing={2} alignItems="center">
                      <AwardIcon sx={{ fontSize: 20, color: 'warning.main' }} />
                      <Typography variant="body1" color="warning.main">
                        <strong>Status:</strong> Winner Selected
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjectDetailsOpen(false)}>
            Close
          </Button>
          {isOng && selectedProject && (
            <Button
              variant="contained"
              startIcon={<PeopleIcon />}
              onClick={() => {
                setProjectDetailsOpen(false);
                handleViewApplicants(selectedProject);
              }}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              }}
            >
              View Applicants
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OngProjectsPage;
