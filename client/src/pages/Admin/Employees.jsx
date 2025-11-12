import React, { useState, useEffect } from 'react'
import EmployeeCard from '../../components/ui/EmployeeCard'
import Modal from '../../components/ui/Modal'
import EmployeeForm from '../../components/forms/EmployeeForm'
import api from '../../api'
import { FaUsers, FaSearch, FaBuilding, FaPlus } from 'react-icons/fa'

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

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/employees')
      if (response.data.success) setEmployees(response.data.employees || [])
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

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setIsFormModalOpen(true)
  }

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee)
    setIsFormModalOpen(true)
    setIsViewModalOpen(false)
  }

  const handleSubmitEmployee = async (formData) => {
    try {
      if (editingEmployee) {
        const response = await api.put(`/admin/employees/${editingEmployee._id}`, formData)
        if (response.data.success) {
          await fetchEmployees()
          setIsFormModalOpen(false)
          alert('Employee updated successfully!')
        }
      } else {
        // Create new employee - backend will create both user and employee
        const response = await api.post('/admin/employees', formData)
        if (response.data.success) {
          await fetchEmployees()
          setIsFormModalOpen(false)
          const loginId = response.data.loginId
          alert(`Employee added successfully!\n\nLogin ID: ${loginId}\nDefault Password: Welcome@123\n\nPlease share these credentials with the employee.`)
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
          setIsViewModalOpen(false)
          alert('Employee deleted successfully!')
        }
      } catch (err) {
        console.error('Error deleting employee:', err)
        alert(err.response?.data?.message || 'Failed to delete employee')
      }
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter
    const matchesStatus = !statusFilter || employee.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const stats = {
    total: employees.length,
    present: employees.filter((e) => e.status === 'Present').length,
    onLeave: employees.filter((e) => e.status === 'On Leave').length,
    absent: employees.filter((e) => e.status === 'Absent').length,
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading employees...</p>
        </div>
      </div>
    )

  return (
    <div className="rounded-3xl space-y-8">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-xl p-6">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <FaUsers className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Employees</h1>
              <p className="text-blue-100">Manage all employee records and profiles</p>
            </div>
          </div>
          <button
            onClick={handleAddEmployee}
            className="flex items-center gap-2 px-5 py-3 bg-white text-blue-700 rounded-xl font-semibold shadow-md hover:bg-blue-50 transition-all"
          >
            <FaPlus /> Add Employee
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <section className="bg-white/90 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-500" />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-blue-100 focus:ring-4 focus:ring-blue-200 outline-none shadow-sm"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-3 border border-blue-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 outline-none"
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
            className="px-4 py-3 border border-blue-100 rounded-xl shadow-sm focus:ring-4 focus:ring-blue-200 outline-none"
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="On Leave">On Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </section>

      {/* Employee Cards */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-md p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Employees Found</h3>
          <p className="text-gray-600 mb-4">
            {employees.length === 0
              ? 'Start by adding your first employee'
              : 'Try adjusting your filters'}
          </p>
          {employees.length === 0 && (
            <button
              onClick={handleAddEmployee}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              Add First Employee
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee._id}
              employee={employee}
              onClick={handleEmployeeClick}
            />
          ))}
        </div>
      )}

      {/* Employee View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Employee Details"
        footer={
          <>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => handleEditEmployee(selectedEmployee)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDeleteEmployee(selectedEmployee._id)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete
            </button>
          </>
        }
      >
        {selectedEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {selectedEmployee.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  {selectedEmployee.name}
                </h3>
                <p className="text-sm text-gray-600">{selectedEmployee.designation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-100">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{selectedEmployee.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">{selectedEmployee.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-800">{selectedEmployee.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEmployee.status === 'Present'
                      ? 'bg-green-100 text-green-800'
                      : selectedEmployee.status === 'On Leave'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {selectedEmployee.status}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Employee Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <EmployeeForm
          employee={editingEmployee}
          onSubmit={handleSubmitEmployee}
          onCancel={() => setIsFormModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
