const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

/**
 * Leave/TimeOff Service - Business logic for leave management
 */
class LeaveService {
  /**
   * Get all leave requests
   */
  async getAllLeaves(query = {}) {
    const { page = 1, limit = 10, employeeId, status, leaveType } = query;
    
    const filter = {};
    if (employeeId) filter.empId = employeeId;
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    const skip = (page - 1) * limit;
    const leaves = await Leave.find(filter)
      .populate('empId', 'name email employeeId')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(filter);

    return {
      leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get leave by ID
   */
  async getLeaveById(id) {
    const leave = await Leave.findById(id)
      .populate('empId', 'name email employeeId');

    if (!leave) {
      throw new Error('Leave request not found');
    }

    return leave;
  }

  /**
   * Create leave request
   */
  async createLeave(leaveData) {
    const { empId } = leaveData;

    // Verify employee exists
    const employeeExists = await Employee.findById(empId);
    if (!employeeExists) {
      throw new Error('Employee not found');
    }

    const leave = await Leave.create({
      ...leaveData,
      status: 'pending',
    });

    return await this.getLeaveById(leave._id);
  }

  /**
   * Update leave request
   */
  async updateLeave(id, updateData) {
    const leave = await Leave.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('empId', 'name email employeeId');

    if (!leave) {
      throw new Error('Leave request not found');
    }

    return leave;
  }

  /**
   * Approve or reject leave
   */
  async updateLeaveStatus(id, status, remarks = '') {
    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be approved or rejected');
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status, remarks },
      { new: true, runValidators: true }
    ).populate('empId', 'name email employeeId');

    if (!leave) {
      throw new Error('Leave request not found');
    }

    return leave;
  }

  /**
   * Delete leave request
   */
  async deleteLeave(id) {
    const leave = await Leave.findByIdAndDelete(id);
    if (!leave) {
      throw new Error('Leave request not found');
    }

    return { message: 'Leave request deleted successfully' };
  }

  /**
   * Get employee leaves
   */
  async getEmployeeLeaves(empId, query = {}) {
    const { page = 1, limit = 100, status, year } = query;
    
    const filter = { empId };
    if (status) filter.status = status;
    
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      filter.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const skip = (page - 1) * limit;
    const leaves = await Leave.find(filter)
      .populate('empId', 'name email employeeId')
      .populate('approvedBy', 'name email')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(filter);

    return {
      leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get leave balance for employee
   */
  async getLeaveBalance(empId) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get all approved leaves for current year
    const approvedLeaves = await Leave.find({
      empId,
      status: 'approved',
      startDate: { $gte: startOfYear, $lte: endOfYear }
    });

    // Calculate used days by type
    const paidDaysUsed = approvedLeaves
      .filter(leave => leave.leaveType === 'Paid time Off')
      .reduce((sum, leave) => sum + leave.numberOfDays, 0);

    const sickDaysUsed = approvedLeaves
      .filter(leave => leave.leaveType === 'Sick time off')
      .reduce((sum, leave) => sum + leave.numberOfDays, 0);

    const unpaidDaysUsed = approvedLeaves
      .filter(leave => leave.leaveType === 'Unpaid')
      .reduce((sum, leave) => sum + leave.numberOfDays, 0);

    // Standard allocations (can be made configurable later)
    const paidTimeOffTotal = 24;
    const sickTimeOffTotal = 7;
    // Unpaid has no limit, so we don't track total/available

    return {
      paidTimeOff: {
        total: paidTimeOffTotal,
        used: paidDaysUsed,
        available: paidTimeOffTotal - paidDaysUsed
      },
      sickTimeOff: {
        total: sickTimeOffTotal,
        used: sickDaysUsed,
        available: sickTimeOffTotal - sickDaysUsed
      },
      unpaid: {
        used: unpaidDaysUsed
      }
    };
  }

  /**
   * Cancel leave request (only pending leaves)
   */
  async cancelLeave(id, empId) {
    const leave = await Leave.findOne({ _id: id, empId });
    
    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending') {
      throw new Error('Only pending leave requests can be cancelled');
    }

    await Leave.findByIdAndDelete(id);
    
    return { message: 'Leave request cancelled successfully' };
  }
}

module.exports = new LeaveService();
