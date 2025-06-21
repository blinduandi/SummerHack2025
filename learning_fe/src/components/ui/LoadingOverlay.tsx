import React from 'react';
import { Backdrop } from '@mui/material';
import { HashLoader } from 'react-spinners';
import { useTheme } from '@mui/material/styles';

interface LoadingOverlayProps {
  open: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ open }) => {
  const theme = useTheme();

  return (
    <Backdrop
      sx={{
        zIndex: theme.zIndex.modal + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      open={open}
    >      <HashLoader
        color={theme.palette.primary.main}
        loading={open}
        size={50}
        speedMultiplier={1.5}
      />
    </Backdrop>
  );
};

export default LoadingOverlay;
