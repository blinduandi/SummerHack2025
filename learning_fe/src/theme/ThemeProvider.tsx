import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { createGlassTheme } from './index';

interface ThemeContextType {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    // Get saved theme from localStorage or default to dark
    const savedMode = localStorage.getItem('themeMode') as PaletteMode;
    return savedMode || 'dark';
  });

  const toggleTheme = () => {
    const newMode: PaletteMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = createGlassTheme(mode);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
