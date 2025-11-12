const employeeService = require('../../services/employeeService');
const { success, error } = require('../../utils/response');

/**
 * Employee Controller - Handles HTTP requests for employee management
 * Business logic is in employeeService
 */

exports.list = async (req, res) => {
  try {
    const result = await employeeService.getAllEmployees(req.query);
    return success(res, result);
  } catch (err) {
    console.error('List employees error:', err);
    return error(res, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);
    // The employee is already populated with userId from getEmployeeById
    const loginId = employee.userId?.loginId;
    return success(res, { 
      employee,
      message: 'Employee created successfully',
      loginId: loginId
    }, 201);
  } catch (err) {
    console.error('Create employee error:', err);
    return error(res, err.message, 400);
  }
};

exports.get = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return success(res, { employee });
  } catch (err) {
    console.error('Get employee error:', err);
    return error(res, err.message, 404);
  }
};

exports.update = async (req, res) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    return success(res, { employee });
  } catch (err) {
    console.error('Update employee error:', err);
    return error(res, err.message, 400);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await employeeService.deleteEmployee(req.params.id);
    return success(res, result);
  } catch (err) {
    console.error('Delete employee error:', err);
    return error(res, err.message, 404);
  }
};
