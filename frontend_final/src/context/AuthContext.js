// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Base URL for API - adjust this to match your backend
  const API_BASE_URL = 'http://localhost:5000/api';

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
      console.log('Registration data:', userData);
      
      // Remove confirmPassword before sending to server
      const { confirmPassword, ...dataToSend } = userData;
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        const token = response.data.token;
        const userData = response.data.user;
        
        if (token) {
          localStorage.setItem('token', token);
        }
        if (userData) {
          setUser(userData);
        }
        return { 
          success: true, 
          user: userData,
          message: response.data.message || 'Registration successful'
        };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Registration failed' 
        };
      }
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      const message = error.response?.data?.message || 
                     error.response?.data?.error || 
                     error.message || 
                     'Registration failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login for:', email);
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email,
        password: password
      });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const token = response.data.token;
        const userData = response.data.user;
        
        if (token) {
          localStorage.setItem('token', token);
        }
        if (userData) {
          setUser(userData);
        }
        
        // Determine redirect path based on user role
        const userRole = userData?.role || 'jobseeker';
        const redirectTo = userRole === 'employer' 
          ? '/employer/dashboard' 
          : '/jobseeker/dashboard';
          
        return { 
          success: true, 
          user: userData,
          redirectTo: redirectTo,
          message: response.data.message || 'Login successful'
        };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error in AuthContext:', error);
      
      // More specific error handling
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || 
                       error.response.data?.error || 
                       `Server error: ${error.response.status}`;
        return { success: false, message };
      } else if (error.request) {
        // Request made but no response received
        return { success: false, message: 'No response from server. Please check your connection.' };
      } else {
        // Something else happened
        return { success: false, message: error.message || 'Login failed' };
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    register,
    login,
    logout,
    loading,
    API_BASE_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};