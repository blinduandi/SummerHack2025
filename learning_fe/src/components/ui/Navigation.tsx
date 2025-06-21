import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Snackbar,
  styled,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks';
import { UserAvatar } from '../../utils';
import { ThemeToggle } from './ThemeToggle';

// Glass morphism styled AppBar
const GlassAppBar = styled(AppBar)<{ scrolled?: boolean }>(({ scrolled }) => ({
  backgroundColor: scrolled 
    ? alpha('#0a0a0a', 0.95)
    : alpha('#0a0a0a', 0.85),
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: scrolled 
    ? `1px solid ${alpha('#ffffff', 0.15)}` 
    : `1px solid ${alpha('#ffffff', 0.08)}`,
  boxShadow: scrolled 
    ? `0 8px 32px ${alpha('#000000', 0.6)}` 
    : `0 4px 16px ${alpha('#000000', 0.3)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: scrolled
      ? `linear-gradient(135deg, ${alpha('#6366f1', 0.12)} 0%, ${alpha('#06b6d4', 0.08)} 50%, ${alpha('#8b5cf6', 0.06)} 100%)`
      : `linear-gradient(135deg, ${alpha('#6366f1', 0.08)} 0%, ${alpha('#06b6d4', 0.05)} 50%, ${alpha('#8b5cf6', 0.04)} 100%)`,
    zIndex: -1,
    animation: 'shimmer 8s ease-in-out infinite alternate',
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '0% 50%',
    },
    '100%': {
      backgroundPosition: '100% 50%',
    },
  },
}));

// Glass morphism styled Menu
const GlassMenu = styled(Menu)(() => ({
  '& .MuiPaper-root': {
    backgroundColor: alpha('#0a0a0a', 0.9),
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${alpha('#ffffff', 0.12)}`,
    borderRadius: 16,
    boxShadow: `0 20px 40px ${alpha('#000000', 0.6)}, 0 8px 16px ${alpha('#000000', 0.4)}`,
    minWidth: 220,
    mt: 1,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${alpha('#6366f1', 0.08)} 0%, ${alpha('#06b6d4', 0.05)} 100%)`,
      borderRadius: 'inherit',
      zIndex: -1,
    },
  },
  '& .MuiMenuItem-root': {
    padding: '12px 20px',
    borderRadius: 8,
    margin: '4px 8px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    color: '#ffffff',
    '&:hover': {
      backgroundColor: alpha('#ffffff', 0.1),
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 12px ${alpha('#6366f1', 0.2)}`,
    },
    '&:disabled': {
      color: alpha('#ffffff', 0.4),
    },
  },
}));

// Glass morphism styled Drawer
const GlassDrawer = styled(Drawer)(() => ({
  '& .MuiDrawer-paper': {
    backgroundColor: alpha('#0a0a0a', 0.95),
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${alpha('#ffffff', 0.1)}`,
    borderLeft: 'none',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg, ${alpha('#6366f1', 0.1)} 0%, ${alpha('#06b6d4', 0.05)} 100%)`,
      zIndex: -1,
    },
  },
  '& .MuiListItem-root': {
    borderRadius: 8,
    margin: '4px 8px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      backgroundColor: alpha('#ffffff', 0.08),
      transform: 'translateX(4px)',
    },
  },
}));

// Glass button styling - removed, using inline styles instead

// Logo with glass effect - removed, using inline styles instead;

// Glass avatar container
const AvatarContainer = styled(Box)(() => ({
  padding: '3px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha('#6366f1', 0.2)} 0%, ${alpha('#06b6d4', 0.15)} 100%)`,
  border: `1px solid ${alpha('#ffffff', 0.15)}`,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.08)',
    boxShadow: `0 8px 25px ${alpha('#6366f1', 0.4)}`,
  },
}));

export const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      handleUserMenuClose();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
      setError('Failed to logout. Please try again.');
      setErrorOpen(true);
    } finally {
      setLogoutLoading(false);
    }
  };

  const handleCloseError = () => {
    setErrorOpen(false);
    setError(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const navigationItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    ...(isAuthenticated 
      ? [
          { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { label: 'Profile', path: '/profile', icon: <PersonIcon /> }
        ]
      : [
          { label: 'Login', path: '/login', icon: <LoginIcon /> },
          { label: 'Register', path: '/register', icon: <RegisterIcon /> },
        ]
    ),
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ p: 3, borderBottom: `1px solid ${alpha('#ffffff', 0.1)}` }}>
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          EduFlow
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              color: '#ffffff',
              textDecoration: 'none',
              backgroundColor: location.pathname === item.path ? alpha('#6366f1', 0.15) : 'transparent',
              '&:hover': {
                backgroundColor: alpha('#ffffff', 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ color: '#06b6d4', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}        {isAuthenticated && (
          <ListItem 
            onClick={logoutLoading || isLoading ? undefined : handleLogout} 
            sx={{ 
              cursor: logoutLoading || isLoading ? 'default' : 'pointer',
              color: logoutLoading ? alpha('#ffffff', 0.5) : '#ffffff',
              opacity: logoutLoading || isLoading ? 0.5 : 1,
              '&:hover': {
                backgroundColor: logoutLoading || isLoading ? 'transparent' : alpha('#ef4444', 0.1),
              },
            }}
          >
            <ListItemIcon sx={{ color: '#ef4444', minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={logoutLoading ? 'Logging out...' : 'Logout'} />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <GlassAppBar position="sticky" elevation={0} scrolled={scrolled}>
        <Toolbar sx={{ padding: { xs: '0 16px', md: '0 24px' }, minHeight: '70px' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                borderRadius: 2,
                backgroundColor: alpha('#ffffff', 0.08),
                border: `1px solid ${alpha('#ffffff', 0.1)}`,
                '&:hover': {
                  backgroundColor: alpha('#ffffff', 0.15),
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha('#6366f1', 0.2)}`,
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box
            component={RouterLink} 
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: 14,
              background: `linear-gradient(135deg, ${alpha('#6366f1', 0.12)} 0%, ${alpha('#06b6d4', 0.08)} 100%)`,
              border: `1px solid ${alpha('#ffffff', 0.12)}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              textDecoration: 'none',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, ${alpha('#ffffff', 0.1)} 0%, transparent 100%)`,
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover': {
                transform: 'translateY(-2px) scale(1.02)',
                boxShadow: `0 12px 40px ${alpha('#6366f1', 0.3)}`,
                '&::before': {
                  opacity: 1,
                },
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)',
                backgroundClip: 'text',
                WebkitBackdropFilter: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                letterSpacing: '0.5px',
              }}
            >
              EduFlow            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {navigationItems
                .filter(item => {
                  // Hide Login/Register buttons when authenticated
                  if (isAuthenticated && (item.path === '/login' || item.path === '/register')) {
                    return false;
                  }
                  return true;
                })
                .map((item) => (                <Button
                  key={item.path}
                  color="inherit"
                  component={RouterLink}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{ 
                    borderRadius: 12,
                    padding: '8px 16px',
                    textTransform: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: location.pathname === item.path ? alpha('#6366f1', 0.15) : alpha('#ffffff', 0.03),
                    border: `1px solid ${location.pathname === item.path ? alpha('#818cf8', 0.3) : alpha('#ffffff', 0.08)}`,
                    color: location.pathname === item.path ? '#818cf8' : 'inherit',
                    fontSize: '0.875rem',
                    px: 2,
                    py: 1,
                    boxShadow: location.pathname === item.path ? `0 4px 16px ${alpha('#6366f1', 0.3)}` : 'none',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${alpha('#ffffff', 0.1)} 0%, ${alpha('#6366f1', 0.05)} 100%)`,
                      borderRadius: 'inherit',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: alpha('#ffffff', 0.08),
                      boxShadow: `0 8px 25px ${alpha('#6366f1', 0.2)}`,
                      '&::before': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}            </Box>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {isAuthenticated && user && (
            <Box sx={{ ml: 2 }}>              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                <AvatarContainer>                  <UserAvatar
                    user={user}
                    size={40}
                    sx={{ 
                      bgcolor: 'transparent',
                      color: '#818cf8',
                      fontWeight: 'bold',
                      fontSize: '0.9rem',
                      background: `linear-gradient(135deg, ${alpha('#6366f1', 0.1)} 0%, ${alpha('#06b6d4', 0.05)} 100%)`,
                      border: `1px solid ${alpha('#818cf8', 0.2)}`,
                    }}
                  />
                </AvatarContainer>
              </IconButton>
              <GlassMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ 
                  p: 2.5, 
                  borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
                  minWidth: 200,
                }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#ffffff' }}>
                    {user.name || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#ffffff', 0.7), mt: 0.5 }}>
                    {user.email || 'No email'}
                  </Typography>                  {user.user_type && (
                    <Chip
                      label={user.user_type.toUpperCase()}
                      size="small"
                      sx={{ 
                        mt: 1.5,
                        backgroundColor: alpha('#6366f1', 0.2),
                        color: '#818cf8',
                        border: `1px solid ${alpha('#818cf8', 0.3)}`,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    />
                  )}
                </Box>                <MenuItem 
                  onClick={() => { navigate('/dashboard'); handleUserMenuClose(); }}
                >
                  <DashboardIcon sx={{ mr: 1.5, color: '#06b6d4' }} />
                  Dashboard
                </MenuItem>
                <MenuItem 
                  onClick={() => { navigate('/profile'); handleUserMenuClose(); }}
                >
                  <PersonIcon sx={{ mr: 1.5, color: '#6366f1' }} />
                  Profile
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  disabled={logoutLoading || isLoading}
                >
                  <LogoutIcon sx={{ mr: 1.5, color: '#ef4444' }} />
                  {logoutLoading ? 'Logging out...' : 'Logout'}
                </MenuItem>
              </GlassMenu>
            </Box>
          )}
        </Toolbar>
      </GlassAppBar>

      <GlassDrawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </GlassDrawer>

      {/* Error Snackbar */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%',
            backgroundColor: alpha('#ef4444', 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha('#ffffff', 0.1)}`,
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Navigation;
