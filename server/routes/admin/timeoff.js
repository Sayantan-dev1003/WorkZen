const express = require('express');
const router = express.Router();
const timeoffCtrl = require('../../controllers/admin/timeoffController');
const { verifyToken, adminOnly } = require('../../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(verifyToken, adminOnly);

// GET /api/admin/timeoff - Get all leave requests
router.get('/', timeoffCtrl.list);

// POST /api/admin/timeoff - Create new leave request
router.post('/', timeoffCtrl.create);

// GET /api/admin/timeoff/:id - Get leave request by ID
router.get('/:id', timeoffCtrl.get);

// PUT /api/admin/timeoff/:id - Update leave request
router.put('/:id', timeoffCtrl.update);

// PATCH /api/admin/timeoff/:id/status - Approve/Reject leave request
router.patch('/:id/status', timeoffCtrl.updateStatus);

// DELETE /api/admin/timeoff/:id - Delete leave request
router.delete('/:id', timeoffCtrl.remove);

module.exports = router;
