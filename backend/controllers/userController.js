const User = require('../models/User');
const path = require('path');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('employments')
      .populate('educations')
      .populate('itSkills')
      .populate('projects')
      .populate('accomplishments')
      .populate('certifications');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res) => {
  try {
    const {
      name,
      designation,
      company,
      experience,
      salary,
      location,
      email,
      mobile,
      noticePeriod,
      headline,
      skills,
      profileSummary,
      careerProfile,
      personalDetails
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(name && { name }),
          ...(designation && { designation }),
          ...(company && { company }),
          ...(experience && { experience }),
          ...(salary && { salary }),
          ...(location && { location }),
          ...(email && { email }),
          ...(mobile && { mobile }),
          ...(noticePeriod && { noticePeriod }),
          ...(headline && { headline }),
          ...(skills && { skills }),
          ...(profileSummary && { profileSummary }),
          ...(careerProfile && { careerProfile }),
          ...(personalDetails && { personalDetails })
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/:id/upload-pic
// @access  Private
const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const profilePic = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profilePic },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePic,
      user
    });
  } catch (error) {
    console.error('Upload profile pic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload resume
// @route   POST /api/users/:id/upload-resume
// @access  Private
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const resume = {
      filename: req.file.originalname,
      url: `/uploads/resumes/${req.file.filename}`,
      uploadedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { resume },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      resume,
      user
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete resume
// @route   DELETE /api/users/:id/resume
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { resume: null },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
      user
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add employment
// @route   POST /api/users/:id/employments
// @access  Private
const addEmployment = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newEmployment = req.body;
    user.employments.push(newEmployment);
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('employments');

    res.status(201).json({
      success: true,
      message: 'Employment added successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Add employment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update employment
// @route   PUT /api/users/:id/employments/:empId
// @access  Private
const updateEmployment = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const employment = user.employments.id(req.params.empId);
    if (!employment) {
      return res.status(404).json({
        success: false,
        message: 'Employment not found'
      });
    }

    Object.assign(employment, req.body);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('employments');

    res.status(200).json({
      success: true,
      message: 'Employment updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update employment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete employment
// @route   DELETE /api/users/:id/employments/:empId
// @access  Private
const deleteEmployment = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.employments.pull(req.params.empId);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('employments');

    res.status(200).json({
      success: true,
      message: 'Employment deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Delete employment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add education
// @route   POST /api/users/:id/educations
// @access  Private
const addEducation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newEducation = req.body;
    user.educations.push(newEducation);
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('educations');

    res.status(201).json({
      success: true,
      message: 'Education added successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update education
// @route   PUT /api/users/:id/educations/:eduId
// @access  Private
const updateEducation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const education = user.educations.id(req.params.eduId);
    if (!education) {
      return res.status(404).json({
        success: false,
        message: 'Education not found'
      });
    }

    Object.assign(education, req.body);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('educations');

    res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete education
// @route   DELETE /api/users/:id/educations/:eduId
// @access  Private
const deleteEducation = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.educations.pull(req.params.eduId);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('educations');

    res.status(200).json({
      success: true,
      message: 'Education deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add IT skill
// @route   POST /api/users/:id/skills
// @access  Private
const addSkill = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newSkill = req.body;
    user.itSkills.push(newSkill);
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('itSkills');

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update IT skill
// @route   PUT /api/users/:id/skills/:skillId
// @access  Private
const updateSkill = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skill = user.itSkills.id(req.params.skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    Object.assign(skill, req.body);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('itSkills');

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete IT skill
// @route   DELETE /api/users/:id/skills/:skillId
// @access  Private
const deleteSkill = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.itSkills.pull(req.params.skillId);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('itSkills');

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add project
// @route   POST /api/users/:id/projects
// @access  Private
const addProject = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newProject = req.body;
    user.projects.push(newProject);
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('projects');

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update project
// @route   PUT /api/users/:id/projects/:projectId
// @access  Private
const updateProject = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const project = user.projects.id(req.params.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    Object.assign(project, req.body);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('projects');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/users/:id/projects/:projectId
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.projects.pull(req.params.projectId);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('projects');

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add accomplishment
// @route   POST /api/users/:id/accomplishments
// @access  Private
const addAccomplishment = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newAccomplishment = req.body;
    user.accomplishments.push(newAccomplishment);
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('accomplishments');

    res.status(201).json({
      success: true,
      message: 'Accomplishment added successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Add accomplishment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update accomplishment
// @route   PUT /api/users/:id/accomplishments/:accId
// @access  Private
const updateAccomplishment = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const accomplishment = user.accomplishments.id(req.params.accId);
    if (!accomplishment) {
      return res.status(404).json({
        success: false,
        message: 'Accomplishment not found'
      });
    }

    Object.assign(accomplishment, req.body);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('accomplishments');

    res.status(200).json({
      success: true,
      message: 'Accomplishment updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update accomplishment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete accomplishment
// @route   DELETE /api/users/:id/accomplishments/:accId
// @access  Private
const deleteAccomplishment = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.accomplishments.pull(req.params.accId);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('accomplishments');

    res.status(200).json({
      success: true,
      message: 'Accomplishment deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Delete accomplishment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add certification
// @route   POST /api/users/:id/certifications
// @access  Private
const addCertification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newCertification = req.body;
    user.certifications.push(newCertification);
    
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('certifications');

    res.status(201).json({
      success: true,
      message: 'Certification added successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update certification
// @route   PUT /api/users/:id/certifications/:certId
// @access  Private
const updateCertification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const certification = user.certifications.id(req.params.certId);
    if (!certification) {
      return res.status(404).json({
        success: false,
        message: 'Certification not found'
      });
    }

    Object.assign(certification, req.body);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('certifications');

    res.status(200).json({
      success: true,
      message: 'Certification updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete certification
// @route   DELETE /api/users/:id/certifications/:certId
// @access  Private
const deleteCertification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.certifications.pull(req.params.certId);
    await user.save();
    
    const updatedUser = await User.findById(req.params.id)
      .select('-password')
      .populate('certifications');

    res.status(200).json({
      success: true,
      message: 'Certification deleted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
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
};