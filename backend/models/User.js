const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['jobseeker', 'employer'], default: 'jobseeker' },
    isVerified: { type: Boolean, default: false },
    profileCompletion: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },

    profile: {
      resumeHeadline: { type: String, trim: true },
      keySkills: [String],

      employment: [
        {
          jobTitle: String,
          company: String,
          employmentType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
          },
          startDate: Date,
          endDate: Date,
          currentlyWorking: Boolean,
          noticePeriod: String,
          description: String,
          skills: [String]
        }
      ],

      education: [
        {
          degree: String,
          institution: String,
          location: String,
          startYear: Number,
          endYear: Number,
          currentlyStudying: Boolean,
          description: String
        }
      ],

      itSkills: [
        {
          skill: String,
          version: String,
          lastUsed: Number,
          experience: String
        }
      ],

      projects: [
        {
          title: String,
          client: String,
          status: { type: String, enum: ['In Progress', 'Finished'] },
          startDate: Date,
          endDate: Date,
          description: String,
          skills: [String]
        }
      ],

      profileSummary: String,

      accomplishments: {
        onlineProfiles: [
          {
            platform: String,
            url: String,
            description: String
          }
        ]
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
        languages: [
          {
            language: String,
            proficiency: String,
            read: Boolean,
            write: Boolean,
            speak: Boolean
          }
        ]
      },

      resume: {
        filename: String,
        originalName: String,
        uploadDate: { type: Date, default: Date.now }
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Compare password helper
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Export model
module.exports = mongoose.model('User', userSchema);
