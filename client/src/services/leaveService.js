import api from '../api';

/**
 * Leave/TimeOff Service - API calls for leave management
 */

export const leaveService = {
  /**
   * Get all leave requests
   */
  getAll: async (params = {}) => {
    const response = await api.get('/admin/timeoff', { params });
    return response.data;
  },

  /**
   * Get leave by ID
   */
  getById: async (id) => {
    const response = await api.get(`/admin/timeoff/${id}`);
    return response.data;
  },

  /**
   * Create leave request
   */
  create: async (leaveData) => {
    const response = await api.post('/admin/timeoff', leaveData);
    return response.data;
  },

  /**
   * Update leave request
   */
  update: async (id, leaveData) => {
    const response = await api.put(`/admin/timeoff/${id}`, leaveData);
    return response.data;
  },

  /**
   * Approve or reject leave
   */
  updateStatus: async (id, status, remarks = '') => {
    const response = await api.patch(`/admin/timeoff/${id}/status`, { status, remarks });
    return response.data;
  },

  /**
   * Delete leave request
   */
  delete: async (id) => {
    const response = await api.delete(`/admin/timeoff/${id}`);
    return response.data;
  },

  /**
   * Get my leave requests (Employee)
   */
  getMyRequests: async (params = {}) => {
    const response = await api.get('/leaves/my-requests', { params });
    return response.data;
  },

  /**
   * Get leave balance (Employee)
   */
  getBalance: async () => {
    const response = await api.get('/leaves/balance');
    return response.data;
  },

  /**
   * Create leave request (Employee)
   */
  createMyRequest: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  /**
   * Cancel leave request (Employee)
   */
  cancelMyRequest: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },
};

export default leaveService;
