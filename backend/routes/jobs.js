const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Mock data for testing
const mockJobs = [
  {
    _id: '1',
    title: 'Frontend Developer',
    company: 'Tech Corp',
    location: 'Bangalore',
    applications: []
  }
];

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', (req, res) => {
  res.json({ success: true, jobs: mockJobs });
});

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
router.post('/:id/apply', protect, (req, res) => {
  // Implementation for job application
  res.json({ success: true, message: 'Application submitted' });
});

module.exports = router;