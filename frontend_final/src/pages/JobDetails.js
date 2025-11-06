import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { LocationOn, Business, Schedule, AttachMoney } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [application, setApplication] = useState({
    resume: '',
    coverLetter: ''
  });

  // useCallback added
  const fetchJobDetails = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  }, [id]);

  // Now dependency is correct
  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleApply = async () => {
    try {
      await axios.post(`http://localhost:5000/api/jobs/${id}/apply`, application);
      setApplyDialogOpen(false);
      alert('Application submitted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting application');
    }
  };

  if (!job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Job Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {job.title}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {job.company}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{job.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Business sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{job.jobType}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography>{job.experience}</Typography>
                </Box>
                {job.salary && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography>
                      ${job.salary.min} - ${job.salary.max}
                    </Typography>
                  </Box>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Typography paragraph>{job.description}</Typography>

              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Typography paragraph>{job.requirements}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              {user?.role === 'jobseeker' ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => setApplyDialogOpen(true)}
                >
                  Apply Now
                </Button>
              ) : user ? (
                <Typography color="text.secondary" align="center">
                  Employers cannot apply for jobs
                </Typography>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => (window.location.href = '/login')}
                >
                  Login to Apply
                </Button>
              )}

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Job Overview
                </Typography>
                <Typography><strong>Category:</strong> {job.category}</Typography>
                <Typography><strong>Experience:</strong> {job.experience}</Typography>
                <Typography><strong>Job Type:</strong> {job.jobType}</Typography>
                <Typography><strong>Posted:</strong> {new Date(job.createdAt).toLocaleDateString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Application Dialog */}
      <Dialog open={applyDialogOpen} onClose={() => setApplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Apply for {job.title}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Resume URL"
            value={application.resume}
            onChange={(e) => setApplication(prev => ({ ...prev, resume: e.target.value }))}
            margin="normal"
            helperText="Provide a link to your resume (Google Drive, Dropbox, etc.)"
          />
          <TextField
            fullWidth
            label="Cover Letter"
            multiline
            rows={4}
            value={application.coverLetter}
            onChange={(e) => setApplication(prev => ({ ...prev, coverLetter: e.target.value }))}
            margin="normal"
            helperText="Explain why you're a good fit for this position"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails;
