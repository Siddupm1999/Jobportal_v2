// src/pages/Register.js
import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert, Link,
  FormControl, Select, MenuItem, Grid, InputAdornment, Fade, IconButton
} from '@mui/material';
import {
  Person, Email, Lock, Business, Phone, LocationOn, Work, School,
  Code, Description, Visibility, VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'jobseeker',
    profile: { phone: '', address: '', experience: '', education: '', skills: '', company: '', companyDescription: '' }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-()]+$/;

    const validations = {
      name: () => !value.trim() ? 'Full name is required' : value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      email: () => !value ? 'Email is required' : !emailRegex.test(value) ? 'Please enter a valid email' : null,
      password: () => !value ? 'Password is required' : value.length < 6 ? 'Password must be at least 6 characters' : null,
      confirmPassword: () => !value ? 'Please confirm password' : value !== formData.password ? 'Passwords do not match' : null,
      phone: () => value && !phoneRegex.test(value) ? 'Please enter a valid phone number' : null
    };

    const errorMsg = validations[name]?.();
    if (errorMsg) errors[name] = errorMsg;
    else delete errors[name];
    
    setFieldErrors(errors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        profile: { ...prev.profile, [profileField]: value }
      }));
      validateField(profileField, value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm password';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      if (result?.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login.', email: formData.email } });
      } else {
        setError(result?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => formData.name && formData.email && formData.password && 
    formData.confirmPassword && formData.password === formData.confirmPassword && 
    formData.password.length >= 6 && Object.keys(fieldErrors).length === 0;

  // Common text field props with colored icons
  const textFieldProps = (name, label, type = 'text', startIcon) => ({
    fullWidth: true,
    size: 'small',
    placeholder: `Enter your ${label.toLowerCase()}`,
    name,
    type,
    value: formData[name] || (name.startsWith('profile.') ? formData.profile[name.split('.')[1]] : ''),
    onChange: handleChange,
    error: !!fieldErrors[name.split('.')[1] || fieldErrors[name]],
    helperText: fieldErrors[name.split('.')[1] || fieldErrors[name]],
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          {React.cloneElement(startIcon, { sx: { color: 'primary.main' } })}
        </InputAdornment>
      ),
      ...(type === 'password' && {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton 
              size="small" 
              onClick={() => name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
              sx={{ color: 'text.secondary' }}
            >
              {(name === 'password' ? showPassword : showConfirmPassword) ? 
                <VisibilityOff sx={{ color: 'primary.main' }} /> : 
                <Visibility sx={{ color: 'primary.main' }} />
              }
            </IconButton>
          </InputAdornment>
        )
      })
    },
    sx: {
      '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' },
      '& .MuiFormHelperText-root': { fontSize: '0.75rem', margin: 0, mt: 0.5 }
    }
  });

  const FieldWrapper = ({ children, label, required = false }) => (
    <Box>
      <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.primary' }}>
        {label} {required && <Box component="span" sx={{ color: 'error.main' }}>*</Box>}
      </Typography>
      {children}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Fade in={true} timeout={600}>
        <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3, width: '100%', maxWidth: 800 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mx: 'auto', 
              mb: 2 
            }}>
              <Person sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Create Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join our community of professionals and employers
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <FieldWrapper label="Account Type" required>
              <FormControl fullWidth size="small">
                <Select name="role" value={formData.role} onChange={handleChange} required>
                  <MenuItem value="jobseeker">
                    <Person sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                    Job Seeker
                  </MenuItem>
                  <MenuItem value="employer">
                    <Business sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                    Employer
                  </MenuItem>
                </Select>
              </FormControl>
            </FieldWrapper>

            {/* Basic Information */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FieldWrapper label="Full Name" required>
                  <TextField {...textFieldProps('name', 'full name', 'text', <Person />)} />
                </FieldWrapper>
              </Grid>
              <Grid item xs={12} md={6}>
                <FieldWrapper label="Email Address" required>
                  <TextField {...textFieldProps('email', 'email address', 'email', <Email />)} />
                </FieldWrapper>
              </Grid>
            </Grid>

            {/* Password Fields */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <FieldWrapper label="Password" required>
                  <TextField 
                    {...textFieldProps('password', 'password', showPassword ? 'text' : 'password', <Lock />)} 
                    helperText={fieldErrors.password || 'Minimum 6 characters'} 
                  />
                </FieldWrapper>
              </Grid>
              <Grid item xs={12} md={6}>
                <FieldWrapper label="Confirm Password" required>
                  <TextField 
                    {...textFieldProps('confirmPassword', 'confirm password', showConfirmPassword ? 'text' : 'password', <Lock />)} 
                  />
                </FieldWrapper>
              </Grid>
            </Grid>

            {/* Dynamic Fields based on Role */}
            {formData.role === 'jobseeker' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Professional Information
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { field: 'profile.phone', label: 'Phone Number', icon: <Phone /> },
                    { field: 'profile.address', label: 'Location', icon: <LocationOn /> },
                    { field: 'profile.experience', label: 'Experience', icon: <Work /> },
                    { field: 'profile.education', label: 'Education', icon: <School /> }
                  ].map((item, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <FieldWrapper label={item.label}>
                        <TextField {...textFieldProps(item.field, item.label.toLowerCase(), 'text', item.icon)} />
                      </FieldWrapper>
                    </Grid>
                  ))}
                  <Grid item xs={12}>
                    <FieldWrapper label="Skills & Technologies">
                      <TextField 
                        {...textFieldProps('profile.skills', 'skills', 'text', <Code />)} 
                        helperText="Separate skills with commas" 
                      />
                    </FieldWrapper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {formData.role === 'employer' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                  Company Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FieldWrapper label="Company Name">
                      <TextField {...textFieldProps('profile.company', 'company name', 'text', <Business />)} />
                    </FieldWrapper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FieldWrapper label="Industry">
                      <TextField {...textFieldProps('profile.experience', 'industry', 'text', <Work />)} />
                    </FieldWrapper>
                  </Grid>
                  <Grid item xs={12}>
                    <FieldWrapper label="Company Description">
                      <TextField 
                        {...textFieldProps('profile.companyDescription', 'company description', 'text', <Description />)} 
                        multiline 
                        rows={3} 
                      />
                    </FieldWrapper>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Register Button */}
            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large" 
              disabled={loading || !isFormValid()} 
              sx={{ 
                mt: 2, 
                mb: 3, 
                py: 1.5, 
                borderRadius: 2, 
                fontWeight: 600, 
                textTransform: 'none', 
                background: isFormValid() ? 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)' : 'grey.400',
                '&:hover': isFormValid() && !loading ? {
                  background: 'linear-gradient(135deg, #1e40af 0%, #4f46e5 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(30, 58, 138, 0.4)'
                } : {},
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} 
                  />
                  Creating Your Account...
                </Box>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/login" 
                  sx={{ 
                    fontWeight: 600, 
                    textDecoration: 'none', 
                    color: 'primary.main',
                    '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>

      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default Register;