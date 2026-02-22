const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static('frontend'));

// Database connection
const pool = require('./config/db');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Basic route to test server
app.get('/api/health', (req, res) => {
    res.json({ status: 'Platform API is running' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = app;
