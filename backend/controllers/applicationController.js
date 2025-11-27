const mongoose = require('mongoose');
const Job = require('../models/Job');

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private (Employer - job owner)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;

    console.log('Updating application status:', applicationId, 'to:', status);

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, accepted, or rejected'
      });
    }

    // Find the job that contains this application
    const job = await Job.findOne({
      'applications._id': applicationId
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the job owner
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update the application status
    const application = job.applications.id(applicationId);
    application.status = status;

    await job.save();

    // Populate applicant details for response
    await job.populate('applications.applicant', 'name email profile');

    console.log('Application status updated successfully');

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application: job.applications.id(applicationId)
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating application',
      error: error.message
    });
  }
};

// @desc    Get applications for employer's jobs
// @route   GET /api/applications/employer
// @access  Private (Employer)
const getEmployerApplications = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id })
      .populate('applications.applicant', 'name email profile')
      .select('title applications employer');

    // Flatten applications with job information
    const allApplications = jobs.flatMap(job =>
      job.applications.map(app => ({
        ...app.toObject(),
        jobTitle: job.title,
        jobId: job._id
      }))
    );

    console.log('Found applications for employer:', allApplications.length);

    res.json({
      success: true,
      applications: allApplications,
      total: allApplications.length
    });
  } catch (error) {
    console.error('Get employer applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching applications',
      error: error.message
    });
  }
};

module.exports = {
  updateApplicationStatus,
  getEmployerApplications
};