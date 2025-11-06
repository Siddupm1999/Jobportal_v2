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
import { Email, Phone, LocationOn } from '@mui/icons-material';

const About = () => {
  const teamMembers = [
    {
      name: 'John Doe',
      role: 'CEO & Founder',
      description: '10+ years in recruitment technology'
    },
    {
      name: 'Jane Smith',
      role: 'CTO',
      description: 'Expert in scalable web applications'
    },
    {
      name: 'Mike Johnson',
      role: 'Head of Product',
      description: 'Product management specialist'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Mission Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About JobPortal
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          We're dedicated to connecting talented professionals with amazing opportunities 
          and helping companies find their perfect candidates.
        </Typography>
      </Box>

      {/* Mission & Values */}
      <Grid container spacing={6} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Our Mission
          </Typography>
          <Typography paragraph>
            To create a seamless and efficient job search experience for both job seekers 
            and employers, leveraging technology to match the right talent with the right 
            opportunities.
          </Typography>
          <Typography paragraph>
            We believe that everyone deserves to find work they love and that companies 
            should have access to the best talent available.
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>
            Our Values
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li" paragraph>
              <strong>Transparency:</strong> Clear communication and honest practices
            </Typography>
            <Typography component="li" paragraph>
              <strong>Innovation:</strong> Continuous improvement through technology
            </Typography>
            <Typography component="li" paragraph>
              <strong>Empowerment:</strong> Helping people achieve their career goals
            </Typography>
            <Typography component="li" paragraph>
              <strong>Community:</strong> Building connections that matter
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Team Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Our Team
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      mx: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {member.name}
                  </Typography>
                  <Typography color="primary" gutterBottom>
                    {member.role}
                  </Typography>
                  <Typography color="text.secondary">
                    {member.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Contact Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Contact Us
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Email
                </Typography>
                <Typography color="text.secondary">
                  support@jobportal.com
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Phone sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Phone
                </Typography>
                <Typography color="text.secondary">
                  +1 (555) 123-4567
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <LocationOn sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Office
                </Typography>
                <Typography color="text.secondary">
                  123 Business Ave, Suite 100<br />
                  New York, NY 10001
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Button 
          variant="contained" 
          size="large" 
          sx={{ mt: 4 }}
          href="mailto:support@jobportal.com"
        >
          Get In Touch
        </Button>
      </Box>
    </Container>
  );
};

export default About;