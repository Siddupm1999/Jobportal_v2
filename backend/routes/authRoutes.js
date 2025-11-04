const express = require('express');
const { login, register } = require('../controllers/authController');
const router = express.Router();

// @route   POST /api/auth/login
// @desc    User login
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/register
// @desc    User registration
// @access  Public
router.post('/register', register);
//router.post('/change-password', protect, changePassword);
module.exports = router;