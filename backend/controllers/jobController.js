// controllers/jobController.js
const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate('employer', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name email company');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private (Employer)
const createJob = async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      salary,
      jobType,
      experience,
      skills
    } = req.body;

    const job = await Job.create({
      title,
      location,
      description,
      salary,
      jobType,
      experience,
      skills: skills || [],
      employer: req.user.id,
      company: req.user.profile?.company || req.user.name
    });

    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer - job owner)
const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer - job owner)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job
    if (job.employer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/my-jobs
// @access  Private (Employer)
const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.id })
      .populate('applications')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error('Get employer jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getEmployerJobs
};