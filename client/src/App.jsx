import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleProtectedRoute from './components/layout/RoleProtectedRoute'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import { SidebarProvider, useSidebar } from './context/SidebarContext'

// Admin imports
import * as Admin from './pages/Admin'
// Employee imports
import * as Employee from './pages/Employee'
// HR imports
import * as HR from './pages/HR'
// Payroll Officer imports
import * as PayrollOfficer from './pages/PayrollOfficer'

/* --------------------------- Dashboard Layout --------------------------- */
const DashboardLayout = ({ children, Sidebar: SidebarComponent = Sidebar }) => {
  const { isCollapsed } = useSidebar()

  const marginLeft = isCollapsed ? 'ml-20' : 'ml-64'

  return (
    <div className="min-h-screen flex bg-white relative overflow-hidden">
      {/* Sidebar */}
      <SidebarComponent />

      {/* Main Area */}
      <div className={`flex-1 ${marginLeft} transition-all duration-300 relative z-10`}>
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-16 p-6"
        >
          {children}
        </motion.main>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  )
}

/* --------------------------- Sidebar Wrapper --------------------------- */
const SidebarLayout = ({ children, Sidebar: SidebarComponent = Sidebar }) => (
  <SidebarProvider>
    <DashboardLayout Sidebar={SidebarComponent}>{children}</DashboardLayout>
  </SidebarProvider>
)

/* ------------------------------ App Routes ------------------------------ */
export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Admin Routes */}
      <Route
        path="/admin/employees"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <SidebarLayout Sidebar={Admin.Sidebar}>
                <Admin.Employees />
              </SidebarLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <SidebarLayout Sidebar={Admin.Sidebar}>
                <Admin.Attendance />
              </SidebarLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/timeoff"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <SidebarLayout Sidebar={Admin.Sidebar}>
                <Admin.TimeOff />
              </SidebarLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payroll"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <SidebarLayout Sidebar={Admin.Sidebar}>
                <Admin.Payroll />
              </SidebarLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <SidebarLayout Sidebar={Admin.Sidebar}>
                <Admin.Reports />
              </SidebarLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <SidebarLayout Sidebar={Admin.Sidebar}>
                <Admin.MyProfile />
              </SidebarLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['Admin']}>
              <SidebarLayout Sidebar={Admin.Sidebar}>
                <Admin.Settings />
              </SidebarLayout>
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* ------------------ HR Routes ------------------ */}
      {[
        { path: '/hr/employees', page: <HR.HR_Employees /> },
        { path: '/hr/attendance', page: <HR.HR_Attendance /> },
        { path: '/hr/timeoff', page: <HR.TimeOff /> },
        { path: '/hr/profile', page: <HR.HR_MyProfile /> },
      ].map(({ path, page }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['HR']}>
                <SidebarLayout Sidebar={HR.Sidebar}>{page}</SidebarLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
      ))}

      {/* ------------------ Employee Routes ------------------ */}
      {[
        { path: '/employee/attendance', page: <Employee.Attendance /> },
        { path: '/employee/timeoff', page: <Employee.TimeOff /> },
        { path: '/employee/profile', page: <Employee.MyProfile /> },
      ].map(({ path, page }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['Employee']}>
                <SidebarLayout Sidebar={Employee.Sidebar}>{page}</SidebarLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
      ))}

      {/* ------------------ Payroll Officer Routes ------------------ */}
      {[
        { path: '/payroll/attendance', page: <PayrollOfficer.Attendance /> },
        { path: '/payroll/payroll', page: <PayrollOfficer.Payroll /> },
        { path: '/payroll/reports', page: <PayrollOfficer.Reports /> },
        { path: '/payroll/profile', page: <PayrollOfficer.MyProfile /> },
      ].map(({ path, page }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={['PayrollOfficer']}>
                <SidebarLayout Sidebar={PayrollOfficer.Sidebar}>{page}</SidebarLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
      ))}

      {/* Redirect legacy routes */}
      <Route path="/employees" element={<Navigate to="/admin/employees" replace />} />
      <Route path="/attendance" element={<Navigate to="/admin/attendance" replace />} />
      <Route path="/timeoff" element={<Navigate to="/admin/timeoff" replace />} />
      <Route path="/payroll" element={<Navigate to="/admin/payroll" replace />} />
      <Route path="/reports" element={<Navigate to="/admin/reports" replace />} />
      <Route path="/settings" element={<Navigate to="/admin/employees" replace />} />
      <Route path="/profile" element={<Navigate to="/admin/profile" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
