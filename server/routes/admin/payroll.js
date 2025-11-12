const express = require('express');
const router = express.Router();
const payrollCtrl = require('../../controllers/admin/payrollController');
const { verifyToken, allowRoles } = require('../../middlewares/authMiddleware');

// Apply auth middleware to all routes - Allow Admin and PayrollOfficer
router.use(verifyToken, allowRoles('Admin', 'PayrollOfficer'));

// Dashboard Route
// GET /api/admin/payroll/dashboard - Get payroll dashboard data
router.get('/dashboard', payrollCtrl.getDashboard);

// Salary Statement Routes (must be before /:id route)
// GET /api/admin/payroll/salary-statement - Get salary statement report
router.get('/salary-statement', payrollCtrl.getSalaryStatement);

// GET /api/admin/payroll/detailed-salary-statement - Get detailed salary statement for print
router.get('/detailed-salary-statement', payrollCtrl.getDetailedSalaryStatement);

// Payrun Routes (must be before /:id route)
// GET /api/admin/payroll/payruns - Get all payruns
router.get('/payruns/list', payrollCtrl.listPayruns);

// GET /api/admin/payroll/payruns/current - Get current month payrun data
router.get('/payruns/current', payrollCtrl.getCurrentPayrun);

// POST /api/admin/payroll/payruns - Create new payrun
router.post('/payruns', payrollCtrl.createPayrun);

// PATCH /api/admin/payroll/payruns/:id/status - Update payrun status
router.patch('/payruns/:id/status', payrollCtrl.updatePayrunStatus);

// POST /api/admin/payroll/mark-done - Mark employee payroll as done
router.post('/mark-done', payrollCtrl.markPayrollDone);

// GET /api/admin/payroll/payslip/:employeeId - Get detailed payslip for employee
router.get('/payslip/:employeeId', payrollCtrl.getEmployeePayslipDetail);

// GET /api/admin/payroll/payslip/:employeeId/pdf - Generate PDF payslip for employee
router.get('/payslip/:employeeId/pdf', payrollCtrl.generatePayslipPDF);

// Payroll CRUD Routes (/:id route must come AFTER all specific routes)
// GET /api/admin/payroll - Get all payroll records
router.get('/', payrollCtrl.list);

// POST /api/admin/payroll - Create new payroll record
router.post('/', payrollCtrl.create);

// GET /api/admin/payroll/:id - Get payroll record by ID
router.get('/:id', payrollCtrl.get);

// PUT /api/admin/payroll/:id - Update payroll record
router.put('/:id', payrollCtrl.update);

// DELETE /api/admin/payroll/:id - Delete payroll record
router.delete('/:id', payrollCtrl.remove);

module.exports = router;
