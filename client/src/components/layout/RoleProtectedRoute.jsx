import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Normalize role names for comparison
  const userRole = user.role.toLowerCase()
  const allowed = allowedRoles.map(r => r.toLowerCase())

  if (!allowed.includes(userRole)) {
    // Redirect to user's appropriate page
    const roleRoutes = {
      'admin': '/admin/employees',
      'hr': '/hr/employees',
      'payrollofficer': '/payroll/attendance',
      'employee': '/employee/attendance',
    }
    return <Navigate to={roleRoutes[userRole] || '/employee/attendance'} replace />
  }

  return children
}

export default RoleProtectedRoute
