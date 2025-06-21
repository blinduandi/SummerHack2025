import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Devices as DevicesIcon,
  Code as CodeIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks';

const features = [
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Secure Authentication',
    description: 'JWT-based authentication with token refresh and secure session management.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    title: 'Lightning Fast',
    description: 'Built with Vite and optimized for performance with modern React patterns.',
  },
  {
    icon: <DevicesIcon sx={{ fontSize: 40 }} />,
    title: 'Responsive Design',
    description: 'Beautiful UI that works seamlessly across all devices and screen sizes.',
  },
  {
    icon: <CodeIcon sx={{ fontSize: 40 }} />,
    title: 'TypeScript Ready',
    description: 'Full TypeScript support with type safety and excellent developer experience.',
  },
];

const stats = [
  { label: 'Users', value: '10K+' },
  { label: 'Uptime', value: '99.9%' },
  { label: 'Countries', value: '50+' },
  { label: 'Reviews', value: '4.9/5' },
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          minHeight: { xs: '80vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          },
        }}
      >        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={4} 
            alignItems="center"
            sx={{ minHeight: '60vh' }}
          >
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Stack spacing={3}>
                <Chip
                  label="✨ New Version Available"
                  sx={{
                    alignSelf: 'flex-start',
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  Professional React
                  <br />
                  <Box component="span" sx={{ color: theme.palette.secondary.light }}>
                    Authentication App
                  </Box>
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.9,
                    lineHeight: 1.6,
                    maxWidth: 500,
                  }}
                >
                  A modern, secure, and beautiful web application built with React, TypeScript, 
                  and Material-UI. Get started in minutes with our comprehensive authentication system.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {isAuthenticated ? (
                    <Button
                      component={RouterLink}
                      to="/dashboard"
                      variant="contained"
                      size="large"
                      startIcon={<DashboardIcon />}
                      sx={{
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.common.white, 0.9),
                        },
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button
                        component={RouterLink}
                        to="/register"
                        variant="contained"
                        size="large"
                        startIcon={<RegisterIcon />}
                        sx={{
                          bgcolor: 'white',
                          color: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: alpha(theme.palette.common.white, 0.9),
                          },
                        }}
                      >
                        Get Started
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/login"
                        variant="outlined"
                        size="large"
                        startIcon={<LoginIcon />}
                        sx={{
                          borderColor: 'white',
                          color: 'white',
                          '&:hover': {
                            borderColor: 'white',
                            bgcolor: alpha(theme.palette.common.white, 0.1),
                          },
                        }}
                      >
                        Sign In
                      </Button>
                    </>
                  )}                </Stack>
              </Stack>
            </Box>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: { xs: 300, md: 400 },
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.common.white, 0.1),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    textAlign: 'center',
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Modern Dashboard
                  </Typography>                  <Typography variant="body1" sx={{ opacity: 0.8 }}>
                    Beautiful, responsive, and feature-rich
                  </Typography>
                </Paper>
              </Box>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* Stats Section */}      <Box sx={{ width: '100%', py: 6 }}>
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={3}
            justifyContent="center"
          >
            {stats.map((stat, index) => (
              <Box key={index} sx={{ flex: 1 }}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {stat.value}
                </Typography>                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.default', py: 8, width: '100%' }}>
        <Container maxWidth="lg">
          <Stack spacing={6}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Why Choose Our Platform?
              </Typography>
              <Typography variant="h6" color="text.secondary" maxWidth={600} mx="auto">
                Built with modern technologies and best practices to deliver 
                an exceptional user experience.
              </Typography>
            </Box>            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={4}
              flexWrap="wrap"
              justifyContent="center"
            >
              {features.map((feature, index) => (
                <Box key={index} sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' }, minWidth: 250 }}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 3,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme.shadows[8],
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {feature.icon}
                      </Box>                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.8)} 0%, ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
          py: 8,
          width: '100%',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Stack direction="row" spacing={1} alignItems="center">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} sx={{ color: '#FFD700', fontSize: 24 }} />
              ))}
              <Typography variant="body1" sx={{ ml: 1, color: 'white' }}>
                Rated 4.9/5 by developers
              </Typography>
            </Stack>
            
            <Typography variant="h4" fontWeight="bold" color="white">
              Ready to get started?
            </Typography>
            
            <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
              Join thousands of developers building amazing applications
            </Typography>

            {!isAuthenticated && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  startIcon={<RegisterIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                    },
                  }}
                >
                  Create Free Account
                </Button>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            )}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
