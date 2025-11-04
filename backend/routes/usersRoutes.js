const express = require('express');
const router = express.Router();

// Get all users (for testing purposes - remove in production)
router.get('/', (req, res) => {
  try {
    const db = require('../config/database');
    
    db.all('SELECT id, username, email, user_type, phone, address, experience, education, skills, company, company_description, created_at FROM users', (err, rows) => {
      if (err) {
        console.error('Error fetching users:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching users from database'
        });
      }
      
      res.json({
        success: true,
        count: rows.length,
        users: rows
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const db = require('../config/database');
    const userId = req.params.id;
    
    db.get('SELECT id, username, email, user_type, phone, address, experience, education, skills, company, company_description, created_at FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching user from database'
        });
      }
      
      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.json({
        success: true,
        user: row
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

module.exports = router;