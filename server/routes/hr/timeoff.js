const express = require('express');
const router = express.Router();
const timeoffCtrl = require('../../controllers/hr/timeoffController');
const { verifyToken, hrOnly } = require('../../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(verifyToken, hrOnly);

// GET /api/hr/timeoff - Get all leave requests
router.get('/', timeoffCtrl.list);

// POST /api/hr/timeoff - Create new leave request
router.post('/', timeoffCtrl.create);

// GET /api/hr/timeoff/:id - Get leave request by ID
router.get('/:id', timeoffCtrl.get);

// PUT /api/hr/timeoff/:id - Update leave request
router.put('/:id', timeoffCtrl.update);

// PATCH /api/hr/timeoff/:id/status - Approve/Reject leave request
router.patch('/:id/status', timeoffCtrl.updateStatus);

// DELETE /api/hr/timeoff/:id - Delete leave request
router.delete('/:id', timeoffCtrl.remove);

module.exports = router;
