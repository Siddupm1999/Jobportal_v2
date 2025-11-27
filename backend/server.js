const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(__dirname, 'uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created');
}
if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
  console.log('Resumes directory created');
}

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directories
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Portal API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      applications: '/api/applications'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb+srv://siddalingapms100_db_user:uR4KNvfKBQh1QwIm@cluster0.barbxsf.mongodb.net/jobportal',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('✅ MongoDB connected successfully');
    console.log(`Database: ${conn.connection.db.databaseName}`);
    console.log(`Host: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});