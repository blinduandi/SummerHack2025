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

  const [isInitialized, setIsInitialized] = useState(false);  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[useAuth] Initializing auth...', { 
        hasTokens: !!tokens?.accessToken, 
        hasUser: !!user, 
        isAuthenticated 
      });
      
      // If we have both user and tokens from persistence, we're good to go
      if (user && tokens?.accessToken && isAuthenticated) {
        console.log('[useAuth] User and tokens found in persistence, auth is ready');
        setIsInitialized(true);
        return;
      }
      
      // If we have tokens but no user, try to fetch user profile
      // BUT don't immediately logout on failure - this causes the redirect loop
      if (tokens?.accessToken && !user) {
        console.log('[useAuth] Has tokens but no user, fetching profile...');
        setLoading(true);
        try {
          const response = await AuthAPI.getCurrentProfile();
          console.log('[useAuth] Profile fetch response:', response);
          
          if (response.success && response.data) {
            console.log('[useAuth] Profile fetch successful, logging in user');
            login(response.data, tokens);
          } else {
            console.log('[useAuth] Profile fetch failed - keeping tokens for now');
            // Don't logout immediately - let the user try to use the app
            // The API interceptor will handle 401s if the token is truly invalid
          }
        } catch (error) {
          console.log('[useAuth] Profile fetch error - keeping tokens for now:', error);
          // Don't logout immediately - this could be a temporary network issue
        } finally {
          setLoading(false);
        }
      }
      
      setIsInitialized(true);
    };

    // Only run initialization once when the component mounts
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, user, tokens, isAuthenticated]); // Added dependencies to ensure proper re-initialization
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('[useAuth] Starting login for:', email);
    console.log('[useAuth] API URL being used:', import.meta.env.VITE_API_URL);
    
    // Test API connectivity first
    try {
      console.log('[useAuth] Testing API connectivity...');
      const healthCheck = await AuthAPI.healthCheck();
      console.log('[useAuth] Health check result:', healthCheck);
    } catch (healthError) {
      console.log('[useAuth] Health check failed:', healthError);
    }
    
    setLoading(true);
    clearError();

    try {
      console.log('[useAuth] Calling AuthAPI.login with credentials:', { email, password: '***' });
      const response = await AuthAPI.login({ email, password });
      console.log('[useAuth] Raw Login API response:', response);
      console.log('[useAuth] Response success:', response.success);
      console.log('[useAuth] Response data:', response.data);      console.log('[useAuth] Response error:', response.error);
        // Debug: Log the exact structure we're checking
      console.log('[useAuth] Checking response structure:', {
        hasSuccess: !!response.success,
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasUser: !!response.data?.data?.user,
        hasAccessToken: !!response.data?.data?.access_token,        // Also check direct structure in case API doesn't wrap
        hasDirectUser: !!(response.data as any)?.user,
        hasDirectAccessToken: !!(response.data as any)?.access_token
      });
      
      // Check for nested structure first (ApiResponse wrapping Laravel response)
      if (response.success && response.data?.data?.user && response.data?.data?.access_token) {
        const user = response.data.data.user;
        const tokens = { accessToken: response.data.data.access_token };
        console.log('[useAuth] Login successful (nested structure), user:', user, 'tokens:', tokens);
        
        login(user, tokens);
        console.log('[useAuth] Auth state updated after login');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const {
          isAuthenticated: currentAuthState,
          user: currentUser,
          tokens: currentTokens
        } = useAuthStore.getState();
        console.log('[useAuth] Verification after login:', {
          isAuthenticated: currentAuthState,
          hasUser: !!currentUser,
          hasTokens: !!currentTokens
        });
        
        return currentAuthState && !!currentUser;
      }      // Check for direct structure (direct Laravel response)
      else if (response.success && (response.data as any)?.user && (response.data as any)?.access_token) {
        const user = (response.data as any).user;
        const tokens = { accessToken: (response.data as any).access_token };
        console.log('[useAuth] Login successful (direct structure), user:', user, 'tokens:', tokens);
        
        login(user, tokens);
        console.log('[useAuth] Auth state updated after login');
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const {
          isAuthenticated: currentAuthState,
          user: currentUser,
          tokens: currentTokens
        } = useAuthStore.getState();
        console.log('[useAuth] Verification after login:', {
          isAuthenticated: currentAuthState,
          hasUser: !!currentUser,
          hasTokens: !!currentTokens
        });
        
        return currentAuthState && !!currentUser;
      } else {
        console.log('[useAuth] Login failed - invalid response structure:', response);
        setError(response.error?.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      console.log('[useAuth] Login error (caught):', error);
      console.log('[useAuth] Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response
      });
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };  const handleRegister = async (
    email: string,
    password: string,
    name: string,
    user_type: 'student' | 'teacher' | 'ong' = 'student',
    bio?: string,
    avatar?: string
  ): Promise<boolean> => {
    console.log('[useAuth] Starting registration for:', email, name);
    setLoading(true);
    clearError();

    try {      const response = await AuthAPI.register({
        name,
        email,
        password,
        password_confirmation: password,
        user_type,
        bio: bio || undefined,
        avatar: avatar || undefined,
      });
        console.log('[useAuth] Register API response:', response);
          // Debug: Log the exact structure we're checking  
        console.log('[useAuth] Checking registration response structure:', {
          hasSuccess: !!response.success,
          hasData: !!response.data,
          hasDataData: !!response.data?.data,
          hasUser: !!response.data?.data?.user,
          hasAccessToken: !!response.data?.data?.access_token,
          // Also check direct structure
          hasDirectUser: !!(response.data as any)?.user,
          hasDirectAccessToken: !!(response.data as any)?.access_token
        });
        
        // Check for nested structure first
        if (response.success && response.data?.data?.user && response.data?.data?.access_token) {
          const user = response.data.data.user;
          const tokens = { accessToken: response.data.data.access_token };
          console.log('[useAuth] Registration successful (nested structure), user:', user, 'tokens:', tokens);
          
          login(user, tokens);
          console.log('[useAuth] Auth state updated after registration');
          
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const {
            isAuthenticated: currentAuthState,
            user: currentUser,
            tokens: currentTokens
          } = useAuthStore.getState();
          console.log('[useAuth] Verification after registration:', {
            isAuthenticated: currentAuthState,
            hasUser: !!currentUser,
            hasTokens: !!currentTokens
          });
          
          return currentAuthState && !!currentUser;
        }
        // Check for direct structure
        else if (response.success && (response.data as any)?.user && (response.data as any)?.access_token) {
          const user = (response.data as any).user;
          const tokens = { accessToken: (response.data as any).access_token };
          console.log('[useAuth] Registration successful (direct structure), user:', user, 'tokens:', tokens);
          
          login(user, tokens);
          console.log('[useAuth] Auth state updated after registration');
          
          await new Promise(resolve => setTimeout(resolve, 200));
          
          const {
            isAuthenticated: currentAuthState,
            user: currentUser,
            tokens: currentTokens
          } = useAuthStore.getState();
          console.log('[useAuth] Verification after registration:', {
            isAuthenticated: currentAuthState,
            hasUser: !!currentUser,
            hasTokens: !!currentTokens
          });
          
          return currentAuthState && !!currentUser;
        } else {
        console.log('[useAuth] Registration failed - invalid response:', response);
        setError(response.error?.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.log('[useAuth] Registration error:', error);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async (): Promise<void> => {
    setLoading(true);
    try {
      await AuthAPI.logoutUser();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      logout();
      setLoading(false);
    }
  };
  const refreshUser = async (): Promise<boolean> => {
    if (!tokens?.accessToken) return false;
    
    setLoading(true);
    try {
      console.log('[useAuth] Refreshing user data...');
      const response = await AuthAPI.getCurrentProfile();
      console.log('[useAuth] Profile refresh response:', response);
      
      if (response.success && response.data) {
        console.log('[useAuth] Profile refresh successful, updating user data:', response.data);
        login(response.data, tokens);
        return true;
      } else {
        console.log('[useAuth] Profile refresh failed:', response.error);
        return false;
      }
    } catch (error) {
      console.error('[useAuth] Profile refresh error:', error);
      return false;
    } finally {
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
    refreshUser,
    clearError,
  };
};
