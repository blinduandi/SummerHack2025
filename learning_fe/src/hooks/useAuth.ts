import { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { AuthAPI } from '../services/api';

/**
 * Hook for handling authentication logic
 */
export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      if (tokens?.accessToken && !user) {
        setLoading(true);
        try {
          const response = await AuthAPI.getProfile();
          if (response.success && response.data) {
            login(response.data, tokens);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        } finally {
          setLoading(false);
        }
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, [tokens, user, login, logout, setLoading]);
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    clearError();

    try {
      const response = await AuthAPI.login({ email, password });
      
      if (response.success && response.data?.data) {
        // Extract user and token from Laravel response
        const user = response.data.data.user;
        const tokens = { accessToken: response.data.data.token };
        login(user, tokens);
        return true;
      } else {
        setError(response.error?.message || 'Login failed');
        return false;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };  const handleRegister = async (
    email: string,
    password: string,
    name: string,
    role: 'student' | 'teacher' = 'student',
    language_preference: string = 'en'
  ): Promise<boolean> => {
    setLoading(true);
    clearError();

    try {
      const response = await AuthAPI.register({
        name,
        email,
        password,
        password_confirmation: password,
        role,
        language_preference,
      });
      
      if (response.success && response.data?.data) {
        // Extract user and token from Laravel response
        const user = response.data.data.user;
        const tokens = { accessToken: response.data.data.token };
        login(user, tokens);
        return true;
      } else {
        setError(response.error?.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      await AuthAPI.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      logout();
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError,
  };
};
