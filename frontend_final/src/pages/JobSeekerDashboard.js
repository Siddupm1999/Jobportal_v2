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

const JobSeekerDashboard = () => {
  const { user, setUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

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

  const watchedHeadline = watch('headline', '');
  const charLeft = 176 - (watchedHeadline?.length || 0);
  const currentSkills = watchSkills('skills') || [];

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

  // ---------- Data fetching ----------
  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await axios.get('http://localhost:5000/api/jobs');
      const allApplications = data.jobs.flatMap((job) =>
        job.applications
          .filter((app) => app.jobSeeker === user.id)
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

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
      fetchSavedJobs();
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
    }
  }, [user, fetchApplications, fetchSavedJobs, reset, resetHeadline, setValue]);

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

  // ---------- Form submit ----------
  const onSubmit = async (data) => {
    try {
      const payload = { ...data, profilePic };
      const { data: updatedUser } = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        payload
      );
      setUser(updatedUser);
      enqueueSnackbar('Profile updated successfully!', { variant: 'success' });
      handleEditClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  };

  const onHeadlineSubmit = async (data) => {
    try {
      const { data: updatedUser } = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        { headline: data.headline }
      );
      setUser(updatedUser);
      setHeadline(data.headline);
      enqueueSnackbar('Headline updated!', { variant: 'success' });
      handleHeadlineClose();
    } catch (err) {
      enqueueSnackbar('Failed to update headline', { variant: 'error' });
    }
  };

  const onSkillsSubmit = async (data) => {
    try {
      const { data: updatedUser } = await axios.put(
        `http://localhost:5000/api/users/${user.id}`,
        { skills: data.skills }
      );
      setUser(updatedUser);
      setSkills(data.skills);
      enqueueSnackbar('Skills updated!', { variant: 'success' });
      handleSkillsClose();
    } catch (err) {
      enqueueSnackbar('Failed to update skills', { variant: 'error' });
    }
  };

  // ---------- Image upload ----------
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
      const { data } = await axios.post(
        `http://localhost:5000/api/users/${user.id}/upload-pic`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setProfilePic(data.profilePic);
      enqueueSnackbar('Profile picture updated!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to upload image', { variant: 'error' });
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
    ];
    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar('Only .doc, .docx, .pdf, .rtf allowed', {
        variant: 'warning',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      enqueueSnackbar('Resume must be under 2 MB', { variant: 'warning' });
      return;
    }
    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/users/${user.id}/upload-resume`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setResume(data.resume);
      enqueueSnackbar('Resume updated successfully!', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Failed to upload resume', { variant: 'error' });
    } finally {
      setUploadingResume(false);
    }
  };

  // ---------- Delete resume ----------
  const handleDeleteResume = async () => {
    if (!resume) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${user.id}/resume`);
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

      {/* ==== Profile (Compact, 50% Width) ==== */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            My Profile
          </Typography>

          <Grid container>
            <Grid item xs={12} lg={6}>
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
                  <Avatar
                    src={profilePic || undefined}
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
                      accept=".pdf,.doc,.docx,.rtf"
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
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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

      {/* Key Skills Dialog - ESLint Fixed */}
      <Dialog open={openSkills} onClose={handleSkillsClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSkillsSubmit(onSkillsSubmit)}>
          <DialogTitle>Key skills</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add skills that best define your expertise, for e.g. Direct Marketing, Oracle, Java, etc. (Minimum 1)
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
                  variant={currentSkills.includes(skill) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>

            {skillsErrors.skills && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
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
    </Container>
  );
};

export default JobSeekerDashboard;