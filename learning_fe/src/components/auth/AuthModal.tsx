import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  styled,
  keyframes,
  useTheme,
  Fade,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Code as CodeIcon,
} from '@mui/icons-material';
import { LoadingButton, FormInput } from '../index';
import { useAuth } from '../../hooks';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'student' | 'teacher' | 'ong';
}

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
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
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup
    .string()
    .oneOf(['student', 'teacher', 'ong'])
    .required('Please select your role'),
});

// Animations
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const slideIn = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: 24,
    maxWidth: 500,
    width: '100%',
    margin: 16,
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
  },
  '& .MuiBackdrop-root': {
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(4px)',
  },
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 50,
  height: 50,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  borderRadius: 12,
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
  padding: '12px 24px',
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

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
    height: 3,
    borderRadius: 2,
  },
  '& .MuiTab-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 600,
    fontSize: '1rem',
    textTransform: 'none',
    '&.Mui-selected': {
      color: 'white',
    },
  },
}));

const UserTypeButton = styled(Box)<{ selected: boolean }>(({ theme, selected }) => ({
  padding: '16px 20px',
  border: `2px solid ${selected ? theme.palette.primary.main : 'rgba(99, 102, 241, 0.3)'}`,
  borderRadius: 12,
  background: selected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textAlign: 'center',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: 'rgba(99, 102, 241, 0.05)',
  },
}));

export const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'student' | 'teacher' | 'ong'>('student');
  const { login, register, isLoading, error, clearError } = useAuth();
  const theme = useTheme();

  const loginForm = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });  const registerForm = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'student',
    },
  });

  React.useEffect(() => {
    registerForm.setValue('role', userType);
  }, [userType, registerForm]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'login' | 'register') => {
    setActiveTab(newValue);
    clearError();
    loginForm.reset();
    registerForm.reset();
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    clearError();
    const success = await login(data.email, data.password);
    if (success) {
      onClose();
    }
  };  const onRegisterSubmit = async (data: RegisterFormData) => {
    clearError();
    const success = await register(
      data.email,
      data.password,
      data.name,
      data.role,
      'en' // Default language preference
    );
    if (success) {
      onClose();
    }
  };

  const inputSx = {
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
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4, position: 'relative', animation: `${slideIn} 0.5s ease-out` }}>
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Stack spacing={3}>
            {/* Header */}
            <Box textAlign="center">
              <LogoIcon sx={{ mb: 2 }}>
                <CodeIcon sx={{ fontSize: 24, color: 'white' }} />
              </LogoIcon>
              <Typography variant="h4" fontWeight={800} gutterBottom color="white">
                Welcome to <GradientText>CodePath AI</GradientText>
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {activeTab === 'login' 
                  ? 'Sign in to continue your learning journey'
                  : 'Create your account and start learning today'
                }
              </Typography>
            </Box>

            {/* Tabs */}
            <StyledTabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              variant="fullWidth"
            >
              <Tab label="Sign In" value="login" />
              <Tab label="Create Account" value="register" />
            </StyledTabs>

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
            {activeTab === 'login' && (
              <Fade in>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <Stack spacing={3}>
                    <Controller
                      name="email"
                      control={loginForm.control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          label="Email Address"
                          type="email"
                          error={!!loginForm.formState.errors.email}
                          helperText={loginForm.formState.errors.email?.message}
                          placeholder="Enter your email"
                          sx={inputSx}
                        />
                      )}
                    />

                    <Controller
                      name="password"
                      control={loginForm.control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          error={!!loginForm.formState.errors.password}
                          helperText={loginForm.formState.errors.password?.message}
                          placeholder="Enter your password"
                          sx={inputSx}
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
                    />                    <StyledLoadingButton                      type="submit"
                      variant="contained"
                      size="large"
                      loading={isLoading}
                      disabled={!loginForm.formState.isValid}
                      fullWidth
                      loadingText="Signing in..."
                    >
                      Sign In
                    </StyledLoadingButton>
                  </Stack>
                </form>
              </Fade>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <Fade in>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <Stack spacing={3}>
                    <Controller
                      name="name"
                      control={registerForm.control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          label="Full Name"
                          error={!!registerForm.formState.errors.name}
                          helperText={registerForm.formState.errors.name?.message}
                          placeholder="Enter your full name"
                          sx={inputSx}
                        />
                      )}
                    />

                    <Controller
                      name="email"
                      control={registerForm.control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          label="Email Address"
                          type="email"
                          error={!!registerForm.formState.errors.email}
                          helperText={registerForm.formState.errors.email?.message}
                          placeholder="Enter your email"
                          sx={inputSx}
                        />
                      )}
                    />

                    <Controller
                      name="password"
                      control={registerForm.control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          error={!!registerForm.formState.errors.password}
                          helperText={registerForm.formState.errors.password?.message}
                          placeholder="Create a strong password"
                          sx={inputSx}
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
                      name="password_confirmation"
                      control={registerForm.control}
                      render={({ field }) => (
                        <FormInput
                          {...field}
                          label="Confirm Password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          error={!!registerForm.formState.errors.password_confirmation}
                          helperText={registerForm.formState.errors.password_confirmation?.message}
                          placeholder="Confirm your password"
                          sx={inputSx}
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
                        />
                      )}
                    />

                    {/* User Type Selection */}
                    <Box>
                      <Typography variant="subtitle1" color="white" gutterBottom>
                        I am a:
                      </Typography>
                      <Stack direction="row" spacing={2}>                        <UserTypeButton
                          selected={userType === 'student'}
                          onClick={() => {
                            setUserType('student');
                            registerForm.setValue('role', 'student');
                          }}
                          sx={{ flex: 1 }}
                        >
                          <Typography color="white" fontWeight={600}>
                            🎓 Student
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Learn & grow
                          </Typography>
                        </UserTypeButton>
                        <UserTypeButton
                          selected={userType === 'teacher'}
                          onClick={() => {
                            setUserType('teacher');
                            registerForm.setValue('role', 'teacher');
                          }}
                          sx={{ flex: 1 }}
                        >
                          <Typography color="white" fontWeight={600}>
                            🏫 Teacher
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Teach & inspire
                          </Typography>
                        </UserTypeButton>
                        <UserTypeButton
                          selected={userType === 'ong'}
                          onClick={() => {
                            setUserType('ong');
                            registerForm.setValue('role', 'ong');
                          }}
                          sx={{ flex: 1 }}
                        >
                          <Typography color="white" fontWeight={600}>
                            🏫 ONG
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Help & support
                          </Typography>
                        </UserTypeButton>                      
                    </Stack>
                    </Box>                    <StyledLoadingButton
                      type="submit"                      variant="contained"
                      size="large"
                      loading={isLoading}
                      disabled={!registerForm.formState.isValid}
                      fullWidth
                      loadingText="Creating account..."
                    >
                      Create Account
                    </StyledLoadingButton>
                  </Stack>
                </form>
              </Fade>
            )}
          </Stack>
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};

export default AuthModal;
