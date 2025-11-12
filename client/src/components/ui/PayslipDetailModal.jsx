import React, { useState, useEffect } from 'react'
import { FaTimes, FaSpinner } from 'react-icons/fa'
import api from '../../api'

export default function PayslipDetailModal({ employeeId, month, year, onClose }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('workedDays')
  const [payslipData, setPayslipData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPayslipDetail()
  }, [employeeId, month, year])

  const fetchPayslipDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/admin/payroll/payslip/${employeeId}`, {
        params: { month, year }
      })
      if (response.data.success) {
        setPayslipData(response.data)
      }
    } catch (err) {
      console.error('Error fetching payslip detail:', err)
      setError(err.response?.data?.message || 'Failed to load payslip details')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return `₹ ${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handlePrintPayslip = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
      const token = localStorage.getItem('token')
      
      // Fetch the PDF
      const response = await fetch(`${apiUrl}/admin/payroll/payslip/${employeeId}/pdf?month=${month}&year=${year}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      
      // Get the blob
      const blob = await response.blob()
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payslip-${employee.name}-${month}-${year}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error printing payslip:', err)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="text-center">
            <FaSpinner className="text-4xl text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading payslip details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
        <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!payslipData) return null

  const { employee, payrun, salaryStructure, workedDays, salaryComputation, monthlySalary } = payslipData

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white relative rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8 shadow-2xl">
        {/* Header with action buttons */}
        <div className="border-b border-slate-200 p-6 sticky top-0 bg-white z-10 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3 flex-wrap">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors">
                New Payslip
              </button>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors">
                Compute
              </button>
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors">
                Validate
              </button>
              <button className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors">
                Cancel
              </button>
              <button 
                onClick={handlePrintPayslip}
                className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors"
              >
                Print
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FaTimes className="text-2xl" />
            </button>
          </div>

          {/* Employee Info */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900">{employee.name}</h2>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Payrun:</span>{' '}
                <span className="text-blue-600 font-medium">{payrun.name}</span>
              </div>
              <div>
                <span className="text-slate-600">Salary Structure:</span>{' '}
                <span className="text-blue-600 font-medium">{salaryStructure}</span>
              </div>
              <div>
                <span className="text-slate-600">Period:</span>{' '}
                <span className="text-slate-900">{payrun.period}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab('workedDays')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'workedDays'
                  ? 'border-purple-600 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Worked Days
            </button>
            <button
              onClick={() => setActiveTab('salaryComputation')}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === 'salaryComputation'
                  ? 'border-purple-600 text-slate-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Salary Computation
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 min-h-[400px] bg-white">
          {activeTab === 'workedDays' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="text-left py-3 text-slate-700 font-semibold">Type</th>
                      <th className="text-center py-3 text-slate-700 font-semibold">Days</th>
                      <th className="text-right py-3 text-slate-700 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-4 text-slate-900">Attendance</td>
                      <td className="py-4 text-center">
                        <div className="text-slate-900">
                          {workedDays.attendance.days.toFixed(2)}{' '}
                          <span className="text-slate-600 text-sm">
                            ({workedDays.attendance.note})
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-slate-900 font-medium">
                        {formatCurrency(workedDays.attendance.amount)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-4 text-slate-900">Paid Time off</td>
                      <td className="py-4 text-center">
                        <div className="text-slate-900">
                          {workedDays.paidTimeOff.days.toFixed(2)}{' '}
                          <span className="text-slate-600 text-sm">
                            ({workedDays.paidTimeOff.note})
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right text-slate-900 font-medium">
                        {formatCurrency(workedDays.paidTimeOff.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Section - Separate from table */}
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700 font-medium">Total Days:</span>
                  <span className="text-slate-900 font-bold text-2xl">
                    {workedDays.total.days.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Total Amount:</span>
                  <span className="text-slate-900 font-bold text-2xl">
                    {formatCurrency(workedDays.total.amount)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p>
                  Salary is calculated based on the employee's monthly attendance. Paid leaves are
                  included in the total payable days, while unpaid leaves are deducted from the salary.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'salaryComputation' && (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-300">
                      <th className="text-left py-3 text-slate-700 font-semibold">Rule Name</th>
                      <th className="text-center py-3 text-slate-700 font-semibold">Rate %</th>
                      <th className="text-right py-3 text-slate-700 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {/* Earnings */}
                    {salaryComputation.earnings.map((earning, index) => (
                      <tr key={`earning-${index}`}>
                        <td className="py-3 text-slate-900">{earning.ruleName}</td>
                        <td className="py-3 text-center text-slate-900">{earning.rate}</td>
                        <td className="py-3 text-right text-slate-900 font-medium">
                          {formatCurrency(earning.amount)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Gross Total */}
                    <tr className="bg-slate-100">
                      <td className="py-3 text-slate-900 font-semibold">Gross</td>
                      <td className="py-3 text-center text-slate-900">100</td>
                      <td className="py-3 text-right text-green-600 font-bold text-lg">
                        {formatCurrency(salaryComputation.gross)}
                      </td>
                    </tr>

                    {/* Deductions */}
                    {salaryComputation.deductions.map((deduction, index) => (
                      <tr key={`deduction-${index}`}>
                        <td className="py-3 text-slate-900">{deduction.ruleName}</td>
                        <td className="py-3 text-center text-slate-900">{deduction.rate}</td>
                        <td className="py-3 text-right text-red-600 font-medium">
                          {formatCurrency(deduction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Net Amount - Separate highlighted section */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-700 text-sm mb-1 font-medium">Net Amount</p>
                    <p className="text-green-800 font-bold text-3xl">
                      {formatCurrency(salaryComputation.netAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-700 text-sm font-medium">Rate</p>
                    <p className="text-green-800 font-semibold text-xl">100%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <p className="text-slate-600 text-xs">
            When a user opens any generated payslip, they can view detailed information such as working days
            and worked day amounts. They can also generate a new payslip or cancel, and they can print the
            payslip as well.
          </p>
        </div>
      </div>
    </div>
  )
}
