require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const emailService = require('./utils/emailService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Initialize Email Service
emailService.initialize();

// Routes
// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Employee routes (for logged-in employees)
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/leaves', require('./routes/leaves'));

// Profile routes (for all authenticated users)
app.use('/api/profile', require('./routes/profile'));

// Admin routes
app.use('/api/admin/employees', require('./routes/admin/employees'));
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/attendance', require('./routes/admin/attendance'));
app.use('/api/admin/payroll', require('./routes/admin/payroll'));
app.use('/api/admin/timeoff', require('./routes/admin/timeoff'));

// HR routes
app.use('/api/hr/employees', require('./routes/hr/employees'));
app.use('/api/hr/attendance', require('./routes/hr/attendance'));
app.use('/api/hr/timeoff', require('./routes/hr/timeoff'));

// Health check
app.get('/', (req, res) => res.json({ success: true, message: 'WorkZen API running' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
