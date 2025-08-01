import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  CssBaseline,  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Code as CodeIcon,
  School as SchoolIcon,
  Person as TeacherIcon,
  Favorite as OngIcon,
} from '@mui/icons-material';
import { LoadingButton, FormInput } from '../../components';
import AvatarUpload from '../../components/ui/AvatarUpload';
import { useAuth } from '../../hooks';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
  user_type: 'student' | 'teacher' | 'ong';
  avatar?: string | null;
}

const schema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),  bio: yup
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .default(''),
  user_type: yup
    .string()
    .oneOf(['student', 'teacher', 'ong'], 'Please select a valid user type')
    .required('Please select your user type'),
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

const RegisterCard = styled(Paper)(() => ({
  background: 'rgba(15, 23, 42, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  borderRadius: 24,
  padding: '3rem',
  maxWidth: 480,
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

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: '',
      user_type: 'student' as const,
      avatar: null,
    },
  });  const onSubmit = async (data: RegisterFormData) => {
    console.log('[RegisterPage] Registration form submitted');
    clearError();    const success = await register(
      data.email,
      data.password,
      data.name,
      data.user_type, // Will be sent as 'role' to backend
      data.bio?.trim() || undefined,
      data.avatar || undefined
    );
    
    console.log('[RegisterPage] Registration result:', success);
    
    if (success) {
      console.log('[RegisterPage] Registration successful, will be redirected by ProtectedRoute');
      // Don't manually navigate - let ProtectedRoute handle the redirect
    } else {
      console.log('[RegisterPage] Registration failed');
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
          maxWidth="sm"
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <RegisterCard elevation={0}>
            <Stack spacing={3}>
              {/* Header */}
              <Box textAlign="center">
                <LogoIcon sx={{ mb: 2 }}>
                  <CodeIcon sx={{ fontSize: 32, color: 'white' }} />
                </LogoIcon>
                <Typography variant="h4" fontWeight={800} gutterBottom color="white">
                  Join <GradientText>CodePath AI</GradientText>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Start your AI-powered learning journey today
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

              {/* Register Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>                  {/* Name Field */}
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="Full Name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        placeholder="Enter your full name"
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
                          },                        }}
                      />
                    )}
                  />                  {/* Avatar Upload */}
                  <Controller
                    name="avatar"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 1, 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500 
                          }}
                        >
                          Profile Picture (Optional)
                        </Typography>
                        <AvatarUpload
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isLoading}
                        />
                      </Box>
                    )}
                  />

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
                          },                        }}
                      />
                    )}
                  />

                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="Bio (Optional)"
                        multiline
                        rows={3}
                        error={!!errors.bio}
                        helperText={errors.bio?.message || 'Tell us a bit about yourself (optional)'}
                        placeholder="I'm an aspiring developer passionate about learning..."
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
                        placeholder="Create a strong password"
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

                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <FormInput
                        {...field}
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        placeholder="Confirm your password"
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
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />                    )}
                  />

                  {/* User Type Selection */}
                  <Controller
                    name="user_type"
                    control={control}
                    render={({ field }) => (
                      <Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 2, 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontWeight: 500 
                          }}
                        >
                          I am a... *
                        </Typography>
                        <ToggleButtonGroup
                          value={field.value}
                          exclusive
                          onChange={(_, newValue) => {
                            if (newValue !== null) {
                              field.onChange(newValue);
                            }
                          }}
                          sx={{
                            width: '100%',
                            '& .MuiToggleButton-root': {
                              flex: 1,
                              flexDirection: 'column',
                              py: 2,
                              px: 1,
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              color: 'rgba(255, 255, 255, 0.7)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                borderColor: 'rgba(99, 102, 241, 0.5)',
                                color: 'rgba(255, 255, 255, 0.9)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                                },
                              },
                            },
                          }}
                        >
                          <ToggleButton value="student">
                            <SchoolIcon sx={{ mb: 1, fontSize: 28 }} />
                            <Typography variant="body2" fontWeight="medium">
                              Student
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
                              Learn new skills
                            </Typography>
                          </ToggleButton>
                          
                          <ToggleButton value="teacher">
                            <TeacherIcon sx={{ mb: 1, fontSize: 28 }} />
                            <Typography variant="body2" fontWeight="medium">
                              Teacher
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
                              Share knowledge
                            </Typography>
                          </ToggleButton>
                          
                          <ToggleButton value="ong">
                            <OngIcon sx={{ mb: 1, fontSize: 28 }} />
                            <Typography variant="body2" fontWeight="medium">
                              NGO
                            </Typography>
                            <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.8 }}>
                              Social impact
                            </Typography>
                          </ToggleButton>
                        </ToggleButtonGroup>
                        {errors.user_type && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'error.main', 
                              mt: 1, 
                              display: 'block',
                              ml: 1
                            }}
                          >
                            {errors.user_type.message}
                          </Typography>
                        )}
                      </Box>
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
                    Create Account
                  </StyledLoadingButton>
                </Stack>
              </form>

              <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.2)' }} />

              {/* Login Link */}
              <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign in here
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
          </RegisterCard>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default RegisterPage;
