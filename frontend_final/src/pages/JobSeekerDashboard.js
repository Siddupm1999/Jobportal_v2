'use client';

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
  Tab,
  Tabs,
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
    .test('min-words', 'Minimum 5 words', value => (value || '').split(/\s+/).filter(w => w).length >= 5),
});

const JobSeekerDashboard = () => {
  const { user, setUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar(); 

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [openHeadline, setOpenHeadline] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePic || null);
  const [resume, setResume] = useState(user?.resume || null);
  const [headline, setHeadline] = useState(user?.headline || '');

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
    defaultValues: { headline: headline },
  });

  const watchedHeadline = watch('headline', '');
  const charLeft = 176 - (watchedHeadline?.length || 0);

  // ---------- Data fetching ----------
  const fetchApplications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await axios.get('http://localhost:5000/api/jobs');
      const allApplications = data.jobs
        .flatMap(job =>
          job.applications
            .filter(app => app.jobSeeker === user.id)
            .map(app => ({ ...app, jobDetails: job }))
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
      resetHeadline({ headline: user.headline || '' });
    }
  }, [user, fetchApplications, fetchSavedJobs, reset, resetHeadline]);

  // ---------- Helpers ----------
  const getStatusColor = status => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'reviewed': return 'info';
      default: return 'default';
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

  // ---------- Form submit ----------
  const onSubmit = async data => {
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

  const onHeadlineSubmit = async data => {
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

  // ---------- Image upload ----------
  const handleImageUpload = async e => {
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
  const handleResumeUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/rtf',
    ];

    if (!allowedTypes.includes(file.type)) {
      enqueueSnackbar('Only .doc, .docx, .pdf, .rtf allowed', { variant: 'warning' });
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
        <Typography variant="h6" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} aria-label="dashboard tabs">
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">{app.jobDetails.title}</Typography>
                      <Typography color="primary" gutterBottom>
                        {app.jobDetails.company}
                      </Typography>
                      <Typography color="text.secondary">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
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
            savedJobs.map(job => (
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

      {/* ==== Profile ==== */}
      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            My Profile
          </Typography>
          <Card sx={{ p: 3 }}>
            {/* Profile Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative' }}>
              <Avatar
                src={profilePic || undefined}
                sx={{ width: 90, height: 90, mr: 3, fontSize: 36 }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6">{user.name}</Typography>
                <Typography color="text.secondary">{user.designation}</Typography>
                <Typography color="text.secondary">{user.company}</Typography>
              </Box>

              <IconButton
                color="primary"
                onClick={handleEditOpen}
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>

              <input
                accept="image/*"
                type="file"
                id="profile-pic-upload"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <label htmlFor="profile-pic-upload">
                <IconButton
                  component="span"
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 70,
                    bgcolor: 'background.paper',
                    boxShadow: 1,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                  disabled={uploading}
                >
                  {uploading ? <CircularProgress size={16} /> : <CameraAlt fontSize="small" />}
                </IconButton>
              </label>
            </Box>

            {/* Profile Details */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Email:</strong> {user.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Mobile:</strong> {user.mobile || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Location:</strong> {user.location || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Experience:</strong> {user.experience || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Salary:</strong> ₹{user.salary || '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Notice Period:</strong> {user.noticePeriod || '—'}</Typography>
              </Grid>
            </Grid>

            {/* ==== RESUME SECTION ==== */}
            <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: 2, p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resume
              </Typography>

              {resume ? (
                <Box sx={{ mb: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="text.primary">
                      {resume.filename}
                    </Typography>
                    <Link href={resume.url} target="_blank" rel="noopener">
                      <IconButton size="small" color="primary">
                        <Download fontSize="small" />
                      </IconButton>
                    </Link>
                    <IconButton size="small" color="error" onClick={handleDeleteResume}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No resume uploaded
                </Typography>
              )}

              <Box sx={{ textAlign: 'center' }}>
                <input
                  accept=".pdf,.doc,.docx,.rtf"
                  type="file"
                  id="resume-upload"
                  style={{ display: 'none' }}
                  onChange={handleResumeUpload}
                />
                <label htmlFor="resume-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={uploadingResume ? <CircularProgress size={16} /> : <CloudUpload />}
                    disabled={uploadingResume}
                  >
                    {uploadingResume ? 'Uploading...' : 'Update Resume'}
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Supported Formats: .doc, .docx, .pdf, .rtf, up to 2 MB
                </Typography>
              </Box>
            </Box>

            {/* ==== RESUME HEADLINE ==== */}
            <Box sx={{ p: 3, border: '1px solid', borderColor: 'grey.300', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">Resume headline</Typography>
                <IconButton size="small" onClick={handleHeadlineOpen}>
                  <Edit fontSize="small" />
                </IconButton>
              </Box>
              <Typography variant="body1" color="primary">
                {headline || 'No headline set'}
              </Typography>
            </Box>
          </Card>
        </Box>
      )}

      {/* ==== Edit Profile Dialog ==== */}
      <Dialog open={openEdit} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>
          Edit Profile
        </DialogTitle>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Designation"
                      error={!!errors.designation}
                      helperText={errors.designation?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="company"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Current Company"
                      error={!!errors.company}
                      helperText={errors.company?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="experience"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Experience"
                      error={!!errors.experience}
                      helperText={errors.experience?.message}
                      placeholder="e.g. 2 Years"
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="salary"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Current Salary (₹)"
                      type="number"
                      error={!!errors.salary}
                      helperText={errors.salary?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Location"
                      error={!!errors.location}
                      helperText={errors.location?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      label="Mobile"
                      error={!!errors.mobile}
                      helperText={errors.mobile?.message || '10-digit Indian number'}
                      required
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="noticePeriod"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth size="small" error={!!errors.noticePeriod}>
                      <InputLabel>Notice Period</InputLabel>
                      <Select {...field} label="Notice Period">
                        <MenuItem value="15 Days or less">15 Days or less</MenuItem>
                        <MenuItem value="1 Month">1 Month</MenuItem>
                        <MenuItem value="2 Months">2 Months</MenuItem>
                        <MenuItem value="3 Months">3 Months</MenuItem>
                        <MenuItem value="More than 3 Months">More than 3 Months</MenuItem>
                      </Select>
                      {errors.noticePeriod && (
                        <Typography variant="caption" color="error">
                          {errors.noticePeriod.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
            <Button onClick={handleEditClose} variant="outlined" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==== Resume Headline Dialog ==== */}
      <Dialog open={openHeadline} onClose={handleHeadlineClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleHeadlineSubmit(onHeadlineSubmit)}>
          <DialogTitle>Resume headline</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              It is the first thing recruiters notice in your profile. Write a concise headline introducing yourself to employers. (Minimum 5 words)
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
                  placeholder="e.g. Full Stack Developer | 2 Years Experience in React.js, Node.js, PostgreSQL"
                  error={!!headlineErrors.headline}
                  helperText={headlineErrors.headline?.message || `${charLeft} character(s) left`}
                />
              )}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
            <Button onClick={handleHeadlineClose} disabled={isHeadlineSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isHeadlineSubmitting || charLeft < 0}
            >
              {isHeadlineSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default JobSeekerDashboard;