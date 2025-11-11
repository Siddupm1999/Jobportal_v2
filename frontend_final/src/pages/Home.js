import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  Button,
  Box,
  TextField,
  FormControl,
  Chip,
  Select,
  MenuItem
} from '@mui/material';
import { Search, Business, Person, TrendingUp, Place, Work } from '@mui/icons-material';
import axios from 'axios';

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jobs?limit=6');
      setFeaturedJobs(response.data.jobs);
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      search: searchTerm,
      location: location,
      experience: experience
    }).toString();
    window.location.href = `/jobs?${params}`;
  };

  const getJobTypeColor = (jobType) => {
    const colors = {
      'Full-time': 'success',
      'Part-time': 'info',
      'Contract': 'warning',
      'Remote': 'secondary',
      'Internship': 'primary'
    };
    return colors[jobType] || 'default';
  };

  const features = [
    {
      icon: <Business sx={{ fontSize: 24, color: 'primary.main' }} />,
      title: 'Employers',
      description: 'Post jobs and find qualified candidates quickly with our advanced matching algorithm.',
      bgColor: 'primary.light'
    },
    {
      icon: <Person sx={{ fontSize: 24, color: 'secondary.main' }} />,
      title: 'Job Seekers',
      description: 'Find your perfect job from thousands of opportunities with personalized recommendations.',
      bgColor: 'secondary.light'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 24, color: 'success.main' }} />,
      title: 'Career Growth',
      description: 'Access career resources, skill assessments, and advance your professional journey.',
      bgColor: 'success.light'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 25%, #3730a3 50%, #4338ca 75%, #6366f1 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              Find Your Dream{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(45deg, #60a5fa, #a78bfa)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  textShadow: 'none'
                }}
              >
                Job's
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 3,
                opacity: 0.9,
                fontSize: { xs: '1rem', md: '1.1rem' },
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              Discover thousands of job opportunities from top companies worldwide
            </Typography>
          </Box>

          {/* Search Section */}
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              maxWidth: 908,
              mx: 'auto',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3,
              p: 2,
              boxShadow: '0 15px 30px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            <Grid container spacing={2} alignItems="end">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                    Job Title or Keyword
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Enter job title or keyword"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1.5,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        }
                      }
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                    Location
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    InputProps={{
                      startAdornment: <Place sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        borderRadius: 1.5,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main'
                        }
                      }
                    }}
                  />
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5, color: 'text.primary' }}>
                    Experience
                  </Typography>
                  <Select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: 'white',
                      borderRadius: 1.5,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.23)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
                    }}
                    startAdornment={<Work sx={{ mr: 1, color: 'primary.main' }} />}
                  >
                    <MenuItem value="">Select experience</MenuItem>
                    <MenuItem value="0-1 Years">0-1 Years</MenuItem>
                    <MenuItem value="1-3 Years">1-3 Years</MenuItem>
                    <MenuItem value="3-5 Years">3-5 Years</MenuItem>
                    <MenuItem value="5+ Years">5+ Years</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={1}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{
                    height: '40px',
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    background: 'linear-gradient(45deg, #1e3a8a, #3730a3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1e40af, #4f46e5)',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  SEARCH
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Why Choose JobPortal?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              We provide the best platform for both job seekers and employers to connect and grow together
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'center' }}>
            {features.map((feature, index) => (
              <Card
                key={index}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  flex: 1,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }
                }}
              >
                <Box>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      backgroundColor: feature.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 1.5
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Featured Jobs */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
              Featured Jobs
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Hand-picked opportunities from top companies
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {featuredJobs.map((job) => (
              <Grid item xs={12} md={6} lg={4} key={job._id}>
                <Card
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease-in-out',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 20px rgba(0,0,0,0.12)', borderColor: 'primary.main' }
                  }}
                  onClick={() => (window.location.href = `/jobs/${job._id}`)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'start', mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 45,
                        height: 45,
                        borderRadius: 1.5,
                        background: 'linear-gradient(45deg, #1e3a8a, #3730a3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        mr: 1.5
                      }}
                    >
                      {job.company?.charAt(0)?.toUpperCase() || 'C'}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {job.title}
                      </Typography>
                      <Typography color="primary" sx={{ fontWeight: 500, fontSize: '0.9rem' }}>
                        {job.company}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 1.5 }}>
                    <Chip label={job.jobType} color={getJobTypeColor(job.jobType)} size="small" sx={{ mr: 1, mb: 1 }} />
                    <Chip label={job.experience} variant="outlined" size="small" sx={{ mb: 1 }} />
                  </Box>

                  <Typography color="text.secondary" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                    {job.description.substring(0, 100)}...
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      ${job.salary?.min} - ${job.salary?.max}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {featuredJobs.length > 0 && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button variant="outlined" href="/jobs" sx={{ px: 3, fontWeight: 600 }}>
                View All Jobs
              </Button>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
