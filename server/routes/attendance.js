const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../controllers/attendanceController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes (employee must be logged in)
router.use(verifyToken);

// GET /api/attendance/today - Get today's attendance status
router.get('/today', attendanceCtrl.getTodayStatus);

// GET /api/attendance/my-records - Get my attendance records
router.get('/my-records', attendanceCtrl.getMyAttendance);

// POST /api/attendance/checkin - Employee check-in
router.post('/checkin', attendanceCtrl.checkIn);

// POST /api/attendance/checkout - Employee check-out
router.post('/checkout', attendanceCtrl.checkOut);

module.exports = router;
