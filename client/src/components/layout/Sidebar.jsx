import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import {
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaMoneyCheckAlt,
  FaChartLine,
  FaCog,
  FaWarehouse
} from 'react-icons/fa'

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 🔹 Same routes and logic as WorkZen
  const links = [
    { label: 'Employees', to: '/employees', icon: <FaUsers /> },
    { label: 'Attendance', to: '/attendance', icon: <FaCalendarAlt /> },
    { label: 'Time Off', to: '/timeoff', icon: <FaUmbrellaBeach /> },
    { label: 'Payroll', to: '/payroll', icon: <FaMoneyCheckAlt /> },
    { label: 'Reports', to: '/reports', icon: <FaChartLine /> },
    { label: 'Settings', to: '/settings', icon: <FaCog /> },
  ]

  // Animation Variants (same as WorkZen)
  const sidebarVariants = {
    expanded: { width: '20rem' },
    collapsed: { width: '5rem' },
  }

  const textVariants = {
    expanded: { opacity: 1, width: 'auto' },
    collapsed: { opacity: 0, width: 0 },
  }

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      // 💚 TeleMedicine Design Look
      className="bg-gradient-to-b from-white via-emerald-50 to-green-50 text-gray-800 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-xl border-r border-emerald-100 overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-emerald-100 flex items-center justify-between"
      >
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          variants={textVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md"
          >
            <FaWarehouse className="text-white text-xl" />
          </motion.div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h1 className="text-2xl font-bold text-emerald-700">
                  WorkZen
                </h1>
                <p className="text-xs text-emerald-600 font-medium">
                  HRMS
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapse Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-emerald-600 hover:text-emerald-800 transition-colors ml-auto p-2 rounded-lg hover:bg-emerald-100"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </motion.button>
      </motion.div>

      {/* Navigation Links */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 p-6"
      >
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05, delay: 0.3 }}
          className="space-y-3"
        >
          {links.map(({ label, to, icon }, index) => (
            <motion.li
              key={to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink to={to}>
                {({ isActive }) => (
                  <div
                    className={`group flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 relative ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 hover:shadow-sm'
                    }`}
                  >
                    <motion.span
                      className={`text-lg flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-700'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {icon}
                    </motion.span>

                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="font-semibold text-sm whitespace-nowrap"
                        >
                          {label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </NavLink>
            </motion.li>
          ))}
        </motion.ul>
      </motion.nav>

      {/* Footer */}
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 border-t border-emerald-100 bg-emerald-50"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => alert('Logout clicked')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-300 border border-red-200 hover:border-red-300"
            >
              <span className="text-lg">
                <FaCog />
              </span>
              <span className="font-semibold text-sm">Logout</span>
            </motion.button>

            <p className="text-xs text-emerald-600 text-center mt-3 font-medium">
              WorkZen HRMS v1.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}

export default Sidebar
