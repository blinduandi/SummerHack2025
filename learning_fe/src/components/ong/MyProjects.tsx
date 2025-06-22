import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,  styled,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  People as PeopleIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { OngProjectAPI } from '../../services/api';
import type { OngProject } from '../../types';

// Glass morphism styled card
const GlassCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(15, 23, 42, 0.6)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(30, 41, 59, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 12px 24px rgba(0, 0, 0, 0.4)'
      : '0 12px 24px rgba(30, 41, 59, 0.1)',
  },
}));

const ProjectCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.8)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(226, 232, 240, 0.8)',
  borderRadius: 12,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 16px rgba(0, 0, 0, 0.3)'
      : '0 8px 16px rgba(30, 41, 59, 0.08)',
  },
}));

interface MyProjectsProps {
  onCreateProject?: () => void;
}

const MyProjects: React.FC<MyProjectsProps> = ({ onCreateProject }) => {
  const [projects, setProjects] = useState<OngProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<OngProject | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await OngProjectAPI.getMyProjects();
      if (response.success && response.data) {
        setProjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: OngProject) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const handleViewProject = () => {
    if (selectedProject) {
      navigate(`/projects/${selectedProject.id}`);
    }
    handleMenuClose();
  };

  const handleEditProject = () => {
    if (selectedProject) {
      navigate(`/projects/${selectedProject.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    try {
      setDeleting(true);
      const response = await OngProjectAPI.deleteProject(selectedProject.id);
      if (response.success) {
        await fetchProjects(); // Refresh the list
        setDeleteDialogOpen(false);
        setSelectedProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleViewApplicants = () => {
    if (selectedProject) {
      navigate(`/projects/${selectedProject.id}/applicants`);
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'success';
      case 'in_progress': return 'warning';
      case 'completed': return 'info';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <GlassCard>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your projects...
          </Typography>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              🏢 My Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onCreateProject}
              sx={{ borderRadius: 2 }}
            >
              Create Project
            </Button>
          </Stack>

          {projects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first project to start collaborating with students
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateProject}
                size="large"
              >
                Create Your First Project
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3
              }}
            >
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, pr: 1 }}>
                          {project.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, project)}
                          sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>

                      {/* Description */}
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

                      {/* Status and Date */}
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Chip
                          label={project.status.toUpperCase()}
                          color={getStatusColor(project.status) as any}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(project.created_at)}
                          </Typography>
                        </Stack>
                      </Stack>

                      {/* Applications count */}
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {project.applications?.length || 0} applications
                        </Typography>
                      </Stack>

                      {/* Skills */}
                      {project.skills_needed && project.skills_needed.length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                          {project.skills_needed.slice(0, 3).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                          {project.skills_needed.length > 3 && (
                            <Chip
                              label={`+${project.skills_needed.length - 3}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </CardContent>
                </ProjectCard>
              ))}
            </Box>
          )}
        </CardContent>
      </GlassCard>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleViewProject}>
          <ViewIcon sx={{ mr: 1 }} />
          View Project
        </MenuItem>
        <MenuItem onClick={handleViewApplicants}>
          <PeopleIcon sx={{ mr: 1 }} />
          View Applicants
        </MenuItem>
        <MenuItem onClick={handleEditProject}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Project
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProject?.title}"? This action cannot be undone.
          </Typography>
          {selectedProject?.applications && selectedProject.applications.length > 0 && (
            <Typography color="warning.main" sx={{ mt: 2 }}>
              Warning: This project has {selectedProject.applications.length} application(s). 
              You cannot delete a project with existing applications.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={deleting || (selectedProject?.applications && selectedProject.applications.length > 0)}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MyProjects;
