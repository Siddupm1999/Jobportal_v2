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
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tab,
  Tabs
} from '@mui/material';
import { Add, Business, People, Work } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newJobDialog, setNewJobDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    requirements: '',
    salary: { min: '', max: '', currency: 'USD' },
    jobType: 'Full-time',
    category: 'IT',
    experience: 'Entry Level'
  });

  // useCallback hooks to stabilize dependencies
  const fetchEmployerJobs = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      const employerJobs = response.data.jobs.filter(job => job.employer._id === user.id);
      setJobs(employerJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, [user.id]);

  const fetchApplications = useCallback(async () => {
    try {
      const allJobs = await axios.get('http://localhost:5000/api/jobs');
      const employerJobs = allJobs.data.jobs.filter(job => job.employer._id === user.id);
      const allApplications = employerJobs.flatMap(job =>
        job.applications.map(app => ({ ...app, jobTitle: job.title }))
      );
      setApplications(allApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [user.id]);

  useEffect(() => {
    fetchEmployerJobs();
    fetchApplications();
  }, [fetchEmployerJobs, fetchApplications]);

  const handleCreateJob = async () => {
    try {
      await axios.post('http://localhost:5000/api/jobs', {
        ...newJob,
        company: user.profile?.company || user.name,
        salary: {
          min: parseInt(newJob.salary.min),
          max: parseInt(newJob.salary.max),
          currency: 'USD'
        }
      });
      setNewJobDialog(false);
      setNewJob({
        title: '',
        company: '',
        location: '',
        description: '',
        requirements: '',
        salary: { min: '', max: '', currency: 'USD' },
        jobType: 'Full-time',
        category: 'IT',
        experience: 'Entry Level'
      });
      fetchEmployerJobs();
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const updateApplicationStatus = async (jobId, applicationId, status) => {
    try {
      await axios.put(`/api/applications/${applicationId}`, { status });
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Employer Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setNewJobDialog(true)}
        >
          Post New Job
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{jobs.length}</Typography>
                  <Typography color="text.secondary">Active Jobs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 48, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{applications.length}</Typography>
                  <Typography color="text.secondary">Total Applications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Business sx={{ fontSize: 48, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{user.profile?.company || 'Your Company'}</Typography>
                  <Typography color="text.secondary">Company</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="My Jobs" />
          <Tab label="Applications" />
        </Tabs>
      </Box>

      {/* Jobs Tab */}
      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>My Job Postings</Typography>
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} key={job._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography color="text.secondary">
                          {job.location} • {job.jobType} • {job.applications.length} applications
                        </Typography>
                        <Chip
                          label={job.isActive ? 'Active' : 'Inactive'}
                          color={job.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Typography variant="h6" color="primary">
                        ${job.salary.min} - ${job.salary.max}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Applications Tab */}
      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>Job Applications</Typography>
          {applications.map((app, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">{app.jobTitle}</Typography>
                    <Typography color="text.secondary">
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </Typography>
                    <Chip
                      label={app.status}
                      color={
                        app.status === 'accepted'
                          ? 'success'
                          : app.status === 'rejected'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <Button
                      size="small"
                      onClick={() => updateApplicationStatus(app.jobId, app._id, 'accepted')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => updateApplicationStatus(app.jobId, app._id, 'rejected')}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* New Job Dialog */}
      <Dialog open={newJobDialog} onClose={() => setNewJobDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Post New Job</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                value={newJob.title}
                onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={newJob.location}
                onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={newJob.jobType}
                  label="Job Type"
                  onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                >
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  <MenuItem value="Contract">Contract</MenuItem>
                  <MenuItem value="Internship">Internship</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newJob.category}
                  label="Category"
                  onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                >
                  <MenuItem value="IT">IT</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Education">Education</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={newJob.experience}
                  label="Experience"
                  onChange={(e) => setNewJob({ ...newJob, experience: e.target.value })}
                >
                  <MenuItem value="Entry Level">Entry Level</MenuItem>
                  <MenuItem value="Mid Level">Mid Level</MenuItem>
                  <MenuItem value="Senior Level">Senior Level</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Min Salary"
                type="number"
                value={newJob.salary.min}
                onChange={(e) =>
                  setNewJob({
                    ...newJob,
                    salary: { ...newJob.salary, min: e.target.value }
                  })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Max Salary"
                type="number"
                value={newJob.salary.max}
                onChange={(e) =>
                  setNewJob({
                    ...newJob,
                    salary: { ...newJob.salary, max: e.target.value }
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Description"
                multiline
                rows={4}
                value={newJob.description}
                onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                multiline
                rows={4}
                value={newJob.requirements}
                onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewJobDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateJob} variant="contained">
            Post Job
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployerDashboard;
