import React from 'react'
import Table from '../components/ui/Table'

export default function Attendance() {
  const attendanceData = [
    { id: 1, employee: 'John Doe', date: '2025-11-08', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present' },
    { id: 2, employee: 'Jane Smith', date: '2025-11-08', checkIn: '09:15 AM', checkOut: '06:10 PM', status: 'Present' },
    { id: 3, employee: 'Mike Johnson', date: '2025-11-08', checkIn: '-', checkOut: '-', status: 'Absent' },
    { id: 4, employee: 'Sarah Williams', date: '2025-11-08', checkIn: '09:30 AM', checkOut: '06:00 PM', status: 'Late' },
  ]

  const columns = [
    { header: 'Employee', accessor: 'employee' },
    { header: 'Date', accessor: 'date' },
    { header: 'Check In', accessor: 'checkIn' },
    { header: 'Check Out', accessor: 'checkOut' },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Present'
              ? 'bg-green-100 text-green-800'
              : value === 'Late'
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
          <h1 className="text-3xl font-bold text-slate-800">Attendance</h1>
          <p className="text-slate-600 mt-1">Track employee attendance records</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
          Mark Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Present Today</p>
          <p className="text-3xl font-bold text-green-600 mt-2">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Absent Today</p>
          <p className="text-3xl font-bold text-red-600 mt-2">1</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <p className="text-sm text-slate-600">Late Arrivals</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">1</p>
        </div>
      </div>

      <Table columns={columns} data={attendanceData} />
    </div>
  )
}
