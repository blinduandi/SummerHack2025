import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { AuthAPI } from '../../services/api';
import { useApiConfig } from '../../hooks';

export const ApiStatus: React.FC = () => {
  const { devMode, apiUrl } = useApiConfig();
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    setStatus('checking');
    try {
      const response = await AuthAPI.healthCheck();
      setStatus(response.success ? 'online' : 'offline');
    } catch (error) {
      setStatus('offline');
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    if (devMode) {
      checkApiStatus();
    }
  }, [devMode]);

  if (!devMode) {
    return null;
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'API Online';
      case 'offline':
        return 'API Offline';
      default:
        return 'Checking...';
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 8,
        right: 8,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: 'background.paper',
        p: 1,
        borderRadius: 1,
        boxShadow: 2,
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Chip
        label={getStatusText()}
        color={getStatusColor()}
        size="small"
        variant="outlined"
      />
      <Tooltip title={`API URL: ${apiUrl}`}>
        <IconButton size="small" onClick={checkApiStatus}>
          <RefreshIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {lastCheck && (
        <Typography variant="caption" color="text.secondary">
          {lastCheck.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
};

export default ApiStatus;
