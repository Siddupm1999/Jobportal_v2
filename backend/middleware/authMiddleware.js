const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  console.log('Auth Headers:', req.headers.authorization);
  console.log('Request Path:', req.path);
  console.log('Request Method:', req.method);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token received:', token ? 'Yes' : 'No');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      console.log('Decoded token:', decoded);
      
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('User not found in database');
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      console.log('User authenticated:', req.user.email);
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  } else {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }
};

// Optional: Middleware to check if user owns the resource
const authorizeUser = (req, res, next) => {
  if (req.user && (req.user._id.toString() === req.params.id || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  }
};

module.exports = { protect, authorizeUser };