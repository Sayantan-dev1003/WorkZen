import React, { useState, useEffect } from 'react'
import { FaFileAlt, FaDownload } from 'react-icons/fa'
import api from '../../api'

export default function Reports() {
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/admin/employees')
      if (response.data.success) {
        setEmployees(response.data.employees || [])
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const generatePDF = async () => {
    if (!selectedEmployee) {
      alert('Please select an employee')
      return
    }

    setLoading(true)
    try {
      const response = await api.get('/admin/payroll/detailed-salary-statement', {
        params: { employeeId: selectedEmployee, year: selectedYear }
      })
      
      if (response.data.success) {
        const data = response.data
        const printWindow = document.createElement('iframe')
        printWindow.style.position = 'absolute'
        printWindow.style.width = '0'
        printWindow.style.height = '0'
        printWindow.style.border = 'none'
        document.body.appendChild(printWindow)
        
        const doc = printWindow.contentDocument || printWindow.contentWindow.document
        doc.open()
        doc.write(generatePrintHTML(data))
        doc.close()
        
        setTimeout(() => {
          printWindow.contentWindow.print()
          setTimeout(() => document.body.removeChild(printWindow), 100)
        }, 250)
        
        alert('PDF generation initiated.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate salary statement')
    } finally {
      setLoading(false)
    }
  }

  const generatePrintHTML = (data) => {
    const fmt = (amount) => `₹ ${amount.toLocaleString('en-IN')}`
    
    const earningsHTML = data.earnings && data.earnings.length > 0
      ? data.earnings.map(e => `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
          <div>${e.component}</div>
          <div style="text-align:right">${fmt(e.monthlyAmount)}</div>
          <div style="text-align:right">${fmt(e.yearlyAmount)}</div>
        </div>`).join('')
      : '<div style="padding-left:32px;color:#999">No earnings data</div>'
    
    const deductionsHTML = data.deductions && data.deductions.length > 0
      ? data.deductions.map(d => `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
          <div>${d.component}</div>
          <div style="text-align:right">${fmt(d.monthlyAmount)}</div>
          <div style="text-align:right">${fmt(d.yearlyAmount)}</div>
        </div>`).join('')
      : '<div style="padding-left:32px;color:#999">No deductions data</div>'
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Salary Statement - ${data.employee.name}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Arial,sans-serif; font-size:14px; padding:40px; }
    @media print { @page { size:A4; margin:1cm; } body { padding:0; } }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;">
    <h1 style="font-size:24px;font-weight:600;margin-bottom:32px;color:#4A90E2;">Salary Statement Report Print</h1>
    <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #E53935;">
      <h2 style="font-size:18px;font-weight:600;color:#E53935;">[Company]</h2>
    </div>
    <div style="margin-bottom:16px;">
      <h3 style="font-size:16px;font-weight:600;color:#E53935;">Salary Statement Report</h3>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #ccc;">
      <div>
        <p style="color:#E53935;margin-bottom:4px;">Employee Name</p>
        <p style="margin-bottom:12px;">${data.employee.name}</p>
        <p style="color:#E53935;margin-bottom:4px;">Designation</p>
        <p>${data.employee.designation || 'N/A'}</p>
      </div>
      <div style="text-align:right;">
        <p style="color:#E53935;margin-bottom:4px;">Date Of Joining</p>
        <p style="margin-bottom:12px;">${data.employee.dateOfJoining}</p>
        <p style="color:#E53935;margin-bottom:4px;">Salary Effective From</p>
        <p>${data.employee.salaryEffectiveFrom}</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid #ccc;">
      <div style="color:#E53935;">Salary Components</div>
      <div style="text-align:right;color:#E53935;">Monthly Amount</div>
      <div style="text-align:right;color:#E53935;">Yearly Amount</div>
    </div>
    <h4 style="font-weight:600;margin-bottom:8px;color:#E53935;">Earnings</h4>
    ${earningsHTML}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <h4 style="font-weight:600;margin:12px 0 8px 0;color:#E53935;">Deduction</h4>
    ${deductionsHTML}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:4px 0;padding-left:32px;">
      <div style="color:#999;">:</div><div style="text-align:right;color:#999;">:</div><div style="text-align:right;color:#999;">:</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:12px 0;padding-top:12px;border-top:1px solid #ccc;">
      <div style="font-weight:600;color:#E53935;">Net Salary</div>
      <div style="text-align:right;font-weight:600;">${fmt(data.monthlyNet)}</div>
      <div style="text-align:right;font-weight:600;">${fmt(data.yearlyNet)}</div>
    </div>
  </div>
</body>
</html>`
  }

  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = 0; i < 6; i++) years.push(currentYear - i)

  return (
    <div className="min-h-screen bg-white p-6 rounded-3xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-xl p-6">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
              <FaFileAlt className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Reports</h1>
              <p className="text-blue-100">Generate and download salary statement reports</p>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-white border border-slate-200 rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Salary Statement Report</h2>
          <p className="text-sm text-slate-500 mt-1">Select an employee and year to generate a PDF</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Employee Name</label>
            <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Employee</option>
              {employees.map((emp) => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Year</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {years.map((year) => (<option key={year} value={year}>{year}</option>))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generatePDF} disabled={loading || !selectedEmployee} className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <FaDownload />{loading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
