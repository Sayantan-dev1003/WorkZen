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
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-5 rounded-xl shadow-md">
          <div className="flex items-start">
            <div className="bg-yellow-400 p-2.5 rounded-lg mr-4">
              <FaExclamationTriangle className="text-white text-xl" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-yellow-800 mb-3">Action Required</h3>
              
              {warnings.employeesWithoutBank.length > 0 && (
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2 text-base">
                    {warnings.employeesWithoutBank.length} Employee{warnings.employeesWithoutBank.length !== 1 ? 's' : ''} without Bank Account
                  </h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {warnings.employeesWithoutBank.map(emp => (
                      <div key={emp.id} className="text-xs text-yellow-700 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                        <span className="font-medium">{emp.name}</span>
                        <span className="text-yellow-600">({emp.employeeId})</span>
                        <span className="text-yellow-500">- {emp.email}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <FaMoneyBillWave className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs font-medium">This Month</p>
              <p className="text-xl font-bold mt-1">
                {monthlyStats.length > 0 && monthlyStats[monthlyStats.length - 1]?.employerCost > 0
                  ? formatCurrency(monthlyStats[monthlyStats.length - 1].employerCost)
                  : '₹ 0.00'}
              </p>
            </div>
          </div>
          <p className="text-blue-100 text-sm font-medium">Total Wages Paid</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <FaUsers className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-indigo-100 text-xs font-medium">This Month</p>
              <p className="text-xl font-bold mt-1">
                {monthlyStats.length > 0 ? monthlyStats[monthlyStats.length - 1]?.employeeCount || 0 : 0}
              </p>
            </div>
          </div>
          <p className="text-indigo-100 text-sm font-medium">Employees Paid</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <FaChartBar className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-xs font-medium">Total Records</p>
              <p className="text-xl font-bold mt-1">{monthlyStats.length}</p>
            </div>
          </div>
          <p className="text-purple-100 text-sm font-medium">Payroll Months</p>
        </div>
      </div>

      {/* Charts Section - Compact Design */}
      {monthlyStats.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Net Wages Chart - Modern Card Style */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2.5 rounded-xl shadow-md">
                    <FaMoneyBillWave className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Monthly Wages</h3>
                    <p className="text-sm text-slate-600">Last 6 months overview</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Chart Area */}
              <div className="relative">
                <div className="flex items-end justify-between gap-4 h-56 pb-8 relative">
                  {monthlyStats.slice(-6).map((stat, index) => {
                    const maxCost = getMaxValue(monthlyStats, 'employerCost')
                    const heightPercent = maxCost > 0 ? ((stat.employerCost || 0) / maxCost) * 100 : 0
                    const barHeight = Math.max(heightPercent, 5) // Minimum 5% height
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        {/* Value above bar */}
                        <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            {formatCurrency(stat.employerCost || 0)}
                          </div>
                        </div>
                        
                        {/* Bar container */}
                        <div className="w-full flex flex-col items-center justify-end" style={{ height: '180px' }}>
                          <div 
                            className="w-full bg-gradient-to-t from-blue-600 via-blue-500 to-blue-400 rounded-t-xl shadow-md hover:shadow-lg transition-all duration-300 relative group cursor-pointer transform hover:scale-105"
                            style={{ height: `${barHeight}%` }}
                          >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 rounded-t-xl"></div>
                          </div>
                        </div>
                        
                        {/* Month label */}
                        <div className="mt-3 text-sm font-semibold text-slate-700">
                          {stat.month.slice(0, 3)}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Baseline */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-300"></div>
              </div>
              
              {/* Stats footer */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Total Paid</p>
                    <p className="text-base font-bold text-blue-600">
                      {formatCurrency(monthlyStats.reduce((sum, stat) => sum + (stat.employerCost || 0), 0))}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Average/Month</p>
                    <p className="text-base font-bold text-indigo-600">
                      {formatCurrency(monthlyStats.reduce((sum, stat) => sum + (stat.employerCost || 0), 0) / monthlyStats.length)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Count Chart - Modern Card Style */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500 p-2.5 rounded-xl shadow-md">
                    <FaUsers className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Employees Paid</h3>
                    <p className="text-sm text-slate-600">Monthly distribution</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Chart Area */}
              <div className="relative">
                <div className="flex items-end justify-between gap-4 h-56 pb-8 relative">
                  {monthlyStats.slice(-6).map((stat, index) => {
                    const maxCount = getMaxValue(monthlyStats, 'employeeCount')
                    const heightPercent = maxCount > 0 ? ((stat.employeeCount || 0) / maxCount) * 100 : 0
                    const barHeight = Math.max(heightPercent, 5) // Minimum 5% height
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center group">
                        {/* Value above bar */}
                        <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                            {stat.employeeCount || 0}
                          </div>
                        </div>
                        
                        {/* Bar container */}
                        <div className="w-full flex flex-col items-center justify-end" style={{ height: '180px' }}>
                          <div 
                            className="w-full bg-gradient-to-t from-indigo-600 via-indigo-500 to-indigo-400 rounded-t-xl shadow-md hover:shadow-lg transition-all duration-300 relative group cursor-pointer transform hover:scale-105"
                            style={{ height: `${barHeight}%` }}
                          >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30 rounded-t-xl"></div>
                          </div>
                        </div>
                        
                        {/* Month label */}
                        <div className="mt-3 text-sm font-semibold text-slate-700">
                          {stat.month.slice(0, 3)}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Baseline */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-300"></div>
              </div>
              
              {/* Stats footer */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Total Processed</p>
                    <p className="text-base font-bold text-indigo-600">
                      {monthlyStats.reduce((sum, stat) => sum + (stat.employeeCount || 0), 0)} Employees
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Average/Month</p>
                    <p className="text-base font-bold text-purple-600">
                      {Math.round(monthlyStats.reduce((sum, stat) => sum + (stat.employeeCount || 0), 0) / monthlyStats.length)} Employees
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12">
          <div className="text-center">
            <div className="bg-gradient-to-br from-slate-100 to-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaChartBar className="text-slate-400 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Payroll Data Available</h3>
            <p className="text-sm text-slate-500 mb-6">Start by processing your first payroll to see analytics here</p>
            <button
              onClick={handlePayrunClick}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Go to Payrun
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
