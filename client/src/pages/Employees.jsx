import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // Assuming Framer Motion is installed for advanced animations
import EmployeeCard from '../components/ui/EmployeeCard'
import Modal from '../components/ui/Modal'
import EmployeeForm from '../components/forms/EmployeeForm'
import api from '../api'

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Fetch employees from API
  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/employees')
      if (response.data.success) {
        setEmployees(response.data.employees || [])
      }
    } catch (err) {
      console.error('Error fetching employees:', err)
      setError(err.response?.data?.message || 'Failed to fetch employees')
    } finally {
      setLoading(false)
    }
  }

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee)
    setIsViewModalOpen(true)
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setIsFormModalOpen(true)
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setIsFormModalOpen(true)
    setIsViewModalOpen(false)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setEditingEmployee(null)
  }

  const handleSubmitEmployee = async (formData) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        const response = await api.put(`/admin/employees/${editingEmployee._id}`, formData)
        if (response.data.success) {
          await fetchEmployees()
          handleCloseFormModal()
          alert('Employee updated successfully!')
        }
      } else {
        // Create new employee - first create user, then employee
        const userData = {
          name: formData.name,
          email: formData.email,
          password: 'Welcome@123', // Default password
          role: 'employee'
        }
        
        const userResponse = await api.post('/auth/register', userData)
        if (userResponse.data.success) {
          const employeeData = {
            ...formData,
            userId: userResponse.data.user._id
          }
          
          const empResponse = await api.post('/admin/employees', employeeData)
          if (empResponse.data.success) {
            await fetchEmployees()
            handleCloseFormModal()
            alert(`Employee added successfully! Default password: Welcome@123`)
          }
        }
      }
    } catch (err) {
      console.error('Error saving employee:', err)
      alert(err.response?.data?.message || 'Failed to save employee')
    }
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await api.delete(`/admin/employees/${employeeId}`)
        if (response.data.success) {
          await fetchEmployees()
          handleCloseViewModal()
          alert('Employee deleted successfully!')
        }
      } catch (err) {
        console.error('Error deleting employee:', err)
        alert(err.response?.data?.message || 'Failed to delete employee')
      }
    }
  }

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter
    const matchesStatus = !statusFilter || employee.status === statusFilter
    
    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Calculate statistics
  const stats = {
    total: employees.length,
    present: employees.filter(e => e.status === 'Present').length,
    onLeave: employees.filter(e => e.status === 'On Leave').length,
    absent: employees.filter(e => e.status === 'Absent').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="mt-4 text-slate-600">Loading employees...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-6 space-y-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Page Header */}
      <motion.section 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full translate-y-10 -translate-x-10"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent"
            >
              Employees
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-emerald-100 text-lg"
            >
              Manage employee records and information with ease
            </motion.p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddEmployee}
            className="group bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/30 border border-white/30 flex items-center gap-3 shadow-xl hover:shadow-2xl"
          >
            <motion.span 
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-xl"
            >
              ➕
            </motion.span>
            <span>Add Employee</span>
          </motion.button>
        </div>
      </motion.section>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-2 border-red-200/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-2xl"
              >
                ⚠️
              </motion.div>
              <p className="text-red-600 font-medium flex-1">{error}</p>
              <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {Object.entries(stats).map(([key, value], index) => {
          const icons = {
            total: { emoji: '👥', color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-600' },
            present: { emoji: '✅', color: 'from-green-500 to-emerald-500', textColor: 'text-green-600' },
            onLeave: { emoji: '🏖️', color: 'from-blue-500 to-cyan-500', textColor: 'text-blue-600' },
            absent: { emoji: '⚠️', color: 'from-yellow-500 to-amber-500', textColor: 'text-yellow-600' }
          }
          const stat = icons[key]
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-emerald-200/50 overflow-hidden relative`}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <motion.span 
                    className="text-2xl"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.emoji}
                  </motion.span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 relative z-10">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              <motion.p 
                className={`text-3xl font-bold ${stat.textColor} relative z-10`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {value}
              </motion.p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-emerald-100/50"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder="🔍 Search employees by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 pr-12 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
            />
            <motion.span 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:scale-110 transition-transform"
              initial={{ scale: 1 }}
              whileFocus={{ scale: 1.1 }}
            >
              🔍
            </motion.span>
          </div>
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-6 py-4 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Design">Design</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-4 border-2 border-emerald-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300 bg-white/50 backdrop-blur-sm"
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="On Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </motion.div>

      {/* Employee Cards Grid */}
      <AnimatePresence>
        {filteredEmployees.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-emerald-100/50"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-24 h-24 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-5xl">👥</span>
            </motion.div>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-gray-800 mb-3"
            >
              No Employees Found
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 mb-6 text-lg"
            >
              {employees.length === 0 
                ? "Get started by adding your first employee"
                : "Try adjusting your search or filters"
              }
            </motion.p>
            {employees.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddEmployee}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Add First Employee
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EmployeeCard
                  employee={employee}
                  onClick={handleEmployeeClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            title="Employee Details"
            footer={
              <div className="flex justify-end gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCloseViewModal}
                  className="px-6 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  Close
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleEditEmployee(selectedEmployee)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  Edit Employee
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteEmployee(selectedEmployee._id)}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
                >
                  Delete
                </motion.button>
              </div>
            }
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-6"
              >
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-2xl overflow-hidden">
                  <span>{selectedEmployee.name.split(' ').map(n => n[0]).join('')}</span>
                  <div className="absolute inset-0 bg-white/20 animate-ping rounded-full"></div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {selectedEmployee.name}
                  </h3>
                  <p className="text-base text-slate-600">{selectedEmployee.designation}</p>
                  <p className="text-sm text-slate-500">{selectedEmployee.employeeId}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50"
              >
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium text-slate-800 break-all">{selectedEmployee.email}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-medium text-slate-800">{selectedEmployee.phone || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Department</p>
                  <p className="font-medium text-slate-800">{selectedEmployee.department}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Status</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-md ${
                      selectedEmployee.status === 'Present'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : selectedEmployee.status === 'On Leave'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}
                  >
                    {selectedEmployee.status}
                  </span>
                </div>
                {selectedEmployee.manager && (
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-slate-600">Manager</p>
                    <p className="font-medium text-slate-800">{selectedEmployee.manager}</p>
                  </div>
                )}
                {selectedEmployee.location && (
                  <div className="space-y-2 md:col-span-2">
                    <p className="text-sm text-slate-600">Location</p>
                    <p className="font-medium text-slate-800">{selectedEmployee.location}</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Add/Edit Employee Form Modal */}
      <AnimatePresence>
        {isFormModalOpen && (
          <Modal
            isOpen={isFormModalOpen}
            onClose={handleCloseFormModal}
            title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
            className="backdrop-blur-sm bg-black/30" // Enhanced backdrop
          >
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <EmployeeForm
                employee={editingEmployee}
                onSubmit={handleSubmitEmployee}
                onCancel={handleCloseFormModal}
              />
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}