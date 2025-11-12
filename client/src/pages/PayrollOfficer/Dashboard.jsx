import React from 'react'
import Card from '../../components/ui/Card'

export default function PayrollOfficerDashboard() {
  const stats = [
    {
      title: 'Payrolls Pending',
      value: '13',
      icon: '⏳',
      trend: 'down',
      trendValue: '-3',
    },
    {
      title: 'Processed This Month',
      value: '235',
      icon: '✅',
      trend: 'up',
      trendValue: '+100%',
    },
    {
      title: 'Total Amount',
      value: '$1.2M',
      icon: '💰',
      trend: 'up',
      trendValue: '+5%',
    },
    {
      title: 'Payrun Status',
      value: 'Active',
      icon: '🔄',
      trend: 'up',
      trendValue: '100%',
    },
  ]

  const recentPayrolls = [
    { id: 1, employee: 'John Doe', amount: '$5,050', date: '2024-01-15', status: 'Processed' },
    { id: 2, employee: 'Jane Smith', amount: '$6,060', date: '2024-01-15', status: 'Processed' },
    { id: 3, employee: 'Bob Wilson', amount: '$4,545', date: 'Pending', status: 'Pending' },
    { id: 4, employee: 'Alice Brown', amount: '$5,555', date: 'Pending', status: 'Pending' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Payroll Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage salary processing and disbursements</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll Overview */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Monthly Payroll Trend
          </h2>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <span className="text-6xl">📊</span>
              <p className="text-slate-500 mt-2">Payroll Analytics</p>
              <p className="text-xs text-slate-400 mt-1">
                Monthly salary disbursement trends
              </p>
            </div>
          </div>
        </div>

        {/* Recent Payrolls */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Recent Payrolls
          </h2>
          <div className="space-y-4">
            {recentPayrolls.map((payroll) => (
              <div
                key={payroll.id}
                className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 mt-2 bg-blue-600 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {payroll.employee}
                  </p>
                  <p className="text-xs text-slate-600">{payroll.amount}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {payroll.status === 'Processed' ? payroll.date : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
            <span className="text-3xl">💼</span>
            <span className="text-sm font-medium text-slate-700">Process Payroll</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
            <span className="text-3xl">📋</span>
            <span className="text-sm font-medium text-slate-700">View Payruns</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
            <span className="text-3xl">📄</span>
            <span className="text-sm font-medium text-slate-700">Generate Slips</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
            <span className="text-3xl">📊</span>
            <span className="text-sm font-medium text-slate-700">Payroll Reports</span>
          </button>
        </div>
      </div>
    </div>
  )
}
