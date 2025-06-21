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
          <Stack direction="row" alignItems="center" spacing={3}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Welcome back, {user.firstName}!
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Chip
                label={user.role.toUpperCase()}
                color="primary"
                size="small"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>{/* Stats Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" color="text.secondary">
                Account Status
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {user.isActive ? 'Active' : 'Inactive'}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" color="text.secondary">
                Member Since
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {new Date(user.createdAt).getFullYear()}
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
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  {user.role}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {new Date(user.updatedAt).toLocaleDateString()}
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
