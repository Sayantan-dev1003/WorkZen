import React from 'react'
import Card from '../../components/ui/Card'

export default function EmployeeDashboard() {
  const stats = [
    {
      title: 'Days Present',
      value: '22',
      icon: '✅',
      trend: 'up',
      trendValue: '+2',
    },
    {
      title: 'Leave Balance',
      value: '12',
      icon: '🏖️',
      trend: 'down',
      trendValue: '-3',
    },
    {
      title: 'This Month Salary',
      value: '$5,200',
      icon: '💰',
      trend: 'up',
      trendValue: '+$200',
    },
    {
      title: 'Attendance Rate',
      value: '95%',
      icon: '📊',
      trend: 'up',
      trendValue: '+5%',
    },
  ]

  const upcomingEvents = [
    { id: 1, title: 'Team Meeting', date: '2024-01-20', type: 'Meeting' },
    { id: 2, title: 'Project Deadline', date: '2024-01-25', type: 'Deadline' },
    { id: 3, title: 'Performance Review', date: '2024-02-01', type: 'Review' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">My Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your overview</p>
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

      {/* Activity and Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Overview */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            My Attendance This Month
          </h2>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <span className="text-6xl">📊</span>
              <p className="text-slate-500 mt-2">Attendance Calendar</p>
              <p className="text-xs text-slate-400 mt-1">
                Your daily attendance tracking
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Upcoming Events
          </h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 mt-2 bg-purple-600 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {event.title}
                  </p>
                  <p className="text-xs text-slate-600">{event.type}</p>
                  <p className="text-xs text-slate-400 mt-1">{event.date}</p>
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
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
            <span className="text-3xl">📋</span>
            <span className="text-sm font-medium text-slate-700">Mark Attendance</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
            <span className="text-3xl">🏖️</span>
            <span className="text-sm font-medium text-slate-700">Apply Leave</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
            <span className="text-3xl">💰</span>
            <span className="text-sm font-medium text-slate-700">View Payslip</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all">
            <span className="text-3xl">👤</span>
            <span className="text-sm font-medium text-slate-700">My Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
