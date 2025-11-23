import React, { useState } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Typography
} from '@mui/material';
import { CameraAlt } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProfilePictureUpload = ({ onProfileUpdate, size = 72 }) => {
  const { user, token, updateUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please select a valid image file', { variant: 'warning' });
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar('Image must be smaller than 2MB', { variant: 'warning' });
      return;
    }

    setUploading(true);

    try {
      console.log('Starting profile picture upload...');
      console.log('User ID:', user?._id);
      console.log('Token exists:', !!token);
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const formData = new FormData();
      formData.append('profilePic', file);

      // Get fresh token from localStorage
      const freshToken = localStorage.getItem('token');
      console.log('Fresh token from localStorage:', freshToken ? 'Yes' : 'No');

      const response = await axios.post(
        `http://localhost:5000/api/users/${user._id}/upload-pic`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${freshToken}`
          },
          timeout: 30000, // 30 second timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.success) {
        // Update user context with new profile picture
        updateUser({ profilePic: response.data.profilePic });
        
        if (onProfileUpdate) {
          onProfileUpdate(response.data.user);
        }
        
        enqueueSnackbar('Profile picture updated successfully!', { variant: 'success' });
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      
      let errorMessage = 'Failed to upload profile picture';
      
      if (error.response) {
        // Server responded with error status
        console.error('Server response error:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // Request made but no response received
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        console.error('Error setting up request:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleEditProfile = async (data) => {
    try {
      console.log('Updating profile with data:', data);
      console.log('User ID:', user?._id);

      const freshToken = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${freshToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Profile update response:', response.data);

      if (response.data.success) {
        updateUser(response.data.user);
        enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
        return true;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Failed to update profile';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: 'error' });
      return false;
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        src={user?.profilePic ? `http://localhost:5000${user.profilePic}` : undefined}
        sx={{ 
          width: size, 
          height: size,
          border: '2px solid',
          borderColor: 'primary.main'
        }}
      >
        {user?.name?.charAt(0).toUpperCase()}
      </Avatar>
      
      <input
        accept="image/*"
        type="file"
        id="profile-pic-upload"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
        disabled={uploading}
      />
      
      <label htmlFor="profile-pic-upload">
        <IconButton
          component="span"
          size="small"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            width: 32,
            height: 32,
          }}
          disabled={uploading}
        >
          {uploading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <CameraAlt fontSize="small" />
          )}
        </IconButton>
      </label>
    </Box>
  );
};

export default ProfilePictureUpload;