import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  CircularProgress,
  Link,
  Stack,
  Autocomplete,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
} from '@mui/material';
import {
  Work,
  Bookmark,
  Person,
  Edit,
  CameraAlt,
  CloudUpload,
  Download,
  Delete,
  Add,
  Close,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// ---------- Yup validation ----------
const profileSchema = yup.object({
  name: yup.string().required('Name is required'),
  designation: yup.string().required('Designation is required'),
  company: yup.string().required('Company is required'),
  experience: yup.string().required('Experience is required'),
  salary: yup
    .number()
    .typeError('Salary must be a number')
    .min(0, 'Salary cannot be negative')
    .required('Salary is required'),
  location: yup.string().required('Location is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  mobile: yup
    .string()
    .matches(/^[6-9]\d{9}$/, 'Invalid Indian mobile number')
    .required('Mobile is required'),
  noticePeriod: yup.string().required('Notice period is required'),
});

const headlineSchema = yup.object({
  headline: yup
    .string()
    .required('Headline is required')
    .test(
      'min-words',
      'Minimum 5 words',
      (value) => (value || '').split(/\s+/).filter((w) => w).length >= 5
    ),
});

const skillsSchema = yup.object({
  skills: yup
    .array()
    .of(yup.string().trim())
    .min(1, 'Add at least 1 skill')
    .required('Skills are required'),
});

/* ---------- Employment validation ---------- */
const employmentSchema = yup.object({
  isCurrent: yup.boolean(),
  employmentType: yup.string().oneOf(['Full-time', 'Internship']).required(),
  totalYears: yup
    .number()
    .typeError('Years must be a number')
    .min(0)
    .required('Total years required'),
  totalMonths: yup
    .number()
    .typeError('Months must be a number')
    .min(0)
    .max(11)
    .required('Total months required'),
  companyName: yup.string().required('Current company name required'),
  jobTitle: yup.string().required('Current job title required'),
  joiningYear: yup
    .number()
    .typeError('Year must be a number')
    .min(1900)
    .max(new Date().getFullYear() + 5)
    .required('Joining year required'),
  joiningMonth: yup
    .number()
    .typeError('Month must be a number')
    .min(1)
    .max(12)
    .required('Joining month required'),
  currentSalary: yup
    .number()
    .typeError('Salary must be a number')
    .min(0)
    .required('Current salary required'),
  skillsUsed: yup
    .array()
    .of(yup.string().trim())
    .min(1, 'Add at least 1 skill')
    .required('Skills used required'),
  jobProfile: yup.string().required('Job profile required').max(4000),
  noticePeriod: yup.string().required('Notice period required'),
});

/* ---------- Education ---------- */
const educationSchema = yup.object({
  education: yup.string().required('Education is required'),
  institute: yup.string().required('Institute is required'),
  course: yup.string().required('Course is required'),
  specialization: yup.string().required('Specialization is required'),
  courseType: yup.string().required('Course type is required'),
  startYear: yup.number().required().min(1900),
  endYear: yup.number().required().min(1900),
  grading: yup.string().required('Grading system is required'),
});

/* ---------- IT Skills validation ---------- */
const itSkillsSchema = yup.object({
  skillName: yup.string().required('Skill / Software name is required'),
  version: yup.string().required('Software version is required'),
  lastUsed: yup.string().required('Last used year is required'),
  expYears: yup.number().typeError('Years must be a number').min(0).required(),
  expMonths: yup
    .number()
    .typeError('Months must be a number')
    .min(0)
    .max(11)
    .required(),
});

/* ---------- Project validation ---------- */
const projectSchema = yup.object({
  title: yup.string().required('Project title is required'),
  tagWith: yup.string().nullable(),
  client: yup.string().required('Client name required'),
  status: yup.string().oneOf(['In progress', 'Finished']).required(),
  workedYear: yup.number().required(),
  workedMonth: yup.number().required(),
  details: yup.string().required().max(1000),
  location: yup.string().nullable(),
  site: yup.string().required(),
  employmentNature: yup.string().required(),
  teamSize: yup.string().nullable(),
  role: yup.string().nullable(),
  roleDescription: yup.string().max(250),
  skillsUsed: yup.string().max(500),
});

/* ---------- Accomplishments validation ---------- */
const accomplishmentSchema = yup.object({
  accomplishmentType: yup.string().required('Accomplishment type is required'),
  title: yup.string().required('Title is required'),
  associatedWith: yup.string().nullable(),
  date: yup.string().nullable(),
  description: yup.string().max(1000),
});

/* ---------- Certifications validation ---------- */
const certificationSchema = yup.object({
  certificationName: yup.string().required('Certification name is required'),
  completionId: yup.string().nullable(),
  certificationUrl: yup.string().url('Please enter a valid URL').nullable(),
  startMonth: yup.number().when('doesNotExpire', {
    is: false,
    then: (schema) => schema.min(1).max(12).required('Start month is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  startYear: yup.number().when('doesNotExpire', {
    is: false,
    then: (schema) =>
      schema
        .min(1900)
        .max(new Date().getFullYear() + 5)
        .required('Start year is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  endMonth: yup.number().when('doesNotExpire', {
    is: false,
    then: (schema) => schema.min(1).max(12).required('End month is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  endYear: yup.number().when('doesNotExpire', {
    is: false,
    then: (schema) =>
      schema
        .min(1900)
        .max(new Date().getFullYear() + 5)
        .required('End year is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  doesNotExpire: yup.boolean().default(false),
});

/* ---------- Career Profile validation ---------- */
const careerProfileSchema = yup.object({
  currentIndustry: yup.string().required('Current industry is required'),
  department: yup.string().required('Department is required'),
  roleCategory: yup.string().required('Role category is required'),
  jobRole: yup.string().required('Job role is required'),
  desiredJobType: yup.array().min(1, 'Select at least one job type'),
  desiredEmploymentType: yup.string().required('Employment type is required'),
  preferredShift: yup.string().required('Preferred shift is required'),
  preferredWorkLocations: yup.array().min(1, 'Select at least one location'),
  expectedSalary: yup
    .number()
    .typeError('Salary must be a number')
    .min(0, 'Salary cannot be negative')
    .required('Expected salary is required'),
});

/* ---------- Personal Details validation ---------- */
const personalDetailsSchema = yup.object({
  gender: yup.string().required('Gender is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  maritalStatus: yup.string().required('Marital status is required'),
  category: yup.string().required('Category is required'),
  address: yup.string().required('Address is required'),
  pincode: yup
    .string()
    .matches(/^\d{6}$/, 'Pincode must be 6 digits')
    .required('Pincode is required'),
  hometown: yup.string().required('Hometown is required'),
  workPermitUSA: yup.string().nullable(),
  workPermitOtherCountries: yup.array().nullable(),
  languages: yup.array().of(
    yup.object({
      language: yup.string().required('Language is required'),
      read: yup.boolean().default(false),
      write: yup.boolean().default(false),
      speak: yup.boolean().default(false),
      proficiency: yup.string().required('Proficiency is required'),
    })
  ),
  singleParent: yup.boolean().default(false),
  workingMother: yup.boolean().default(false),
  retired: yup.boolean().default(false),
  lgbtq: yup.boolean().default(false),
});

const JobSeekerDashboard = () => {
  const { user, setUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [employments, setEmployments] = useState(user?.employments || []);
  const [openEmployment, setOpenEmployment] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [educations, setEducations] = useState(user?.educations || []);
  const [openEducation, setOpenEducation] = useState(false);
  const [editingEduId, setEditingEduId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHeadline, setOpenHeadline] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [resume, setResume] = useState(user?.resume || null);
  const [headline, setHeadline] = useState(user?.headline || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillsList, setSkillsList] = useState(user?.itSkills || []);
  const [openSkill, setOpenSkill] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [projects, setProjects] = useState(user?.projects || []);
  const [openProject, setOpenProject] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [openProfileSummary, setOpenProfileSummary] = useState(false);
  const [profileSummary, setProfileSummary] = useState(
    user?.profileSummary || ''
  );
  const [accomplishments, setAccomplishments] = useState(
    user?.accomplishments || []
  );
  const [openAccomplishment, setOpenAccomplishment] = useState(false);
  const [editingAccomplishmentId, setEditingAccomplishmentId] = useState(null);
  const [certifications, setCertifications] = useState(
    user?.certifications || []
  );
  const [openCertification, setOpenCertification] = useState(false);
  const [editingCertificationId, setEditingCertificationId] = useState(null);
  const [openCareerProfile, setOpenCareerProfile] = useState(false);
  const [careerProfile, setCareerProfile] = useState(user?.careerProfile || {});
  const [openPersonalDetails, setOpenPersonalDetails] = useState(false);
  const [personalDetails, setPersonalDetails] = useState(user?.personalDetails || {});

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      designation: user?.designation || 'Software Engineer',
      company: user?.company || 'IOP Technologies LLP',
      experience: user?.experience || '2 Years',
      salary: user?.salary ? Number(user.salary) : 0,
      location: user?.location || 'Bengaluru, India',
      email: user?.email || '',
      noticePeriod: user?.noticePeriod || '15 Days or less',
      mobile: user?.mobile || '',
    },
  });

  const {
    control: headlineControl,
    handleSubmit: handleHeadlineSubmit,
    watch,
    reset: resetHeadline,
    formState: { errors: headlineErrors, isSubmitting: isHeadlineSubmitting },
  } = useForm({
    resolver: yupResolver(headlineSchema),
    defaultValues: { headline: '' },
  });

  const {
    control: skillsControl,
    handleSubmit: handleSkillsSubmit,
    setValue,
    watch: watchSkills,
    formState: { errors: skillsErrors },
  } = useForm({
    resolver: yupResolver(skillsSchema),
    defaultValues: { skills: [] },
  });

  /* ---------- Employment form ---------- */
  const {
    control: empControl,
    handleSubmit: handleEmpSubmit,
    reset: resetEmp,
    setValue: setEmpValue,
    watch: watchEmp,
    formState: { errors: empErrors, isSubmitting: isEmpSubmitting },
  } = useForm({
    resolver: yupResolver(employmentSchema),
    defaultValues: {
      isCurrent: true,
      employmentType: 'Full-time',
      totalYears: '',
      totalMonths: '',
      companyName: '',
      jobTitle: '',
      joiningYear: '',
      joiningMonth: '',
      currentSalary: '',
      skillsUsed: [],
      jobProfile: '',
      noticePeriod: '',
    },
  });

  const {
    control: eduControl,
    handleSubmit: handleEduSubmit,
    reset: resetEdu,
    formState: { errors: eduErrors, isSubmitting: isEduSubmitting },
  } = useForm({
    resolver: yupResolver(educationSchema),
    defaultValues: {
      education: '',
      institute: '',
      course: '',
      specialization: '',
      courseType: 'Full time',
      startYear: '',
      endYear: '',
      grading: '',
    },
  });

  /* IT Skills form control */
  const {
    control: skillControl,
    handleSubmit: handleSkillSubmit,
    reset: resetSkill,
    formState: { errors: skillErrors, isSubmitting: isSkillSubmitting },
  } = useForm({
    resolver: yupResolver(itSkillsSchema),
    defaultValues: {
      skillName: '',
      version: '',
      lastUsed: '',
      expYears: '',
      expMonths: '',
    },
  });

  /* Project form control */
  const {
    control: projectControl,
    handleSubmit: handleProjectSubmit,
    reset: resetProject,
    formState: { errors: projectErrors, isSubmitting: isProjectSubmitting },
  } = useForm({
    resolver: yupResolver(projectSchema),
    defaultValues: {
      title: '',
      tagWith: '',
      client: '',
      status: 'In progress',
      workedYear: '',
      workedMonth: '',
      details: '',
      location: '',
      site: 'Offsite',
      employmentNature: 'Full time',
      teamSize: '',
      role: '',
      roleDescription: '',
      skillsUsed: '',
    },
  });

  /* Accomplishment form control */
  const {
    control: accomplishmentControl,
    handleSubmit: handleAccomplishmentSubmit,
    reset: resetAccomplishment,
    formState: {
      errors: accomplishmentErrors,
      isSubmitting: isAccomplishmentSubmitting,
    },
  } = useForm({
    resolver: yupResolver(accomplishmentSchema),
    defaultValues: {
      accomplishmentType: '',
      title: '',
      associatedWith: '',
      date: '',
      description: '',
    },
  });

  /* Certification form control - FIXED: Added proper validation */
  const {
    control: certificationControl,
    handleSubmit: handleCertificationSubmit,
    reset: resetCertification,
    watch: watchCertification,
    formState: {
      errors: certificationErrors,
      isSubmitting: isCertificationSubmitting,
    },
  } = useForm({
    resolver: yupResolver(certificationSchema),
    defaultValues: {
      certificationName: '',
      completionId: '',
      certificationUrl: '',
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      doesNotExpire: false,
    },
  });

  /* Career Profile form control */
  const {
    control: careerProfileControl,
    handleSubmit: handleCareerProfileSubmit,
    reset: resetCareerProfile,
    formState: {
      errors: careerProfileErrors,
      isSubmitting: isCareerProfileSubmitting,
    },
  } = useForm({
    resolver: yupResolver(careerProfileSchema),
    defaultValues: {
      currentIndustry: user?.careerProfile?.currentIndustry || 'IT Services & Consulting',
      department: user?.careerProfile?.department || 'Engineering - Software & QA',
      roleCategory: user?.careerProfile?.roleCategory || 'Software Development',
      jobRole: user?.careerProfile?.jobRole || 'Software Development - Other',
      desiredJobType: user?.careerProfile?.desiredJobType || ['Permanent'],
      desiredEmploymentType: user?.careerProfile?.desiredEmploymentType || 'Full Time',
      preferredShift: user?.careerProfile?.preferredShift || 'Flexible',
      preferredWorkLocations: user?.careerProfile?.preferredWorkLocations || [
        'Delhi / NCR', 'Noida', 'Gurgaon/Gurugram', 'Hyderabad/Secunderabad', 
        'Chennai', 'Pune', 'Mumbai', 'Bangalore/Bengaluru'
      ],
      expectedSalary: user?.careerProfile?.expectedSalary || 0,
    },
  });

  /* Personal Details form control */
  const {
    control: personalDetailsControl,
    handleSubmit: handlePersonalDetailsSubmit,
    reset: resetPersonalDetails,
    setValue: setPersonalDetailsValue,
    watch: watchPersonalDetails,
    formState: {
      errors: personalDetailsErrors,
      isSubmitting: isPersonalDetailsSubmitting,
    },
  } = useForm({
    resolver: yupResolver(personalDetailsSchema),
    defaultValues: {
      gender: user?.personalDetails?.gender || '',
      dateOfBirth: user?.personalDetails?.dateOfBirth || '',
      maritalStatus: user?.personalDetails?.maritalStatus || '',
      category: user?.personalDetails?.category || '',
      address: user?.personalDetails?.address || '',
      pincode: user?.personalDetails?.pincode || '',
      hometown: user?.personalDetails?.hometown || '',
      workPermitUSA: user?.personalDetails?.workPermitUSA || '',
      workPermitOtherCountries: user?.personalDetails?.workPermitOtherCountries || [],
      languages: user?.personalDetails?.languages || [],
      singleParent: user?.personalDetails?.singleParent || false,
      workingMother: user?.personalDetails?.workingMother || false,
      retired: user?.personalDetails?.retired || false,
      lgbtq: user?.personalDetails?.lgbtq || false,
    },
  });

  const watchedHeadline = watch('headline', '');
  const charLeft = 176 - (watchedHeadline?.length || 0);
  const currentSkills = watchSkills('skills') || [];
  const doesNotExpire = watchCertification('doesNotExpire');
  const languages = watchPersonalDetails('languages') || [];

  const suggestedSkills = [
    'MongoDB',
    'MariaDB',
    'Express',
    '8D',
    'GraphQL',
    'MongoDB Dba',
    'Ember.js',
    'Elastic Search',
    'Backbone.js',
    'PHP',
  ];

  const accomplishmentTypes = [
    'Award',
    'Certification',
    'Publication',
    'Patent',
    'Presentation',
    'Course',
    'Project',
    'Other',
  ];

  // Career Profile Options
  const industries = [
    'IT Services & Consulting',
    'Software Product',
    'Internet',
    'E-commerce',
    'Banking',
    'Insurance',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Real Estate',
    'Media & Entertainment',
    'Telecom',
    'Retail',
    'Automotive',
    'Others'
  ];

  const departments = [
    'Engineering - Software & QA',
    'Sales & Business Development',
    'Marketing & Communication',
    'Human Resources',
    'Finance & Accounting',
    'Operations',
    'Customer Success',
    'Product Management',
    'Design',
    'Data Science & Analytics',
    'IT & Information Security',
    'Research & Development',
    'Others'
  ];

  const roleCategories = [
    'Software Development',
    'Quality Assurance',
    'DevOps',
    'Data Science',
    'Business Intelligence',
    'Product Management',
    'Project Management',
    'Technical Support',
    'Sales',
    'Marketing',
    'Human Resources',
    'Finance',
    'Operations',
    'Others'
  ];

  const jobRoles = [
    'Software Development - Other',
    'Full Stack Developer',
    'Frontend Developer',
    'Backend Developer',
    'Mobile App Developer',
    'DevOps Engineer',
    'Data Scientist',
    'QA Engineer',
    'Product Manager',
    'Project Manager',
    'Business Analyst',
    'UI/UX Designer',
    'Technical Lead',
    'System Architect',
    'Others'
  ];

  const jobTypes = ['Permanent', 'Contractual'];
  const employmentTypes = ['Full Time', 'Part Time'];
  const shiftTypes = ['Day', 'Night', 'Flexible'];
  
  const workLocations = [
    'Delhi / NCR',
    'Noida',
    'Gurgaon/Gurugram',
    'Hyderabad/Secunderabad',
    'Chennai',
    'Pune',
    'Mumbai',
    'Bangalore/Bengaluru',
    'Kolkata',
    'Ahmedabad',
    'Chandigarh',
    'Jaipur',
    'Lucknow',
    'Kochi',
    'Coimbatore'
  ];

  // Personal Details Options
  const genders = ['Male', 'Female', 'Transgender'];
  const maritalStatuses = ['Single/unmarried', 'Married', 'Widowed', 'Divorced', 'Separated', 'Other'];
  const categories = ['General', 'Scheduled Caste (SC)', 'Scheduled Tribe (ST)', 'OBC - Creamy', 'OBC - Non creamy', 'Other'];
  const workPermitOptions = ['H1B', 'L1', 'F1', 'Green Card', 'Citizen', 'Other'];
  const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Singapore', 'UAE', 'Other'];
  const languagesList = ['Kannada', 'English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Bengali', 'Other'];
  const proficiencyLevels = ['Beginner', 'Intermediate', 'Expert', 'Native'];

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  // ---------- Data fetching ----------
  const fetchApplications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get('http://localhost:5000/api/jobs');
      const allApplications = data.jobs.flatMap((job) =>
        job.applications
          .filter((app) => app.jobSeeker === user._id)
          .map((app) => ({ ...app, jobDetails: job }))
      );
      setApplications(allApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [user]);

  const fetchSavedJobs = useCallback(() => {
    setSavedJobs([]);
  }, []);

  /* ---------- Fetch employments ---------- */
  const fetchEmployments = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/${user._id}`
      );
      setEmployments(data.user.employments || []);
    } catch (err) {
      console.error('Failed to fetch employments', err);
    }
  }, [user?._id]);

  /* ---------- Fetch educations ---------- */
  const fetchEducations = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/${user._id}`);
      setEducations(data.user.educations || []);
    } catch (err) {
      console.error('Failed to fetch educations', err);
    }
  }, [user?._id]);

  /* ---------- Fetch IT skills ---------- */
  const fetchSkills = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/${user._id}`);
      setSkillsList(data.user.itSkills || []);
    } catch (err) {
      console.error('Failed to fetch IT skills', err);
    }
  }, [user?._id]);

  /* ---------- Fetch projects ---------- */
  const fetchProjects = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/${user._id}`);
      setProjects(data.user.projects || []);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  }, [user?._id]);

  /* ---------- Fetch accomplishments ---------- */
  const fetchAccomplishments = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/${user._id}`);
      setAccomplishments(data.user.accomplishments || []);
    } catch (err) {
      console.error('Failed to fetch accomplishments', err);
    }
  }, [user?._id]);

  /* ---------- Fetch certifications ---------- */
  const fetchCertifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/${user._id}`);
      setCertifications(data.user.certifications || []);
    } catch (err) {
      console.error('Failed to fetch certifications', err);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchSavedJobs();
      fetchEmployments();
      fetchApplications();
      fetchEducations();
      fetchSkills();
      fetchProjects();
      fetchAccomplishments();
      fetchCertifications();
      reset({
        name: user.name || '',
        designation: user.designation || 'Software Engineer',
        company: user.company || 'IOP Technologies LLP',
        experience: user.experience || '2 Years',
        salary: Number(user.salary) || 0,
        location: user.location || 'Bengaluru, India',
        email: user.email || '',
        noticePeriod: user.noticePeriod || '15 Days or less',
        mobile: user.mobile || '',
      });
      setProfilePic(user.profilePic || null);
      setResume(user.resume || null);
      setHeadline(user.headline || '');
      setSkills(user.skills || []);
      resetHeadline({ headline: user.headline || '' });
      setValue('skills', user.skills || []);
      setCareerProfile(user.careerProfile || {});
      setPersonalDetails(user.personalDetails || {});
    }
  }, [
    user,
    fetchApplications,
    fetchSavedJobs,
    fetchEmployments,
    fetchEducations,
    fetchSkills,
    fetchProjects,
    fetchAccomplishments,
    fetchCertifications,
    reset,
    resetHeadline,
    setValue,
  ]);

  // ---------- Helpers ----------
  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'reviewed':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleEditOpen = () => setOpenEdit(true);
  const handleEditClose = () => {
    setOpenEdit(false);
    reset();
  };

  const handleHeadlineOpen = () => {
    resetHeadline({ headline });
    setOpenHeadline(true);
  };
  const handleHeadlineClose = () => setOpenHeadline(false);

  const handleSkillsOpen = () => {
    setValue('skills', skills);
    setOpenSkills(true);
  };
  const handleSkillsClose = () => setOpenSkills(false);

  /* ---------- Employment dialog handlers ---------- */
  const handleEmploymentOpen = (emp = null) => {
    if (emp) {
      setEditingEmpId(emp._id);
      const [y, m] = emp.totalExperience.split(' Years ');
      const months = m?.replace(' Months', '') || '0';
      const joinDate = new Date(emp.joiningDate);
      resetEmp({
        isCurrent: emp.isCurrent,
        employmentType: emp.employmentType,
        totalYears: Number(y),
        totalMonths: Number(months),
        companyName: emp.companyName,
        jobTitle: emp.jobTitle,
        joiningYear: joinDate.getFullYear(),
        joiningMonth: joinDate.getMonth() + 1,
        currentSalary: emp.currentSalary,
        skillsUsed: emp.skillsUsed || [],
        jobProfile: emp.jobProfile,
        noticePeriod: emp.noticePeriod,
      });
    } else {
      setEditingEmpId(null);
      resetEmp();
    }
    setOpenEmployment(true);
  };
  const handleEmploymentClose = () => {
    setOpenEmployment(false);
    setEditingEmpId(null);
  };

  const handleEducationOpen = (edu = null) => {
    if (edu) {
      setEditingEduId(edu._id);
      resetEdu({
        education: edu.education,
        institute: edu.institute,
        course: edu.course,
        specialization: edu.specialization,
        courseType: edu.courseType,
        startYear: edu.startYear,
        endYear: edu.endYear,
        grading: edu.grading,
      });
    } else {
      setEditingEduId(null);
      resetEdu();
    }
    setOpenEducation(true);
  };

  const handleEducationClose = () => {
    setOpenEducation(false);
    setEditingEduId(null);
  };

  const handleSkillOpen = (item = null) => {
    if (item) {
      setEditingSkillId(item._id);
      resetSkill({
        skillName: item.skillName,
        version: item.version,
        lastUsed: item.lastUsed,
        expYears: item.expYears,
        expMonths: item.expMonths,
      });
    } else {
      setEditingSkillId(null);
      resetSkill();
    }
    setOpenSkill(true);
  };

  const handleSkillClose = () => {
    setOpenSkill(false);
    setEditingSkillId(null);
  };

  /* ---------- PROJECT HANDLERS ---------- */
  const handleProjectOpen = (item = null) => {
    if (item) {
      setEditingProjectId(item._id);
      resetProject(item);
    } else {
      setEditingProjectId(null);
      resetProject();
    }
    setOpenProject(true);
  };

  const handleProjectClose = () => {
    setOpenProject(false);
    setEditingProjectId(null);
  };

  /* ---------- ACCOMPLISHMENT HANDLERS ---------- */
  const handleAccomplishmentOpen = (item = null) => {
    if (item) {
      setEditingAccomplishmentId(item._id);
      resetAccomplishment({
        accomplishmentType: item.accomplishmentType,
        title: item.title,
        associatedWith: item.associatedWith,
        date: item.date,
        description: item.description,
      });
    } else {
      setEditingAccomplishmentId(null);
      resetAccomplishment();
    }
    setOpenAccomplishment(true);
  };

  const handleAccomplishmentClose = () => {
    setOpenAccomplishment(false);
    setEditingAccomplishmentId(null);
  };

  /* ---------- CERTIFICATION HANDLERS ---------- */
  const handleCertificationOpen = (item = null) => {
    if (item) {
      setEditingCertificationId(item._id);
      resetCertification({
        certificationName: item.certificationName,
        completionId: item.completionId,
        certificationUrl: item.certificationUrl,
        startMonth: item.startMonth,
        startYear: item.startYear,
        endMonth: item.endMonth,
        endYear: item.endYear,
        doesNotExpire: item.doesNotExpire,
      });
    } else {
      setEditingCertificationId(null);
      resetCertification();
    }
    setOpenCertification(true);
  };

  const handleCertificationClose = () => {
    setOpenCertification(false);
    setEditingCertificationId(null);
  };

  /* ---------- Career Profile handlers ---------- */
  const handleCareerProfileOpen = () => {
    resetCareerProfile({
      currentIndustry: user?.careerProfile?.currentIndustry || 'IT Services & Consulting',
      department: user?.careerProfile?.department || 'Engineering - Software & QA',
      roleCategory: user?.careerProfile?.roleCategory || 'Software Development',
      jobRole: user?.careerProfile?.jobRole || 'Software Development - Other',
      desiredJobType: user?.careerProfile?.desiredJobType || ['Permanent'],
      desiredEmploymentType: user?.careerProfile?.desiredEmploymentType || 'Full Time',
      preferredShift: user?.careerProfile?.preferredShift || 'Flexible',
      preferredWorkLocations: user?.careerProfile?.preferredWorkLocations || [
        'Delhi / NCR', 'Noida', 'Gurgaon/Gurugram', 'Hyderabad/Secunderabad', 
        'Chennai', 'Pune', 'Mumbai', 'Bangalore/Bengaluru'
      ],
      expectedSalary: user?.careerProfile?.expectedSalary || 0,
    });
    setOpenCareerProfile(true);
  };

  const handleCareerProfileClose = () => {
    setOpenCareerProfile(false);
  };

  /* ---------- Personal Details handlers ---------- */
  const handlePersonalDetailsOpen = () => {
    resetPersonalDetails({
      gender: user?.personalDetails?.gender || '',
      dateOfBirth: user?.personalDetails?.dateOfBirth || '',
      maritalStatus: user?.personalDetails?.maritalStatus || '',
      category: user?.personalDetails?.category || '',
      address: user?.personalDetails?.address || '',
      pincode: user?.personalDetails?.pincode || '',
      hometown: user?.personalDetails?.hometown || '',
      workPermitUSA: user?.personalDetails?.workPermitUSA || '',
      workPermitOtherCountries: user?.personalDetails?.workPermitOtherCountries || [],
      languages: user?.personalDetails?.languages || [],
      singleParent: user?.personalDetails?.singleParent || false,
      workingMother: user?.personalDetails?.workingMother || false,
      retired: user?.personalDetails?.retired || false,
      lgbtq: user?.personalDetails?.lgbtq || false,
    });
    setOpenPersonalDetails(true);
  };

  const handlePersonalDetailsClose = () => {
    setOpenPersonalDetails(false);
  };

  // ---------- Form submit ----------
  const onSubmit = async (data) => {
    try {
      const payload = { ...data, profilePic };
      
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const { data: response } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        payload
      );
      
      setUser(response.user);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const onHeadlineSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const { data: response } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { headline: data.headline }
      );
      
      setUser(response.user);
      setHeadline(data.headline);
      enqueueSnackbar('Headline updated!', { variant: 'success' });
      handleHeadlineClose();
    } catch (err) {
      enqueueSnackbar('Failed to update headline', { variant: 'error' });
    }
  };

  const onSkillsSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const { data: response } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { skills: data.skills }
      );
      
      setUser(response.user);
      setSkills(data.skills);
      enqueueSnackbar('Skills updated!', { variant: 'success' });
      handleSkillsClose();
    } catch (err) {
      enqueueSnackbar('Failed to update skills', { variant: 'error' });
    }
  };

  /* ---------- Employment submit ---------- */
  const onEmploymentSubmit = async (data) => {
    const payload = {
      isCurrent: data.isCurrent,
      employmentType: data.employmentType,
      totalExperience: `${data.totalYears} Years ${data.totalMonths} Months`,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      joiningDate: `${data.joiningYear}-${String(data.joiningMonth).padStart(2, '0')}-01`,
      currentSalary: data.currentSalary,
      skillsUsed: data.skillsUsed,
      jobProfile: data.jobProfile,
      noticePeriod: data.noticePeriod,
    };

    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      let response;
      if (editingEmpId) {
        response = await axios.put(
          `http://localhost:5000/api/users/${user._id}/employments/${editingEmpId}`,
          payload
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/api/users/${user._id}/employments`,
          payload
        );
      }
      
      setUser(response.data.user);
      setEmployments(response.data.user.employments || []);
      enqueueSnackbar(
        editingEmpId ? 'Employment updated!' : 'Employment added!',
        { variant: 'success' }
      );
      handleEmploymentClose();
    } catch (err) {
      enqueueSnackbar('Failed to save employment', { variant: 'error' });
    }
  };

  /* ---------- Delete employment ---------- */
  const handleDeleteEmployment = async (empId) => {
    if (!window.confirm('Delete this employment record?')) return;
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/users/${user._id}/employments/${empId}`
      );
      setUser(data.user);
      setEmployments(data.user.employments || []);
      enqueueSnackbar('Employment deleted', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };

  /* ---------- Education submit ---------- */
  const onEducationSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      let response;
      if (editingEduId) {
        response = await axios.put(
          `http://localhost:5000/api/users/${user._id}/educations/${editingEduId}`,
          data
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/api/users/${user._id}/educations`,
          data
        );
      }

      setUser(response.data.user);
      setEducations(response.data.user.educations || []);

      enqueueSnackbar(
        editingEduId ? 'Education updated!' : 'Education added!',
        { variant: 'success' }
      );

      handleEducationClose();
    } catch (err) {
      enqueueSnackbar('Failed to save education', { variant: 'error' });
    }
  };

  /* ---------- Delete education ---------- */
  const handleDeleteEducation = async (eduId) => {
    if (!window.confirm('Delete this education record?')) return;

    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/users/${user._id}/educations/${eduId}`
      );

      setUser(data.user);
      setEducations(data.user.educations || []);
      enqueueSnackbar('Education deleted', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete education', { variant: 'error' });
    }
  };

  /* ---------- IT Skills submit ---------- */
  const onSkillSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      let response;
      if (editingSkillId) {
        response = await axios.put(
          `http://localhost:5000/api/users/${user._id}/skills/${editingSkillId}`,
          data
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/api/users/${user._id}/skills`,
          data
        );
      }

      setUser(response.data.user);
      setSkillsList(response.data.user.itSkills || []);

      enqueueSnackbar(editingSkillId ? 'Skill updated!' : 'Skill added!', {
        variant: 'success',
      });

      handleSkillClose();
    } catch (err) {
      enqueueSnackbar('Failed to save skill', { variant: 'error' });
    }
  };

  /* ---------- Delete IT skill ---------- */
  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Delete this skill?')) return;

    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/users/${user._id}/skills/${skillId}`
      );

      setUser(data.user);
      setSkillsList(data.user.itSkills || []);

      enqueueSnackbar('Skill deleted', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete skill', { variant: 'error' });
    }
  };

  /* ---------- Project submit ---------- */
  const onProjectSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      let response;
      if (editingProjectId) {
        response = await axios.put(
          `http://localhost:5000/api/users/${user._id}/projects/${editingProjectId}`,
          data
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/api/users/${user._id}/projects`,
          data
        );
      }

      setUser(response.data.user);
      setProjects(response.data.user.projects || []);

      enqueueSnackbar(
        editingProjectId ? 'Project updated!' : 'Project added!',
        { variant: 'success' }
      );

      handleProjectClose();
    } catch (err) {
      enqueueSnackbar('Failed to save project', { variant: 'error' });
    }
  };

  /* ---------- Delete project ---------- */
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/users/${user._id}/projects/${projectId}`
      );
      setUser(data.user);
      setProjects(data.user.projects || []);
      enqueueSnackbar('Project deleted!', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete project', { variant: 'error' });
    }
  };

  const handleProfileSummarySave = async () => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { profileSummary }
      );

      setUser(data.user);
      enqueueSnackbar('Profile summary updated!', { variant: 'success' });
      setOpenProfileSummary(false);
    } catch (err) {
      enqueueSnackbar('Failed to update profile summary', { variant: 'error' });
    }
  };

  const handleProfileSummaryDelete = async () => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const { data } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { profileSummary: '' }
      );

      setUser(data.user);
      setProfileSummary('');
      enqueueSnackbar('Profile summary deleted!', { variant: 'info' });
      setOpenProfileSummary(false);
    } catch (err) {
      enqueueSnackbar('Failed to delete', { variant: 'error' });
    }
  };

  /* ---------- Accomplishment submit ---------- */
  const onAccomplishmentSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      let response;
      if (editingAccomplishmentId) {
        response = await axios.put(
          `http://localhost:5000/api/users/${user._id}/accomplishments/${editingAccomplishmentId}`,
          data
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/api/users/${user._id}/accomplishments`,
          data
        );
      }

      setUser(response.data.user);
      setAccomplishments(response.data.user.accomplishments || []);

      enqueueSnackbar(
        editingAccomplishmentId
          ? 'Accomplishment updated!'
          : 'Accomplishment added!',
        { variant: 'success' }
      );

      handleAccomplishmentClose();
    } catch (err) {
      enqueueSnackbar('Failed to save accomplishment', { variant: 'error' });
    }
  };

  /* ---------- Delete accomplishment ---------- */
  const handleDeleteAccomplishment = async (accomplishmentId) => {
    if (!window.confirm('Delete this accomplishment?')) return;
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/users/${user._id}/accomplishments/${accomplishmentId}`
      );
      setUser(data.user);
      setAccomplishments(data.user.accomplishments || []);
      enqueueSnackbar('Accomplishment deleted!', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete accomplishment', { variant: 'error' });
    }
  };

  /* ---------- FIXED: Certification submit ---------- */
  const onCertificationSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      // Prepare certification data
      const certificationData = {
        certificationName: data.certificationName,
        completionId: data.completionId || '',
        certificationUrl: data.certificationUrl || '',
        doesNotExpire: data.doesNotExpire,
      };

      // Only add date fields if certification expires
      if (!data.doesNotExpire) {
        certificationData.startMonth = data.startMonth;
        certificationData.startYear = data.startYear;
        certificationData.endMonth = data.endMonth;
        certificationData.endYear = data.endYear;
      }

      let response;
      if (editingCertificationId) {
        response = await axios.put(
          `http://localhost:5000/api/users/${user._id}/certifications/${editingCertificationId}`,
          certificationData
        );
      } else {
        response = await axios.post(
          `http://localhost:5000/api/users/${user._id}/certifications`,
          certificationData
        );
      }

      setUser(response.data.user);
      setCertifications(response.data.user.certifications || []);

      enqueueSnackbar(
        editingCertificationId
          ? 'Certification updated!'
          : 'Certification added!',
        { variant: 'success' }
      );

      handleCertificationClose();
    } catch (err) {
      console.error('Certification save error:', err);
      enqueueSnackbar('Failed to save certification', { variant: 'error' });
    }
  };

  /* ---------- Delete certification ---------- */
  const handleDeleteCertification = async (certificationId) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/users/${user._id}/certifications/${certificationId}`
      );
      setUser(data.user);
      setCertifications(data.user.certifications || []);
      enqueueSnackbar('Certification deleted!', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete certification', { variant: 'error' });
    }
  };

  /* ---------- Career Profile submit ---------- */
  const onCareerProfileSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const { data: response } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { careerProfile: data }
      );
      setUser(response.user);
      setCareerProfile(data);
      enqueueSnackbar('Career profile updated!', { variant: 'success' });
      handleCareerProfileClose();
    } catch (err) {
      enqueueSnackbar('Failed to update career profile', { variant: 'error' });
    }
  };

  /* ---------- Personal Details submit ---------- */
  const onPersonalDetailsSubmit = async (data) => {
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const { data: response } = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        { personalDetails: data }
      );
      setUser(response.user);
      setPersonalDetails(data);
      enqueueSnackbar('Personal details updated!', { variant: 'success' });
      handlePersonalDetailsClose();
    } catch (err) {
      enqueueSnackbar('Failed to update personal details', { variant: 'error' });
    }
  };

  /* ---------- Language management functions ---------- */
  const handleAddLanguage = () => {
    const currentLanguages = languages || [];
    setPersonalDetailsValue('languages', [
      ...currentLanguages,
      { language: '', read: false, write: false, speak: false, proficiency: '' }
    ]);
  };

  const handleRemoveLanguage = (index) => {
    const currentLanguages = [...languages];
    currentLanguages.splice(index, 1);
    setPersonalDetailsValue('languages', currentLanguages);
  };

  const handleLanguageChange = (index, field, value) => {
    const currentLanguages = [...languages];
    currentLanguages[index][field] = value;
    setPersonalDetailsValue('languages', currentLanguages);
  };

  // ---------- FIXED: Image upload ----------
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      enqueueSnackbar('Please upload a valid image', { variant: 'warning' });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar('Image must be under 2 MB', { variant: 'warning' });
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePic', file);
    
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `http://localhost:5000/api/users/${user._id}/upload-pic`,
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      
      setProfilePic(data.profilePic);
      setUser(data.user);
      enqueueSnackbar('Profile picture updated!', { variant: 'success' });
    } catch (err) {
      console.error('Image upload error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to upload image';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  // ---------- Resume upload ----------
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar('Only .doc, .docx, .pdf, .rtf, .txt files allowed', {
        variant: 'warning',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      enqueueSnackbar('Resume must be under 5 MB', { variant: 'warning' });
      return;
    }
    
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `http://localhost:5000/api/users/${user._id}/upload-resume`,
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      
      setResume(data.resume);
      setUser(data.user);
      enqueueSnackbar('Resume updated successfully!', { variant: 'success' });
    } catch (err) {
      console.error('Resume upload error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to upload resume';
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setUploadingResume(false);
    }
  };

  // ---------- Delete resume ----------
  const handleDeleteResume = async () => {
    if (!resume) return;
    try {
      if (!user?._id) {
        enqueueSnackbar('User not found. Please login again.', { variant: 'error' });
        return;
      }

      await axios.delete(`http://localhost:5000/api/users/${user._id}/resume`);
      setResume(null);
      enqueueSnackbar('Resume deleted', { variant: 'info' });
    } catch (err) {
      enqueueSnackbar('Failed to delete resume', { variant: 'error' });
    }
  };

  // ---------- Loading ----------
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Job Seeker Dashboard
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Work sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{applications.length}</Typography>
                <Typography color="text.secondary">Applications</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Bookmark sx={{ fontSize: 48, color: 'secondary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4">{savedJobs.length}</Typography>
                <Typography color="text.secondary">Saved Jobs</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ fontSize: 48, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h6">Profile</Typography>
                <Chip label="100%" color="success" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          aria-label="dashboard tabs"
        >
          <Tab label="My Applications" />
          <Tab label="Saved Jobs" />
          <Tab label="Profile" />
        </Tabs>
      </Box>

      {/* ==== My Applications ==== */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            My Job Applications
          </Typography>
          {applications.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">
                  No applications yet
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }} href="/jobs">
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((app, idx) => (
              <Card key={idx} sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="h6">
                        {app.jobDetails.title}
                      </Typography>
                      <Typography color="primary" gutterBottom>
                        {app.jobDetails.company}
                      </Typography>
                      <Typography color="text.secondary">
                        Applied on{' '}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={app.status}
                        color={getStatusColor(app.status)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {app.jobDetails.location}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* ==== Saved Jobs ==== */}
      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Saved Jobs
          </Typography>
          {savedJobs.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="h6" color="text.secondary">
                  No saved jobs
                </Typography>
                <Button variant="contained" href="/jobs">
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            savedJobs.map((job) => (
              <Card key={job._id} sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography color="primary">{job.company}</Typography>
                  <Typography color="text.secondary">{job.location}</Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* ==== Profile (60% Width on Left Side) ==== */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            My Profile
          </Typography>

          <Grid container spacing={3}>
            {/* Left Side - Profile Content (60% width) */}
            <Grid item xs={12} lg={7.2}>
              <Card sx={{ p: 2.5, borderRadius: 3, boxShadow: 3 }}>
                {/* Profile Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    position: 'relative',
                  }}
                >
                  {/* FIXED: Profile picture with proper URL handling */}
                  <Avatar
                    src={profilePic ? `http://localhost:5000${profilePic}` : undefined}
                    sx={{ width: 72, height: 72, mr: 2 }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.designation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.company}
                    </Typography>
                  </Box>

                  {/* Edit Profile */}
                  <IconButton
                    color="primary"
                    onClick={handleEditOpen}
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: 6,
                      bgcolor: 'background.paper',
                      boxShadow: 2,
                      width: 36,
                      height: 36,
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>

                  {/* Camera */}
                  <input
                    accept="image/*"
                    type="file"
                    id="pic"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  <label htmlFor="pic">
                    <IconButton
                      component="span"
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 56,
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        width: 32,
                        height: 32,
                      }}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <CameraAlt fontSize="small" />
                      )}
                    </IconButton>
                  </label>
                </Box>

                {/* Compact Details */}
                <Grid container spacing={1.5} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Email:</strong> {user.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Mobile:</strong> {user.mobile || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Location:</strong> {user.location || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Experience:</strong> {user.experience || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Salary:</strong> ₹{user.salary || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Notice Period:</strong> {user.noticePeriod || '—'}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Resume Section */}
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: 'grey.400',
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Resume
                  </Typography>
                  {resume ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                        {resume.filename}
                      </Typography>
                      <Link href={resume.url} target="_blank">
                        <IconButton size="small" color="primary">
                          <Download fontSize="small" />
                        </IconButton>
                      </Link>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={handleDeleteResume}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      No resume uploaded
                    </Typography>
                  )}
                  <Box sx={{ textAlign: 'center' }}>
                    <input
                      accept=".pdf,.doc,.docx,.rtf,.txt"
                      type="file"
                      id="resume"
                      style={{ display: 'none' }}
                      onChange={handleResumeUpload}
                    />
                    <label htmlFor="resume">
                      <Button
                        variant="outlined"
                        size="small"
                        component="span"
                        startIcon={
                          uploadingResume ? (
                            <CircularProgress size={14} />
                          ) : (
                            <CloudUpload />
                          )
                        }
                        disabled={uploadingResume}
                      >
                        {uploadingResume ? 'Uploading...' : 'Update'}
                      </Button>
                    </label>
                  </Box>
                </Box>

                {/* ==== RESUME HEADLINE ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Resume headline
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleHeadlineOpen}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" color="primary" sx={{ mt: 1 }}>
                    {headline || 'No headline set'}
                  </Typography>
                </Box>

                {/* ==== KEY SKILLS - AFTER HEADLINE ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Key skills
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleSkillsOpen}
                      color="primary"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box
                    sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                  >
                    {skills.length > 0 ? (
                      skills.map((skill, idx) => (
                        <Chip
                          key={idx}
                          label={skill}
                          size="small"
                          sx={{
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                          }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No skills added
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* ==== EMPLOYMENT SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Employment
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      onClick={() => handleEmploymentOpen()}
                      variant="outlined"
                    >
                      Add employment
                    </Button>
                  </Box>

                  {employments.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No employment added yet.
                    </Typography>
                  ) : (
                    employments.map((emp) => {
                      const joinDate = new Date(emp.joiningDate);
                      const joinStr = `${joinDate.toLocaleString('default', {
                        month: 'short',
                      })} ${joinDate.getFullYear()}`;

                      return (
                        <Box
                          key={emp._id}
                          sx={{
                            border: '1px dashed',
                            borderColor: 'grey.400',
                            borderRadius: 2,
                            p: 2,
                            mb: 2,
                            position: 'relative',
                          }}
                        >
                          {/* Edit & Delete buttons */}
                          <IconButton
                            size="small"
                            color="primary"
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                            onClick={() => handleEmploymentOpen(emp)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            sx={{ position: 'absolute', top: 8, right: 44 }}
                            onClick={() => handleDeleteEmployment(emp._id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>

                          <Typography variant="subtitle2" fontWeight={600}>
                            {emp.jobTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {emp.companyName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {emp.employmentType} | {joinStr} to{' '}
                            {emp.isCurrent ? 'Present' : 'Left'} (
                            {emp.totalExperience})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emp.noticePeriod}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {emp.jobProfile.slice(0, 250)}
                            {emp.jobProfile.length > 250 ? '...' : ''}
                          </Typography>

                          <Box
                            sx={{
                              mt: 1,
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 0.5,
                            }}
                          >
                            {emp.skillsUsed?.map((s, i) => (
                              <Chip key={i} label={s} size="small" />
                            ))}
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>

                {/* ==== EDUCATION SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Education
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      variant="outlined"
                      onClick={() => handleEducationOpen()}
                    >
                      Add education
                    </Button>
                  </Box>

                  {/* List */}
                  {educations.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No education added.
                    </Typography>
                  ) : (
                    educations.map((edu) => (
                      <Box
                        key={edu._id}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px dashed grey',
                          borderRadius: 2,
                          position: 'relative',
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                          onClick={() => handleEducationOpen(edu)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          sx={{ position: 'absolute', top: 10, right: 46 }}
                          onClick={() => handleDeleteEducation(edu._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>

                        <Typography variant="subtitle2" fontWeight={600}>
                          {edu.course}{' '}
                          {edu.specialization ? `(${edu.specialization})` : ''}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {edu.institute}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {edu.education} | {edu.courseType}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {edu.startYear} – {edu.endYear}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>

                {/* ==== IT SKILLS SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      IT Skills
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<Add />}
                      variant="outlined"
                      onClick={() => handleSkillOpen()}
                    >
                      Add details
                    </Button>
                  </Box>

                  {skillsList.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No skills added.
                    </Typography>
                  ) : (
                    <>
                      {/* Header Row */}
                      <Grid container sx={{ mb: 1, borderBottom: '1px solid', borderColor: 'grey.300', pb: 1 }}>
                        <Grid item xs={3} sx={{ fontWeight: 600 }}>
                          Skills
                        </Grid>
                        <Grid item xs={2} sx={{ fontWeight: 600 }}>
                          Version
                        </Grid>
                        <Grid item xs={2} sx={{ fontWeight: 600 }}>
                          Last used
                        </Grid>
                        <Grid item xs={3} sx={{ fontWeight: 600 }}>
                          Experience
                        </Grid>
                        <Grid item xs={2} sx={{ fontWeight: 600, textAlign: 'center' }}>
                          Actions
                        </Grid>
                      </Grid>

                      {/* Skills List */}
                      {skillsList.map((sk) => (
                        <Grid container key={sk._id} sx={{ py: 1, alignItems: 'center', borderBottom: '1px solid', borderColor: 'grey.100' }}>
                          <Grid item xs={3}>
                            <Typography variant="body2">{sk.skillName}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">{sk.version}</Typography>
                          </Grid>
                          <Grid item xs={2}>
                            <Typography variant="body2">{sk.lastUsed}</Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="body2">
                              {sk.expYears} Year{sk.expYears !== 1 ? 's' : ''} {sk.expMonths} Month{sk.expMonths !== 1 ? 's' : ''}
                            </Typography>
                          </Grid>
                          <Grid item xs={2} sx={{ textAlign: 'center' }}>
                            <IconButton
                              size="small"
                              onClick={() => handleSkillOpen(sk)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSkill(sk._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      ))}
                    </>
                  )}
                </Box>

                {/* ==== PROJECTS SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Projects
                    </Typography>

                    <Button
                      size="small"
                      startIcon={<Add />}
                      variant="outlined"
                      onClick={() => handleProjectOpen()}
                    >
                      Add project
                    </Button>
                  </Box>

                  {projects.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Stand out to employers by adding details about projects
                      that you have done so far
                    </Typography>
                  ) : (
                    projects.map((p) => (
                      <Box
                        key={p._id}
                        sx={{
                          p: 2,
                          border: '1px dashed #999',
                          borderRadius: 2,
                          mb: 2,
                          position: 'relative',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleProjectOpen(p)}
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteProject(p._id)}
                          sx={{ position: 'absolute', top: 10, right: 45 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>

                        <Typography variant="subtitle2" fontWeight={600}>
                          {p.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {p.client} • {p.status}
                        </Typography>

                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {p.details.slice(0, 200)}
                          {p.details.length > 200 ? '...' : ''}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>

                {/* ==== PROFILE SUMMARY SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Profile summary
                    </Typography>

                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => setOpenProfileSummary(true)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {user.profileSummary && user.profileSummary.trim() !== ''
                      ? user.profileSummary
                      : 'Add a short career summary to attract recruiters'}
                  </Typography>
                </Box>

                {/* ==== ACCOMPLISHMENTS SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Accomplishments
                    </Typography>

                    <Button
                      size="small"
                      startIcon={<Add />}
                      variant="outlined"
                      onClick={() => handleAccomplishmentOpen()}
                    >
                      Add accomplishment
                    </Button>
                  </Box>

                  {accomplishments.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Add your awards, certifications, publications, and other
                      accomplishments
                    </Typography>
                  ) : (
                    accomplishments.map((acc) => (
                      <Box
                        key={acc._id}
                        sx={{
                          p: 2,
                          border: '1px dashed #999',
                          borderRadius: 2,
                          mb: 2,
                          position: 'relative',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleAccomplishmentOpen(acc)}
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAccomplishment(acc._id)}
                          sx={{ position: 'absolute', top: 10, right: 45 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>

                        <Typography variant="subtitle2" fontWeight={600}>
                          {acc.title}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {acc.accomplishmentType}{' '}
                          {acc.associatedWith ? `• ${acc.associatedWith}` : ''}
                        </Typography>

                        {acc.date && (
                          <Typography variant="caption" color="text.secondary">
                            {acc.date}
                          </Typography>
                        )}

                        {acc.description && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {acc.description}
                          </Typography>
                        )}
                      </Box>
                    ))
                  )}
                </Box>

                {/* ==== CERTIFICATIONS SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Certifications
                    </Typography>

                    <Button
                      size="small"
                      startIcon={<Add />}
                      variant="outlined"
                      onClick={() => handleCertificationOpen()}
                    >
                      Add certification
                    </Button>
                  </Box>

                  {certifications.length === 0 ? (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      Add details of certifications you have completed
                    </Typography>
                  ) : (
                    certifications.map((cert) => (
                      <Box
                        key={cert._id}
                        sx={{
                          p: 2,
                          border: '1px dashed #999',
                          borderRadius: 2,
                          mb: 2,
                          position: 'relative',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleCertificationOpen(cert)}
                          sx={{ position: 'absolute', top: 10, right: 10 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCertification(cert._id)}
                          sx={{ position: 'absolute', top: 10, right: 45 }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>

                        <Typography variant="subtitle2" fontWeight={600}>
                          {cert.certificationName}
                        </Typography>

                        {cert.completionId && (
                          <Typography variant="body2" color="text.secondary">
                            ID: {cert.completionId}
                          </Typography>
                        )}

                        {cert.certificationUrl && (
                          <Link
                            href={cert.certificationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="body2"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            View Certificate
                          </Link>
                        )}

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 1 }}
                        >
                          {cert.doesNotExpire
                            ? 'Does not expire'
                            : `Valid from ${
                                months.find((m) => m.value === cert.startMonth)
                                  ?.label
                              } ${cert.startYear} to ${
                                months.find((m) => m.value === cert.endMonth)
                                  ?.label
                              } ${cert.endYear}`}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>

                {/* ==== CAREER PROFILE SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Career Profile
                    </Typography>

                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handleCareerProfileOpen}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Current Industry:</strong>{' '}
                        {careerProfile.currentIndustry || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Department:</strong>{' '}
                        {careerProfile.department || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Role Category:</strong>{' '}
                        {careerProfile.roleCategory || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Job Role:</strong>{' '}
                        {careerProfile.jobRole || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Desired Job Type:</strong>{' '}
                        {careerProfile.desiredJobType?.join(', ') || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Employment Type:</strong>{' '}
                        {careerProfile.desiredEmploymentType || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Preferred Shift:</strong>{' '}
                        {careerProfile.preferredShift || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Expected Salary:</strong>{' '}
                        {careerProfile.expectedSalary ? `₹${careerProfile.expectedSalary}` : 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Preferred Locations:</strong>{' '}
                        {careerProfile.preferredWorkLocations?.join(', ') || 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* ==== PERSONAL DETAILS SECTION ==== */}
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Personal Details
                    </Typography>

                    <IconButton
                      size="small"
                      color="primary"
                      onClick={handlePersonalDetailsOpen}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Gender:</strong>{' '}
                        {personalDetails.gender || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Date of Birth:</strong>{' '}
                        {personalDetails.dateOfBirth || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Marital Status:</strong>{' '}
                        {personalDetails.maritalStatus || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Category:</strong>{' '}
                        {personalDetails.category || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Address:</strong>{' '}
                        {personalDetails.address || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Pincode:</strong>{' '}
                        {personalDetails.pincode || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Hometown:</strong>{' '}
                        {personalDetails.hometown || 'Not specified'}
                      </Typography>
                    </Grid>
                    {personalDetails.workPermitUSA && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Work Permit (USA):</strong>{' '}
                          {personalDetails.workPermitUSA}
                        </Typography>
                      </Grid>
                    )}
                    {personalDetails.workPermitOtherCountries && personalDetails.workPermitOtherCountries.length > 0 && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          <strong>Work Permit (Other):</strong>{' '}
                          {personalDetails.workPermitOtherCountries.join(', ')}
                        </Typography>
                      </Grid>
                    )}
                    {personalDetails.languages && personalDetails.languages.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Languages:</strong>{' '}
                          {personalDetails.languages.map(lang => lang.language).join(', ')}
                        </Typography>
                      </Grid>
                    )}
                    {(personalDetails.singleParent || personalDetails.workingMother || personalDetails.retired || personalDetails.lgbtq) && (
                      <Grid item xs={12}>
                        <Typography variant="body2">
                          <strong>Additional Info:</strong>{' '}
                          {[
                            personalDetails.singleParent ? 'Single Parent' : '',
                            personalDetails.workingMother ? 'Working Mother' : '',
                            personalDetails.retired ? 'Retired (60+)' : '',
                            personalDetails.lgbtq ? 'LGBTQ++' : ''
                          ].filter(Boolean).join(', ')}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Edit Profile Dialog */}
      <Dialog open={openEdit} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Edit Profile
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {[
                'name',
                'designation',
                'company',
                'experience',
                'salary',
                'location',
                'email',
                'mobile',
              ].map((field) => (
                <Grid item xs={12} sm={6} key={field}>
                  <Controller
                    name={field}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        fullWidth
                        size="small"
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        type={
                          field === 'email'
                            ? 'email'
                            : field === 'salary'
                            ? 'number'
                            : 'text'
                        }
                        error={!!errors[field]}
                        helperText={errors[field]?.message}
                        required
                      />
                    )}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Controller
                  name="noticePeriod"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      size="small"
                      error={!!errors.noticePeriod}
                    >
                      <InputLabel>Notice Period</InputLabel>
                      <Select {...field} label="Notice Period">
                        {[
                          '15 Days or less',
                          '1 Month',
                          '2 Months',
                          '3 Months',
                          'More than 3 Months',
                        ].map((v) => (
                          <MenuItem key={v} value={v}>
                            {v}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleEditClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Headline Dialog */}
      <Dialog
        open={openHeadline}
        onClose={handleHeadlineClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleHeadlineSubmit(onHeadlineSubmit)}>
          <DialogTitle>Resume headline</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Minimum 5 words. Be concise and professional.
            </Typography>
            <Controller
              name="headline"
              control={headlineControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="e.g. Full Stack Developer | React, Node.js, AWS"
                  error={!!headlineErrors.headline}
                  helperText={
                    headlineErrors.headline?.message || `${charLeft} chars left`
                  }
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleHeadlineClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isHeadlineSubmitting || charLeft < 0}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Key Skills Dialog */}
      <Dialog
        open={openSkills}
        onClose={handleSkillsClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSkillsSubmit(onSkillsSubmit)}>
          <DialogTitle>Key skills</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add skills that best define your expertise, for e.g. Direct
              Marketing, Oracle, Java, etc. (Minimum 1)
            </Typography>

            {/* Hidden Controller to use skillsControl and enable validation */}
            <Controller
              name="skills"
              control={skillsControl}
              render={() => null}
            />

            {/* Current Skills */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {currentSkills.map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    onDelete={() => {
                      const updated = currentSkills.filter((_, i) => i !== idx);
                      setValue('skills', updated);
                    }}
                    deleteIcon={<Close />}
                    size="small"
                    sx={{ backgroundColor: 'primary.light', color: 'white' }}
                  />
                ))}
              </Box>
            </Box>

            {/* Add Custom Skill */}
            <Autocomplete
              freeSolo
              options={[]}
              onInputChange={(_, value) => {
                if (value && !currentSkills.includes(value.trim())) {
                  setValue('skills', [...currentSkills, value.trim()]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add skills"
                  variant="outlined"
                  size="small"
                  placeholder="Type and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && params.inputProps.value) {
                      const val = params.inputProps.value.trim();
                      if (val && !currentSkills.includes(val)) {
                        setValue('skills', [...currentSkills, val]);
                        e.preventDefault();
                      }
                    }
                  }}
                />
              )}
            />

            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>
              Or you can select from the suggested set of skills
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {suggestedSkills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  clickable
                  color={currentSkills.includes(skill) ? 'primary' : 'default'}
                  onClick={() => {
                    if (!currentSkills.includes(skill)) {
                      setValue('skills', [...currentSkills, skill]);
                    }
                  }}
                  icon={<Add fontSize="small" />}
                  size="small"
                  variant={
                    currentSkills.includes(skill) ? 'filled' : 'outlined'
                  }
                />
              ))}
            </Box>

            {skillsErrors.skills && (
              <Typography
                color="error"
                variant="caption"
                sx={{ mt: 1, display: 'block' }}
              >
                {skillsErrors.skills.message}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSkillsClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={currentSkills.length === 0}
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== EMPLOYMENT DIALOG ==== */}
      <Dialog
        open={openEmployment}
        onClose={handleEmploymentClose}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleEmpSubmit(onEmploymentSubmit)}>
          <DialogTitle>
            {editingEmpId ? 'Edit Employment' : 'Add Employment'}
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Details like job title, company name, etc. help employers
              understand your work.
            </Typography>

            {/* Is this your current employment? */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">
                Is this your current employment?
              </FormLabel>
              <Controller
                name="isCurrent"
                control={empControl}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value={true}
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value={false}
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>

            {/* Employment type */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Employment type</FormLabel>
              <Controller
                name="employmentType"
                control={empControl}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel
                      value="Full-time"
                      control={<Radio />}
                      label="Full-time"
                    />
                    <FormControlLabel
                      value="Internship"
                      control={<Radio />}
                      label="Internship"
                    />
                  </RadioGroup>
                )}
              />
            </FormControl>

            {/* Total experience */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Controller
                  name="totalYears"
                  control={empControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Total experience *"
                      type="number"
                      fullWidth
                      size="small"
                      error={!!empErrors.totalYears}
                      helperText={empErrors.totalYears?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="totalMonths"
                  control={empControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Months"
                      type="number"
                      fullWidth
                      size="small"
                      error={!!empErrors.totalMonths}
                      helperText={empErrors.totalMonths?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Current company & job title */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="companyName"
                  control={empControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Current company name *"
                      placeholder="Type your organization"
                      fullWidth
                      size="small"
                      error={!!empErrors.companyName}
                      helperText={empErrors.companyName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="jobTitle"
                  control={empControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Current job title *"
                      placeholder="Type your designation"
                      fullWidth
                      size="small"
                      error={!!empErrors.jobTitle}
                      helperText={empErrors.jobTitle?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Joining date */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Controller
                  name="joiningYear"
                  control={empControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Joining date *"
                      fullWidth
                      size="small"
                      error={!!empErrors.joiningYear}
                      helperText={empErrors.joiningYear?.message}
                    >
                      {Array.from(
                        { length: 50 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((y) => (
                        <MenuItem key={y} value={y}>
                          {y}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="joiningMonth"
                  control={empControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Select Month"
                      fullWidth
                      size="small"
                      error={!!empErrors.joiningMonth}
                      helperText={empErrors.joiningMonth?.message}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <MenuItem key={m} value={m}>
                          {new Date(2000, m - 1, 1).toLocaleString('default', {
                            month: 'long',
                          })}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            {/* Current salary */}
            <Controller
              name="currentSalary"
              control={empControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Current salary *"
                  type="number"
                  fullWidth
                  size="small"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  error={!!empErrors.currentSalary}
                  helperText={empErrors.currentSalary?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Skills used */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Skills used *
              </Typography>
              <Controller
                name="skillsUsed"
                control={empControl}
                render={() => null}
              />
              <Autocomplete
                multiple
                freeSolo
                options={suggestedSkills}
                value={watchEmp('skillsUsed') || []}
                onChange={(_, newVal) => setEmpValue('skillsUsed', newVal)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Add skills"
                    size="small"
                    error={!!empErrors.skillsUsed}
                    helperText={empErrors.skillsUsed?.message}
                  />
                )}
              />
            </Box>

            {/* Job profile */}
            <Controller
              name="jobProfile"
              control={empControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job profile"
                  multiline
                  rows={4}
                  placeholder="Type here..."
                  fullWidth
                  size="small"
                  inputProps={{ maxLength: 4000 }}
                  helperText={`${
                    field.value?.length || 0
                  }/4000 characters left`}
                  error={!!empErrors.jobProfile}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Notice period */}
            <Controller
              name="noticePeriod"
              control={empControl}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  size="small"
                  error={!!empErrors.noticePeriod}
                >
                  <InputLabel>Notice period *</InputLabel>
                  <Select {...field} label="Notice period *">
                    {[
                      '15 Days or less',
                      '1 Month',
                      '2 Months',
                      '3 Months',
                      'More than 3 Months',
                    ].map((v) => (
                      <MenuItem key={v} value={v}>
                        {v}
                      </MenuItem>
                    ))}
                  </Select>
                  {empErrors.noticePeriod && (
                    <Typography variant="caption" color="error">
                      {empErrors.noticePeriod.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleEmploymentClose} disabled={isEmpSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isEmpSubmitting}
            >
              {isEmpSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== EDUCATION DIALOG ==== */}
      <Dialog
        open={openEducation}
        onClose={handleEducationClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleEduSubmit(onEducationSubmit)}>
          <DialogTitle>
            {editingEduId ? 'Edit Education' : 'Add Education'}
          </DialogTitle>

          <DialogContent dividers>
            {/* Education select */}
            <Controller
              name="education"
              control={eduControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Education *"
                  size="small"
                  margin="dense"
                  error={!!eduErrors.education}
                  helperText={eduErrors.education?.message}
                >
                  {[
                    'B.Tech',
                    'B.E',
                    'M.Tech',
                    'MCA',
                    'Diploma',
                    'Class X',
                    'Class XII',
                  ].map((v) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Institute */}
            <Controller
              name="institute"
              control={eduControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="University / Institute *"
                  fullWidth
                  margin="dense"
                  size="small"
                  error={!!eduErrors.institute}
                  helperText={eduErrors.institute?.message}
                />
              )}
            />

            {/* Course */}
            <Controller
              name="course"
              control={eduControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Course *"
                  fullWidth
                  margin="dense"
                  size="small"
                  error={!!eduErrors.course}
                  helperText={eduErrors.course?.message}
                />
              )}
            />

            {/* Specialization */}
            <Controller
              name="specialization"
              control={eduControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Specialization *"
                  fullWidth
                  margin="dense"
                  size="small"
                  error={!!eduErrors.specialization}
                  helperText={eduErrors.specialization?.message}
                />
              )}
            />

            {/* Course Type */}
            <Controller
              name="courseType"
              control={eduControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Course type *"
                  size="small"
                  margin="dense"
                  error={!!eduErrors.courseType}
                  helperText={eduErrors.courseType?.message}
                >
                  <MenuItem value="Full time">Full time</MenuItem>
                  <MenuItem value="Part time">Part time</MenuItem>
                  <MenuItem value="Distance Learning">
                    Correspondence / Distance Learning
                  </MenuItem>
                </TextField>
              )}
            />

            {/* Years */}
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Duration *
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="startYear"
                    control={eduControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Starting year *"
                        select
                        fullWidth
                        size="small"
                        error={!!eduErrors.startYear}
                        helperText={eduErrors.startYear?.message}
                      >
                        {Array.from({ length: 40 }, (_, i) => 2025 - i).map(
                          (year) => (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="endYear"
                    control={eduControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Ending year *"
                        select
                        fullWidth
                        size="small"
                        error={!!eduErrors.endYear}
                        helperText={eduErrors.endYear?.message}
                      >
                        {Array.from({ length: 40 }, (_, i) => 2025 - i).map(
                          (year) => (
                            <MenuItem key={year} value={year}>
                              {year}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Grading System */}
            <Controller
              name="grading"
              control={eduControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Grading system *"
                  size="small"
                  margin="dense"
                  error={!!eduErrors.grading}
                  helperText={eduErrors.grading?.message}
                >
                  <MenuItem value="Percentage">Percentage</MenuItem>
                  <MenuItem value="CGPA">CGPA</MenuItem>
                  <MenuItem value="Grade">Grade</MenuItem>
                </TextField>
              )}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={handleEducationClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isEduSubmitting}
            >
              {isEduSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== IT SKILLS DIALOG ==== */}
      <Dialog
        open={openSkill}
        onClose={handleSkillClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSkillSubmit(onSkillSubmit)}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingSkillId ? 'Edit IT Skill' : 'Add IT Skill'}
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            {/* ===== Section: Skill Info ===== */}
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Skill Information
            </Typography>

            {/* Skill Name */}
            <Controller
              name="skillName"
              control={skillControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Skill / Software Name *"
                  size="small"
                  margin="dense"
                  error={!!skillErrors.skillName}
                  helperText={skillErrors.skillName?.message}
                />
              )}
            />

            {/* Version */}
            <Controller
              name="version"
              control={skillControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Version *"
                  size="small"
                  margin="dense"
                  error={!!skillErrors.version}
                  helperText={skillErrors.version?.message}
                />
              )}
            />

            {/* Last Used */}
            <Controller
              name="lastUsed"
              control={skillControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Last Used *"
                  size="small"
                  margin="dense"
                  error={!!skillErrors.lastUsed}
                  helperText={skillErrors.lastUsed?.message}
                >
                  {Array.from({ length: 15 }, (_, i) => 2025 - i).map(
                    (year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    )
                  )}
                </TextField>
              )}
            />

            {/* ===== Section: Experience ===== */}
            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
              Experience
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Controller
                  name="expYears"
                  control={skillControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Years *"
                      type="number"
                      size="small"
                      inputProps={{ min: 0 }}
                      error={!!skillErrors.expYears}
                      helperText={skillErrors.expYears?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="expMonths"
                  control={skillControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Months *"
                      type="number"
                      size="small"
                      inputProps={{ min: 0, max: 11 }}
                      error={!!skillErrors.expMonths}
                      helperText={skillErrors.expMonths?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleSkillClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSkillSubmitting}
            >
              {isSkillSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== ADD PROJECT DIALOG ==== */}
      <Dialog
        open={openProject}
        onClose={handleProjectClose}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleProjectSubmit(onProjectSubmit)}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingProjectId ? 'Edit Project' : 'Project'}
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Stand out to employers by adding details about projects you have
              done in college, internships, or at work
            </Typography>

            {/* Project title */}
            <Controller
              name="title"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Project title *"
                  size="small"
                  margin="dense"
                  error={!!projectErrors.title}
                  helperText={projectErrors.title?.message}
                />
              )}
            />

            {/* Tag with employment */}
            <Controller
              name="tagWith"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Tag this project with your employment/education"
                  size="small"
                  margin="dense"
                >
                  <MenuItem value="">None</MenuItem>
                  {employments.map((e) => (
                    <MenuItem key={e._id} value={e._id}>
                      {e.companyName} - {e.jobTitle}
                    </MenuItem>
                  ))}
                  {educations.map((e) => (
                    <MenuItem key={e._id} value={e._id}>
                      {e.course} ({e.institute})
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Client */}
            <Controller
              name="client"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Client *"
                  size="small"
                  margin="dense"
                  error={!!projectErrors.client}
                  helperText={projectErrors.client?.message}
                />
              )}
            />

            {/* Project status */}
            <FormLabel sx={{ mt: 2 }}>Project status</FormLabel>
            <Controller
              name="status"
              control={projectControl}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel
                    value="In progress"
                    control={<Radio />}
                    label="In progress"
                  />
                  <FormControlLabel
                    value="Finished"
                    control={<Radio />}
                    label="Finished"
                  />
                </RadioGroup>
              )}
            />

            {/* Worked From */}
            <Box sx={{ mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Worked from *
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="workedYear"
                    control={projectControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Select year"
                        size="small"
                        error={!!projectErrors.workedYear}
                        helperText={projectErrors.workedYear?.message}
                      >
                        {Array.from({ length: 20 }, (_, i) => 2025 - i).map(
                          (yr) => (
                            <MenuItem key={yr} value={yr}>
                              {yr}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="workedMonth"
                    control={projectControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Select month"
                        size="small"
                        error={!!projectErrors.workedMonth}
                        helperText={projectErrors.workedMonth?.message}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (m) => (
                            <MenuItem key={m} value={m}>
                              {new Date(2000, m - 1, 1).toLocaleString(
                                'default',
                                {
                                  month: 'long',
                                }
                              )}
                            </MenuItem>
                          )
                        )}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Details of project */}
            <Controller
              name="details"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={4}
                  label="Details of project *"
                  size="small"
                  margin="dense"
                  error={!!projectErrors.details}
                  helperText={projectErrors.details?.message}
                  inputProps={{ maxLength: 1000 }}
                />
              )}
            />

            {/* Project location */}
            <Controller
              name="location"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Project location"
                  size="small"
                  margin="dense"
                />
              )}
            />

            {/* Project site */}
            <FormLabel sx={{ mt: 2 }}>Project site</FormLabel>
            <Controller
              name="site"
              control={projectControl}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel
                    value="Offsite"
                    control={<Radio />}
                    label="Offsite"
                  />
                  <FormControlLabel
                    value="Onsite"
                    control={<Radio />}
                    label="Onsite"
                  />
                </RadioGroup>
              )}
            />

            {/* Nature of employment */}
            <FormLabel sx={{ mt: 2 }}>Nature of employment</FormLabel>
            <Controller
              name="employmentNature"
              control={projectControl}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel
                    value="Full time"
                    control={<Radio />}
                    label="Full time"
                  />
                  <FormControlLabel
                    value="Part time"
                    control={<Radio />}
                    label="Part time"
                  />
                  <FormControlLabel
                    value="Contractual"
                    control={<Radio />}
                    label="Contractual"
                  />
                </RadioGroup>
              )}
            />

            {/* Team size */}
            <Controller
              name="teamSize"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Team size"
                  size="small"
                  margin="dense"
                >
                  <MenuItem value="">Select team size</MenuItem>
                  {[1, 2, 3, 4, 5, 10, 15, 20].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Role */}
            <Controller
              name="role"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Role"
                  size="small"
                  margin="dense"
                >
                  <MenuItem value="">Select role</MenuItem>
                  {['Developer', 'Tester', 'Lead', 'Manager', 'Designer'].map(
                    (r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    )
                  )}
                </TextField>
              )}
            />

            {/* Role description */}
            <Controller
              name="roleDescription"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={3}
                  label="Role description"
                  size="small"
                  margin="dense"
                  inputProps={{ maxLength: 250 }}
                />
              )}
            />

            {/* Skills used */}
            <Controller
              name="skillsUsed"
              control={projectControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Skills used"
                  size="small"
                  margin="dense"
                  inputProps={{ maxLength: 500 }}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleProjectClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isProjectSubmitting}
            >
              {isProjectSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== PROFILE SUMMARY DIALOG ==== */}
      <Dialog
        open={openProfileSummary}
        onClose={() => setOpenProfileSummary(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Profile summary
          <Button color="error" onClick={handleProfileSummaryDelete}>
            Delete
          </Button>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Give recruiters a brief overview of your career, skills,
            achievements, and career goals.
          </Typography>

          <TextField
            value={profileSummary}
            onChange={(e) => setProfileSummary(e.target.value)}
            fullWidth
            multiline
            minRows={5}
            inputProps={{ maxLength: 750 }}
          />

          <Typography
            variant="caption"
            sx={{ float: 'right', mt: 1 }}
            color="text.secondary"
          >
            {750 - (profileSummary?.length || 0)} characters left
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenProfileSummary(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleProfileSummarySave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==== ACCOMPLISHMENTS DIALOG ==== */}
      <Dialog
        open={openAccomplishment}
        onClose={handleAccomplishmentClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleAccomplishmentSubmit(onAccomplishmentSubmit)}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingAccomplishmentId
              ? 'Edit Accomplishment'
              : 'Add Accomplishment'}
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your awards, certifications, publications, and other
              accomplishments
            </Typography>

            {/* Accomplishment Type */}
            <Controller
              name="accomplishmentType"
              control={accomplishmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Accomplishment Type *"
                  size="small"
                  margin="dense"
                  error={!!accomplishmentErrors.accomplishmentType}
                  helperText={accomplishmentErrors.accomplishmentType?.message}
                >
                  {accomplishmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Title */}
            <Controller
              name="title"
              control={accomplishmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Title *"
                  size="small"
                  margin="dense"
                  error={!!accomplishmentErrors.title}
                  helperText={accomplishmentErrors.title?.message}
                />
              )}
            />

            {/* Associated With */}
            <Controller
              name="associatedWith"
              control={accomplishmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Associated With"
                  size="small"
                  margin="dense"
                  placeholder="e.g., Company Name, University, Organization"
                />
              )}
            />

            {/* Date */}
            <Controller
              name="date"
              control={accomplishmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Date"
                  size="small"
                  margin="dense"
                  placeholder="e.g., March 2024"
                />
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={accomplishmentControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  minRows={3}
                  label="Description"
                  size="small"
                  margin="dense"
                  placeholder="Describe your accomplishment..."
                  inputProps={{ maxLength: 1000 }}
                  helperText={`${field.value?.length || 0}/1000 characters`}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleAccomplishmentClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isAccomplishmentSubmitting}
            >
              {isAccomplishmentSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== FIXED: CERTIFICATIONS DIALOG ==== */}
      <Dialog
        open={openCertification}
        onClose={handleCertificationClose}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleCertificationSubmit(onCertificationSubmit)}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingCertificationId
              ? 'Edit Certification'
              : 'Add Certification'}
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add details of certifications you have achieved/completed
            </Typography>

            {/* Certification Name */}
            <Controller
              name="certificationName"
              control={certificationControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Certification name *"
                  size="small"
                  margin="dense"
                  placeholder="Please enter your certification name"
                  error={!!certificationErrors.certificationName}
                  helperText={certificationErrors.certificationName?.message}
                />
              )}
            />

            {/* Completion ID */}
            <Controller
              name="completionId"
              control={certificationControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Certification completion ID"
                  size="small"
                  margin="dense"
                  placeholder="Please mention your course completion ID"
                />
              )}
            />

            {/* Certification URL */}
            <Controller
              name="certificationUrl"
              control={certificationControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Certification URL"
                  size="small"
                  margin="dense"
                  placeholder="Please mention your completion URL"
                  error={!!certificationErrors.certificationUrl}
                  helperText={certificationErrors.certificationUrl?.message}
                />
              )}
            />

            {/* Certification Validity */}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
              Certification validity
            </Typography>

            {/* Does not expire checkbox */}
            <Controller
              name="doesNotExpire"
              control={certificationControl}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox checked={field.value} onChange={field.onChange} />
                  }
                  label="This certification does not expire"
                />
              )}
            />

            {!doesNotExpire && (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={3}>
                  <Controller
                    name="startMonth"
                    control={certificationControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="MM"
                        size="small"
                        error={!!certificationErrors.startMonth}
                        helperText={certificationErrors.startMonth?.message}
                      >
                        {months.map((month) => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Controller
                    name="startYear"
                    control={certificationControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="YYYY"
                        size="small"
                        error={!!certificationErrors.startYear}
                        helperText={certificationErrors.startYear?.message}
                      >
                        {years.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid
                  item
                  xs={1}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2">To</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Controller
                    name="endMonth"
                    control={certificationControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="MM"
                        size="small"
                        error={!!certificationErrors.endMonth}
                        helperText={certificationErrors.endMonth?.message}
                      >
                        {months.map((month) => (
                          <MenuItem key={month.value} value={month.value}>
                            {month.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Controller
                    name="endYear"
                    control={certificationControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        label="YYYY"
                        size="small"
                        error={!!certificationErrors.endYear}
                        helperText={certificationErrors.endYear?.message}
                      >
                        {years.map((year) => (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCertificationClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCertificationSubmitting}
            >
              {isCertificationSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== CAREER PROFILE DIALOG ==== */}
      <Dialog
        open={openCareerProfile}
        onClose={handleCareerProfileClose}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handleCareerProfileSubmit(onCareerProfileSubmit)}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            Career Profile
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add details about your current and preferred job profile. This helps us personalize your job recommendations.
            </Typography>

            {/* Current Industry */}
            <Controller
              name="currentIndustry"
              control={careerProfileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Current industry *"
                  size="small"
                  margin="dense"
                  error={!!careerProfileErrors.currentIndustry}
                  helperText={careerProfileErrors.currentIndustry?.message}
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Department */}
            <Controller
              name="department"
              control={careerProfileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Department *"
                  size="small"
                  margin="dense"
                  error={!!careerProfileErrors.department}
                  helperText={careerProfileErrors.department?.message}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Role Category */}
            <Controller
              name="roleCategory"
              control={careerProfileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Role category *"
                  size="small"
                  margin="dense"
                  error={!!careerProfileErrors.roleCategory}
                  helperText={careerProfileErrors.roleCategory?.message}
                >
                  {roleCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Job Role */}
            <Controller
              name="jobRole"
              control={careerProfileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Job role *"
                  size="small"
                  margin="dense"
                  error={!!careerProfileErrors.jobRole}
                  helperText={careerProfileErrors.jobRole?.message}
                >
                  {jobRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Desired Job Type */}
            <FormControl fullWidth margin="dense" error={!!careerProfileErrors.desiredJobType}>
              <InputLabel>Desired job type *</InputLabel>
              <Controller
                name="desiredJobType"
                control={careerProfileControl}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    label="Desired job type *"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {jobTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Checkbox checked={field.value.indexOf(type) > -1} />
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {careerProfileErrors.desiredJobType && (
                <Typography variant="caption" color="error">
                  {careerProfileErrors.desiredJobType.message}
                </Typography>
              )}
            </FormControl>

            {/* Desired Employment Type */}
            <Controller
              name="desiredEmploymentType"
              control={careerProfileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Desired employment type *"
                  size="small"
                  margin="dense"
                  error={!!careerProfileErrors.desiredEmploymentType}
                  helperText={careerProfileErrors.desiredEmploymentType?.message}
                >
                  {employmentTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Preferred Shift */}
            <Controller
              name="preferredShift"
              control={careerProfileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Preferred shift *"
                  size="small"
                  margin="dense"
                  error={!!careerProfileErrors.preferredShift}
                  helperText={careerProfileErrors.preferredShift?.message}
                >
                  {shiftTypes.map((shift) => (
                    <MenuItem key={shift} value={shift}>
                      {shift}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Preferred Work Locations */}
            <FormControl fullWidth margin="dense" error={!!careerProfileErrors.preferredWorkLocations}>
              <InputLabel>Preferred work locations (Max 10) *</InputLabel>
              <Controller
                name="preferredWorkLocations"
                control={careerProfileControl}
                render={({ field }) => (
                  <Select
                    {...field}
                    multiple
                    label="Preferred work locations (Max 10) *"
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {workLocations.map((location) => (
                      <MenuItem key={location} value={location}>
                        <Checkbox checked={field.value.indexOf(location) > -1} />
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {careerProfileErrors.preferredWorkLocations && (
                <Typography variant="caption" color="error">
                  {careerProfileErrors.preferredWorkLocations.message}
                </Typography>
              )}
            </FormControl>

            {/* Expected Salary */}
            <Controller
              name="expectedSalary"
              control={careerProfileControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Expected salary *"
                  type="number"
                  size="small"
                  margin="dense"
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  error={!!careerProfileErrors.expectedSalary}
                  helperText={careerProfileErrors.expectedSalary?.message}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCareerProfileClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isCareerProfileSubmitting}
            >
              {isCareerProfileSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== PERSONAL DETAILS DIALOG ==== */}
      <Dialog
        open={openPersonalDetails}
        onClose={handlePersonalDetailsClose}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={handlePersonalDetailsSubmit(onPersonalDetailsSubmit)}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            Personal Details
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This information is important for employers to know you better
            </Typography>

            {/* Gender */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Gender *
              </FormLabel>
              <Controller
                name="gender"
                control={personalDetailsControl}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    {genders.map((gender) => (
                      <FormControlLabel
                        key={gender}
                        value={gender}
                        control={<Radio />}
                        label={gender}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
              {personalDetailsErrors.gender && (
                <Typography variant="caption" color="error">
                  {personalDetailsErrors.gender.message}
                </Typography>
              )}
            </FormControl>

            {/* Additional Information */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                More information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Companies are focusing on equal opportunities and might be looking for candidates from diverse backgrounds.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="singleParent"
                    control={personalDetailsControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Single parent"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="workingMother"
                    control={personalDetailsControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Working mother"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="retired"
                    control={personalDetailsControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="Retired (60+)"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lgbtq"
                    control={personalDetailsControl}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        }
                        label="LGBTQ++"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Marital Status */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Marital status *
              </FormLabel>
              <Controller
                name="maritalStatus"
                control={personalDetailsControl}
                render={({ field }) => (
                  <RadioGroup {...field} row>
                    {maritalStatuses.map((status) => (
                      <FormControlLabel
                        key={status}
                        value={status}
                        control={<Radio />}
                        label={status}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
              {personalDetailsErrors.maritalStatus && (
                <Typography variant="caption" color="error">
                  {personalDetailsErrors.maritalStatus.message}
                </Typography>
              )}
            </FormControl>

            {/* Date of Birth */}
            <Controller
              name="dateOfBirth"
              control={personalDetailsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Date of birth *"
                  type="date"
                  size="small"
                  margin="dense"
                  InputLabelProps={{ shrink: true }}
                  error={!!personalDetailsErrors.dateOfBirth}
                  helperText={personalDetailsErrors.dateOfBirth?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Category */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                Category *
              </FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Companies welcome people from various categories to bring equality among all citizens
              </Typography>
              <Controller
                name="category"
                control={personalDetailsControl}
                render={({ field }) => (
                  <RadioGroup {...field} row sx={{ flexWrap: 'wrap' }}>
                    {categories.map((category) => (
                      <FormControlLabel
                        key={category}
                        value={category}
                        control={<Radio />}
                        label={category}
                        sx={{ width: '50%', mb: 1 }}
                      />
                    ))}
                  </RadioGroup>
                )}
              />
              {personalDetailsErrors.category && (
                <Typography variant="caption" color="error">
                  {personalDetailsErrors.category.message}
                </Typography>
              )}
            </FormControl>

            {/* Address */}
            <Controller
              name="address"
              control={personalDetailsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Permanent address *"
                  multiline
                  rows={3}
                  size="small"
                  margin="dense"
                  error={!!personalDetailsErrors.address}
                  helperText={personalDetailsErrors.address?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Pincode */}
            <Controller
              name="pincode"
              control={personalDetailsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Pincode *"
                  size="small"
                  margin="dense"
                  error={!!personalDetailsErrors.pincode}
                  helperText={personalDetailsErrors.pincode?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            {/* Hometown */}
            <Controller
              name="hometown"
              control={personalDetailsControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Hometown *"
                  size="small"
                  margin="dense"
                  error={!!personalDetailsErrors.hometown}
                  helperText={personalDetailsErrors.hometown?.message}
                  sx={{ mb: 3 }}
                />
              )}
            />

            {/* Work Permit for USA */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Work permit for USA
              </Typography>
              <Controller
                name="workPermitUSA"
                control={personalDetailsControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Select work permit"
                    size="small"
                    margin="dense"
                  >
                    <MenuItem value="">None</MenuItem>
                    {workPermitOptions.map((permit) => (
                      <MenuItem key={permit} value={permit}>
                        {permit}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Box>

            {/* Work Permit for Other Countries */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Work permit for other countries
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                You can choose 3 countries at max
              </Typography>
              <Controller
                name="workPermitOtherCountries"
                control={personalDetailsControl}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    options={countries}
                    value={field.value || []}
                    onChange={(_, newValue) => {
                      if (newValue.length <= 3) {
                        field.onChange(newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select countries"
                        size="small"
                        placeholder="Choose up to 3 countries"
                      />
                    )}
                  />
                )}
              />
            </Box>

            {/* Language Proficiency */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Language proficiency
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Strengthen your resume by letting recruiters know you can communicate in multiple languages
              </Typography>

              {languages.map((language, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">
                      Language {index + 1} *
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveLanguage(index)}
                      disabled={languages.length === 1}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Language *"
                        size="small"
                        value={language.language}
                        onChange={(e) => handleLanguageChange(index, 'language', e.target.value)}
                        error={!!personalDetailsErrors.languages?.[index]?.language}
                      >
                        {languagesList.map((lang) => (
                          <MenuItem key={lang} value={lang}>
                            {lang}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        select
                        fullWidth
                        label="Proficiency *"
                        size="small"
                        value={language.proficiency}
                        onChange={(e) => handleLanguageChange(index, 'proficiency', e.target.value)}
                        error={!!personalDetailsErrors.languages?.[index]?.proficiency}
                      >
                        {proficiencyLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12}>
                      <FormLabel component="legend">Skills</FormLabel>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={language.read}
                              onChange={(e) => handleLanguageChange(index, 'read', e.target.checked)}
                            />
                          }
                          label="Read"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={language.write}
                              onChange={(e) => handleLanguageChange(index, 'write', e.target.checked)}
                            />
                          }
                          label="Write"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={language.speak}
                              onChange={(e) => handleLanguageChange(index, 'speak', e.target.checked)}
                            />
                          }
                          label="Speak"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ))}

              <Button
                startIcon={<Add />}
                onClick={handleAddLanguage}
                variant="outlined"
                size="small"
              >
                Add another language
              </Button>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handlePersonalDetailsClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPersonalDetailsSubmitting}
            >
              {isPersonalDetailsSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default JobSeekerDashboard;