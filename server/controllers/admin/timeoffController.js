const leaveService = require('../../services/leaveService');
const { success, error } = require('../../utils/response');

/**
 * Time Off (Leave) Controller - Handles HTTP requests for leave management
 * Business logic is in leaveService
 */

exports.list = async (req, res) => {
  try {
    const result = await leaveService.getAllLeaves(req.query);
    return success(res, result);
  } catch (err) {
    console.error('List leaves error:', err);
    return error(res, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const leave = await leaveService.createLeave(req.body);
    return success(res, { leave }, 201);
  } catch (err) {
    console.error('Create leave error:', err);
    return error(res, err.message, 400);
  }
};

exports.get = async (req, res) => {
  try {
    const leave = await leaveService.getLeaveById(req.params.id);
    return success(res, { leave });
  } catch (err) {
    console.error('Get leave error:', err);
    return error(res, err.message, 404);
  }
};

exports.update = async (req, res) => {
  try {
    const leave = await leaveService.updateLeave(req.params.id, req.body);
    return success(res, { leave });
  } catch (err) {
    console.error('Update leave error:', err);
    return error(res, err.message, 400);
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const leave = await leaveService.updateLeaveStatus(req.params.id, status, remarks);
    return success(res, { leave });
  } catch (err) {
    console.error('Update leave status error:', err);
    return error(res, err.message, 400);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await leaveService.deleteLeave(req.params.id);
    return success(res, result);
  } catch (err) {
    console.error('Delete leave error:', err);
    return error(res, err.message, 404);
  }
};
