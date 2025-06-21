import { useState, useEffect } from 'react';
import { useAuthStore } from '../store';
import { AuthAPI } from '../services/api';

/**
 * Simplified authentication hook that works with Laravel Sanctum API
 */
export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login: setAuthState,
    logout: clearAuthState,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  const [isInitialized, setIsInitialized] = useState(false);

  // Simple initialization
  useEffect(() => {
    console.log('[useAuth] Initializing...', { hasUser: !!user, hasTokens: !!tokens?.accessToken });
    
    // If we have user and tokens from persistence, we're authenticated
    if (user && tokens?.accessToken) {
      console.log('[useAuth] Found persisted auth data, user is authenticated');
    } else if (tokens?.accessToken && !user) {
      // Clear orphaned tokens
      console.log('[useAuth] Found orphaned tokens, clearing auth state');
      clearAuthState();
    }
    
    setIsInitialized(true);
  }, []);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('[useAuth] Starting login for:', email);
    setLoading(true);
    clearError();

    try {
      const response = await AuthAPI.login({ email, password });
      console.log('[useAuth] Full login response:', JSON.stringify(response, null, 2));

      // Check if the API call was successful and we have the expected data
      if (response.success && response.data?.data?.user && response.data?.data?.access_token) {
        const userData = response.data.data.user;
        const accessToken = response.data.data.access_token;
        
        console.log('[useAuth] Login successful!');
        console.log('[useAuth] User data:', userData);
        console.log('[useAuth] Access token:', accessToken);
        
        // Set the authentication state
        setAuthState(userData, { accessToken });
        
        console.log('[useAuth] Auth state has been set');
        return true;
      } else {
        console.log('[useAuth] Login failed - unexpected response structure');
        console.log('[useAuth] Expected: response.success && response.data.data.user && response.data.data.access_token');
        console.log('[useAuth] Got:', {
          success: response.success,
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasUser: !!response.data?.data?.user,
          hasAccessToken: !!response.data?.data?.access_token
        });
        
        setError(response.data?.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      console.log('[useAuth] Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (
    email: string,
    password: string,
    name: string,
    user_type: 'student' | 'teacher' = 'student',
    bio?: string
  ): Promise<boolean> => {
    console.log('[useAuth] Starting registration for:', email, name);
    setLoading(true);
    clearError();

    try {
      const response = await AuthAPI.register({
        name,
        email,
        password,
        password_confirmation: password,
        user_type,
        bio: bio || undefined,
      });
      
      console.log('[useAuth] Full registration response:', JSON.stringify(response, null, 2));

      if (response.success && response.data?.data?.user && response.data?.data?.access_token) {
        const userData = response.data.data.user;
        const accessToken = response.data.data.access_token;
        
        console.log('[useAuth] Registration successful!');
        console.log('[useAuth] User data:', userData);
        console.log('[useAuth] Access token:', accessToken);
        
        setAuthState(userData, { accessToken });
        
        console.log('[useAuth] Auth state has been set');
        return true;
      } else {
        console.log('[useAuth] Registration failed - unexpected response structure');
        setError(response.data?.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      console.log('[useAuth] Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
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
      console.log('[useAuth] Logout API error (continuing anyway):', error);
    } finally {
      clearAuthState();
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
