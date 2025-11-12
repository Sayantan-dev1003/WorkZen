import React from 'react'
import { motion } from 'framer-motion'
import {
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaUserPlus,
  FaChartPie,
  FaCheckCircle,
  FaFileAlt,
  FaPlus
} from 'react-icons/fa'

export default function HRDashboard() {
  const stats = [
    {
      title: 'Total Employees',
      value: '248',
      icon: <FaUsers />,
      trend: 'up',
      trendValue: '+12%',
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Attendance Today',
      value: '94.5%',
      icon: <FaCalendarAlt />,
      trend: 'up',
      trendValue: '+2.3%',
      color: 'from-green-500 to-emerald-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Leaves',
      value: '18',
      icon: <FaClipboardList />,
      trend: 'down',
      trendValue: '-5%',
      color: 'from-blue-500 to-cyan-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'New Hires',
      value: '12',
      icon: <FaUserPlus />,
      trend: 'up',
      trendValue: '+6',
      color: 'from-indigo-500 to-purple-500',
      textColor: 'text-indigo-600'
    },
  ]

  const recentActivities = [
    { id: 1, action: 'New employee onboarded', name: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Leave approved', name: 'Jane Smith', time: '3 hours ago' },
    { id: 3, action: 'Attendance marked', name: 'Bob Wilson', time: '4 hours ago' },
    { id: 4, action: 'Employee updated', name: 'Alice Brown', time: '5 hours ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">HR Dashboard</h1>
          <p className="text-slate-600 mt-1">Employee management and operations</p>
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

      {/* Welcome Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-3xl p-8 shadow-2xl"
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full translate-y-10 -translate-x-10"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent"
            >
              Dashboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-emerald-100 text-lg"
            >
              Welcome back! Here's what's happening today.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-right"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30">
              <p className="text-sm text-white/90">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Statistics Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, delay: index * 0.1 }}
            className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 hover:border-emerald-200/50 overflow-hidden"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <motion.span
                    className="text-2xl text-white"
                    whileHover={{ scale: 1.1, rotate: 360 }}
                    transition={{ duration: 0.3 }}
                  >
                    {stat.icon}
                  </motion.span>
                </div>
                <motion.span
                  className={`text-sm font-semibold px-3 py-1 rounded-full shadow-md ${
                    stat.trend === 'up'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {stat.trendValue}
                </motion.span>
              </div>
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-600 mb-2"
              >
                {stat.title}
              </motion.h3>
              <motion.p
                className={`text-3xl font-bold ${stat.textColor}`}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {stat.value}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-slate-200"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Department Distribution
          </h2>
          <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center">
              <FaChartPie className="text-6xl text-emerald-500 mx-auto" />
              <p className="text-slate-500 mt-2">Department Analytics</p>
              <p className="text-xs text-slate-400 mt-1">
                Employee distribution by department
              </p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-emerald-100/50"
        >
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-gray-800 mb-6"
          >
            Recent Activity
          </motion.h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 mt-2 bg-green-600 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-slate-600">{activity.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all">
            <FaPlus className="text-3xl text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">Add Employee</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all">
            <FaCalendarAlt className="text-3xl text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">Mark Attendance</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all">
            <FaCheckCircle className="text-3xl text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">Approve Leaves</span>
          </button>
          <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 transition-all">
            <FaFileAlt className="text-3xl text-emerald-600" />
            <span className="text-sm font-medium text-slate-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  )
}
