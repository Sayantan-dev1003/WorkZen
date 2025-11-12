const leaveService = require('../services/leaveService');
const { success, error } = require('../utils/response');

/**
 * Employee Leave Controller - Handles employee leave requests
 */

/**
 * Get my leave requests
 */
exports.getMyLeaves = async (req, res) => {
  try {
    const empId = req.user.empId;
    
    if (!empId) {
      return error(res, 'Employee profile not found', 404);
    }

    const result = await leaveService.getEmployeeLeaves(empId, req.query);
    return success(res, result);
  } catch (err) {
    console.error('Get my leaves error:', err);
    return error(res, err.message);
  }
};

/**
 * Get leave balance
 */
exports.getLeaveBalance = async (req, res) => {
  try {
    const empId = req.user.empId;
    
    if (!empId) {
      return error(res, 'Employee profile not found', 404);
    }

    const balance = await leaveService.getLeaveBalance(empId);
    return success(res, { balance });
  } catch (err) {
    console.error('Get leave balance error:', err);
    return error(res, err.message);
  }
};

/**
 * Create leave request
 */
exports.createLeave = async (req, res) => {
  try {
    const empId = req.user.empId;
    
    if (!empId) {
      return error(res, 'Employee profile not found', 404);
    }

    const leaveData = {
      ...req.body,
      empId
    };

    const leave = await leaveService.createLeave(leaveData);
    return success(res, { 
      message: 'Leave request submitted successfully',
      leave 
    }, 201);
  } catch (err) {
    console.error('Create leave error:', err);
    return error(res, err.message, 400);
  }
};

/**
 * Cancel leave request
 */
exports.cancelLeave = async (req, res) => {
  try {
    const empId = req.user.empId;
    const { id } = req.params;
    
    if (!empId) {
      return error(res, 'Employee profile not found', 404);
    }

    const leave = await leaveService.cancelLeave(id, empId);
    return success(res, { 
      message: 'Leave request cancelled successfully',
      leave 
    });
  } catch (err) {
    console.error('Cancel leave error:', err);
    return error(res, err.message, 400);
  }
};
