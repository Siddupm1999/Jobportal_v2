// src/pages/Register.js
import React, { useState, useCallback } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert, Link,
  FormControl, Select, MenuItem, InputAdornment, Fade, IconButton,
  useTheme, useMediaQuery
} from '@mui/material';
import {
  Person, Email, Lock, Business, Visibility, VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'jobseeker'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let msg = '';
    if (name === 'name' && !value.trim()) msg = 'Full name is required';
    if (name === 'email' && (!value || !emailRegex.test(value))) msg = 'Valid email required';
    if (name === 'password' && value.length < 6) msg = 'Password must be at least 6 characters';
    setFieldErrors(prev => ({ ...prev, [name]: msg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { name, email, password } = formData;
    if (!name.trim() || !email || !password || password.length < 6) {
      setFieldErrors({
        name: !name.trim() ? 'Full name is required' : '',
        email: !email ? 'Email is required' : '',
        password: password.length < 6 ? 'Password must be at least 6 characters' : ''
      });
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      if (result?.success) {
        navigate('/login', { state: { message: 'Registration successful! Please login.', email } });
      } else {
        setError(result?.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => (
    formData.name && formData.email && formData.password.length >= 6 && !Object.values(fieldErrors).some(Boolean)
  );

  const getTextFieldProps = (name, type = 'text', Icon) => ({
    fullWidth: true,
    size: 'small',
    name,
    type: type === 'password' ? (showPassword ? 'text' : 'password') : type,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: !!fieldErrors[name],
    helperText: fieldErrors[name],
    InputProps: {
      startAdornment: (
        <InputAdornment position="start">
          <Icon sx={{ fontSize: 18, color: 'primary.main' }} />
        </InputAdornment>
      ),
      ...(type === 'password' && {
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}
            </IconButton>
          </InputAdornment>
        )
      }),
    },
    sx: {
      '& .MuiOutlinedInput-root': { borderRadius: 1.5, minHeight: 42 },
      '& .MuiInputBase-input': { fontSize: '0.9rem', padding: '10px 0' },
      '& .MuiFormHelperText-root': { fontSize: '0.75rem', mt: 0.5 },
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Fade in timeout={500}>
        <Paper
          elevation={isMobile ? 1 : 3}
          sx={{
            p: 4,
            borderRadius: 2,
            width: '100%',
            maxWidth: 420, // Reused consistent card size
            mx: 'auto'
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{
              width: 50, height: 50, borderRadius: '50%',
              bgcolor: 'primary.main', display: 'flex', alignItems: 'center',
              justifyContent: 'center', mx: 'auto', mb: 2
            }}>
              <Person sx={{ fontSize: 26, color: '#fff' }} />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Create Account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Role */}
            <Typography sx={{ mb: 0.5, fontWeight: 500 }}>Account Type *</Typography>
            <FormControl fullWidth size="small">
              <Select name="role" value={formData.role} onChange={handleChange} sx={{ borderRadius: 1.5 }}>
                <MenuItem value="jobseeker">
                  <Person sx={{ fontSize: 18, mr: 1 }} /> Job Seeker
                </MenuItem>
                <MenuItem value="employer">
                  <Business sx={{ fontSize: 18, mr: 1 }} /> Employer
                </MenuItem>
              </Select>
            </FormControl>

            {/* Fields one by one */}
            <Typography sx={{ mb: 0.5, fontWeight: 500 }}>Full Name *</Typography>
            <TextField {...getTextFieldProps('name', 'text', Person)} />

            <Typography sx={{ mb: 0.5, fontWeight: 500 }}>Email Address *</Typography>
            <TextField {...getTextFieldProps('email', 'email', Email)} />

            <Typography sx={{ mb: 0.5, fontWeight: 500 }}>Password *</Typography>
            <TextField
              {...getTextFieldProps('password', 'password', Lock)}
              helperText={fieldErrors.password || 'Min. 6 characters'}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !isFormValid()}
              sx={{
                py: 1,
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                mb: 2
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Typography variant="body2" align="center" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default Register;
