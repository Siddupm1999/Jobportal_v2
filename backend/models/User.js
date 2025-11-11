// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['jobseeker', 'employer'], default: 'jobseeker' },
  isVerified: { type: Boolean, default: false },
  profileCompletion: { type: Number, default: 0 },
  lastLogin: Date,
  profile: {
    resumeHeadline: String,
    keySkills: [String],
    employment: [{
      jobTitle: String,
      company: String,
      employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'] },
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean,
      noticePeriod: String,
      description: String,
      skills: [String]
    }],
    education: [{
      degree: String,
      institution: String,
      location: String,
      startYear: Number,
      endYear: Number,
      currentlyStudying: Boolean,
      description: String
    }],
    itSkills: [{
      skill: String,
      version: String,
      lastUsed: Number,
      experience: String
    }],
    projects: [{
      title: String,
      client: String,
      status: { type: String, enum: ['In Progress', 'Finished'] },
      startDate: Date,
      endDate: Date,
      description: String,
      skills: [String]
    }],
    profileSummary: String,
    accomplishments: {
      onlineProfiles: [{
        platform: String,
        url: String,
        description: String
      }]
    },
    careerProfile: {
      currentIndustry: String,
      department: String,
      roleCategory: String,
      jobRole: String,
      desiredJobType: [String],
      desiredEmploymentType: String,
      preferredShift: String,
      expectedSalary: Number,
      preferredWorkLocation: [String]
    },
    personalDetails: {
      gender: String,
      maritalStatus: String,
      dateOfBirth: Date,
      address: String,
      pincode: String,
      category: String,
      workPermit: [String],
      permanentAddress: String,
      hometown: String,
      languages: [{
        language: String,
        proficiency: String,
        read: Boolean,
        write: Boolean,
        speak: Boolean
      }]
    },
    resume: {
      filename: String,
      originalName: String,
      uploadDate: { type: Date, default: Date.now }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function() {
  const profile = this.profile;
  let completedFields = 0;
  const totalFields = 12;

  if (profile.resumeHeadline) completedFields++;
  if (profile.keySkills && profile.keySkills.length > 0) completedFields++;
  if (profile.employment && profile.employment.length > 0) completedFields++;
  if (profile.education && profile.education.length > 0) completedFields++;
  if (profile.itSkills && profile.itSkills.length > 0) completedFields++;
  if (profile.projects && profile.projects.length > 0) completedFields++;
  if (profile.profileSummary) completedFields++;
  if (profile.accomplishments && profile.accomplishments.onlineProfiles.length > 0) completedFields++;
  if (profile.careerProfile && profile.careerProfile.jobRole) completedFields++;
  if (profile.personalDetails && profile.personalDetails.gender) completedFields++;
  if (profile.personalDetails && profile.personalDetails.languages.length > 0) completedFields++;
  if (profile.resume && profile.resume.filename) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);