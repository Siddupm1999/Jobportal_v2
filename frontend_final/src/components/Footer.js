import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  TextField,
  Button,
  InputAdornment
} from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  Email,
  Phone,
  LocationOn,
  Send,
  Work,
  Apple,
  Android
} from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#1a237e',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Main Footer Content */}
        <Grid container spacing={6} sx={{ py: 8 }}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
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
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 25%, #4338ca 50%, #6366f1 75%, #818cf8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent'
                }}
              >
                JobPortal
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, opacity: 0.9 }}>
              Connecting exceptional talent with amazing opportunities. Your career journey starts here with thousands of jobs from top companies.
            </Typography>
            
            {/* Contact Info - Horizontal Layout */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Email sx={{ fontSize: 20, mr: 1, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                      Siddu@jobportal.com
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Phone sx={{ fontSize: 20, mr: 1, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                      +1 (555) 123-4567
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ fontSize: 20, mr: 1, opacity: 0.8 }} />
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                      123 Business Ave
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Social Links */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Follow Us
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[
                  { icon: <Facebook />, color: '#1877F2' },
                  { icon: <Twitter />, color: '#1DA1F2' },
                  { icon: <LinkedIn />, color: '#0A66C2' },
                  { icon: <Instagram />, color: '#E4405F' }
                ].map((social, index) => (
                  <IconButton
                    key={index}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      borderRadius: 2,
                      '&:hover': {
                        backgroundColor: social.color,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${social.color}40`
                      },
                      transition: 'all 0.3s ease-in-out'
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, position: 'relative' }}>
              Job Seekers
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: -8, 
                  left: 0, 
                  width: '30px', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, #60a5fa, transparent)',
                  borderRadius: 2
                }} 
              />
            </Typography>
            {[
              'Browse Jobs',
              'Career Advice',
              'Resume Builder',
              'Skill Assessment',
              'Create Profile'
            ].map((item, index) => (
              <Link
                key={index}
                href="#"
                color="inherit"
                underline="none"
                sx={{
                  display: 'block',
                  mb: 2,
                  opacity: 0.8,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    opacity: 1,
                    transform: 'translateX(8px)',
                    color: '#60a5fa'
                  }
                }}
              >
                {item}
              </Link>
            ))}
          </Grid>

          {/* Employers */}
          <Grid item xs={12} md={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, position: 'relative' }}>
              Employers
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: -8, 
                  left: 0, 
                  width: '30px', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, #a78bfa, transparent)',
                  borderRadius: 2
                }} 
              />
            </Typography>
            {[
              'Post a Job',
              'Browse Candidates',
              'Employer Dashboard',
              'Hiring Solutions',
              'Pricing Plans'
            ].map((item, index) => (
              <Link
                key={index}
                href="#"
                color="inherit"
                underline="none"
                sx={{
                  display: 'block',
                  mb: 2,
                  opacity: 0.8,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    opacity: 1,
                    transform: 'translateX(8px)',
                    color: '#a78bfa'
                  }
                }}
              >
                {item}
              </Link>
            ))}
          </Grid>

          {/* Newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, position: 'relative' }}>
              Stay Updated
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: -8, 
                  left: 0, 
                  width: '30px', 
                  height: '3px', 
                  background: 'linear-gradient(90deg, #34d399, transparent)',
                  borderRadius: 2
                }} 
              />
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
              Subscribe to our newsletter and get the latest job alerts and career tips delivered to your inbox.
            </Typography>
            
            <Box component="form" sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Enter your email"
                variant="outlined"
                size="small"
                InputProps={{
                  sx: {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#60a5fa',
                    }
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          minWidth: 'auto',
                          //px: 2,
                          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                          borderRadius: 2,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(96, 165, 250, 0.4)'
                          },
                          transition: 'all 0.3s ease-in-out'
                        }}
                      >
                        <Send sx={{ fontSize: 20 }} />
                      </Button>
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    paddingRight: '80px',
                  }
                }}
              />
            </Box>

            {/* App Download */}
            <Box>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600, opacity: 0.9 }}>
                Download Our App
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    p: 1.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Apple sx={{ fontSize: 24 }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, lineHeight: 1 }}>
                      Download on the
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      App Store
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    p: 1.5,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Android sx={{ fontSize: 24 }} />
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, lineHeight: 1 }}>
                      Get it on
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      Google Play
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Bar */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            py: 3
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                © {new Date().getFullYear()} JobPortal. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { md: 'flex-end' }, gap: 3 }}>
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Disclaimer'].map((item, index) => (
                  <Link
                    key={index}
                    href="#"
                    color="inherit"
                    underline="none"
                    sx={{
                      fontSize: '0.875rem',
                      opacity: 0.7,
                      transition: 'opacity 0.2s ease-in-out',
                      '&:hover': {
                        opacity: 1,
                        color: '#60a5fa'
                      }
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Add CSS animation for shimmer effect */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </Box>
  );
};

export default Footer;