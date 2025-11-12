const Payroll = require('../models/Payroll');
const Payrun = require('../models/Payrun');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

/**
 * Payroll Service - Business logic for payroll management
 */
class PayrollService {
  /**
   * Get all payroll records
   */
  async getAllPayrolls(query = {}) {
    const { page = 1, limit = 10, employeeId, payrunId, month, year } = query;
    
    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (payrunId) filter.payrun = payrunId;
    if (month) filter.month = month;
    if (year) filter.year = year;

    const skip = (page - 1) * limit;
    const payrolls = await Payroll.find(filter)
      .populate('employee', 'firstName lastName email')
      .populate('payrun', 'name status')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Payroll.countDocuments(filter);

    return {
      payrolls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get payroll by ID
   */
  async getPayrollById(id) {
    const payroll = await Payroll.findById(id)
      .populate('employee', 'firstName lastName email')
      .populate('payrun', 'name status');

    if (!payroll) {
      throw new Error('Payroll record not found');
    }

    return payroll;
  }

  /**
   * Create payroll record
   */
  async createPayroll(payrollData) {
    const { employee, payrun } = payrollData;

    // Verify employee exists
    const employeeExists = await Employee.findById(employee);
    if (!employeeExists) {
      throw new Error('Employee not found');
    }

    // Verify payrun exists if provided
    if (payrun) {
      const payrunExists = await Payrun.findById(payrun);
      if (!payrunExists) {
        throw new Error('Payrun not found');
      }
    }

    const payroll = await Payroll.create(payrollData);
    return await this.getPayrollById(payroll._id);
  }

  /**
   * Update payroll record
   */
  async updatePayroll(id, updateData) {
    const payroll = await Payroll.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('employee', 'firstName lastName email')
      .populate('payrun', 'name status');

    if (!payroll) {
      throw new Error('Payroll record not found');
    }

    return payroll;
  }

  /**
   * Delete payroll record
   */
  async deletePayroll(id) {
    const payroll = await Payroll.findByIdAndDelete(id);
    if (!payroll) {
      throw new Error('Payroll record not found');
    }

    return { message: 'Payroll record deleted successfully' };
  }

  /**
   * Get all payruns
   */
  async getAllPayruns(query = {}) {
    const { page = 1, limit = 10, status } = query;
    
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const payruns = await Payrun.find(filter)
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Payrun.countDocuments(filter);

    return {
      payruns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create payrun
   */
  async createPayrun(payrunData) {
    const payrun = await Payrun.create(payrunData);
    return payrun;
  }

  /**
   * Update payrun status
   */
  async updatePayrunStatus(id, status) {
    const validStatuses = ['draft', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const payrun = await Payrun.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!payrun) {
      throw new Error('Payrun not found');
    }

    return payrun;
  }

  /**
   * Get payroll dashboard data
   */
  async getPayrollDashboard() {
    const UserProfile = require('../models/UserProfile');
    
    // Get all employees
    const allEmployees = await Employee.find({});
    
    // Get all user profiles with bank details
    const allUserProfiles = await UserProfile.find({});
    const userProfileMap = new Map();
    allUserProfiles.forEach(profile => {
      userProfileMap.set(profile.userId.toString(), profile);
    });
    
    // Find employees without bank account in UserProfile
    const employeesWithoutBank = allEmployees.filter(emp => {
      const userProfile = userProfileMap.get(emp.userId.toString());
      const bankDetails = userProfile?.privateInfo?.bankDetails;
      return !bankDetails || !bankDetails.accountNumber || !bankDetails.bankName;
    });
    
    // Get recent payruns (last 6 months for chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentPayruns = await Payrun.find({
      createdAt: { $gte: sixMonthsAgo }
    }).sort({ year: 1, month: 1 });
    
    // Get all unique month/year combinations from Payroll records
    const payrollMonths = await Payroll.aggregate([
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1 }
      }
    ]);
    
    // Create virtual payruns for months with payroll data but no official payrun
    const virtualPayruns = [];
    for (const pm of payrollMonths) {
      const existingPayrun = recentPayruns.find(pr => 
        pr.month === pm._id.month && pr.year === pm._id.year
      );
      
      if (!existingPayrun) {
        const date = new Date(pm._id.year, pm._id.month - 1, 1);
        virtualPayruns.push({
          id: `virtual-${pm._id.year}-${pm._id.month}`,
          month: pm._id.month,
          year: pm._id.year,
          status: 'processed',
          displayName: `Payrun for ${date.toLocaleString('default', { month: 'short', year: 'numeric' })} (${pm.count} Payslip${pm.count !== 1 ? 's' : ''})`
        });
      }
    }
    
    // Combine actual and virtual payruns
    const allPayruns = [
      ...recentPayruns.map(pr => ({
        id: pr._id,
        month: pr.month,
        year: pr.year,
        status: pr.status,
        displayName: `Payrun for ${new Date(pr.year, pr.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}`
      })),
      ...virtualPayruns
    ].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    // Calculate employer cost and employee count per month
    const monthlyData = {};
    const currentDate = new Date();
    
    // Initialize last 6 months (extended to include Oct 2025 for demo/testing)
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      
      monthlyData[monthKey] = {
        month: monthName,
        employerCost: 0, // This represents total net wages for all employees
        employeeCount: 0, // Number of employees who received payroll
        year: date.getFullYear(),
        monthNum: date.getMonth() + 1
      };
    }
    
    // Populate with actual payroll data from all months
    for (const monthKey of Object.keys(monthlyData)) {
      const [year, month] = monthKey.split('-').map(Number);
      
      const payrolls = await Payroll.find({ 
        month: month,
        year: year
      }).populate('empId');
      
      if (payrolls.length > 0) {
        monthlyData[monthKey].employeeCount = payrolls.length;
        monthlyData[monthKey].employerCost = payrolls.reduce((sum, p) => {
          return sum + (p.netPay || 0); // Changed to netPay for net wages
        }, 0);
      }
    }
    
    const monthlyStats = Object.values(monthlyData);
    
    return {
      warnings: {
        employeesWithoutBank: employeesWithoutBank.map(emp => ({
          id: emp._id,
          name: emp.name,
          employeeId: emp.employeeId,
          email: emp.email
        }))
      },
      payruns: allPayruns,
      monthlyStats,
      totalEmployees: allEmployees.length
    };
  }

  /**
   * Calculate salary components based on employer cost (monthly wage)
   */
  calculateSalaryComponents(employerCost) {
    // Basic Salary - 50% of employer cost
    const basicSalary = employerCost * 0.50;
    
    // HRA - 50% of basic salary
    const hra = basicSalary * 0.50;
    
    // Standard Allowance - 16.67% of employer cost
    const standardAllowance = employerCost * 0.1667;
    
    // Performance Bonus - 8.33% of employer cost
    const performanceBonus = employerCost * 0.0833;
    
    // Leave Travel Allowance - 8.33% of employer cost
    const lta = employerCost * 0.0833;
    
    // Fixed Allowance - 11.67% of employer cost
    const fixedAllowance = employerCost * 0.1167;
    
    // Gross Salary = Sum of all components
    const grossSalary = basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance;
    
    // PF Employee Contribution - 12% of basic salary
    const pfEmployee = basicSalary * 0.12;
    
    // PF Employer Contribution - 12% of basic salary
    const pfEmployer = basicSalary * 0.12;
    
    // Professional Tax - Fixed at 200
    const professionalTax = 200;
    
    // Total Deductions = PF Employee + PF Employer + Professional Tax
    const totalDeductions = pfEmployee + pfEmployer + professionalTax;
    
    // Net Salary = Gross - Total Deductions
    const netSalary = grossSalary - totalDeductions;
    
    return {
      basicSalary: Math.round(basicSalary * 100) / 100,
      hra: Math.round(hra * 100) / 100,
      standardAllowance: Math.round(standardAllowance * 100) / 100,
      performanceBonus: Math.round(performanceBonus * 100) / 100,
      lta: Math.round(lta * 100) / 100,
      fixedAllowance: Math.round(fixedAllowance * 100) / 100,
      grossSalary: Math.round(grossSalary * 100) / 100,
      pfEmployee: Math.round(pfEmployee * 100) / 100,
      pfEmployer: Math.round(pfEmployer * 100) / 100,
      professionalTax,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100
    };
  }

  /**
   * Get current month payrun data with all employees
   */
  async getCurrentPayrunData() {
    const UserProfile = require('../models/UserProfile');
    
    // Get previous month (since payrun is typically for the previous month)
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = previousMonth.getMonth() + 1;
    const year = previousMonth.getFullYear();
    const payPeriod = previousMonth.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    // Calculate working days in the previous month (excluding Sundays)
    const workingDays = this.getWorkingDaysInMonth(year, month);
    
    // Get all employees
    const employees = await Employee.find({}).sort({ name: 1 });
    
    // Get all user profiles with bank details
    const allUserProfiles = await UserProfile.find({});
    const userProfileMap = new Map();
    allUserProfiles.forEach(profile => {
      userProfileMap.set(profile.userId.toString(), profile);
    });
    
    // Get existing payroll records for this month
    const existingPayrolls = await Payroll.find({ month, year });
    const payrollMap = new Map();
    existingPayrolls.forEach(p => {
      payrollMap.set(p.empId.toString(), p);
    });
    
    // Get attendance data for all employees for the previous month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['present', 'leave'] } // Count both present and leave as paid days
    });
    
    // Create a map of employee attendance counts
    const attendanceMap = new Map();
    attendanceRecords.forEach(record => {
      const empId = record.empId?.toString();
      if (empId) {
        attendanceMap.set(empId, (attendanceMap.get(empId) || 0) + 1);
      }
    });
    
    // Build payrun data for each employee
    const payrunData = employees.map(emp => {
      const monthlySalary = emp.salary || 0;
      const presentDays = attendanceMap.get(emp._id.toString()) || 0;
      
      // Calculate actual employer cost based on attendance
      // Formula: (monthly salary / working days) * present days
      const employerCost = workingDays > 0 
        ? (monthlySalary / workingDays) * presentDays 
        : monthlySalary;
      
      const calculations = this.calculateSalaryComponents(employerCost);
      const existingPayroll = payrollMap.get(emp._id.toString());
      
      // Check if employee has bank details in UserProfile
      const userProfile = userProfileMap.get(emp.userId.toString());
      const bankDetails = userProfile?.privateInfo?.bankDetails;
      const hasBankDetails = !!(bankDetails && bankDetails.accountNumber && bankDetails.bankName);
      
      return {
        employeeId: emp._id,
        employeeName: emp.name,
        payPeriod: `[${previousMonth.toLocaleString('default', { month: 'short' })} ${year}]`,
        monthlySalary, // Full monthly salary
        workingDays,
        presentDays,
        employerCost: Math.round(employerCost * 100) / 100,
        basicWage: calculations.basicSalary,
        grossWage: calculations.grossSalary,
        netWage: calculations.netSalary,
        status: existingPayroll ? 'Done' : 'Pending',
        payrollId: existingPayroll?._id,
        hasBankDetails, // New field to indicate if bank details exist
        calculations // Include full breakdown for potential detail view
      };
    });
    
    // Calculate totals
    const totals = payrunData.reduce((acc, item) => ({
      employerCost: acc.employerCost + item.employerCost,
      basicWage: acc.basicWage + item.basicWage,
      grossWage: acc.grossWage + item.grossWage,
      netWage: acc.netWage + item.netWage
    }), { employerCost: 0, basicWage: 0, grossWage: 0, netWage: 0 });
    
    return {
      payPeriod: `Payrun ${payPeriod}`,
      month,
      year,
      workingDays,
      payrunData,
      totals: {
        employerCost: Math.round(totals.employerCost * 100) / 100,
        basicWage: Math.round(totals.basicWage * 100) / 100,
        grossWage: Math.round(totals.grossWage * 100) / 100,
        netWage: Math.round(totals.netWage * 100) / 100
      }
    };
  }

  /**
   * Calculate number of working days in a month (5 days per week - excluding Saturday and Sunday)
   */
  getWorkingDaysInMonth(year, month) {
    const totalDays = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Exclude Saturdays (6) and Sundays (0) - Only count Monday to Friday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    return workingDays;
  }

  /**
   * Mark employee payroll as done for current month
   */
  async markEmployeePayrollDone(employeeId) {
    const Leave = require('../models/Leave');
    const UserProfile = require('../models/UserProfile');
    
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = previousMonth.getMonth() + 1;
    const year = previousMonth.getFullYear();
    
    // Get employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Check if employee has bank details in UserProfile
    const userProfile = await UserProfile.findOne({ userId: employee.userId });
    const bankDetails = userProfile?.privateInfo?.bankDetails;
    
    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankName) {
      throw new Error('Employee does not have bank account details. Please update the profile before processing payroll.');
    }
    
    // Calculate working days in the month
    const workingDays = this.getWorkingDaysInMonth(year, month);
    
    // Get attendance records for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const attendanceRecords = await Attendance.find({
      empId: employeeId,
      date: { $gte: startDate, $lte: endDate },
      status: 'present'
    });
    
    // Get approved paid leaves for the month
    const paidLeaves = await Leave.find({
      empId: employeeId,
      status: 'approved',
      leaveType: 'Paid time Off',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });
    
    // Calculate paid leave days in this month
    let totalPaidLeaveDays = 0;
    paidLeaves.forEach(leave => {
      const leaveStart = new Date(Math.max(leave.startDate, startDate));
      const leaveEnd = new Date(Math.min(leave.endDate, endDate));
      
      // Count only weekdays (Mon-Fri) in the leave period
      let currentDate = new Date(leaveStart);
      while (currentDate <= leaveEnd) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
          totalPaidLeaveDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    // Total worked days = attendance days + paid leave days
    const attendanceDays = attendanceRecords.length;
    const totalWorkedDays = attendanceDays + totalPaidLeaveDays;
    
    // Monthly salary
    const monthlySalary = employee.salary || 0;
    
    // Calculate employer cost based on worked days
    const employerCost = workingDays > 0 
      ? (monthlySalary / workingDays) * totalWorkedDays 
      : monthlySalary;
    
    // Calculate salary components
    const calculations = this.calculateSalaryComponents(employerCost);
    
    // Calculate paid leave amount
    const paidLeaveAmount = workingDays > 0 
      ? (monthlySalary / workingDays) * totalPaidLeaveDays 
      : 0;
    
    // Attendance amount
    const attendanceAmount = workingDays > 0 
      ? (monthlySalary / workingDays) * attendanceDays 
      : 0;
    
    // Prepare detailed payroll data
    const payrollData = {
      empId: employeeId,
      month,
      year,
      
      // Legacy fields
      gross: calculations.grossSalary,
      deductions: calculations.totalDeductions,
      netPay: calculations.netSalary,
      
      // Detailed computation
      workedDays: {
        workingDaysInMonth: workingDays,
        attendance: {
          days: attendanceDays,
          amount: Math.round(attendanceAmount * 100) / 100,
          note: `${workingDays} working days in week`
        },
        paidTimeOff: {
          days: totalPaidLeaveDays,
          amount: Math.round(paidLeaveAmount * 100) / 100,
          note: `${Math.floor(totalPaidLeaveDays / workingDays * 4)} Paid leaves/Month`
        },
        total: {
          days: totalWorkedDays,
          amount: Math.round(employerCost * 100) / 100
        }
      },
      
      earnings: [
        { ruleName: 'Basic Salary', rate: 100, amount: calculations.basicSalary },
        { ruleName: 'House Rent Allowance', rate: 100, amount: calculations.hra },
        { ruleName: 'Standard Allowance', rate: 100, amount: calculations.standardAllowance },
        { ruleName: 'Performance Bonus', rate: 100, amount: calculations.performanceBonus },
        { ruleName: 'Leave Travel Allowance', rate: 100, amount: calculations.lta },
        { ruleName: 'Fixed Allowance', rate: 100, amount: calculations.fixedAllowance }
      ],
      
      grossAmount: calculations.grossSalary,
      
      deductionsList: [
        { ruleName: 'PF Employee', rate: 100, amount: calculations.pfEmployee },
        { ruleName: 'PF Employer', rate: 100, amount: calculations.pfEmployer },
        { ruleName: 'Professional Tax', rate: 100, amount: calculations.professionalTax }
      ],
      
      totalDeductions: calculations.totalDeductions,
      netAmount: calculations.netSalary,
      
      salaryStructure: 'Regular Pay',
      status: 'done',
      
      // Employee snapshot
      employeeSnapshot: {
        name: employee.name,
        employeeId: employee.employeeId || 'N/A',
        email: employee.email,
        department: employee.department || 'N/A',
        designation: employee.designation || 'N/A',
        location: employee.location || 'N/A',
        dateOfJoining: employee.joiningDate ? new Date(employee.joiningDate).toISOString() : 'N/A',
        pan: bankDetails?.panNumber || employee.pan || 'XXXxxxxxx3',
        uan: bankDetails?.uanNumber || employee.uan || '234234234243',
        bankAccount: bankDetails?.accountNumber || employee.bankAccountNumber || '234234234532'
      }
    };
    
    // Check if payroll already exists
    let payroll = await Payroll.findOne({ empId: employeeId, month, year });
    
    if (payroll) {
      // Update existing with all new fields
      Object.assign(payroll, payrollData);
      await payroll.save();
    } else {
      // Create new
      payroll = await Payroll.create(payrollData);
    }
    
    return {
      message: 'Payroll marked as done',
      payroll,
      attendanceInfo: {
        workingDays,
        presentDays: attendanceDays,
        paidLeaveDays: totalPaidLeaveDays,
        totalWorkedDays,
        monthlySalary,
        employerCost: Math.round(employerCost * 100) / 100
      }
    };
  }

  /**
   * Get detailed payslip information for an employee
   */
  async getEmployeePayslipDetail(employeeId, month, year) {
    const Leave = require('../models/Leave');
    
    // If month/year not provided, use previous month
    if (!month || !year) {
      const now = new Date();
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      month = previousMonth.getMonth() + 1;
      year = previousMonth.getFullYear();
    }
    
    month = parseInt(month);
    year = parseInt(year);
    
    // First, try to get stored payroll data
    const storedPayroll = await Payroll.findOne({ empId: employeeId, month, year });
    
    // If payroll is marked as 'done' and has detailed data, use it
    if (storedPayroll && storedPayroll.status === 'done' && storedPayroll.workedDays) {
      // Payrun information
      const payrunName = new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
      const period = `01 ${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} To ${new Date(year, month, 0).getDate()} ${new Date(year, month - 1).toLocaleString('default', { month: 'short' })}`;
      
      return {
        employee: {
          id: storedPayroll.employeeSnapshot?.employeeId || employeeId,
          name: storedPayroll.employeeSnapshot?.name || 'N/A',
          employeeId: storedPayroll.employeeSnapshot?.employeeId || 'N/A',
          email: storedPayroll.employeeSnapshot?.email || 'N/A',
          department: storedPayroll.employeeSnapshot?.department || 'N/A',
          designation: storedPayroll.employeeSnapshot?.designation || 'N/A',
          location: storedPayroll.employeeSnapshot?.location || 'N/A',
          dateOfJoining: storedPayroll.employeeSnapshot?.dateOfJoining || 'N/A',
          pan: storedPayroll.employeeSnapshot?.pan || 'N/A',
          uan: storedPayroll.employeeSnapshot?.uan || 'N/A',
          bankAccount: storedPayroll.employeeSnapshot?.bankAccount || 'N/A'
        },
        payrun: {
          name: `Payrun ${payrunName}`,
          period,
          monthName: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
          year: year,
          payDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        },
        salaryStructure: storedPayroll.salaryStructure || 'Regular Pay',
        workedDays: storedPayroll.workedDays,
        salaryComputation: {
          earnings: storedPayroll.earnings,
          gross: storedPayroll.grossAmount,
          deductions: storedPayroll.deductionsList,
          netAmount: storedPayroll.netAmount
        },
        monthlySalary: storedPayroll.workedDays?.total?.amount || 0
      };
    }
    
    // If no stored data or status is not 'done', calculate on the fly (legacy behavior)
    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    // Calculate working days in the month (5 days per week)
    const workingDays = this.getWorkingDaysInMonth(year, month);
    
    // Get attendance records for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const attendanceRecords = await Attendance.find({
      empId: employeeId,
      date: { $gte: startDate, $lte: endDate },
      status: 'present'
    });
    
    // Get approved paid leaves for the month
    const paidLeaves = await Leave.find({
      empId: employeeId,
      status: 'approved',
      leaveType: 'Paid time Off',
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });
    
    // Calculate paid leave days in this month
    let totalPaidLeaveDays = 0;
    paidLeaves.forEach(leave => {
      const leaveStart = new Date(Math.max(leave.startDate, startDate));
      const leaveEnd = new Date(Math.min(leave.endDate, endDate));
      
      // Count only weekdays (Mon-Fri) in the leave period
      let currentDate = new Date(leaveStart);
      while (currentDate <= leaveEnd) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
          totalPaidLeaveDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    // Total worked days = attendance days + paid leave days
    const attendanceDays = attendanceRecords.length;
    const totalWorkedDays = attendanceDays + totalPaidLeaveDays;
    
    // Monthly salary
    const monthlySalary = employee.salary || 0;
    
    // Calculate employer cost based on worked days
    const employerCost = workingDays > 0 
      ? (monthlySalary / workingDays) * totalWorkedDays 
      : monthlySalary;
    
    // Calculate salary components
    const calculations = this.calculateSalaryComponents(employerCost);
    
    // Calculate paid leave amount
    const paidLeaveAmount = workingDays > 0 
      ? (monthlySalary / workingDays) * totalPaidLeaveDays 
      : 0;
    
    // Payrun information
    const payrunName = new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
    const period = `01 ${new Date(year, month - 1).toLocaleString('default', { month: 'short' })} To ${new Date(year, month, 0).getDate()} ${new Date(year, month - 1).toLocaleString('default', { month: 'short' })}`;
    
    return {
      employee: {
        id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        location: employee.location || 'N/A',
        dateOfJoining: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : 'N/A',
        pan: employee.pan || 'XXXxxxxxx3',
        uan: employee.uan || '234234234243',
        bankAccount: employee.bankAccountNumber || '234234234532'
      },
      payrun: {
        name: `Payrun ${payrunName}`,
        period,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'short' }),
        year: year,
        payDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
      },
      salaryStructure: 'Regular Pay',
      workedDays: {
        workingDaysInMonth: workingDays,
        attendance: {
          days: attendanceDays,
          amount: workingDays > 0 ? Math.round((monthlySalary / workingDays) * attendanceDays * 100) / 100 : 0,
          note: `${workingDays} working days in week`
        },
        paidTimeOff: {
          days: totalPaidLeaveDays,
          amount: Math.round(paidLeaveAmount * 100) / 100,
          note: `${Math.floor(totalPaidLeaveDays / workingDays * 4)} Paid leaves/Month`
        },
        total: {
          days: totalWorkedDays,
          amount: Math.round(employerCost * 100) / 100
        }
      },
      salaryComputation: {
        earnings: [
          { ruleName: 'Basic Salary', rate: 100, amount: calculations.basicSalary },
          { ruleName: 'House Rent Allowance', rate: 100, amount: calculations.hra },
          { ruleName: 'Standard Allowance', rate: 100, amount: calculations.standardAllowance },
          { ruleName: 'Performance Bonus', rate: 100, amount: calculations.performanceBonus },
          { ruleName: 'Leave Travel Allowance', rate: 100, amount: calculations.lta },
          { ruleName: 'Fixed Allowance', rate: 100, amount: calculations.fixedAllowance }
        ],
        gross: calculations.grossSalary,
        deductions: [
          { ruleName: 'PF Employee', rate: 100, amount: -calculations.pfEmployee },
          { ruleName: 'PF Employer', rate: 100, amount: -calculations.pfEmployer },
          { ruleName: 'Professional Tax', rate: 100, amount: -calculations.professionalTax }
        ],
        netAmount: calculations.netSalary
      },
      monthlySalary
    };
  }

  /**
   * Get salary statement report for an employee
   */
  async getSalaryStatement(employeeId, year) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get all payroll records for the employee in the specified year
    const payrolls = await Payroll.find({
      empId: employeeId,
      year: targetYear
    }).sort({ month: 1 });

    // Get month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Build salary statement data
    const salaryData = [];
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (let month = 1; month <= 12; month++) {
      const payroll = payrolls.find(p => p.month === month);
      
      if (payroll) {
        const gross = payroll.grossAmount || payroll.gross || 0;
        const deduction = payroll.totalDeductions || payroll.deductions || 0;
        const net = payroll.netAmount || payroll.netPay || gross - deduction;

        salaryData.push({
          month: monthNames[month - 1],
          monthNumber: month,
          gross,
          deductions: deduction,
          net,
          hasData: true
        });

        totalGross += gross;
        totalDeductions += deduction;
        totalNet += net;
      } else {
        salaryData.push({
          month: monthNames[month - 1],
          monthNumber: month,
          gross: 0,
          deductions: 0,
          net: 0,
          hasData: false
        });
      }
    }

    return {
      employee: {
        id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        designation: employee.designation,
        department: employee.department
      },
      year: targetYear,
      salaryData,
      totals: {
        gross: totalGross,
        deductions: totalDeductions,
        net: totalNet
      }
    };
  }

  /**
   * Get detailed salary statement for print format
   */
  async getDetailedSalaryStatement(employeeId, year) {
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get all payroll records for the employee in the specified year
    const payrolls = await Payroll.find({
      empId: employeeId,
      year: targetYear
    }).sort({ month: 1 });

    // If no payroll data exists, return empty structure
    if (payrolls.length === 0) {
      return {
        employee: {
          name: employee.name,
          employeeId: employee.employeeId,
          designation: employee.designation,
          dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN') : 'N/A',
          salaryEffectiveFrom: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN') : 'N/A'
        },
        earnings: [],
        deductions: [],
        monthlyNet: 0,
        yearlyNet: 0
      };
    }

    // Get the most recent payroll to extract earnings and deductions structure
    const latestPayroll = payrolls[payrolls.length - 1];

    // Build earnings with monthly and yearly amounts
    const earnings = [];
    if (latestPayroll.earnings && latestPayroll.earnings.length > 0) {
      latestPayroll.earnings.forEach(earning => {
        const monthlyAmount = earning.amount || 0;
        const yearlyAmount = payrolls.reduce((sum, p) => {
          const earningInMonth = p.earnings?.find(e => e.ruleName === earning.ruleName);
          return sum + (earningInMonth?.amount || 0);
        }, 0);

        earnings.push({
          component: earning.ruleName,
          monthlyAmount,
          yearlyAmount
        });
      });
    }

    // Build deductions with monthly and yearly amounts
    const deductions = [];
    if (latestPayroll.deductionsList && latestPayroll.deductionsList.length > 0) {
      latestPayroll.deductionsList.forEach(deduction => {
        const monthlyAmount = deduction.amount || 0;
        const yearlyAmount = payrolls.reduce((sum, p) => {
          const deductionInMonth = p.deductionsList?.find(d => d.ruleName === deduction.ruleName);
          return sum + (deductionInMonth?.amount || 0);
        }, 0);

        deductions.push({
          component: deduction.ruleName,
          monthlyAmount,
          yearlyAmount
        });
      });
    }

    // Calculate totals
    const monthlyNet = (latestPayroll.netAmount || latestPayroll.netPay || 0);
    const yearlyNet = payrolls.reduce((sum, p) => sum + (p.netAmount || p.netPay || 0), 0);

    return {
      employee: {
        name: employee.name,
        employeeId: employee.employeeId,
        designation: employee.designation,
        dateOfJoining: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN') : 'N/A',
        salaryEffectiveFrom: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString('en-IN') : 'N/A'
      },
      earnings,
      deductions,
      monthlyNet,
      yearlyNet
    };
  }
}

module.exports = new PayrollService();
