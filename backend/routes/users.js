const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, authorizeUser } = require('../middleware/authMiddleware');
const {
  getUser,
  updateUser,
  uploadProfilePic,
  uploadResume,
  deleteResume,
  addEmployment,
  updateEmployment,
  deleteEmployment,
  addEducation,
  updateEducation,
  deleteEducation,
  addSkill,
  updateSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addAccomplishment,
  updateAccomplishment,
  deleteAccomplishment,
  addCertification,
  updateCertification,
  deleteCertification
} = require('../controllers/userController');

// Configure multer for profile pictures
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + fileExtension);
  }
});

// Configure multer for resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/resumes/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + fileExtension);
  }
});

// File filter for profile pictures
const profilePicFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed for profile pictures'), false);
  }
};

// File filter for resumes
const resumeFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf',
    'text/plain'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, RTF, and TXT files are allowed for resumes'), false);
  }
};

// Create separate upload instances
const uploadProfilePicMulter = multer({
  storage: profilePicStorage,
  fileFilter: profilePicFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

const uploadResumeMulter = multer({
  storage: resumeStorage,
  fileFilter: resumeFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Error handling middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files.'
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Apply protection to all routes
router.use(protect);

// GET user profile
router.get('/:id', authorizeUser, getUser);

// UPDATE user profile
router.put('/:id', authorizeUser, updateUser);

// UPLOAD profile picture - FIXED: Changed to upload-pic to match frontend
router.post('/:id/upload-pic', authorizeUser, uploadProfilePicMulter.single('profilePic'), handleMulterError, uploadProfilePic);

// UPLOAD resume - FIXED: Changed to upload-resume to match frontend
router.post('/:id/upload-resume', authorizeUser, uploadResumeMulter.single('resume'), handleMulterError, uploadResume);

// DELETE resume - FIXED: Changed to match frontend endpoint
router.delete('/:id/resume', authorizeUser, deleteResume);

// Employment routes
router.post('/:id/employments', authorizeUser, addEmployment);
router.put('/:id/employments/:empId', authorizeUser, updateEmployment);
router.delete('/:id/employments/:empId', authorizeUser, deleteEmployment);

// Education routes
router.post('/:id/educations', authorizeUser, addEducation);
router.put('/:id/educations/:eduId', authorizeUser, updateEducation);
router.delete('/:id/educations/:eduId', authorizeUser, deleteEducation);

// IT Skills routes
router.post('/:id/skills', authorizeUser, addSkill);
router.put('/:id/skills/:skillId', authorizeUser, updateSkill);
router.delete('/:id/skills/:skillId', authorizeUser, deleteSkill);

// Projects routes
router.post('/:id/projects', authorizeUser, addProject);
router.put('/:id/projects/:projectId', authorizeUser, updateProject);
router.delete('/:id/projects/:projectId', authorizeUser, deleteProject);

// Accomplishments routes
router.post('/:id/accomplishments', authorizeUser, addAccomplishment);
router.put('/:id/accomplishments/:accId', authorizeUser, updateAccomplishment);
router.delete('/:id/accomplishments/:accId', authorizeUser, deleteAccomplishment);

// Certifications routes - FIXED: Changed to match frontend endpoints
router.post('/:id/certifications', authorizeUser, addCertification);
router.put('/:id/certifications/:certId', authorizeUser, updateCertification);
router.delete('/:id/certifications/:certId', authorizeUser, deleteCertification);

module.exports = router;