import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUsers,
  FaChartBar,
} from 'react-icons/fa'
import payrollService from '../../services/payrollService'

export default function PayrollDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    warnings: {
      employeesWithoutBank: []
    },
    payruns: [],
    monthlyStats: [],
    totalEmployees: 0
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await payrollService.getDashboard()
      
      if (response.success) {
        // The data is spread directly in the response by the backend
        const newDashboardData = {
          warnings: response.warnings || { employeesWithoutBank: [] },
          payruns: response.payruns || [],
          monthlyStats: response.monthlyStats || [],
          totalEmployees: response.totalEmployees || 0
        }
        setDashboardData(newDashboardData)
      }
    } catch (error) {
      console.error('Error fetching payroll dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMaxValue = (data, key) => {
    return Math.max(...data.map(d => d[key] || 0), 1)
  }

  const formatCurrency = (amount) => {
    return `₹ ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const handlePayrunClick = () => {
    // Navigate to Payrun tab
    navigate('/admin/payroll?tab=payrun')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const { warnings = { employeesWithoutBank: [] }, payruns = [], monthlyStats = [] } = dashboardData || {}
  const hasWarnings = warnings.employeesWithoutBank.length > 0

  return (
    <div className="space-y-6">
      {/* Warnings Section */}
      {hasWarnings && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-yellow-400 text-2xl mt-1 mr-4" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4">Warnings</h3>
              
              {warnings.employeesWithoutBank.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">
                    {warnings.employeesWithoutBank.length} Employee{warnings.employeesWithoutBank.length !== 1 ? 's' : ''} without Bank A/c
                  </h4>
                  <div className="space-y-1">
                    {warnings.employeesWithoutBank.map(emp => (
                      <div key={emp.id} className="text-sm text-yellow-700">
                        • {emp.name} ({emp.employeeId}) - {emp.email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Net Wages Chart */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Total Net Wages (Monthly)</h3>
            <div className="flex items-center gap-4">
              <button className="text-sm text-slate-600 hover:text-slate-800">Annually</button>
              <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Monthly</button>
            </div>
          </div>
          
          {monthlyStats.length > 0 ? (
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => {
                const maxCost = getMaxValue(monthlyStats, 'employerCost')
                const heightPercent = maxCost > 0 ? (stat.employerCost / maxCost) * 100 : 0
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-slate-600 font-medium">
                      {stat.month}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-12 bg-slate-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${Math.max(heightPercent, 5)}%` }}
                        >
                          {heightPercent > 20 && (
                            <span className="text-white text-sm font-semibold">
                              {formatCurrency(stat.employerCost)}
                            </span>
                          )}
                        </div>
                      </div>
                      {(heightPercent <= 20 || heightPercent === 0) && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-700 text-sm font-semibold">
                          {stat.employerCost > 0 ? formatCurrency(stat.employerCost) : '₹ 0.00'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No payroll data available</p>
          )}
        </div>

        {/* Employee Count Chart */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Employees Paid (Monthly)</h3>
            <div className="flex items-center gap-4">
              <button className="text-sm text-slate-600 hover:text-slate-800">Annually</button>
              <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600">Monthly</button>
            </div>
          </div>
          
          {monthlyStats.length > 0 ? (
            <div className="space-y-4">
              {monthlyStats.map((stat, index) => {
                const maxCount = getMaxValue(monthlyStats, 'employeeCount')
                const heightPercent = maxCount > 0 ? (stat.employeeCount / maxCount) * 100 : 0
                
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-slate-600 font-medium">
                      {stat.month}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-12 bg-slate-100 rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                          style={{ width: `${Math.max(heightPercent, 5)}%` }}
                        >
                          {heightPercent > 20 && (
                            <span className="text-white text-sm font-semibold">
                              {stat.employeeCount} {stat.employeeCount === 1 ? 'Employee' : 'Employees'}
                            </span>
                          )}
                        </div>
                      </div>
                      {(heightPercent <= 20 || heightPercent === 0) && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-700 text-sm font-semibold">
                          {stat.employeeCount} {stat.employeeCount === 1 ? 'Employee' : 'Employees'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No payroll data available</p>
          )}
        </div>
      </div>
    </div>
  )
}
