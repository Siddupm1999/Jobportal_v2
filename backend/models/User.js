const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employmentSchema = new mongoose.Schema({
  isCurrent: { type: Boolean, default: true },
  employmentType: { type: String, enum: ['Full-time', 'Internship'], required: true },
  totalExperience: { type: String, required: true },
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  joiningDate: { type: Date, required: true },
  currentSalary: { type: Number, required: true },
  skillsUsed: [String],
  jobProfile: { type: String, maxlength: 4000 },
  noticePeriod: { type: String, required: true }
}, { timestamps: true });

const educationSchema = new mongoose.Schema({
  education: { type: String, required: true },
  institute: { type: String, required: true },
  course: { type: String, required: true },
  specialization: { type: String, required: true },
  courseType: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  grading: { type: String, required: true }
}, { timestamps: true });

const itSkillSchema = new mongoose.Schema({
  skillName: { type: String, required: true },
  version: { type: String, required: true },
  lastUsed: { type: String, required: true },
  expYears: { type: Number, required: true },
  expMonths: { type: Number, required: true }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tagWith: { type: String },
  client: { type: String, required: true },
  status: { type: String, enum: ['In progress', 'Finished'], required: true },
  workedYear: { type: Number, required: true },
  workedMonth: { type: Number, required: true },
  details: { type: String, maxlength: 1000, required: true },
  location: { type: String },
  site: { type: String, required: true },
  employmentNature: { type: String, required: true },
  teamSize: { type: String },
  role: { type: String },
  roleDescription: { type: String, maxlength: 250 },
  skillsUsed: { type: String, maxlength: 500 }
}, { timestamps: true });

const accomplishmentSchema = new mongoose.Schema({
  accomplishmentType: { type: String, required: true },
  title: { type: String, required: true },
  associatedWith: { type: String },
  date: { type: String },
  description: { type: String, maxlength: 1000 }
}, { timestamps: true });

const certificationSchema = new mongoose.Schema({
  certificationName: { type: String, required: true },
  completionId: { type: String },
  certificationUrl: { type: String },
  startMonth: { type: Number },
  startYear: { type: Number },
  endMonth: { type: Number },
  endYear: { type: Number },
  doesNotExpire: { type: Boolean, default: false }
}, { timestamps: true });

const careerProfileSchema = new mongoose.Schema({
  currentIndustry: { type: String, required: true },
  department: { type: String, required: true },
  roleCategory: { type: String, required: true },
  jobRole: { type: String, required: true },
  desiredJobType: [{ type: String }],
  desiredEmploymentType: { type: String, required: true },
  preferredShift: { type: String, required: true },
  preferredWorkLocations: [{ type: String }],
  expectedSalary: { type: Number, required: true }
});

const personalDetailsSchema = new mongoose.Schema({
  gender: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  category: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  hometown: { type: String, required: true },
  workPermitUSA: { type: String },
  workPermitOtherCountries: [{ type: String }],
  languages: [{
    language: { type: String, required: true },
    read: { type: Boolean, default: false },
    write: { type: Boolean, default: false },
    speak: { type: Boolean, default: false },
    proficiency: { type: String, required: true }
  }],
  singleParent: { type: Boolean, default: false },
  workingMother: { type: Boolean, default: false },
  retired: { type: Boolean, default: false },
  lgbtq: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['jobseeker', 'employer', 'admin'], default: 'jobseeker' },
    
    // Basic profile fields
    designation: { type: String, trim: true },
    company: { type: String, trim: true },
    experience: { type: String, trim: true },
    salary: { type: Number, default: 0 },
    location: { type: String, trim: true },
    mobile: { type: String, trim: true },
    noticePeriod: { type: String, trim: true },
    
    // Profile media
    profilePic: { type: String },
    resume: {
      filename: { type: String },
      originalName: { type: String },
      url: { type: String },
      uploadDate: { type: Date, default: Date.now }
    },
    
    // Profile sections
    headline: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    profileSummary: { type: String, maxlength: 750 },
    
    // Arrays of sub-documents
    employments: [employmentSchema],
    educations: [educationSchema],
    itSkills: [itSkillSchema],
    projects: [projectSchema],
    accomplishments: [accomplishmentSchema],
    certifications: [certificationSchema],
    
    // Embedded documents
    careerProfile: careerProfileSchema,
    personalDetails: personalDetailsSchema,
    
    // System fields
    isVerified: { type: Boolean, default: false },
    profileCompletion: { type: Number, default: 0 },
    lastLogin: { type: Date, default: null },
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

// ✅ Calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function() {
  let completion = 0;
  const fields = [
    this.name, this.email, this.designation, this.company, 
    this.experience, this.location, this.mobile, this.headline,
    this.skills?.length > 0, this.employments?.length > 0,
    this.educations?.length > 0, this.profileSummary
  ];
  
  const completedFields = fields.filter(field => {
    if (typeof field === 'boolean') return field;
    if (Array.isArray(field)) return field.length > 0;
    return field && field.toString().trim() !== '';
  }).length;
  
  completion = Math.round((completedFields / fields.length) * 100);
  return completion;
};

// ✅ Export model
module.exports = mongoose.model('User', userSchema);