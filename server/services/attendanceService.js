const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

/**
 * Attendance Service - Business logic for attendance management
 */
class AttendanceService {
  /**
   * Get all attendance records
   */
  async getAllAttendance(query = {}) {
    const { page = 1, limit = 10, employeeId, startDate, endDate } = query;
    
    console.log('getAllAttendance - query:', query);
    
    const filter = {};
    if (employeeId) filter.empId = employeeId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    console.log('getAllAttendance - filter:', filter);

    const skip = (page - 1) * limit;
    const attendance = await Attendance.find(filter)
      .populate('empId', 'name email employeeId')
      .populate('userId', 'name email role')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ date: -1 });

    console.log('getAllAttendance - found records:', attendance.length);
    console.log('getAllAttendance - records:', attendance);

    const total = await Attendance.countDocuments(filter);

    return {
      attendance,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get attendance by ID
   */
  async getAttendanceById(id) {
    const attendance = await Attendance.findById(id)
      .populate('empId', 'name email employeeId');

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    return attendance;
  }

  /**
   * Create attendance record
   */
  async createAttendance(attendanceData) {
    const { empId, date } = attendanceData;

    // Verify employee exists
    const employeeExists = await Employee.findById(empId);
    if (!employeeExists) {
      throw new Error('Employee not found');
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      empId,
      date: new Date(date),
    });

    if (existingAttendance) {
      throw new Error('Attendance record already exists for this date');
    }

    const attendance = await Attendance.create(attendanceData);
    return await this.getAttendanceById(attendance._id);
  }

  /**
   * Update attendance record
   */
  async updateAttendance(id, updateData) {
    const attendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('empId', 'name email employeeId');

    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    return attendance;
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(id) {
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      throw new Error('Attendance record not found');
    }

    return { message: 'Attendance record deleted successfully' };
  }

  /**
   * Get today's attendance for an employee
   */
  async getTodayAttendance(empId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      empId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('empId', 'name email employeeId');

    return attendance;
  }

  /**
   * Employee check-in
   */
  async checkIn(empId, userId) {
    // Check if employee exists
    const employee = await Employee.findById(empId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if already checked in today
    const existingAttendance = await this.getTodayAttendance(empId);
    
    if (existingAttendance) {
      if (existingAttendance.checkIn) {
        throw new Error('You have already checked in today');
      }
      // Update existing record with check-in
      existingAttendance.checkIn = new Date();
      existingAttendance.status = 'present';
      await existingAttendance.save();
      return existingAttendance;
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      userId,
      empId,
      date: new Date(),
      checkIn: new Date(),
      status: 'present'
    });

    return await this.getTodayAttendance(empId);
  }

  /**
   * Employee check-out
   */
  async checkOut(empId) {
    const attendance = await this.getTodayAttendance(empId);
    
    if (!attendance) {
      throw new Error('No check-in record found for today');
    }

    if (!attendance.checkIn) {
      throw new Error('You must check in before checking out');
    }

    if (attendance.checkOut) {
      throw new Error('You have already checked out today');
    }

    attendance.checkOut = new Date();
    await attendance.save();

    return attendance;
  }

  /**
   * Get today's attendance for a user (Admin, HR, PayrollOfficer, etc.)
   */
  async getTodayUserAttendance(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('getTodayUserAttendance - userId:', userId);
    console.log('getTodayUserAttendance - date range:', { today, tomorrow });

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('userId', 'name email role');

    console.log('getTodayUserAttendance - found:', attendance);

    return attendance;
  }

  /**
   * User check-in (for Admin, HR, PayrollOfficer, Employee)
   */
  async userCheckIn(userId) {
    const User = require('../models/User');
    
    console.log('userCheckIn - userId:', userId);
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log('userCheckIn - user found:', user.name, user.role);

    // Check if already checked in today
    const existingAttendance = await this.getTodayUserAttendance(userId);
    
    console.log('userCheckIn - existing attendance:', existingAttendance);
    
    if (existingAttendance) {
      if (existingAttendance.checkIn) {
        throw new Error('You have already checked in today');
      }
      // Update existing record with check-in
      existingAttendance.checkIn = new Date();
      existingAttendance.status = 'present';
      await existingAttendance.save();
      console.log('userCheckIn - updated existing:', existingAttendance);
      return existingAttendance;
    }

    // Create new attendance record
    const attendance = await Attendance.create({
      userId,
      date: new Date(),
      checkIn: new Date(),
      status: 'present'
    });

    console.log('userCheckIn - created new:', attendance);

    return await this.getTodayUserAttendance(userId);
  }

  /**
   * User check-out (for Admin, HR, PayrollOfficer, Employee)
   */
  async userCheckOut(userId) {
    console.log('userCheckOut - userId:', userId);
    
    const attendance = await this.getTodayUserAttendance(userId);
    
    console.log('userCheckOut - found attendance:', attendance);
    
    if (!attendance) {
      throw new Error('No check-in record found for today');
    }

    if (!attendance.checkIn) {
      throw new Error('You must check in before checking out');
    }

    if (attendance.checkOut) {
      throw new Error('You have already checked out today');
    }

    attendance.checkOut = new Date();
    await attendance.save();

    console.log('userCheckOut - updated attendance:', attendance);

    return attendance;
  }

  /**
   * Get attendance records for a specific employee (by empId or userId)
   */
  async getEmployeeAttendance(empId, query = {}) {
    const { startDate, endDate, limit = 100 } = query;
    
    console.log('getEmployeeAttendance - empId:', empId);
    console.log('getEmployeeAttendance - query:', query);
    
    const filter = { empId };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    console.log('getEmployeeAttendance - filter:', filter);

    const attendance = await Attendance.find(filter)
      .populate('empId', 'name email employeeId')
      .limit(parseInt(limit))
      .sort({ date: -1 });

    console.log('getEmployeeAttendance - found attendance:', attendance.length);

    return {
      attendance,
      total: attendance.length
    };
  }

  /**
   * Get attendance records for a user (by userId - for employees without Employee profile)
   */
  async getUserAttendance(userId, query = {}) {
    const { startDate, endDate, limit = 100 } = query;
    
    console.log('getUserAttendance - userId:', userId);
    console.log('getUserAttendance - query:', query);
    
    const filter = { userId };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    console.log('getUserAttendance - filter:', filter);

    const attendance = await Attendance.find(filter)
      .populate('userId', 'name email role')
      .limit(parseInt(limit))
      .sort({ date: -1 });

    console.log('getUserAttendance - found attendance:', attendance.length);

    return {
      attendance,
      total: attendance.length
    };
  }
}

module.exports = new AttendanceService();
