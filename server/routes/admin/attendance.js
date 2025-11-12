const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../../controllers/admin/attendanceController');
const { verifyToken, allowRoles } = require('../../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// User-specific attendance routes (any authenticated user)
// POST /api/admin/attendance/mark - Mark attendance for logged-in user
router.post('/mark', attendanceCtrl.markUserAttendance);

// POST /api/admin/attendance/checkout - Check out for logged-in user
router.post('/checkout', attendanceCtrl.checkOutUser);

// GET /api/admin/attendance/today - Get today's attendance status for logged-in user
router.get('/today', attendanceCtrl.getTodayUserStatus);

// Admin and PayrollOfficer routes
router.use(allowRoles('Admin', 'PayrollOfficer'));

// GET /api/admin/attendance - Get all attendance records
router.get('/', attendanceCtrl.list);

// POST /api/admin/attendance - Create new attendance record
router.post('/', attendanceCtrl.create);

// GET /api/admin/attendance/:id - Get attendance record by ID
router.get('/:id', attendanceCtrl.get);

// PUT /api/admin/attendance/:id - Update attendance record
router.put('/:id', attendanceCtrl.update);

// DELETE /api/admin/attendance/:id - Delete attendance record
router.delete('/:id', attendanceCtrl.remove);

module.exports = router;
