import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Badge,
  Divider,
  Chip
} from '@mui/material';
import {
  Work,
  Menu as MenuIcon,
  Notifications,
  Dashboard,
  Home,
  BusinessCenter,
  School,
  Info,
  ExitToApp,
  Person
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  // Safe user data access
  const userName = user?.name || user?.username || 'User';
  const userType = user?.user_type || 'jobseeker';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenu = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    setMobileMenuOpen(false);
    logout();
    
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 0);
  };

  const handleDashboard = () => {
    if (userType === 'employer') {
      navigate('/employer/dashboard');
    } else {
      navigate('/jobseeker/dashboard');
    }
    handleClose();
    setMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleClose();
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: <Home /> },
    { label: 'Jobs', path: '/jobs', icon: <BusinessCenter /> },
    { label: 'Career Advice', path: '/blog', icon: <School /> },
    { label: 'About Us', path: '/about', icon: <Info /> },
  ];

  const notifications = [
    { id: 1, text: 'New job matches your profile', time: '5 min ago', read: false },
    { id: 2, text: 'Application status updated', time: '1 hour ago', read: false },
    { id: 3, text: 'Profile viewed by recruiter', time: '2 hours ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  // Show loading state or nothing while auth initializes
  if (loading) {
    return (
      <AppBar position="sticky" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Work sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">JobPortal</Typography>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  const mobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{
        sx: {
          width: 280,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Work sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2563eb, #4f46e5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}
          >
            JobPortal
          </Typography>
        </Box>

        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.label} 
              button 
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: isActivePath(item.path) ? 'primary.light' : 'transparent',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon sx={{ color: isActivePath(item.path) ? 'primary.main' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: isActivePath(item.path) ? 600 : 400,
                  color: isActivePath(item.path) ? 'primary.main' : 'text.primary'
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {user ? (
          <List>
            <ListItem 
              button 
              onClick={handleDashboard}
              sx={{
                borderRadius: 2,
                mb: 1,
                '&:hover': {
                  backgroundColor: 'secondary.light',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon>
                <Dashboard />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
            <ListItem 
              button 
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'error.light',
                  transform: 'translateX(4px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText 
                primary="Logout"
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItem>
          </List>
        ) : (
          <Box sx={{ p: 1 }}>
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={() => handleNavigation('/login')}
              sx={{ mb: 1, borderRadius: 2, fontWeight: 600 }}
            >
              Login
            </Button>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => handleNavigation('/register')}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={1} 
      sx={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary'
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
        {/* Logo */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1,
            cursor: 'pointer'
          }}
          onClick={() => handleNavigation('/')}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <Work sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Typography 
            variant="h5" 
            component="div"
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #3730a3 50%, #4338ca 75%, #6366f1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            JobPortal
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {menuItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                onClick={() => handleNavigation(item.path)}
                startIcon={item.icon}
                sx={{ 
                  fontWeight: isActivePath(item.path) ? 700 : 500,
                  borderRadius: 3,
                  px: 2,
                  py: 1,
                  color: isActivePath(item.path) ? 'primary.main' : 'text.primary',
                  backgroundColor: isActivePath(item.path) ? 'primary.50' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'primary.100',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)'
                  },
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  '&::after': isActivePath(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '3px',
                    backgroundColor: 'primary.main',
                    borderRadius: 2
                  } : {}
                }}
              >
                {item.label}
              </Button>
            ))}

            {user ? (
              <>
                {/* Notifications */}
                <IconButton 
                  color="inherit" 
                  onClick={handleNotificationMenu}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Badge badgeContent={unreadCount} color="error" variant="dot">
                    <Notifications />
                  </Badge>
                </IconButton>

                <Menu
                  anchorEl={notificationAnchorEl}
                  open={Boolean(notificationAnchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      width: 320,
                      borderRadius: 3,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Notifications
                    </Typography>
                    {notifications.map((notification) => (
                      <MenuItem 
                        key={notification.id}
                        sx={{ 
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: notification.read ? 'transparent' : 'primary.50'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {notification.text}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notification.time}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Box>
                </Menu>

                {/* User Menu */}
                <IconButton 
                  color="inherit" 
                  onClick={handleMenu}
                  sx={{
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    {userInitial}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      width: 200,
                      borderRadius: 3,
                      boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ p: 1 }}>
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                          mx: 'auto',
                          mb: 1,
                          fontWeight: 600
                        }}
                      >
                        {userInitial}
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {userName}
                      </Typography>
                      <Chip 
                        label={userType} 
                        size="small" 
                        color={userType === 'employer' ? 'primary' : 'secondary'}
                        sx={{ mt: 1, textTransform: 'capitalize' }}
                      />
                    </Box>
                    
                    <Divider />
                    
                    <MenuItem 
                      onClick={handleDashboard}
                      sx={{ borderRadius: 2, my: 0.5 }}
                    >
                      <Dashboard sx={{ mr: 2, fontSize: 20 }} />
                      Dashboard
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ borderRadius: 2, my: 0.5, color: 'error.main' }}
                    >
                      <ExitToApp sx={{ mr: 2, fontSize: 20 }} />
                      Logout
                    </MenuItem>
                  </Box>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => handleNavigation('/login')}
                  startIcon={<Person />}
                  sx={{ 
                    fontWeight: 600,
                    borderRadius: 3,
                    px: 3,
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => handleNavigation('/register')}
                  sx={{ 
                    borderRadius: 3,
                    px: 3,
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1d4ed8, #4338ca)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            color="inherit"
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'primary.50',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {mobileMenu}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;