const express = require('express');
const router = express.Router();
const {
  updateApplicationStatus,
  getEmployerApplications
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.put('/:id', protect, updateApplicationStatus);
router.get('/employer', protect, getEmployerApplications);

module.exports = router;