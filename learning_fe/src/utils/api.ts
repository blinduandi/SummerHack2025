/**
 * Utility functions for API configuration and validation
 */

/**
 * Validate if a URL is a valid API endpoint
 */
export const isValidApiUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Get the API base URL with validation
 */
export const getValidatedApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  
  if (!isValidApiUrl(url)) {
    console.warn('Invalid API URL configured, falling back to default:', url);
    return 'http://localhost:3001/api';
  }
  
  return url;
};

/**
 * Get environment information
 */
export const getEnvironmentInfo = () => {
  return {
    apiUrl: import.meta.env.VITE_API_URL,
    appName: import.meta.env.VITE_APP_NAME,
    appVersion: import.meta.env.VITE_APP_VERSION,
    devMode: import.meta.env.VITE_DEV_MODE === 'true',
    mode: import.meta.env.MODE,
    prod: import.meta.env.PROD,
    dev: import.meta.env.DEV,
  };
};

/**
 * Log environment information in development
 */
export const logEnvironmentInfo = () => {
  if (import.meta.env.DEV) {
    console.group('🔧 Environment Configuration');
    console.table(getEnvironmentInfo());
    console.groupEnd();
  }
};

export default {
  isValidApiUrl,
  getValidatedApiUrl,
  getEnvironmentInfo,
  logEnvironmentInfo,
};
