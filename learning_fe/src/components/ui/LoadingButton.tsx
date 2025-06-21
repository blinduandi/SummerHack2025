import React from 'react';
import {
  Button,
  Box,
  styled,
} from '@mui/material';
import type { ButtonProps } from '@mui/material';
import { HashLoader } from 'react-spinners';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
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
  ...props
}) => {
  return (
    <StyledButton
      {...props}
      disabled={disabled || loading}
    >      {/* Loading Overlay */}
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
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderRadius: 'inherit',
            zIndex: 1,
          }}
        >
          <HashLoader
            color="#6366f1"
            loading={loading}
            size={20}
            speedMultiplier={1.5}
          />
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
