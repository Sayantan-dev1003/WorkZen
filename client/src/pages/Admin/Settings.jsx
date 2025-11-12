import React, { useState, useEffect } from 'react'
import api from '../../api'
import { FaCog, FaSearch, FaEdit, FaSave, FaTimes } from 'react-icons/fa'

export default function Settings() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editingUserId, setEditingUserId] = useState(null)
  const [editingRole, setEditingRole] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching employees for settings...')
      // Request all employees without pagination limit
      const response = await api.get('/admin/employees?limit=1000')
      console.log('Response:', response.data)
      
      if (response.data.success) {
        // Map employees to include user details
        const employeesData = response.data.employees || []
        console.log('Employees data:', employeesData)
        
        const usersData = employeesData.map(emp => ({
          _id: emp.userId?._id,
          name: emp.userId?.name || emp.name,
          loginId: emp.userId?.loginId,
          email: emp.userId?.email || emp.email,
          role: emp.userId?.role,
          department: emp.department,
          designation: emp.designation,
        }))
        console.log('Mapped users data:', usersData)
        
        const filteredUsers = usersData.filter(u => u._id)
        console.log('Filtered users (with userId):', filteredUsers)
        setUsers(filteredUsers)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (user) => {
    setEditingUserId(user._id)
    setEditingRole(user.role)
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditingRole('')
  }

  const handleSaveRole = async (userId) => {
    try {
      setUpdating(true)
      const response = await api.put(`/admin/users/${userId}/role`, { role: editingRole })
      if (response.data.success) {
        // Update local state
        setUsers(users.map(u => 
          u._id === userId ? { ...u, role: editingRole } : u
        ))
        setEditingUserId(null)
        setEditingRole('')
        alert('Role updated successfully!')
      }
    } catch (err) {
      console.error('Error updating role:', err)
      alert(err.response?.data?.message || 'Failed to update role')
    } finally {
      setUpdating(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = (
      user.name?.toLowerCase().includes(searchLower) ||
      user.loginId?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower) ||
      user.designation?.toLowerCase().includes(searchLower)
    )
    const matchesDepartment = !departmentFilter || user.department === departmentFilter
    const matchesRole = !roleFilter || user.role === roleFilter
    
    return matchesSearch && matchesDepartment && matchesRole
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
          <FaCog className="text-white text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-600 mt-1">Manage user roles and permissions</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, login ID, email, department, or designation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Design">Design</option>
          </select>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="HR">HR</option>
            <option value="PayrollOfficer">Payroll Officer</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Login ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Department</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Designation</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-slate-400">
                      <FaSearch className="text-4xl mx-auto mb-2" />
                      <p className="text-lg">No users found</p>
                      <p className="text-sm">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        {user.loginId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4 text-slate-600">{user.department || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600">{user.designation || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {editingUserId === user._id ? (
                        <select
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          disabled={updating}
                        >
                          <option value="Employee">Employee</option>
                          <option value="HR">HR</option>
                          <option value="PayrollOfficer">Payroll Officer</option>
                          <option value="Admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'Admin' 
                            ? 'bg-red-100 text-red-800' 
                            : user.role === 'HR'
                            ? 'bg-blue-100 text-blue-800'
                            : user.role === 'PayrollOfficer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingUserId === user._id ? (
                          <>
                            <button
                              onClick={() => handleSaveRole(user._id)}
                              disabled={updating}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                              title="Save"
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updating}
                              className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                              title="Cancel"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            title="Edit Role"
                          >
                            <FaEdit />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}