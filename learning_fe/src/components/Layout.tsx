import React from 'react';
import { Box } from '@mui/material';
import { Navigation } from '../components/ui/Navigation';
import { Footer } from '../components/ui/Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  showNavigation = true,
  showFooter = true 
}) => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      width: '100%',
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {showNavigation && <Navigation />}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          width: '100%',
          minHeight: showNavigation ? 'calc(100vh - 64px)' : '100vh'
        }}
      >
        {children}
      </Box>
      {showFooter && <Footer />}
    </Box>
  );
};

export default Layout;
