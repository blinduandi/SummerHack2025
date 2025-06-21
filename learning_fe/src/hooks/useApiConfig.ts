import { useMemo } from 'react';

/**
 * Hook to access API configuration
 */
export const useApiConfig = () => {
  const config = useMemo(() => ({
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    appName: import.meta.env.VITE_APP_NAME || 'Professional Auth App',
    appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
    devMode: import.meta.env.VITE_DEV_MODE === 'true',
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
    tokenRefreshInterval: parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL || '15', 10),
  }), []);

  return config;
};

export default useApiConfig;
