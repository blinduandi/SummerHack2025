import React from 'react';
import {
  Button,
  CircularProgress,
  Box,
  styled,
} from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { BarLoader } from 'react-spinners';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  useBarLoader?: boolean;
}

const StyledButton = styled(Button)(() => ({
  position: 'relative',
  overflow: 'hidden',
  '&.Mui-disabled': {
    pointerEvents: 'none',
  },
}));

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  useBarLoader = false,
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
    >
      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(2px)',
            zIndex: 1,
          }}
        >
          {useBarLoader ? (
            <BarLoader
              color="currentColor"
              loading={loading}
              width={60}
              height={3}
              speedMultiplier={1.2}
            />
          ) : (
            <CircularProgress
              size={20}
              sx={{ color: 'inherit' }}
            />
          )}
        </Box>
      )}
      
      {/* Button Content */}
      <Box
        sx={{
          opacity: loading ? 0.5 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        {loading && loadingText ? loadingText : children}
      </Box>
    </StyledButton>
  );
};

export default LoadingButton;
