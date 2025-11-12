const attendanceService = require('../services/attendanceService');
const { success, error } = require('../utils/response');

/**
 * Employee Attendance Controller - Handles employee check-in/check-out
 */

/**
 * Get today's attendance status for the logged-in employee
 */
exports.getTodayStatus = async (req, res) => {
  try {
    const empId = req.user.empId; // Get employee ID from verified token
    const userId = req.user.id; // Get user ID as fallback
    
    console.log('getTodayStatus - empId:', empId, 'userId:', userId);
    
    let attendance;
    
    if (empId) {
      attendance = await attendanceService.getTodayAttendance(empId);
    } else {
      // Fallback to userId for employees without Employee profile
      attendance = await attendanceService.getTodayUserAttendance(userId);
    }
    
    console.log('getTodayStatus - attendance:', attendance);
    
    return success(res, { attendance });
  } catch (err) {
    console.error('Get today attendance error:', err);
    return error(res, err.message);
  }
};

/**
 * Employee check-in
 */
exports.checkIn = async (req, res) => {
  try {
    const empId = req.user.empId; // Get employee ID from verified token
    const userId = req.user.id; // Get user ID from verified token
    
    console.log('Check-in request from user:', req.user);
    console.log('Employee ID:', empId);
    console.log('User ID:', userId);
    
    let attendance;
    
    if (empId) {
      // Employee has an Employee profile, use empId
      attendance = await attendanceService.checkIn(empId, userId);
    } else {
      // Employee doesn't have Employee profile yet, use userId
      console.log('No empId found, using userId for check-in');
      attendance = await attendanceService.userCheckIn(userId);
    }
    
    console.log('Check-in successful, attendance:', attendance);
    
    return success(res, { 
      message: 'Checked in successfully',
      attendance 
    }, 201);
  } catch (err) {
    console.error('Check-in error:', err);
    return error(res, err.message, 400);
  }
};

/**
 * Employee check-out
 */
exports.checkOut = async (req, res) => {
  try {
    const empId = req.user.empId; // Get employee ID from verified token
    const userId = req.user.id; // Get user ID as fallback
    
    console.log('Check-out request - empId:', empId, 'userId:', userId);
    
    let attendance;
    
    if (empId) {
      attendance = await attendanceService.checkOut(empId);
    } else {
      // Fallback to userId for employees without Employee profile
      attendance = await attendanceService.userCheckOut(userId);
    }
    
    return success(res, { 
      message: 'Checked out successfully',
      attendance 
    });
  } catch (err) {
    console.error('Check-out error:', err);
    return error(res, err.message, 400);
  }
};

/**
 * Get my attendance records (employee's own records)
 */
exports.getMyAttendance = async (req, res) => {
  try {
    const empId = req.user.empId; // Get employee ID from verified token
    const userId = req.user.id; // Get user ID as fallback
    
    console.log('getMyAttendance - empId:', empId, 'userId:', userId);
    console.log('getMyAttendance - query:', req.query);
    
    let result;
    
    if (empId) {
      // Employee has an Employee profile, fetch by empId
      result = await attendanceService.getEmployeeAttendance(empId, req.query);
    } else {
      // Employee doesn't have Employee profile, fetch by userId
      console.log('No empId found, fetching by userId');
      result = await attendanceService.getUserAttendance(userId, req.query);
    }
    
    console.log('getMyAttendance - result:', result);
    
    return success(res, result);
  } catch (err) {
    console.error('Get my attendance error:', err);
    return error(res, err.message);
  }
};
