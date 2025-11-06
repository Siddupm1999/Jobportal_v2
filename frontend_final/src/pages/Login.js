// src/components/Login.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
  Fade,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Person,
  Google,
  Facebook,
  LinkedIn,
  Close,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Forgot Password Modal Component
const ForgotPasswordModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { API_BASE_URL } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleClickShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.newPassword || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!validateForm()) return;

  setLoading(true);

  try {
    // Use the correct endpoint for forgot password
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        newPassword: formData.newPassword,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setSuccess('Password reset successfully!');
      setTimeout(() => {
        setFormData({
          email: '',
          newPassword: '',
          confirmPassword: '',
        });
        onClose();
      }, 2000);
    } else {
      setError(result.message || 'Failed to reset password');
    }
  } catch (err) {
    setError('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setFormData({
      email: '',
      newPassword: '',
      confirmPassword: '',
    });
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Reset Password
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            size="small"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ fontSize: 20, color: 'primary.main' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="New Password"
            name="newPassword"
            type={showPassword.new ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange}
            margin="normal"
            required
            helperText="Password must be at least 6 characters long"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ fontSize: 20, color: 'primary.main' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="toggle new password visibility"
                    onClick={() => handleClickShowPassword('new')}
                    edge="end"
                  >
                    {showPassword.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="Confirm New Password"
            name="confirmPassword"
            type={showPassword.confirm ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock sx={{ fontSize: 20, color: 'primary.main' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="toggle confirm password visibility"
                    onClick={() => handleClickShowPassword('confirm')}
                    edge="end"
                  >
                    {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Login Component
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Load saved credentials if "Remember Me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: savedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };

    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        } else {
          delete errors.password;
        }
        break;

      default:
        break;
    }

    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (name !== 'rememberMe') {
      validateField(name, fieldValue);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.password.length >= 6 &&
      Object.keys(fieldErrors).length === 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation
    const errors = {};
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email });

      // Handle "Remember Me" functionality
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);

      if (result && result.success) {
        // Redirect to the appropriate dashboard based on user type
        const dashboardPath = result.redirectTo || '/jobseeker/dashboard';
        console.log('Redirecting to:', dashboardPath);
        navigate(dashboardPath, { replace: true });
      } else {
        setError(
          result?.message || 'Invalid email or password. Please try again.'
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.message || 'An error occurred during login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    setError(`${provider} login is not yet implemented`);
  };

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={true} timeout={600}>
          <Paper
            elevation={6}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              background: 'white',
              border: '1px solid',
              borderColor: 'divider',
              width: '100%',
              maxWidth: 400,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            {/* Compact Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Person sx={{ fontSize: 24, color: 'white' }} />
              </Box>
              <Typography
                variant="h5"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                }}
              >
                Welcome Back!
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.875rem' }}
              >
                Sign in to your account.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  py: 1,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Compact Login Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                margin="normal"
                required
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ fontSize: 20, color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.75rem',
                    margin: 0,
                    mt: 0.5,
                  },
                }}
              />

              <TextField
                fullWidth
                size="small"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ fontSize: 20, color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: '0.875rem',
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: '0.875rem',
                  },
                  '& .MuiFormHelperText-root': {
                    fontSize: '0.75rem',
                    margin: 0,
                    mt: 0.5,
                  },
                }}
              />

              {/* Remember Me & Forgot Password */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 1,
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      size="small"
                      sx={{ py: 0 }}
                    />
                  }
                  label={
                    <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                      Remember me
                    </Typography>
                  }
                />
                <Link
                  component="button"
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  sx={{
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* Compact Login Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="medium"
                disabled={loading || !isFormValid()}
                sx={{
                  py: 1,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  background: isFormValid()
                    ? 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)'
                    : 'grey.400',
                  boxShadow: isFormValid()
                    ? '0 2px 8px rgba(30, 58, 138, 0.3)'
                    : 'none',
                  '&:hover':
                    isFormValid() && !loading
                      ? {
                          background:
                            'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(30, 58, 138, 0.4)',
                        }
                      : {},
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    Signing In...
                  </Box>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            {/* Compact Divider */}
            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Divider sx={{ flex: 1 }} />
              <Typography
                variant="caption"
                sx={{ px: 1.5, color: 'text.secondary' }}
              >
                Or continue with
              </Typography>
              <Divider sx={{ flex: 1 }} />
            </Box>

            {/* Compact Social Logins */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={5}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleSocialLogin('google')}
                  sx={{
                    py: 0.76,
                    borderRadius: 2,
                    borderColor: 'grey.300',
                    minWidth: 'auto',
                    '&:hover': {
                      borderColor: '#c03124ff',
                      backgroundColor: 'rgba(219, 68, 55, 0.04)',
                    },
                  }}
                >
                  <Google sx={{ fontSize: 20, color: '#DB4437' }} />
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleSocialLogin('facebook')}
                  sx={{
                    py: 0.75,
                    borderRadius: 2,
                    borderColor: 'grey.300',
                    minWidth: 'auto',
                    '&:hover': {
                      borderColor: '#1877F2',
                      backgroundColor: 'rgba(24, 119, 242, 0.04)',
                    },
                  }}
                >
                  <Facebook sx={{ fontSize: 20, color: '#1877F2' }} />
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => handleSocialLogin('linkedin')}
                  sx={{
                    py: 0.75,
                    borderRadius: 2,
                    borderColor: 'grey.300',
                    minWidth: 'auto',
                    '&:hover': {
                      borderColor: '#0A66C2',
                      backgroundColor: 'rgba(10, 102, 194, 0.04)',
                    },
                  }}
                >
                  <LinkedIn sx={{ fontSize: 20, color: '#0A66C2' }} />
                </Button>
              </Grid>
            </Grid>

            {/* Compact Sign Up Link */}
            <Box sx={{ textAlign: 'center', pt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    fontWeight: 600,
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontSize: '0.8rem',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>

        {/* CSS for spinner animation */}
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Container>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        open={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </>
  );
};

export default Login;