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
      className="bg-gradient-to-b from-white via-blue-50 to-indigo-50 text-gray-800 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-20 shadow-xl border-r border-blue-100 overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-blue-100 flex items-center justify-between"
      >
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          variants={textVariants}
          animate={isCollapsed ? 'collapsed' : 'expanded'}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-2 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-md"
          >
            <FaWarehouse className="text-white text-xl" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h1 className="text-2xl font-bold text-blue-700">WorkZen</h1>
                <p className="text-xs text-blue-600 font-medium">
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
          className="text-blue-600 hover:text-blue-800 transition-colors ml-auto p-2 rounded-lg hover:bg-blue-100"
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
        className="flex-1 p-4"
      >
        <ul className="space-y-3">
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
                    className={`group flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:shadow-sm'
                    }`}
                    title={isCollapsed ? label : ''}
                  >
                    <motion.span
                      className={`text-lg flex-shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-blue-600 group-hover:text-blue-700'
                      }`}
                      whileHover={{ scale: 1.1 }}
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
            className="p-5 border-t border-blue-100 bg-blue-50 text-center"
          >
            <p className="text-xs text-blue-600 font-medium">
              WorkZen Admin v1.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default AdminSidebar;
