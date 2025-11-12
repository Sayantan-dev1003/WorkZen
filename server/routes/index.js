const express = require('express');
const router = express.Router();

/**
 * Central route index
 * This file can be used to organize all routes in one place
 */

// Auth routes
router.use('/auth', require('./authRoutes'));

// Admin routes
router.use('/admin/employees', require('./admin/employees'));
router.use('/admin/attendance', require('./admin/attendance'));
router.use('/admin/payroll', require('./admin/payroll'));
router.use('/admin/timeoff', require('./admin/timeoff'));

// Health check
router.get('/health', (req, res) => res.json({ success: true, message: 'OK' }));

module.exports = router;
