import React from 'react'

export default function Reports() {
  const reportTypes = [
    { name: 'Attendance Report', icon: '📊', description: 'View attendance statistics and trends' },
    { name: 'Payroll Report', icon: '💰', description: 'Monthly payroll summaries and breakdowns' },
    { name: 'Leave Report', icon: '📅', description: 'Leave requests and approval history' },
    { name: 'Employee Report', icon: '👥', description: 'Employee demographics and statistics' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-600 mt-1">Generate and view various HR reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 border border-slate-200 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{report.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-800">{report.name}</h3>
                <p className="text-sm text-slate-600 mt-2">{report.description}</p>
                <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Recent Reports</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">November Attendance Report</p>
              <p className="text-xs text-slate-500">Generated on Nov 7, 2025</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Download
            </button>
          </div>
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">October Payroll Report</p>
              <p className="text-xs text-slate-500">Generated on Nov 1, 2025</p>
            </div>
            <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
