const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  coverLetter: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  salary: {
    min: {
      type: Number,
      required: [true, 'Minimum salary is required']
    },
    max: {
      type: Number,
      required: [true, 'Maximum salary is required']
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  experience: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level'],
    default: 'Entry Level'
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applications: [applicationSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
jobSchema.index({ employer: 1, createdAt: -1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ location: 1 });

module.exports = mongoose.model('Job', jobSchema);