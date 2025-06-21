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
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { AuthCard, LoadingButton, FormInput } from '../../components';
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

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <AuthCard>
        <Stack spacing={3}>
          {/* Header */}
          <Box textAlign="center">
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please sign in to your account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
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
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={isLoading}
                disabled={!isValid}
                sx={{ mt: 2 }}
              >
                Sign In
              </LoadingButton>
            </Stack>
          </form>

          <Divider />

          {/* Register Link */}
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{ fontWeight: 'bold' }}
              >
                Sign up here
              </Link>
            </Typography>
          </Box>

          {/* Forgot Password Link */}
          <Box textAlign="center">
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              color="text.secondary"
            >
              Forgot your password?
            </Link>
          </Box>
        </Stack>
      </AuthCard>
    </Box>
  );
};

export default LoginPage;
