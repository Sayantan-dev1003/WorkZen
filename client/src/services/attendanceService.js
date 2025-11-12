import api from '../api';

/**
 * Attendance Service - API calls for attendance management
 */

export const attendanceService = {
  /**
   * Get all attendance records (Admin)
   */
  getAll: async (params = {}) => {
    const response = await api.get('/admin/attendance', { params });
    return response.data;
  },

  /**
   * Get attendance by ID (Admin)
   */
  getById: async (id) => {
    const response = await api.get(`/admin/attendance/${id}`);
    return response.data;
  },

  /**
   * Create attendance record (Admin)
   */
  create: async (attendanceData) => {
    const response = await api.post('/admin/attendance', attendanceData);
    return response.data;
  },

  /**
   * Update attendance record (Admin)
   */
  update: async (id, attendanceData) => {
    const response = await api.put(`/admin/attendance/${id}`, attendanceData);
    return response.data;
  },

  /**
   * Delete attendance record (Admin)
   */
  delete: async (id) => {
    const response = await api.delete(`/admin/attendance/${id}`);
    return response.data;
  },

  /**
   * Get today's attendance status for logged-in employee
   */
  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  /**
   * Get my attendance records (Employee)
   */
  getMyRecords: async (params = {}) => {
    const response = await api.get('/attendance/my-records', { params });
    return response.data;
  },

  /**
   * Employee check-in
   */
  checkIn: async () => {
    const response = await api.post('/attendance/checkin');
    return response.data;
  },

  /**
   * Employee check-out
   */
  checkOut: async () => {
    const response = await api.post('/attendance/checkout');
    return response.data;
  },

  /**
   * Mark attendance for logged-in user (Admin, HR, PayrollOfficer)
   */
  markUserAttendance: async () => {
    const response = await api.post('/admin/attendance/mark');
    return response.data;
  },

  /**
   * Check out for logged-in user (Admin, HR, PayrollOfficer)
   */
  checkOutUser: async () => {
    const response = await api.post('/admin/attendance/checkout');
    return response.data;
  },

  /**
   * Get today's attendance status for logged-in user
   */
  getTodayUserStatus: async () => {
    const response = await api.get('/admin/attendance/today');
    return response.data;
  },

  // HR-specific methods
  /**
   * Get all attendance records (HR)
   */
  getAllHR: async (params = {}) => {
    const response = await api.get('/hr/attendance', { params });
    return response.data;
  },

  /**
   * Get attendance by ID (HR)
   */
  getByIdHR: async (id) => {
    const response = await api.get(`/hr/attendance/${id}`);
    return response.data;
  },

  /**
   * Create attendance record (HR)
   */
  createHR: async (attendanceData) => {
    const response = await api.post('/hr/attendance', attendanceData);
    return response.data;
  },

  /**
   * Update attendance record (HR)
   */
  updateHR: async (id, attendanceData) => {
    const response = await api.put(`/hr/attendance/${id}`, attendanceData);
    return response.data;
  },

  /**
   * Delete attendance record (HR)
   */
  deleteHR: async (id) => {
    const response = await api.delete(`/hr/attendance/${id}`);
    return response.data;
  },

  /**
   * Mark attendance for logged-in user (HR)
   */
  markUserAttendanceHR: async () => {
    const response = await api.post('/hr/attendance/mark');
    return response.data;
  },

  /**
   * Get today's attendance status for logged-in user (HR)
   */
  getTodayUserStatusHR: async () => {
    const response = await api.get('/hr/attendance/today');
    return response.data;
  },
};

export default attendanceService;
