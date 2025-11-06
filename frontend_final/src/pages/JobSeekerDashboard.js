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
  Tabs
} from '@mui/material';
import { Work, Bookmark, Person } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobSeekerDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Wrapped fetchApplications in useCallback
  const fetchApplications = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs');
      const allApplications = response.data.jobs.flatMap(job =>
        job.applications
          .filter(app => app.jobSeeker === user.id)
          .map(app => ({ ...app, jobDetails: job }))
      );
      setApplications(allApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [user.id]);

  //  Wrapped fetchSavedJobs in useCallback too
  const fetchSavedJobs = useCallback(async () => {
    // Implement saved jobs functionality (placeholder)
    setSavedJobs([]);
  }, []);

  //useEffect now depends on both callbacks
  useEffect(() => {
    fetchApplications();
    fetchSavedJobs();
  }, [fetchApplications, fetchSavedJobs]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'reviewed': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Job Seeker Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Work sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{applications.length}</Typography>
                  <Typography color="text.secondary">Applications</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Bookmark sx={{ fontSize: 48, color: 'secondary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{savedJobs.length}</Typography>
                  <Typography color="text.secondary">Saved Jobs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ fontSize: 48, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">Profile</Typography>
                  <Typography color="text.secondary">Completion: 75%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="My Applications" />
          <Tab label="Saved Jobs" />
          <Tab label="Profile" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>My Job Applications</Typography>
          {applications.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No applications yet
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  href="/jobs"
                >
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((app, index) => (
              <Card key={index} sx={{ mb: 2 }}>
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

      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>Saved Jobs</Typography>
          {savedJobs.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No saved jobs
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Save jobs you're interested in to apply later
                </Typography>
                <Button variant="contained" href="/jobs">
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>
          ) : (
            savedJobs.map((job) => (
              <Card key={job._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography color="primary" gutterBottom>
                    {job.company}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {job.location} • {job.jobType}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary">
                      ${job.salary.min} - ${job.salary.max}
                    </Typography>
                    <Button variant="contained">
                      Apply Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tabValue === 2 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>My Profile</Typography>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Personal Information</Typography>
                  <Typography><strong>Name:</strong> {user.name}</Typography>
                  <Typography><strong>Email:</strong> {user.email}</Typography>
                  <Typography><strong>Phone:</strong> {user.profile?.phone || 'Not provided'}</Typography>
                  <Typography><strong>Location:</strong> {user.profile?.address || 'Not provided'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Professional Information</Typography>
                  <Typography><strong>Experience:</strong> {user.profile?.experience || 'Not provided'}</Typography>
                  <Typography><strong>Education:</strong> {user.profile?.education || 'Not provided'}</Typography>
                  <Typography><strong>Skills:</strong> {user.profile?.skills?.join(', ') || 'Not provided'}</Typography>
                </Grid>
              </Grid>
              <Button variant="contained" sx={{ mt: 3 }}>
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default JobSeekerDashboard;
