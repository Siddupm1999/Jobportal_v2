// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios interceptor to include token in all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
          console.log('Axios Request - Adding token to headers:', storedToken.substring(0, 20) + '...');
        } else {
          console.log('Axios Request - No token found');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Add response interceptor to handle token errors
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('Authentication error - logging out');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('Checking auth, stored token:', storedToken ? 'exists' : 'null');
      
      if (storedToken) {
        try {
          setToken(storedToken);
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`
            }
          });
          
          if (response.data.success) {
            console.log('Auth check successful, user:', response.data.user);
            setUser(response.data.user);
          } else {
            console.log('Auth check failed - no success flag');
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth check failed with error:', error.response?.data || error.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('No stored token found');
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        
        console.log('Login successful for user:', user.email);
        return { success: true, redirectTo: response.data.redirectTo };
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      if (response.data.success) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        setToken(token);
        setUser(user);
        
        console.log('Registration successful for user:', user.email);
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    console.log('User logged out');
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user is employer
  const isEmployer = () => {
    return user?.role === 'employer';
  };

  // Check if user is job seeker
  const isJobSeeker = () => {
    return user?.role === 'jobseeker';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    isEmployer,
    isJobSeeker,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;