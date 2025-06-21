import React from 'react';
import { Box, Typography, Fade, Backdrop } from '@mui/material';
import { BarLoader } from 'react-spinners';
import { useTheme } from '@mui/material/styles';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  open, 
  message = 'Loading...' 
}) => {
  const theme = useTheme();

  return (
    <Backdrop
      sx={{
        zIndex: theme.zIndex.modal + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
      }}
      open={open}
    >
      <Fade in={open} timeout={500}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            padding: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            minWidth: 300,
            textAlign: 'center',
          }}
        >
          {/* Loading Animation */}
          <Box
            sx={{
              position: 'relative',
              width: 200,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarLoader
              color={theme.palette.primary.main}
              loading={open}
              width={200}
              height={6}
              speedMultiplier={0.8}
            />
          </Box>

          {/* Loading Text */}
          <Typography
            variant="h6"
            sx={{
              color: 'white',
              fontWeight: 500,
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              letterSpacing: '0.5px',
            }}
          >
            {message}
          </Typography>

          {/* Animated dots */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              alignItems: 'center',
            }}
          >
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  animation: `loading-dot 1.5s ease-in-out ${index * 0.2}s infinite`,
                  '@keyframes loading-dot': {
                    '0%, 80%, 100%': {
                      transform: 'scale(0.8)',
                      opacity: 0.5,
                    },
                    '40%': {
                      transform: 'scale(1.2)',
                      opacity: 1,
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Fade>
    </Backdrop>
  );
};

export default LoadingOverlay;
