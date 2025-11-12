import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  FaCalendarCheck,
  FaUmbrellaBeach,
  FaUserCircle,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'

const EmployeeSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const links = [
    { label: 'My Attendance', to: '/employee/attendance', icon: <FaCalendarCheck /> },
    { label: 'Time Off', to: '/employee/timeoff', icon: <FaUmbrellaBeach /> },
    { label: 'My Profile', to: '/employee/profile', icon: <FaUserCircle /> },
  ]

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-purple-900 via-purple-800 to-purple-900 text-white min-h-screen transition-all duration-300 flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-xl`}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-purple-700 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-purple-300 tracking-wide">WorkZen</h1>
            <p className="text-xs text-purple-400 mt-1">Employee Portal</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-purple-400 hover:text-white transition-all duration-200"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <FaChevronRight size={18} /> : <FaChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {links.map(({ label, to, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-purple-300 hover:bg-purple-800 hover:text-white'
                  }`
                }
                title={isCollapsed ? label : ''}
              >
                <span className="text-lg">{icon}</span>
                {!isCollapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-purple-700 text-center text-xs text-purple-500">
          <p>WorkZen Employee v1.0</p>
          <p className="text-[10px] text-purple-400 mt-1">© 2025 WorkZen HRMS</p>
        </div>
      )}
    </aside>
  )
}

export default EmployeeSidebar
