import React from 'react'
import Table from '../components/ui/Table'

export default function TimeOff() {
  const leaveData = [
    { id: 1, employee: 'John Doe', type: 'Sick Leave', startDate: '2025-11-10', endDate: '2025-11-12', days: 3, status: 'Pending' },
    { id: 2, employee: 'Jane Smith', type: 'Vacation', startDate: '2025-11-15', endDate: '2025-11-20', days: 6, status: 'Approved' },
    { id: 3, employee: 'Mike Johnson', type: 'Personal', startDate: '2025-11-09', endDate: '2025-11-09', days: 1, status: 'Rejected' },
  ]

  const columns = [
    { header: 'Employee', accessor: 'employee' },
    { header: 'Leave Type', accessor: 'type' },
    { header: 'Start Date', accessor: 'startDate' },
    { header: 'End Date', accessor: 'endDate' },
    { header: 'Days', accessor: 'days' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Approved'
              ? 'bg-green-100 text-green-800'
              : value === 'Pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Time Off</h1>
          <p className="text-slate-600 mt-1">Manage leave requests and approvals</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
          Request Leave
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">1</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Approved</p>
          <p className="text-3xl font-bold text-green-600 mt-2">1</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Rejected</p>
          <p className="text-3xl font-bold text-red-600 mt-2">1</p>
        </div>
      </div>

      <Table columns={columns} data={leaveData} />
    </div>
  )
}
