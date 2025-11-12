import api from '../api';

/**
 * Payroll Service - API calls for payroll management
 */

export const payrollService = {
  /**
   * Get payroll dashboard
   */
  getDashboard: async () => {
    const response = await api.get('/admin/payroll/dashboard');
    return response.data;
  },

  /**
   * Get all payroll records
   */
  getAll: async (params = {}) => {
    const response = await api.get('/admin/payroll', { params });
    return response.data;
  },

  /**
   * Get payroll by ID
   */
  getById: async (id) => {
    const response = await api.get(`/admin/payroll/${id}`);
    return response.data;
  },

  /**
   * Create payroll record
   */
  create: async (payrollData) => {
    const response = await api.post('/admin/payroll', payrollData);
    return response.data;
  },

  /**
   * Update payroll record
   */
  update: async (id, payrollData) => {
    const response = await api.put(`/admin/payroll/${id}`, payrollData);
    return response.data;
  },

  /**
   * Delete payroll record
   */
  delete: async (id) => {
    const response = await api.delete(`/admin/payroll/${id}`);
    return response.data;
  },

  /**
   * Get all payruns
   */
  getAllPayruns: async (params = {}) => {
    const response = await api.get('/admin/payroll/payruns/list', { params });
    return response.data;
  },

  /**
   * Create payrun
   */
  createPayrun: async (payrunData) => {
    const response = await api.post('/admin/payroll/payruns', payrunData);
    return response.data;
  },

  /**
   * Update payrun status
   */
  updatePayrunStatus: async (id, status) => {
    const response = await api.patch(`/admin/payroll/payruns/${id}/status`, { status });
    return response.data;
  },
};

export default payrollService;
