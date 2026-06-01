import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Header/Header'
import Dashboard from './pages/Dashboard/Dashboard'
import UserRequest from './pages/UserRequest/UserRequest'
import SmartBins from './pages/SmartBins/SmartBins'
import RouteOptimization from './pages/RouteOptimization/RouteOptimization'
import TruckManagement from './pages/TruckManagement/TruckManagement'
import Rewards from './pages/Rewards/Rewards'
import Settings from './pages/Settings/Settings'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import UsersPage from './pages/UsersPage'
import UserDashboard from './pages/UserDashboard/UserDashboard'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  // Don't show sidebar and header on login/register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    )
  }

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header sidebarCollapsed={sidebarCollapsed} />
        <main className="page-container">
          <Routes>
            {/* Root Role-Based Redirect */}
            <Route path="/" element={<RoleBasedRedirect />} />
            
            {/* Admin Routes */}
            <Route
  path="/users"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <UsersPage />
    </ProtectedRoute>
  }
/>
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute allowedRoles={['admin']}><UserRequest /></ProtectedRoute>} />
            <Route path="/bins" element={<ProtectedRoute allowedRoles={['admin']}><SmartBins /></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute allowedRoles={['admin']}><RouteOptimization /></ProtectedRoute>} />
            <Route path="/trucks" element={<ProtectedRoute allowedRoles={['admin']}><TruckManagement /></ProtectedRoute>} />
            
            {/* User Routes */}
            <Route
  path="/user-dashboard"
  element={
    <ProtectedRoute allowedRoles={['user']}>
      <UserDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/my-requests"
  element={
    <ProtectedRoute allowedRoles={['user']}>
      <UserRequest />
    </ProtectedRoute>
  }
/>
            
            
            {/* Shared Routes */}
            {/* Shared Routes */}
<Route
  path="/rewards"
  element={
    <ProtectedRoute allowedRoles={['admin', 'user']}>
      <Rewards />
    </ProtectedRoute>
  }
/>

<Route
  path="/settings"
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <Settings />
    </ProtectedRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute allowedRoles={['user']}>
      <Settings />
    </ProtectedRoute>
  }
/>
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function RoleBasedRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />
  if (user.role === 'driver') return <Navigate to="/driver-panel" replace />
  return <Navigate to="/user-dashboard" replace />
}

export default App
