import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaCalendarAlt,
  FaUmbrellaBeach,
  FaMoneyCheckAlt,
  FaChartLine,
  FaCog,
  FaWarehouse,
  FaHome,
} from 'react-icons/fa';
import { useSidebar } from '../../context/SidebarContext';

const AdminSidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const links = [
    // { label: 'Dashboard', to: '/admin/dashboard', icon: <FaHome /> },
    { label: 'Employees', to: '/admin/employees', icon: <FaUsers /> },
    { label: 'Attendance', to: '/admin/attendance', icon: <FaCalendarAlt /> },
    { label: 'Time Off', to: '/admin/timeoff', icon: <FaUmbrellaBeach /> },
    { label: 'Payroll', to: '/admin/payroll', icon: <FaMoneyCheckAlt /> },
    { label: 'Reports', to: '/admin/reports', icon: <FaChartLine /> },
    { label: 'Settings', to: '/admin/settings', icon: <FaCog /> },
  ];

  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' },
  };

  const textVariants = {
    expanded: { opacity: 1, width: 'auto' },
    collapsed: { opacity: 0, width: 0 },
  };

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-800 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-20 shadow-2xl overflow-hidden"
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-blue-500/30 flex items-center justify-between relative z-10"
      >
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          variants={textVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-3 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30"
          >
            <FaWarehouse className="text-white text-2xl" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h1 className="text-2xl font-bold text-white">WorkZen</h1>
                <p className="text-xs text-blue-200 font-medium">
                  Admin Portal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapse Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleSidebar}
          className="text-white hover:bg-white/20 transition-all ml-auto p-2 rounded-lg backdrop-blur-sm border border-white/20"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </motion.button>
      </motion.div>

      {/* Navigation Links */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex-1 p-4 relative z-10"
      >
        <ul className="space-y-2">
          {links.map(({ label, to, icon }, index) => (
            <motion.li
              key={to}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* ✅ NavLink with render callback */}
              <NavLink to={to}>
                {({ isActive }) => (
                  <div
                    className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-white text-blue-700 shadow-lg'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white hover:shadow-md backdrop-blur-sm'
                    }`}
                    title={isCollapsed ? label : ''}
                  >
                    <motion.span
                      className={`text-xl flex-shrink-0 ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-blue-200 group-hover:text-white'
                      }`}
                      whileHover={{ scale: 1.15, rotate: 5 }}
                    >
                      {icon}
                    </motion.span>

                    <AnimatePresence>
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

                    {/* Hover effect */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                    )}
                  </div>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      {/* Footer */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 border-t border-blue-500/30 bg-blue-800/30 backdrop-blur-sm text-center relative z-10"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-xs text-blue-200 font-medium">System Active</p>
            </div>
            <p className="text-xs text-blue-300 font-semibold">
              WorkZen Admin v1.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default AdminSidebar;
