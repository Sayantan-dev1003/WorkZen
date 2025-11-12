import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaCalendarCheck,
  FaUmbrellaBeach,
  // FaChartBar,
  // FaUserCircle,
  FaWarehouse,
} from 'react-icons/fa';
import { useSidebar } from '../../context/SidebarContext';

const HRSidebar = () => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  const links = [
    { label: 'Employees', to: '/hr/employees', icon: <FaUsers /> },
    { label: 'Attendance', to: '/hr/attendance', icon: <FaCalendarCheck /> },
    { label: 'Time Off', to: '/hr/timeoff', icon: <FaUmbrellaBeach /> },
  ];

  const sidebarVariants = {
    expanded: { width: '16rem' },
    collapsed: { width: '5rem' },
  };

  return (
    <motion.aside
      initial="expanded"
      animate={isCollapsed ? 'collapsed' : 'expanded'}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-gradient-to-b from-green-50 via-emerald-50 to-green-100 text-gray-800 min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-40 shadow-xl border-r border-green-100 overflow-hidden"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-green-100 flex items-center justify-between"
      >
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          animate={isCollapsed ? { opacity: 0, width: 0 } : { opacity: 1, width: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-2 bg-gradient-to-br from-green-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-md"
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
                <h1 className="text-2xl font-bold text-green-700">WorkZen</h1>
                <p className="text-xs text-green-600 font-medium">
                  HR Portal
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
          className="text-green-600 hover:text-green-800 transition-colors ml-auto p-2 rounded-lg hover:bg-green-100"
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
              <NavLink to={to}>
                {({ isActive }) => (
                  <div
                    className={`group flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-green-100 hover:text-green-700 hover:shadow-sm'
                    }`}
                    title={isCollapsed ? label : ''}
                  >
                    <motion.span
                      className={`text-lg flex-shrink-0 ${
                        isActive
                          ? 'text-white'
                          : 'text-green-600 group-hover:text-green-700'
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
            className="p-5 border-t border-green-100 bg-green-50 text-center"
          >
            <p className="text-xs text-green-600 font-medium">
              WorkZen HR v1.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default HRSidebar;
