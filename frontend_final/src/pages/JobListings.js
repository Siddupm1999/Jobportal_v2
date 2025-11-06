import React, { useState, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Box,
  Pagination,
  Chip,
  InputAdornment,
  Divider
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  Business, 
  Schedule,
  TrendingUp
} from '@mui/icons-material';
import axios from 'axios';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    experience: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  // Fetch Jobs
  const fetchJobs = useCallback(async () => {
    try {
      const paramsObj = {
        page: pagination.page,
        limit: 8
      };

      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          paramsObj[key] = filters[key];
        }
      });

      const params = new URLSearchParams(paramsObj).toString();
      const response = await axios.get(`http://localhost:5000/api/jobs?${params}`);
      setJobs(response.data.jobs);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.totalPages,
        total: response.data.total
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  }, [filters, pagination.page]);

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchJobs();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      location: '',
      experience: ''
    });
  };

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'Full-time': return 'success';
      case 'Part-time': return 'info';
      case 'Contract': return 'warning';
      case 'Remote': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 25%, #4338ca 50%, #6366f1 75%, #818cf8 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          Find Your Dream Job
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover {pagination.total}+ opportunities waiting for you
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Grid container spacing={2} alignItems="flex-end">
          {/* Search Field */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.primary' }}>
                Enter keyword / designation / companies
              </Typography>
              <TextField
                size="small"
                placeholder="Job title, keywords, or company"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </FormControl>
          </Grid>
          
          {/* Experience Dropdown */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.primary' }}>
                Select experience
              </Typography>
              <Select
                value={filters.experience}
                onChange={(e) => handleFilterChange('experience', e.target.value)}
                displayEmpty
                renderValue={(selected) => {
                  if (selected === '') {
                    return <Typography sx={{ color: 'text.secondary' }}>Any Experience</Typography>;
                  }
                  return selected;
                }}
              >
                <MenuItem value="">Any Experience</MenuItem>
                <MenuItem value="Internship">Internship</MenuItem>
                <MenuItem value="Entry Level">Entry Level (0-2 years)</MenuItem>
                <MenuItem value="Mid Level">Mid Level (2-5 years)</MenuItem>
                <MenuItem value="Senior Level">Senior Level (5+ years)</MenuItem>
                <MenuItem value="Executive">Executive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Location Field */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <Typography variant="body2" fontWeight="600" sx={{ mb: 1, color: 'text.primary' }}>
                Enter location
              </Typography>
              <TextField
                size="small"
                placeholder="City, state, or remote"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn color="primary" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </FormControl>
          </Grid>

          {/* Search Button */}
          <Grid item xs={12} md={1.5}>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleSearch}
              fullWidth
              sx={{ 
                height: '40px',
                mb: 0.5,
                backgroundColor: '#1976d2',
                '&:hover': {
                backgroundColor: '#1565c0'
                }
              }}
            >
              Search 
            </Button>
          </Grid>

          {/* Clear Button */}
          <Grid item xs={12} md={1.5}>
            <Button
              variant="outlined"
              onClick={clearAllFilters}
              fullWidth
              sx={{ height: '40px', mb: 0.5 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Results Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {jobs.length} of {pagination.total} jobs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Page {pagination.page} of {pagination.totalPages}
        </Typography>
      </Box>

      {/* Job Listings */}
      <Grid container spacing={2}>
        {jobs.map((job) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={job._id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                  borderColor: 'primary.main'
                }
              }}
              onClick={() => window.location.href = `/jobs/${job._id}`}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                {/* Company & Job Type */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Business color="primary" sx={{ fontSize: 20 }} />
                    <Typography variant="body2" color="primary" fontWeight="600">
                      {job.company}
                    </Typography>
                  </Box>
                  {job.jobType && (
                    <Chip 
                      label={job.jobType} 
                      size="small" 
                      color={getJobTypeColor(job.jobType)}
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Job Title */}
                <Typography variant="h6" component="h2" gutterBottom sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  height: '2.6rem',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {job.title}
                </Typography>

                {/* Location & Experience */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.experience}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* Salary & Apply */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" color="primary" fontWeight="600">
                      ${job.salary?.min}k
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      per year
                    </Typography>
                  </Box>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/jobs/${job._id}`;
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    Apply
                  </Button>
                </Box>

                {/* Posted Date */}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  <Schedule sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {jobs.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default JobListings;