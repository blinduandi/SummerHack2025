import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  Link,
  Alert,
  Divider,
  Stack,
  IconButton,
  InputAdornment,
  Container,
  Paper,
  styled,
  keyframes,
  useTheme,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Code as CodeIcon,
} from '@mui/icons-material';
import { LoadingButton, FormInput } from '../../components';
import { useAuth } from '../../hooks';

interface LoginFormData {
  email: string;
  password: string;
}

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

// Create dark theme matching the landing page
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    background: {
      default: '#050505',
      paper: '#0a0a0a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
  },
  shape: {
    borderRadius: 20,
  },
});

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(100px); opacity: 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
`;

const bgMove = keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(-20px, -20px) rotate(120deg); }
  66% { transform: translate(20px, -10px) rotate(240deg); }
`;

// Styled components
const AnimatedBackground = styled(Box)({
  position: 'fixed',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
  zIndex: -1,
  background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 100%)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '200%',
    height: '200%',
    top: '-50%',
    left: '-50%',
    background: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 50%),
                radial-gradient(circle at 40% 20%, rgba(249, 115, 22, 0.1) 0%, transparent 50%)`,
    animation: `${bgMove} 20s ease-in-out infinite`,
  },
});

const Particle = styled('div')({
  position: 'absolute',
  width: '4px',
  height: '4px',
  background: 'rgba(99, 102, 241, 0.5)',
  borderRadius: '50%',
  animation: `${float} 15s infinite`,
});

const LoginCard = styled(Paper)(() => ({
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  borderRadius: 24,
  padding: '3rem',
  maxWidth: 420,
  width: '100%',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${pulse} 2s ease-in-out infinite`,
  margin: '0 auto',
}));

const GradientText = styled('span')(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'inline-block',
}));

const StyledLoadingButton = styled(LoadingButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  padding: '14px 28px',
  borderRadius: 50,
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.3)',
    transition: 'left 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)',
    '&:before': {
      left: '100%',
    },
  },
  '&:disabled': {
    background: 'rgba(99, 102, 241, 0.3)',
    transform: 'none',
  },
}));

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data.email, data.password);
    if (success) {
      navigate('/dashboard');
    }
  };

  // Generate particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    delay: Math.random() * 15 + 's',
    duration: (15 + Math.random() * 10) + 's',
  }));

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', position: 'relative' }}>
        {/* Animated Background */}
        <AnimatedBackground>
          <Box sx={{ position: 'absolute', width: '100%', height: '100%' }}>
            {particles.map((particle) => (
              <Particle
                key={particle.id}
                sx={{
                  left: particle.left,
                  animationDelay: particle.delay,
                  animationDuration: particle.duration,
                }}
              />
            ))}
          </Box>
        </AnimatedBackground>

        {/* Main Content */}
        <Container
          maxWidth="xs"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <LoginCard elevation={0}>
            <Stack spacing={3}>
              {/* Header */}
              <Box textAlign="center">
                <LogoIcon sx={{ mb: 2 }}>
                  <CodeIcon sx={{ fontSize: 32, color: 'white' }} />
                </LogoIcon>
                <Typography variant="h4" fontWeight={800} gutterBottom color="white">
                  Welcome to <GradientText>CodePath AI</GradientText>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to continue your learning journey
                </Typography>
              </Box>

              {/* Error Alert */}
              {error && (
                <Alert
                  severity="error"
                  onClose={clearError}
                  sx={{
                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: '#ff6b6b',
                    '& .MuiAlert-icon': {
                      color: '#ff6b6b',
                    },
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="Email Address"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        placeholder="Enter your email"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '& fieldset': {
                              borderColor: 'rgba(99, 102, 241, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(99, 102, 241, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': {
                              color: theme.palette.primary.main,
                            },
                          },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        placeholder="Enter your password"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            '& fieldset': {
                              borderColor: 'rgba(99, 102, 241, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(99, 102, 241, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: theme.palette.primary.main,
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&.Mui-focused': {
                              color: theme.palette.primary.main,
                            },
                          },
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />

                  <StyledLoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={isLoading}
                    disabled={!isValid}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Sign In
                  </StyledLoadingButton>
                </Stack>
              </form>

              <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.2)' }} />

              {/* Register Link */}
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>

              {/* Back to Home Link */}
              <Box textAlign="center">
                <Link
                  component={RouterLink}
                  to="/"
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  ← Back to Home
                </Link>
              </Box>
            </Stack>
          </LoginCard>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;
