import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'

const PayrollOfficerSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const links = [
    { label: 'Attendance', to: '/payroll/attendance', icon: '📅' },
    { label: 'Payroll', to: '/payroll/payroll', icon: '💰' },
    { label: 'Reports', to: '/payroll/reports', icon: '📈' },
    { label: 'My Profile', to: '/payroll/profile', icon: '👤' },
  ]

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-60'
      } bg-blue-900 text-white min-h-screen transition-all duration-300 flex flex-col fixed left-0 top-0 bottom-0 z-40`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-blue-300">WorkZen</h1>
              <p className="text-xs text-blue-400 mt-1">Payroll Portal</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map(({ label, to, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-300 hover:bg-blue-800 hover:text-white'
                  }`
                }
                title={isCollapsed ? label : ''}
              >
                <span className="text-xl">{icon}</span>
                {!isCollapsed && <span className="font-medium">{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-blue-700">
          <p className="text-xs text-blue-500 text-center">
            WorkZen Payroll v1.0
          </p>
        </div>
      )}
    </aside>
  )
}

export default PayrollOfficerSidebar
