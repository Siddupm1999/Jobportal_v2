import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Typography
} from '@mui/material';
import {
  Close,
  Visibility,
  VisibilityOff,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { token, user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleClickShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
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

    if (formData.currentPassword === formData.newPassword) {
      setError('New password must be different from current password');
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
      const userToken = token || 
                       localStorage.getItem('userToken') || 
                       localStorage.getItem('token') ||
                       sessionStorage.getItem('userToken') ||
                       sessionStorage.getItem('token');

      console.log('Token being used:', userToken ? 'Token found' : 'No token found');
      
      if (!userToken) {
        setError('You must be logged in to change your password. Please log in again.');
        setLoading(false);
        return;
      }

      // Use relative URL - proxy will handle redirecting to backend
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      console.log('Response status:', response.status);

      let result;
      try {
        const responseText = await response.text();
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        setSuccess('Password updated successfully!');
        setTimeout(() => {
          setFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          onClose();
        }, 2000);
      } else {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (response.status === 400) {
          setError(result.message || 'Current password is incorrect');
        } else if (response.status === 404) {
          setError('Endpoint not found. Please check backend server.');
        } else {
          setError(result.message || `Failed to update password (Error ${response.status})`);
        }
      }
    } catch (err) {
      console.error('Password change error:', err);
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError('Cannot connect to server. Make sure your backend is running on port 5000.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
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
          p: 1
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Change Password
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
            label="Current Password"
            name="currentPassword"
            type={showPassword.current ? 'text' : 'password'}
            value={formData.currentPassword}
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
                    aria-label="toggle current password visibility"
                    onClick={() => handleClickShowPassword('current')}
                    edge="end"
                  >
                    {showPassword.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
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
              }
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="Re-Enter New Password"
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
              }
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
            fontWeight: 600
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
            px: 3
          }}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordModal;