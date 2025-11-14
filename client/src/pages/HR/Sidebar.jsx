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
      className="bg-gradient-to-b from-green-600 via-emerald-700 to-teal-800 text-white min-h-screen flex flex-col fixed left-0 top-0 bottom-0 z-20 shadow-2xl overflow-hidden"
    >
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-emerald-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-teal-200 rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 border-b border-white/20 flex items-center justify-between backdrop-blur-sm bg-white/5 relative z-10"
      >
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          animate={isCollapsed ? { opacity: 0, width: 0 } : { opacity: 1, width: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="p-3 bg-gradient-to-br from-emerald-400 to-teal-300 rounded-xl flex items-center justify-center shadow-lg"
          >
            <FaWarehouse className="text-green-900 text-2xl" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h1 className="text-2xl font-bold text-white tracking-tight">WorkZen</h1>
                <p className="text-xs text-emerald-200 font-medium">
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
          className="text-white/90 hover:text-white transition-colors ml-auto p-2 rounded-lg hover:bg-white/10 backdrop-blur-sm"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
              <NavLink to={to}>
                {({ isActive }) => (
                  <motion.div
                    className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-md'
                        : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                    }`}
                    title={isCollapsed ? label : ''}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="hr-active-tab"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-300 to-teal-200 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}

                    <motion.span
                      className={`text-xl flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-emerald-300'
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

                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300 rounded-xl"
                    />
                  </motion.div>
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
            className="p-5 border-t border-white/20 bg-white/5 backdrop-blur-sm text-center relative z-10"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-emerald-300 rounded-full shadow-lg shadow-emerald-300/50"
              />
              <p className="text-xs text-emerald-200 font-medium">
                System Active
              </p>
            </div>
            <p className="text-xs text-white/60">
              WorkZen HR v1.0
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

export default HRSidebar;
