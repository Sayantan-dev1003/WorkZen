import api from '../api';

/**
 * Employee Service - API calls for employee management
 */

export const employeeService = {
  /**
   * Get all employees
   */
  getAll: async (params = {}) => {
    const response = await api.get('/admin/employees', { params });
    return response.data;
  },

  /**
   * Get employee by ID
   */
  getById: async (id) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data;
  },

  /**
   * Create new employee
   */
  create: async (employeeData) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },

  /**
   * Update employee
   */
  update: async (id, employeeData) => {
    const response = await api.put(`/admin/employees/${id}`, employeeData);
    return response.data;
  },

  /**
   * Delete employee
   */
  delete: async (id) => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  },
};

export default employeeService;
