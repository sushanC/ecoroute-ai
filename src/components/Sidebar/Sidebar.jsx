import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Trash2,
  Route,
  Truck,
  Award,
  Settings,
  Leaf,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MapPin,
  Users
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const role = user?.role || 'user'

  const getNavItems = () => {
    if (role === 'admin') {
  return [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'All Requests', icon: ClipboardList, path: '/requests' },
    { label: 'Smart Bins', icon: Trash2, path: '/bins' },
    { label: 'Trucks', icon: Truck, path: '/trucks' },
    { label: 'Route Optimization', icon: Route, path: '/routes' },
    { label: 'Rewards', icon: Award, path: '/rewards' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]
} else {
      return [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/user-dashboard' },
{ label: 'My Requests', icon: ClipboardList, path: '/my-requests' },
{ label: 'Rewards', icon: Award, path: '/rewards' },
{ label: 'Profile', icon: Settings, path: '/profile' },
      ]
    }
  }

  const navItems = getNavItems()

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Leaf size={24} color="white" />
        </div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <h2>EcoRoute AI</h2>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <item.icon size={20} />
            {!collapsed && <span className="nav-item-text">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user-wrapper">
            <div className="sidebar-user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Demo User'}</div>
              <div className="sidebar-user-role">{role}</div>
            </div>
          </div>
        )}
        <button className="nav-item" onClick={logout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '10px', marginTop: '8px', width: '100%', justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <LogOut size={18} className="text-danger" />
          {!collapsed && <span className="nav-item-text text-danger ml-2">Sign out</span>}
        </button>
      </div>
      
      <button className="sidebar-toggle-btn" onClick={onToggle}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  )
}
