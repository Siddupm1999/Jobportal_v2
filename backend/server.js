// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://siddalingapms100_db_user:uR4KNvfKBQh1QwIm@cluster0.barbxsf.mongodb.net/jobportal', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    // 🔥 Drop the old "username_1" index automatically if it exists
    const indexes = await mongoose.connection.db.collection('users').indexes();
    const usernameIndex = indexes.find(i => i.name === 'username_1');
    if (usernameIndex) {
      await mongoose.connection.db.collection('users').dropIndex('username_1');
      console.log('🧹 Removed old "username_1" index from users collection.');
    } else {
      console.log('✅ No old "username_1" index found.');
    }

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
});
