import React, { useState, useEffect } from 'react'
import { FaMoneyCheckAlt, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'
import api from '../../api'
import PayslipDetailModal from '../../components/ui/PayslipDetailModal'

export default function PayrollPayrun() {
  const [loading, setLoading] = useState(true)
  const [payrunData, setPayrunData] = useState([])
  const [payPeriod, setPeriod] = useState('')
  const [totals, setTotals] = useState(null)
  const [processingEmployees, setProcessingEmployees] = useState(new Set())
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(null)
  const [currentYear, setCurrentYear] = useState(null)

  useEffect(() => {
    fetchPayrunData()
  }, [])

  const fetchPayrunData = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/payroll/payruns/current')
      if (response.data.success) {
        setPayrunData(response.data.payrunData)
        setPeriod(response.data.payPeriod)
        setTotals(response.data.totals)
        setCurrentMonth(response.data.month)
        setCurrentYear(response.data.year)
      }
    } catch (error) {
      console.error('Error fetching payrun data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkDone = async (employeeId) => {
    try {
      setProcessingEmployees(prev => new Set(prev).add(employeeId))
      const response = await api.post('/admin/payroll/mark-done', { employeeId })
      
      if (response.data.success) {
        // Update the local state to reflect the change
        setPayrunData(prev => prev.map(item => 
          item.employeeId === employeeId 
            ? { ...item, status: 'Done' }
            : item
        ))
      }
    } catch (error) {
      console.error('Error marking payroll as done:', error)
      alert('Failed to mark payroll as done. Please try again.')
    } finally {
      setProcessingEmployees(prev => {
        const newSet = new Set(prev)
        newSet.delete(employeeId)
        return newSet
      })
    }
  }

  const formatCurrency = (amount) => {
    return `₹ ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const handleDoneButtonClick = (employeeId, status) => {
    // Only open modal if status is already 'Done'
    if (status === 'Done') {
      setSelectedEmployee(employeeId)
    }
  }

  const closeModal = () => {
    setSelectedEmployee(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-12 text-center">
        <FaSpinner className="text-4xl text-blue-600 mx-auto mb-4 animate-spin" />
        <p className="text-slate-600">Loading payrun data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold">{payPeriod}</h2>
        <p className="text-blue-100 mt-1">Review and process employee payroll</p>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Total Employer Cost</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(totals.employerCost)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Total Gross</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.grossWage)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Total Net</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.netWage)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border border-slate-200">
            <p className="text-sm text-slate-600 mb-1">Employees</p>
            <p className="text-xl font-bold text-slate-800">{payrunData.length}</p>
          </div>
        </div>
      )}

      {/* Payrun Table */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Pay Period</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Employee</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Employer Cost</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Basic Wage</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Gross Wage</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Net Wage</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payrunData.map((item, index) => (
                <tr 
                  key={item.employeeId} 
                  className={`hover:bg-slate-50 transition-colors ${!item.hasBankDetails ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-4 py-3 text-sm text-slate-600">{item.payPeriod}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-800">{item.employeeName}</span>
                      {!item.hasBankDetails && (
                        <div className="group relative">
                          <FaExclamationTriangle className="text-yellow-500 text-sm cursor-help" />
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-48 p-2 text-xs bg-gray-800 text-white rounded shadow-lg">
                            No bank account details found in profile
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">{formatCurrency(item.employerCost)}</td>
                  <td className="px-4 py-3 text-sm text-right text-slate-700">{formatCurrency(item.basicWage)}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 font-medium">{formatCurrency(item.grossWage)}</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-600 font-semibold">{formatCurrency(item.netWage)}</td>
                  <td className="px-4 py-3 text-center">
                    {item.status === 'Done' ? (
                      <button
                        onClick={() => handleDoneButtonClick(item.employeeId, item.status)}
                        className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <FaCheckCircle /> Done
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkDone(item.employeeId)}
                        disabled={processingEmployees.has(item.employeeId) || !item.hasBankDetails}
                        title={!item.hasBankDetails ? 'Bank details required to process payroll' : ''}
                        className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all shadow-md inline-flex items-center gap-1 ${
                          !item.hasBankDetails 
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg animate-pulse'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {processingEmployees.has(item.employeeId) ? (
                          <>
                            <FaSpinner className="animate-spin" /> Processing...
                          </>
                        ) : (
                          'Done'
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payrunData.length === 0 && !loading && (
          <div className="p-12 text-center">
            <FaMoneyCheckAlt className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No employee data available for payrun</p>
          </div>
        )}
      </div>

      {/* Payslip Detail Modal */}
      {selectedEmployee && (
        <PayslipDetailModal
          employeeId={selectedEmployee}
          month={currentMonth}
          year={currentYear}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
