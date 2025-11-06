import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button
} from '@mui/material';
import { Article, TrendingUp, School } from '@mui/icons-material';

const Blog = () => {
  const blogPosts = [
    {
      title: 'How to Write a Standout Resume in 2025-26',
      excerpt: 'Learn the key elements that make your resume stand out to employers and get noticeds.',
      category: 'Resume Tips',
      icon: <Article />
    },
    {
      title: 'Ace Your Next Job Interview',
      excerpt: 'Common interview questions and how to answer them with confidence.',
      category: 'Interview Preparation',
      icon: <School />
    },
    {
      title: 'Top 10 In-Demand Skills for 2024',
      excerpt: 'Discover the most sought-after skills in today\'s job market.',
      category: 'Career Growth',
      icon: <TrendingUp />
    },
    {
      title: 'Navigating Career Transitions',
      excerpt: 'Tips for successfully changing careers or industries.',
      category: 'Career Advice',
      icon: <TrendingUp />
    },
    {
      title: 'Remote Work Best Practices',
      excerpt: 'How to excel in remote work environments and stay productive.',
      category: 'Workplace',
      icon: <Article />
    },
    {
      title: 'Salary Negotiation Strategies',
      excerpt: 'Get the compensation you deserve with these negotiation tips.',
      category: 'Career Growth',
      icon: <School />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Career Advice & Resources
      </Typography>
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6 }}>
        Expert tips to help you advance your career
      </Typography>

      <Grid container spacing={4}>
        {blogPosts.map((post, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: 'primary.main', mr: 1 }}>
                    {post.icon}
                  </Box>
                  <Typography 
                    variant="caption" 
                    color="primary" 
                    sx={{ 
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}
                  >
                    {post.category}
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                <Typography color="text.secondary" paragraph>
                  {post.excerpt}
                </Typography>
                <Button variant="outlined" size="small">
                  Read More
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Resources Section */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Career Resources
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resume Templates
                </Typography>
                <Typography color="text.secondary">
                  Professional templates for every industry
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cover Letter Guide
                </Typography>
                <Typography color="text.secondary">
                  Write compelling cover letters
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Interview Prep
                </Typography>
                <Typography color="text.secondary">
                  Practice questions and tips
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Blog;
