import React from 'react';
import {
  Button,
  CircularProgress,
  styled,
} from '@mui/material';
import type { ButtonProps } from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

const StyledButton = styled(Button)(() => ({
  position: 'relative',
  '&.Mui-disabled': {
    pointerEvents: 'none',
  },
}));

const LoadingIndicator = styled(CircularProgress)(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: -12,
  marginLeft: -12,
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
    >
      {loading && loadingText ? loadingText : children}
      {loading && <LoadingIndicator size={24} />}
    </StyledButton>
  );
};

export default LoadingButton;
