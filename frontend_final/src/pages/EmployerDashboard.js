import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Tab,
  Tabs,
  Paper,
  Stack,
  CardActions,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  People,
  Work,
  LocationOn,
  AttachMoney,
  Schedule,
  TrendingUp,
  CheckCircle,
  Cancel,
  Visibility,
  Edit,
  Delete,
  Close,
  Business,
  Description,
  School,
  AccessTime,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newJobDialog, setNewJobDialog] = useState(false);
  const [editJobDialog, setEditJobDialog] = useState(false);
  const [viewJobDialog, setViewJobDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [errors, setErrors] = useState({});

  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    description: '',
    salary: { min: '', max: '', currency: 'USD' },
    jobType: 'Full-time',
    experience: 'Entry Level',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchEmployerJobs = useCallback(async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/jobs/employer/my-jobs',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Ensure each job has an applications array
      const jobsWithApplications = response.data.jobs.map((job) => ({
        ...job,
        applications: job.applications || [], // Provide empty array if applications is undefined
      }));

      setJobs(jobsWithApplications);
      console.log('Fetched employer jobs:', jobsWithApplications);
    } catch (error) {
      console.error('Error fetching employer jobs:', error);
      showSnackbar('Error fetching jobs', 'error');
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/applications/employer',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setApplications(response.data.applications || []); // Ensure applications is an array
      console.log('Fetched employer applications:', response.data.applications);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showSnackbar('Error fetching applications', 'error');
    }
  }, []);

  useEffect(() => {
    fetchEmployerJobs();
    fetchApplications();
  }, [fetchEmployerJobs, fetchApplications]);

  // Validation function
  const validateJob = (job) => {
    const newErrors = {};

    if (!job.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!job.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!job.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!job.salary.min || job.salary.min < 0) {
      newErrors.minSalary = 'Minimum salary must be a positive number';
    }

    if (!job.salary.max || job.salary.max < 0) {
      newErrors.maxSalary = 'Maximum salary must be a positive number';
    }

    if (
      job.salary.min &&
      job.salary.max &&
      parseInt(job.salary.min) > parseInt(job.salary.max)
    ) {
      newErrors.maxSalary =
        'Maximum salary must be greater than minimum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CREATE Job
  const handleCreateJob = async () => {
    if (!validateJob(newJob)) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }

    try {
      // Safely get company name from user object
      const companyName = user?.profile?.company || user?.name || 'Your Company';
      
      await axios.post(
        'http://localhost:5000/api/jobs',
        {
          ...newJob,
          company: companyName,
          salary: {
            min: parseInt(newJob.salary.min),
            max: parseInt(newJob.salary.max),
            currency: 'USD',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setNewJobDialog(false);
      setNewJob({
        title: '',
        location: '',
        description: '',
        salary: { min: '', max: '', currency: 'USD' },
        jobType: 'Full-time',
        experience: 'Entry Level',
      });
      setErrors({});
      fetchEmployerJobs();
      showSnackbar('Job posted successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      showSnackbar('Error creating job', 'error');
    }
  };

  // UPDATE Job
  const handleEditJob = async () => {
    if (!validateJob(editingJob)) {
      showSnackbar('Please fix the validation errors', 'error');
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/jobs/${editingJob._id}`,
        {
          ...editingJob,
          salary: {
            min: parseInt(editingJob.salary.min),
            max: parseInt(editingJob.salary.max),
            currency: 'USD',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setEditJobDialog(false);
      setEditingJob(null);
      setErrors({});
      fetchEmployerJobs();
      showSnackbar('Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      showSnackbar('Error updating job', 'error');
    }
  };

  // DELETE Job
  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`http://localhost:5000/api/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        fetchEmployerJobs();
        showSnackbar('Job deleted successfully!');
      } catch (error) {
        console.error('Error deleting job:', error);
        showSnackbar('Error deleting job', 'error');
      }
    }
  };

  // Open edit dialog
  const handleEditClick = (job) => {
    setEditingJob({
      ...job,
      salary: {
        min: job.salary.min.toString(),
        max: job.salary.max.toString(),
        currency: job.salary.currency,
      },
    });
    setEditJobDialog(true);
    setErrors({});
  };

  // Open view details dialog
  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setViewJobDialog(true);
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/applications/${applicationId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchApplications();
      showSnackbar(`Application ${status} successfully!`);
    } catch (error) {
      console.error('Error updating application:', error);
      showSnackbar('Error updating application', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Required field indicator
  const RequiredStar = () => (
    <span style={{ color: 'red', marginLeft: 2 }}>*</span>
  );

  // Get applications count safely
  const getApplicationsCount = (job) => {
    return job.applications?.length || 0;
  };

  // Safely get company name
  const getCompanyName = (job) => {
    return job?.company || user?.profile?.company || user?.name || 'Your Company';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 6,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Employer Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Manage your job postings and applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={() => setNewJobDialog(true)}
          sx={{
            px: 1,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem',
            boxShadow: 3,
          }}
        >
          Post New Job
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'black',
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '2.5rem', md: '3rem' } }}
                  >
                    {jobs.length}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '1rem', md: '1.25rem' },
                    }}
                  >
                    Active Jobs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 3,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'black',
              height: '70%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '2.5rem', md: '3rem' } }}
                  >
                    {applications.length}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      opacity: 0.9,
                      fontSize: { xs: '1rem', md: '1.25rem' },
                    }}
                  >
                    Total Applications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Paper
        sx={{
          width: '100%',
          borderRadius: 4,
          boxShadow: 3,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                py: 2,
                px: 4,
              },
            }}
          >
            <Tab
              icon={<Work sx={{ mr: 1 }} />}
              iconPosition="start"
              label="My Jobs"
            />
            <Tab
              icon={<People sx={{ mr: 1 }} />}
              iconPosition="start"
              label={`Applications (${applications.length})`}
            />
          </Tabs>
        </Box>

        {/* Jobs Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                My Job Postings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} posted
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} key={job._id}>
                  <Card
                    sx={{
                      borderRadius: '35px',
                      boxShadow: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="h5"
                              fontWeight="bold"
                              sx={{ mr: 2 }}
                            >
                              {job.title}
                            </Typography>
                            <Chip
                              label={job.isActive ? 'Active' : 'Inactive'}
                              color={job.isActive ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          <Stack
                            direction="row"
                            spacing={3}
                            sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationOn
                                sx={{
                                  fontSize: 20,
                                  color: 'text.secondary',
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {job.location}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Schedule
                                sx={{
                                  fontSize: 20,
                                  color: 'text.secondary',
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {job.jobType}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TrendingUp
                                sx={{
                                  fontSize: 20,
                                  color: 'text.secondary',
                                  mr: 1,
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {job.experience}
                              </Typography>
                            </Box>
                          </Stack>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AttachMoney
                                sx={{ color: 'black.main', mr: 1 }}
                              />
                              <Typography
                                variant="h6"
                                color="black.main"
                                fontWeight="bold"
                              >
                                ${job.salary.min} - ${job.salary.max}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="black"
                              fontWeight="medium"
                            >
                              {getApplicationsCount(job)} application
                              {getApplicationsCount(job) !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 14}}>
                      <Tooltip title="View Details">
                        <IconButton
                          color="dark"
                          onClick={() => handleViewDetails(job)}
                          sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'dark.main',
                            '&:hover': {
                              backgroundColor: 'success.light',
                              color: 'white',
                            },
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Job">
                        <IconButton
                          color="dark"
                          onClick={() => handleEditClick(job)}
                          sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'dark.main',
                            '&:hover': {
                              backgroundColor: 'info.light',
                              color: 'white', 
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Job">
                        <IconButton
                          color="dark"
                          onClick={() => handleDeleteJob(job._id)}
                          sx={{
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'dark.main',
                            '&:hover': {
                              backgroundColor: 'error.light',
                              color: 'white', 
                              paddingBottom: '14px', 
                            },
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Applications Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                Job Applications
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {applications.length} application
                {applications.length !== 1 ? 's' : ''} received
              </Typography>
            </Box>

            <Stack spacing={3}>
              {applications.map((app, index) => (
                <Card
                  key={index}
                  sx={{
                    borderRadius: 3,
                    boxShadow: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {app.jobTitle}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={3}
                          sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Applicant: {app.applicant?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Applied:{' '}
                            {new Date(app.appliedAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              }
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Email: {app.applicant?.email || 'N/A'}
                          </Typography>
                        </Stack>

                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                        >
                          <Chip
                            label={
                              app.status.charAt(0).toUpperCase() +
                              app.status.slice(1)
                            }
                            color={getStatusColor(app.status)}
                            variant="filled"
                            size="medium"
                          />

                          {app.status === 'pending' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Accept Application">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() =>
                                    updateApplicationStatus(app._id, 'accepted')
                                  }
                                  sx={{
                                    bgcolor: 'success.light',
                                    '&:hover': { bgcolor: 'success.main' },
                                    color: 'white',
                                  }}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Application">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    updateApplicationStatus(app._id, 'rejected')
                                  }
                                  sx={{
                                    bgcolor: 'error.light',
                                    '&:hover': { bgcolor: 'error.main' },
                                    color: 'white',
                                  }}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>

      {/* View Job Details Dialog */}
      <Dialog
        open={viewJobDialog}
        onClose={() => setViewJobDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            py: 3,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={() => setViewJobDialog(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'gray',
            }}
          >
            <Close />
          </IconButton>
          <Box sx={{ textAlign: 'left' }}>
            <Typography
              component="div"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2563eb',
                lineHeight: 1.2,
              }}
            >
              Job Details
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            background: 'white',
          }}
        >
          {selectedJob && (
            <Box sx={{ p: 3 }}>
              {/* Job Title and Status */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {selectedJob.title}
                </Typography>
                <Chip
                  label={selectedJob.isActive ? 'Active' : 'Inactive'}
                  color={selectedJob.isActive ? 'success' : 'default'}
                  size="medium"
                />
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Job Information - Side by Side Layout */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {/* Company and Location */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Business color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Company
                      </Typography>
                      <Typography variant="body1">
                        {getCompanyName(selectedJob)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {selectedJob.location}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Salary and Job Type */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AttachMoney color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Salary Range
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="success.main"
                      >
                        ${selectedJob.salary.min} - ${selectedJob.salary.max}{' '}
                        {selectedJob.salary.currency}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Schedule color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Job Type
                      </Typography>
                      <Typography variant="body1">
                        {selectedJob.jobType}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Experience and Posted Date */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TrendingUp color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Experience Level
                      </Typography>
                      <Typography variant="body1">
                        {selectedJob.experience}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTime color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Posted On
                      </Typography>
                      <Typography variant="body1">
                        {new Date(selectedJob.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Applications Count */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        fontWeight="bold"
                      >
                        Applications Received
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary"
                      >
                        {getApplicationsCount(selectedJob)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              {/* Job Description */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  color="primary"
                >
                  <Description sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Job Description
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    maxHeight: '300px',
                    overflowY: 'auto',
                  }}
                >
                  <Typography
                    variant="body1"
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {selectedJob.description}
                  </Typography>
                </Paper>
              </Box>

              {/* Skills/Requirements Section */}
              {selectedJob.skills && selectedJob.skills.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    color="primary"
                  >
                    <School sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Required Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedJob.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            gap: 2,
            background: 'white',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Button
            onClick={() => setViewJobDialog(false)}
            variant="outlined"
            size="medium"
            sx={{
              borderRadius: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            CLOSE
          </Button>
          {selectedJob && (
            <Button
              onClick={() => {
                setViewJobDialog(false);
                handleEditClick(selectedJob);
              }}
              variant="contained"
              size="medium"
              sx={{
                borderRadius: 1,
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
              }}
            >
              EDIT JOB
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* New Job Dialog */}
      <Dialog
        open={newJobDialog}
        onClose={() => setNewJobDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            py: 3,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={() => setNewJobDialog(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'gray',
            }}
          >
            <Close />
          </IconButton>
          <Box sx={{ textAlign: 'left' }}>
            <Typography
              component="div"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#2563eb',
                lineHeight: 1.2,
              }}
            >
              Create A New Job Posting
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            background: 'white',
            '& .MuiGrid-container': {
              p: 3,
            },
          }}
        >
          <Grid container spacing={2}>
            {/* Job Title */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="black"
                gutterBottom
              >
                Job Title <RequiredStar />
              </Typography>
              <TextField
                fullWidth
                value={newJob.title}
                onChange={(e) =>
                  setNewJob({ ...newJob, title: e.target.value })
                }
                variant="outlined"
                size="small"
                placeholder="Enter job title"
                error={!!errors.title}
                helperText={errors.title}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: 'white',
                    '& input::placeholder': {
                      fontSize: '0.875rem',
                      padding: '4px',
                    },
                  },
                }}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="black"
                gutterBottom
              >
                Location <RequiredStar />
              </Typography>
              <TextField
                fullWidth
                value={newJob.location}
                onChange={(e) =>
                  setNewJob({ ...newJob, location: e.target.value })
                }
                variant="outlined"
                size="small"
                placeholder="Enter location"
                error={!!errors.location}
                helperText={errors.location}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: 'white',
                    '& input::placeholder': {
                      fontSize: '0.875rem',
                      padding: '4px',
                    },
                  },
                }}
              />
            </Grid>

            {/* Job Type */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="black"
                gutterBottom
              >
                Job Type
              </Typography>
              <FormControl fullWidth variant="outlined" size="small">
                <Select
                  value={newJob.jobType}
                  onChange={(e) =>
                    setNewJob({ ...newJob, jobType: e.target.value })
                  }
                  sx={{
                    borderRadius: 1,
                    backgroundColor: 'white',
                  }}
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Experience Level */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="black"
                gutterBottom
              >
                Experience Level
              </Typography>
              <FormControl fullWidth variant="outlined" size="small">
                <Select
                  value={newJob.experience}
                  onChange={(e) =>
                    setNewJob({ ...newJob, experience: e.target.value })
                  }
                  sx={{
                    borderRadius: 1,
                    backgroundColor: 'white',
                  }}
                >
                  <MenuItem value="Entry Level">Entry Level</MenuItem>
                  <MenuItem value="Mid Level">Mid Level</MenuItem>
                  <MenuItem value="Senior Level">Senior Level</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Salary Range */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="black"
                gutterBottom
              >
                Salary Range <RequiredStar />
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  type="number"
                  value={newJob.salary.min}
                  onChange={(e) =>
                    setNewJob({
                      ...newJob,
                      salary: { ...newJob.salary, min: e.target.value },
                    })
                  }
                  variant="outlined"
                  size="small"
                  placeholder="Min"
                  error={!!errors.minSalary}
                  helperText={errors.minSalary}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white',
                      '& input::placeholder': {
                        fontSize: '0.875rem',
                        padding: '4px',
                      },
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mx: 1 }}
                >
                  to
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={newJob.salary.max}
                  onChange={(e) =>
                    setNewJob({
                      ...newJob,
                      salary: { ...newJob.salary, max: e.target.value },
                    })
                  }
                  variant="outlined"
                  size="small"
                  placeholder="Max"
                  error={!!errors.maxSalary}
                  helperText={errors.maxSalary}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white',
                      '& input::placeholder': {
                        fontSize: '0.875rem',
                        padding: '4px',
                      },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Job Description */}
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="black"
                gutterBottom
              >
                Job Description <RequiredStar />
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={newJob.description}
                onChange={(e) =>
                  setNewJob({ ...newJob, description: e.target.value })
                }
                variant="outlined"
                size="small"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                error={!!errors.description}
                helperText={errors.description}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    backgroundColor: 'white',
                    '& textarea::placeholder': {
                      fontSize: '0.875rem',
                      padding: '4px',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            gap: 2,
            background: 'white',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Button
            onClick={() => {
              setNewJobDialog(false);
              setErrors({});
            }}
            variant="outlined"
            size="medium"
            sx={{
              borderRadius: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleCreateJob}
            variant="contained"
            size="medium"
            sx={{
              borderRadius: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            POST JOB
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog
        open={editJobDialog}
        onClose={() => setEditJobDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'white',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            py: 3,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={() => setEditJobDialog(false)}
            sx={{
              position: 'absolute',
              left: 16,
              top: 16,
              color: 'gray',
            }}
          >
            <Close />
          </IconButton>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              component="div"
              sx={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'blue',
                lineHeight: 1.2,
              }}
            >
              Edit Job Posting
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 0,
            background: 'white',
            '& .MuiGrid-container': {
              p: 3,
            },
          }}
        >
          {editingJob && (
            <Grid container spacing={2}>
              {/* Job Title */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="black"
                  gutterBottom
                >
                  Job Title <RequiredStar />
                </Typography>
                <TextField
                  fullWidth
                  value={editingJob.title}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, title: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  placeholder="Enter job title"
                  error={!!errors.title}
                  helperText={errors.title}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white',
                      '& input::placeholder': {
                        fontSize: '0.875rem',
                        padding: '4px',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="black"
                  gutterBottom
                >
                  Location <RequiredStar />
                </Typography>
                <TextField
                  fullWidth
                  value={editingJob.location}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, location: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  placeholder="Enter location"
                  error={!!errors.location}
                  helperText={errors.location}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white',
                      '& input::placeholder': {
                        fontSize: '0.875rem',
                        padding: '4px',
                      },
                    },
                  }}
                />
              </Grid>

              {/* Job Type */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="black"
                  gutterBottom
                >
                  Job Type
                </Typography>
                <FormControl fullWidth variant="outlined" size="small">
                  <Select
                    value={editingJob.jobType}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, jobType: e.target.value })
                    }
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'white',
                    }}
                  >
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                    <MenuItem value="Remote">Remote</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Experience Level */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="black"
                  gutterBottom
                >
                  Experience Level
                </Typography>
                <FormControl fullWidth variant="outlined" size="small">
                  <Select
                    value={editingJob.experience}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        experience: e.target.value,
                      })
                    }
                    sx={{
                      borderRadius: 1,
                      backgroundColor: 'white',
                    }}
                  >
                    <MenuItem value="Entry Level">Entry Level</MenuItem>
                    <MenuItem value="Mid Level">Mid Level</MenuItem>
                    <MenuItem value="Senior Level">Senior Level</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Salary Range */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="black"
                  gutterBottom
                >
                  Salary Range <RequiredStar />
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    type="number"
                    value={editingJob.salary.min}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        salary: { ...editingJob.salary, min: e.target.value },
                      })
                    }
                    variant="outlined"
                    size="small"
                    placeholder="Min"
                    error={!!errors.minSalary}
                    helperText={errors.minSalary}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        backgroundColor: 'white',
                        '& input::placeholder': {
                          fontSize: '0.875rem',
                          padding: '4px',
                        },
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mx: 1 }}
                  >
                    to
                  </Typography>
                  <TextField
                    fullWidth
                    type="number"
                    value={editingJob.salary.max}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        salary: { ...editingJob.salary, max: e.target.value },
                      })
                    }
                    variant="outlined"
                    size="small"
                    placeholder="Max"
                    error={!!errors.maxSalary}
                    helperText={errors.maxSalary}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        backgroundColor: 'white',
                        '& input::placeholder': {
                          fontSize: '0.875rem',
                        },
                      },
                    }}
                  />
                </Box>
              </Grid>

              {/* Job Description */}
              <Grid item xs={12}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="black"
                  gutterBottom
                >
                  Job Description <RequiredStar />
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editingJob.description}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      description: e.target.value,
                    })
                  }
                  variant="outlined"
                  size="small"
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  error={!!errors.description}
                  helperText={errors.description}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: 'white',
                      '& textarea::placeholder': {
                        fontSize: '0.875rem',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            gap: 2,
            background: 'white',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
          }}
        >
          <Button
            onClick={() => {
              setEditJobDialog(false);
              setErrors({});
            }}
            variant="outlined"
            size="medium"
            sx={{
              borderRadius: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleEditJob}
            variant="contained"
            size="medium"
            sx={{
              borderRadius: 1,
              px: 3,
              textTransform: 'none',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              },
            }}
          >
            UPDATE JOB
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EmployerDashboard;