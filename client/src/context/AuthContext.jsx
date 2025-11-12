import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      console.log('Login response:', response)
      
      // Backend returns { success: true, user, token }
      if (!response.success || !response.user || !response.token) {
        throw new Error('Invalid response format')
      }
      
      const { user, token } = response
      
      // Store token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      
      console.log('User set:', user)
      console.log('User role:', user.role)
      
      // Redirect based on role
      const normalizedRole = user.role.toLowerCase()
      const roleRoutes = {
        'admin': '/admin/employees',
        'hr': '/hr/employees',
        'payrollofficer': '/payroll/attendance',
        'employee': '/employee/attendance',
      }
      
      const route = roleRoutes[normalizedRole] || '/employee/attendance'
      console.log('Navigating to:', route)
      
      // Navigate after a short delay to ensure state is set
      setTimeout(() => {
        navigate(route, { replace: true })
      }, 100)
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.response?.data?.message || error.message || 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const hasRole = (allowedRoles) => {
    if (!user) return false
    return allowedRoles.includes(user.role.toLowerCase())
  }

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAuthenticated: !!user,
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
