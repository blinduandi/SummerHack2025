import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks';
import { getInitials } from '../utils';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      {/* Welcome Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={3}>            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              {getInitials(user.name)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Welcome back, {user.name || 'User'}!
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email || 'No email'}
              </Typography>
              {user.role && (
                <Chip
                  label={user.role.toUpperCase()}
                  color="primary"
                  size="small"
                />
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>{/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" color="text.secondary">
                User ID
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                #{user.id}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" color="text.secondary">
                Member Since
              </Typography>              <Typography variant="h4" fontWeight="bold">
                {user.created_at ? new Date(user.created_at).getFullYear() : 'Unknown'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" color="text.secondary">
                Role
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <PersonIcon color="primary" />                <Typography variant="h6" fontWeight="bold">
                  {user.role || 'No role assigned'}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" color="text.secondary">
                Language Preference
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {user.language_preference?.toUpperCase() || 'Not set'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="contained" startIcon={<PersonIcon />}>
              Edit Profile
            </Button>
            <Button variant="outlined">
              View Settings
            </Button>
            <Button variant="outlined">
              Help & Support
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
