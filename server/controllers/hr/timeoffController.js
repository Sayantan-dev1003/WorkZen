const leaveService = require('../../services/leaveService');
const { success, error } = require('../../utils/response');

// GET /api/hr/timeoff - List all leave requests
exports.list = async (req, res) => {
  try {
    const filters = {
      leaveType: req.query.leaveType,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit || 100,
    };
    
    // Remove undefined filters
    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);
    
    const result = await leaveService.getAllLeaves(filters);
    
    return success(res, { 
      leaves: result.leaves,
      count: result.leaves.length,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('Error in timeoffController.list:', err);
    return error(res, err.message, 500);
  }
};

// POST /api/hr/timeoff - Create new leave request
exports.create = async (req, res) => {
  try {
    const leaveData = req.body;
    const leave = await leaveService.createLeave(leaveData);
    
    return success(res, { leave }, 201);
  } catch (err) {
    console.error('Error in timeoffController.create:', err);
    return error(res, err.message, 400);
  }
};

// GET /api/hr/timeoff/:id - Get leave request by ID
exports.get = async (req, res) => {
  try {
    const leave = await leaveService.getLeaveById(req.params.id);
    
    if (!leave) {
      return error(res, 'Leave request not found', 404);
    }
    
    return success(res, { leave });
  } catch (err) {
    console.error('Error in timeoffController.get:', err);
    return error(res, err.message, 500);
  }
};

// PUT /api/hr/timeoff/:id - Update leave request
exports.update = async (req, res) => {
  try {
    const leave = await leaveService.updateLeave(req.params.id, req.body);
    
    if (!leave) {
      return error(res, 'Leave request not found', 404);
    }
    
    return success(res, { leave });
  } catch (err) {
    console.error('Error in timeoffController.update:', err);
    return error(res, err.message, 400);
  }
};

// PATCH /api/hr/timeoff/:id/status - Update leave status (approve/reject)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return error(res, 'Invalid status. Must be approved, rejected, or pending', 400);
    }
    
    const leave = await leaveService.updateLeaveStatus(req.params.id, status);
    
    if (!leave) {
      return error(res, 'Leave request not found', 404);
    }
    
    return success(res, { 
      leave,
      message: `Leave request ${status} successfully` 
    });
  } catch (err) {
    console.error('Error in timeoffController.updateStatus:', err);
    return error(res, err.message, 400);
  }
};

// DELETE /api/hr/timeoff/:id - Delete leave request
exports.remove = async (req, res) => {
  try {
    const leave = await leaveService.deleteLeave(req.params.id);
    
    if (!leave) {
      return error(res, 'Leave request not found', 404);
    }
    
    return success(res, { message: 'Leave request deleted successfully' });
  } catch (err) {
    console.error('Error in timeoffController.remove:', err);
    return error(res, err.message, 500);
  }
};
