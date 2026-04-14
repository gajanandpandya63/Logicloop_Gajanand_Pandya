const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { 
  serverSelectionTimeoutMS: 5000 // Stop waiting after 5 seconds
})
  .then(() => console.log('Successfully connected to MongoDB at:', process.env.MONGODB_URI))
  .catch(err => {
    console.error('CRITICAL: MongoDB connection error!', err.message);
    console.log('--------------------------------------------------');
    console.log('ROOT CAUSE DETECTED: Your local MongoDB is not running.');
    console.log('FIX: Please install MongoDB or use a Cloud Atlas URI in your .env file.');
    console.log('--------------------------------------------------');
  });

// Routes placeholder
app.get('/', (req, res) => {
  res.send('Learnova API is running...');
});

// Import Routes
const userRoutes = require('./routes/userRoutes');
const quizRoutes = require('./routes/quizRoutes');
const analysisRoutes = require('./routes/analysisRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const aiRoutes = require('./routes/aiRoutes');
const mistakeRoutes = require('./routes/mistakeRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
