const Employee = require('../models/Employee');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const bcrypt = require('bcryptjs');
const authService = require('./authService');
const emailService = require('../utils/emailService');

/**
 * Employee Service - Business logic for employee management
 */
class EmployeeService {
  /**
   * Get all employees with pagination and filters
   * Includes dynamic status based on today's attendance and leave
   */
  async getAllEmployees(query = {}) {
    const { page = 1, limit = 10, search, department, designation } = query;
    
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) filter.department = department;
    if (designation) filter.designation = designation;

    const skip = (page - 1) * limit;
    const employees = await Employee.find(filter)
      .populate('userId', 'name email loginId role')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's attendance for all employees
    const attendanceRecords = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    });

    // Fetch approved leaves for today
    const leaveRecords = await Leave.find({
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    // Create maps for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.empId?.toString()] = record;
    });

    const leaveMap = {};
    leaveRecords.forEach(record => {
      leaveMap[record.empId?.toString()] = record;
    });

    // Update employee status dynamically
    const employeesWithStatus = employees.map(emp => {
      const empObj = emp.toObject();
      const empId = emp._id.toString();
      
      // Check if on approved leave
      if (leaveMap[empId]) {
        empObj.status = 'On Leave';
      }
      // Check if checked in today
      else if (attendanceMap[empId] && attendanceMap[empId].checkIn) {
        empObj.status = 'Present';
      }
      // Otherwise absent
      else {
        empObj.status = 'Absent';
      }

      return empObj;
    });

    const total = await Employee.countDocuments(filter);

    return {
      employees: employeesWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(id) {
    const employee = await Employee.findById(id)
      .populate('userId', 'name email role loginId');

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  }

  /**
   * Create new employee
   */
  async createEmployee(employeeData) {
    const { email, password, name, role, joiningDate, ...otherData } = employeeData;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Use provided password or default
    const plainPassword = password || 'Welcome@123';

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Determine joining year from joiningDate or use current year
    const joiningYear = joiningDate 
      ? new Date(joiningDate).getFullYear() 
      : new Date().getFullYear();

    // Generate Login ID using authService method
    const loginId = await authService.generateLoginId(name, joiningYear);

    // Create user account with specified role or default to Employee
    const user = await User.create({
      name: name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      loginId,
      joiningYear,
    });

    // Create employee record
    const employee = await Employee.create({
      userId: user._id,
      name,
      email,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      ...otherData,
    });

    // Send welcome email with credentials (async, don't wait for it)
    emailService.sendWelcomeEmail({
      name: user.name,
      email: user.email,
      loginId: user.loginId,
      role: user.role,
      password: plainPassword,
    }).catch(err => {
      // Log error but don't fail the employee creation
      console.error('Failed to send welcome email:', err.message);
    });

    return await this.getEmployeeById(employee._id);
  }

  /**
   * Update employee
   */
  async updateEmployee(id, updateData) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Update employee
    Object.assign(employee, updateData);
    await employee.save();

    // Update user if email or name changed
    if (updateData.email || updateData.firstName || updateData.lastName) {
      const user = await User.findById(employee.user);
      if (user) {
        if (updateData.email) user.email = updateData.email;
        if (updateData.firstName || updateData.lastName) {
          user.name = `${updateData.firstName || employee.firstName} ${updateData.lastName || employee.lastName}`;
        }
        await user.save();
      }
    }

    return await this.getEmployeeById(id);
  }

  /**
   * Delete employee
   */
  async deleteEmployee(id) {
    const employee = await Employee.findById(id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Delete associated user
    if (employee.user) {
      await User.findByIdAndDelete(employee.user);
    }

    // Delete employee
    await Employee.findByIdAndDelete(id);

    return { message: 'Employee deleted successfully' };
  }
}

module.exports = new EmployeeService();
