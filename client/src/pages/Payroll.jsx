import React from 'react'
import Table from '../components/ui/Table'

export default function Payroll() {
  const payrollData = [
    { id: 1, employee: 'John Doe', month: 'November 2025', basic: '$5,000', allowances: '$1,000', deductions: '$500', net: '$5,500' },
    { id: 2, employee: 'Jane Smith', month: 'November 2025', basic: '$6,000', allowances: '$1,200', deductions: '$600', net: '$6,600' },
    { id: 3, employee: 'Mike Johnson', month: 'November 2025', basic: '$4,500', allowances: '$900', deductions: '$450', net: '$4,950' },
  ]

  const columns = [
    { header: 'Employee', accessor: 'employee' },
    { header: 'Month', accessor: 'month' },
    { header: 'Basic Salary', accessor: 'basic' },
    { header: 'Allowances', accessor: 'allowances' },
    { header: 'Deductions', accessor: 'deductions' },
    {
      header: 'Net Salary',
      accessor: 'net',
      render: (value) => <span className="font-semibold text-green-600">{value}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Payroll</h1>
          <p className="text-slate-600 mt-1">Manage employee salaries and payroll processing</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
          Process Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Total Processed</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">$17,050</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Employees Paid</p>
          <p className="text-3xl font-bold text-green-600 mt-2">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Pending Payslips</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
        </div>
      </div>

      <Table columns={columns} data={payrollData} />
    </div>
  )
}
