const express = require('express');
const router = express.Router();
const {
  updateApplicationStatus,
  getEmployerApplications
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer - job owner)
router.put('/:id', protect, updateApplicationStatus);

// @desc    Get applications for employer's jobs
// @route   GET /api/applications/employer
// @access  Private (Employer)
router.get('/employer', protect, getEmployerApplications);

module.exports = router;