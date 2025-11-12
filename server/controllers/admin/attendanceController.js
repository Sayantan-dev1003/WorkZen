const attendanceService = require('../../services/attendanceService');
const { success, error } = require('../../utils/response');

/**
 * Attendance Controller - Handles HTTP requests for attendance management
 * Business logic is in attendanceService
 */

exports.list = async (req, res) => {
  try {
    const result = await attendanceService.getAllAttendance(req.query);
    return success(res, result);
  } catch (err) {
    console.error('List attendance error:', err);
    return error(res, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const attendance = await attendanceService.createAttendance(req.body);
    return success(res, { attendance }, 201);
  } catch (err) {
    console.error('Create attendance error:', err);
    return error(res, err.message, 400);
  }
};

exports.get = async (req, res) => {
  try {
    const attendance = await attendanceService.getAttendanceById(req.params.id);
    return success(res, { attendance });
  } catch (err) {
    console.error('Get attendance error:', err);
    return error(res, err.message, 404);
  }
};

exports.update = async (req, res) => {
  try {
    const attendance = await attendanceService.updateAttendance(req.params.id, req.body);
    return success(res, { attendance });
  } catch (err) {
    console.error('Update attendance error:', err);
    return error(res, err.message, 400);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await attendanceService.deleteAttendance(req.params.id);
    return success(res, result);
  } catch (err) {
    console.error('Delete attendance error:', err);
    return error(res, err.message, 404);
  }
};

/**
 * Mark attendance for logged-in user (Admin, HR, PayrollOfficer)
 */
exports.markUserAttendance = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    console.log('Mark user attendance - userId:', userId);
    
    const attendance = await attendanceService.userCheckIn(userId);
    console.log('Created attendance:', attendance);
    
    return success(res, { attendance }, 200);
  } catch (err) {
    console.error('Mark user attendance error:', err);
    return error(res, err.message, 400);
  }
};

/**
 * Get today's attendance status for logged-in user
 */
exports.getTodayUserStatus = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    console.log('Get today user status - userId:', userId);
    
    const attendance = await attendanceService.getTodayUserAttendance(userId);
    console.log('Found attendance:', attendance);
    
    return success(res, { attendance });
  } catch (err) {
    console.error('Get today user status error:', err);
    return error(res, err.message);
  }
};

/**
 * Check out for logged-in user (Admin, HR, PayrollOfficer)
 */
exports.checkOutUser = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    console.log('Check out user - userId:', userId);
    
    const attendance = await attendanceService.userCheckOut(userId);
    console.log('Checked out attendance:', attendance);
    
    return success(res, { attendance }, 200);
  } catch (err) {
    console.error('Check out user error:', err);
    return error(res, err.message, 400);
  }
};
