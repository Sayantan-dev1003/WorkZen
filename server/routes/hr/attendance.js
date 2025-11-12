const express = require('express');
const router = express.Router();
const attendanceCtrl = require('../../controllers/admin/attendanceController');
const { verifyToken, allowRoles } = require('../../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// User-specific attendance routes (any authenticated user)
// POST /api/hr/attendance/mark - Mark attendance for logged-in user
router.post('/mark', attendanceCtrl.markUserAttendance);

// GET /api/hr/attendance/today - Get today's attendance status for logged-in user
router.get('/today', attendanceCtrl.getTodayUserStatus);

// HR-only routes (HR and Admin can access)
router.use(allowRoles('HR', 'Admin'));

// GET /api/hr/attendance - Get all attendance records
router.get('/', attendanceCtrl.list);

// POST /api/hr/attendance - Create new attendance record
router.post('/', attendanceCtrl.create);

// GET /api/hr/attendance/:id - Get attendance record by ID
router.get('/:id', attendanceCtrl.get);

// PUT /api/hr/attendance/:id - Update attendance record
router.put('/:id', attendanceCtrl.update);

// DELETE /api/hr/attendance/:id - Delete attendance record
router.delete('/:id', attendanceCtrl.remove);

module.exports = router;
