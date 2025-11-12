const payrollService = require('../../services/payrollService');
const { success, error } = require('../../utils/response');

/**
 * Payroll Controller - Handles HTTP requests for payroll management
 * Business logic is in payrollService
 */

// Dashboard endpoint
exports.getDashboard = async (req, res) => {
  try {
    const dashboard = await payrollService.getPayrollDashboard();
    return success(res, dashboard);
  } catch (err) {
    console.error('Get payroll dashboard error:', err);
    return error(res, err.message);
  }
};

exports.list = async (req, res) => {
  try {
    const result = await payrollService.getAllPayrolls(req.query);
    return success(res, result);
  } catch (err) {
    console.error('List payroll error:', err);
    return error(res, err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const payroll = await payrollService.createPayroll(req.body);
    return success(res, { payroll }, 201);
  } catch (err) {
    console.error('Create payroll error:', err);
    return error(res, err.message, 400);
  }
};

exports.get = async (req, res) => {
  try {
    const payroll = await payrollService.getPayrollById(req.params.id);
    return success(res, { payroll });
  } catch (err) {
    console.error('Get payroll error:', err);
    return error(res, err.message, 404);
  }
};

exports.update = async (req, res) => {
  try {
    const payroll = await payrollService.updatePayroll(req.params.id, req.body);
    return success(res, { payroll });
  } catch (err) {
    console.error('Update payroll error:', err);
    return error(res, err.message, 400);
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await payrollService.deletePayroll(req.params.id);
    return success(res, result);
  } catch (err) {
    console.error('Delete payroll error:', err);
    return error(res, err.message, 404);
  }
};

// Payrun endpoints
exports.listPayruns = async (req, res) => {
  try {
    const result = await payrollService.getAllPayruns(req.query);
    return success(res, result);
  } catch (err) {
    console.error('List payruns error:', err);
    return error(res, err.message);
  }
};

// Get current payrun data with all employees
exports.getCurrentPayrun = async (req, res) => {
  try {
    const result = await payrollService.getCurrentPayrunData();
    return success(res, result);
  } catch (err) {
    console.error('Get current payrun error:', err);
    return error(res, err.message);
  }
};

exports.createPayrun = async (req, res) => {
  try {
    const payrun = await payrollService.createPayrun(req.body);
    return success(res, { payrun }, 201);
  } catch (err) {
    console.error('Create payrun error:', err);
    return error(res, err.message, 400);
  }
};

exports.updatePayrunStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const payrun = await payrollService.updatePayrunStatus(req.params.id, status);
    return success(res, { payrun });
  } catch (err) {
    console.error('Update payrun status error:', err);
    return error(res, err.message, 400);
  }
};

// Salary Statement Report
exports.getSalaryStatement = async (req, res) => {
  try {
    const { employeeId, year } = req.query;
    const statement = await payrollService.getSalaryStatement(employeeId, year);
    return success(res, statement);
  } catch (err) {
    console.error('Get salary statement error:', err);
    return error(res, err.message, 400);
  }
};

// Get detailed salary statement for print
exports.getDetailedSalaryStatement = async (req, res) => {
  try {
    const { employeeId, year } = req.query;
    const statement = await payrollService.getDetailedSalaryStatement(employeeId, year);
    return success(res, statement);
  } catch (err) {
    console.error('Get detailed salary statement error:', err);
    return error(res, err.message, 400);
  }
};

// Mark employee payroll as done
exports.markPayrollDone = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const result = await payrollService.markEmployeePayrollDone(employeeId);
    return success(res, result);
  } catch (err) {
    console.error('Mark payroll done error:', err);
    return error(res, err.message, 400);
  }
};

// Get detailed payslip for an employee
exports.getEmployeePayslipDetail = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    const result = await payrollService.getEmployeePayslipDetail(employeeId, month, year);
    return success(res, result);
  } catch (err) {
    console.error('Get employee payslip detail error:', err);
    return error(res, err.message, 400);
  }
};

// Generate PDF payslip for an employee
exports.generatePayslipPDF = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;
    
    // Get payslip data (will fetch from stored Payroll model if status='done')
    const payslipData = await payrollService.getEmployeePayslipDetail(employeeId, month, year);
    
    // Generate PDF
    const { generatePayslipPDF } = require('../../utils/pdfGenerator');
    const doc = generatePayslipPDF(payslipData);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip-${payslipData.employee.name.replace(/\s+/g, '-')}-${month || new Date().getMonth()}-${year || new Date().getFullYear()}.pdf`);
    
    // Pipe the PDF to response
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Generate payslip PDF error:', err);
    return error(res, err.message, 400);
  }
};
