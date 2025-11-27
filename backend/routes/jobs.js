const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getEmployerJobs
} = require('../controllers/jobController');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get('/', getJobs);

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', getJob);

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer)
router.post('/', protect, createJob);

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer - job owner)
router.put('/:id', protect, updateJob);

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer - job owner)
router.delete('/:id', protect, deleteJob);

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
router.get('/employer/my-jobs', protect, getEmployerJobs);

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
router.post('/:id/apply', protect, (req, res) => {
  // Implementation for job application
  res.json({ success: true, message: 'Application submitted' });
});

module.exports = router;