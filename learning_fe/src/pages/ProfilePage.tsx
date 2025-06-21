import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  styled,
  alpha,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  TrendingUp as ProgressIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks';
import { UserAvatar } from '../utils';
import { AuthAPI, ProgressAPI } from '../services/api';

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
    transform: 'translateY(-4px)',
    boxShadow: theme.palette.mode === 'dark'
      ? '0 20px 40px rgba(0, 0, 0, 0.4)'
      : '0 20px 40px rgba(30, 41, 59, 0.15)',
  },
}));

const StatsCard = styled(GlassCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: true,
    learningReminders: true,
  });
  const stats = [
    {
      title: 'Courses Enrolled',
      value: '3',
      icon: SchoolIcon,
      color: 'primary',
      change: '+2 this month',
      changeColor: 'success.main',
    },
    {
      title: 'Completion Rate',
      value: '67%',
      icon: ProgressIcon,
      color: 'secondary',
      change: 'Above average',
      changeColor: 'info.main',
    },
    {
      title: 'Learning Hours',
      value: '124h',
      icon: TimeIcon,
      color: 'warning',
      change: 'This semester',
      changeColor: 'text.secondary',
    },
    {
      title: 'Certificates',
      value: '3',
      icon: StarIcon,
      color: 'success',
      change: 'Earned',
      changeColor: 'text.secondary',
    },
  ];

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await AuthAPI.updateProfile({
        name: formData.name,
        bio: formData.bio,
      });
      
      if (response.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        // Refresh user data
        await refreshUser();
      } else {
        setError(response.error?.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('An unexpected error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      bio: user?.bio || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccessMessage(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

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

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your account and learning preferences
        </Typography>
      </Box>

      {/* Profile Card */}
      <GlassCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>            {/* Avatar Section */}
            <Box sx={{ textAlign: 'center' }}>
              <UserAvatar
                user={user}
                size={120}
                sx={{
                  fontSize: '3rem',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.4)',
                  border: (theme) => `4px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(30, 41, 59, 0.1)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 16px 50px rgba(99, 102, 241, 0.5)',
                  },
                }}
              />
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
                startIcon={<EditIcon />}
              >
                Change Photo
              </Button>
            </Box>

            {/* Profile Info */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Stack spacing={3}>
                {isEditing ? (
                  <>
                    <TextField
                      label="Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Email Address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      fullWidth
                      variant="outlined"
                      type="email"
                    />
                    <TextField
                      label="Bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </>
                ) : (
                  <>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <PersonIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          {user.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        {user.user_type && (
                          <Chip
                            label={user.user_type.toUpperCase()}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                        <Chip
                          label="🎯 Active Learner"
                          variant="outlined"
                          size="small"
                        />
                      </Stack>
                    </Box>

                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <EmailIcon color="primary" />
                        <Typography variant="body1" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <CalendarIcon color="primary" />
                        <Typography variant="body2" color="text.secondary">
                          Member since {user.created_at ? new Date(user.created_at).getFullYear() : 'Unknown'}
                        </Typography>
                      </Stack>
                    </Box>

                    {user.bio && (
                      <Box>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          About
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {user.bio}
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </GlassCard>

      {/* Learning Stats */}
      <GlassCard sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📊 Learning Statistics
          </Typography>
          
          <Box 
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              mt: 3
            }}
          >
            {stats.map((stat, index) => (
              <StatsCard key={index}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" color="text.secondary">
                        {stat.title}
                      </Typography>
                      <stat.icon color={stat.color as any} />
                    </Stack>
                    <Typography variant="h3" fontWeight="bold" color={`${stat.color}.main`}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color={stat.changeColor}>
                      {stat.change}
                    </Typography>
                  </Stack>
                </CardContent>
              </StatsCard>
            ))}
          </Box>
        </CardContent>
      </GlassCard>

      {/* Settings */}
      <GlassCard>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            ⚙️ Preferences
          </Typography>

          <Stack spacing={3} sx={{ mt: 3 }}>
            {/* Notifications */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Notifications
                </Typography>
              </Stack>
              <Stack spacing={1} sx={{ ml: 4 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    />
                  }
                  label="Email notifications for course updates"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                    />
                  }
                  label="Push notifications for learning reminders"
                />
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.learningReminders}
                      onChange={(e) => setSettings({ ...settings, learningReminders: e.target.checked })}
                    />
                  }
                  label="Daily learning reminders"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Privacy */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <VisibilityIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Privacy
                </Typography>
              </Stack>
              <Stack spacing={1} sx={{ ml: 4 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.profileVisibility}
                      onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.checked })}
                    />
                  }
                  label="Make profile visible to other learners"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Account Actions */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Account Security
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ ml: 4 }}>
                <Button variant="outlined" startIcon={<SecurityIcon />}>
                  Change Password
                </Button>
                <Button variant="outlined" startIcon={<EmailIcon />}>
                  Update Email
                </Button>
                <Button variant="outlined" color="error">
                  Delete Account
                </Button>
              </Stack>
            </Box>
          </Stack>        </CardContent>
      </GlassCard>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;
