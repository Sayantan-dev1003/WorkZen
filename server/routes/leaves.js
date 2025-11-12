const express = require('express');
const router = express.Router();
const leaveCtrl = require('../controllers/leaveController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(verifyToken);

// GET /api/leaves/my-requests - Get my leave requests
router.get('/my-requests', leaveCtrl.getMyLeaves);

// GET /api/leaves/balance - Get leave balance
router.get('/balance', leaveCtrl.getLeaveBalance);

// POST /api/leaves - Create leave request
router.post('/', leaveCtrl.createLeave);

// DELETE /api/leaves/:id - Cancel leave request
router.delete('/:id', leaveCtrl.cancelLeave);

module.exports = router;
