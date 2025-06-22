import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    glass: {
      primary: string;
      secondary: string;
      background: string;
      surface: string;
      border: string;
    };
  }

  interface PaletteOptions {
    glass?: {
      primary?: string;
      secondary?: string;
      background?: string;
      surface?: string;
      border?: string;
    };
  }
}

export const createGlassTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark';

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4338ca',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#06b6d4',
        light: '#0891b2',
        dark: '#0e7490',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0a0a0a' : '#f8fafc',
        paper: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      glass: {
        primary: isDark ? alpha('#6366f1', 0.1) : alpha('#6366f1', 0.05),
        secondary: isDark ? alpha('#06b6d4', 0.1) : alpha('#06b6d4', 0.05),
        background: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
        surface: isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(248, 250, 252, 0.9)',
        border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(30, 41, 59, 0.1)',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            // Hide scrollbars globally
            '*::-webkit-scrollbar': {
              display: 'none',
            },
            '*': {
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            },
            background: isDark 
              ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark 
              ? 'rgba(15, 23, 42, 0.6)' 
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: isDark
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(30, 41, 59, 0.1)',
            borderRadius: 20,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: isDark
                ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                : '0 20px 40px rgba(30, 41, 59, 0.15)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(240, 240, 240, 0.3)',
              transform: 'translateY(-2px)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4338ca 0%, #0891b2 100%)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(30, 41, 59, 0.2)',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            '&:hover': {
              borderColor: '#6366f1',
              backgroundColor: alpha('#6366f1', 0.1),
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 12,
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(30, 41, 59, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: alpha('#6366f1', 0.5),
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6366f1',
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha('#6366f1', 0.3)}`,
            fontWeight: 600,
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          },
        },
      },
    },
  });

  return theme;
};