import { useLocation } from 'react-router-dom'
import { Search, Bell, Moon, Sun, Settings, HelpCircle, LogOut, User } from 'lucide-react'
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
import './Header.css'

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/requests': 'User Request',
  '/bins': 'Smart Bins',
  '/routes': 'Route Optimization',
  '/trucks': 'Truck Management',
  '/rewards': 'Rewards',
  '/settings': 'Settings',
}

export default function Header() {
  const location = useLocation()
  const currentPage = routeLabels[location.pathname] || 'EcoRoute AI'
  const { user, logout } = useContext(AuthContext)

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-breadcrumb">
          <span>EcoRoute AI</span>
          <span className="separator">/</span>
          <span className="current">{currentPage}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search anything..."
            id="header-search-input"
          />
        </div>

        {/* Live Badge */}
        <div className="header-live-badge">
          <div className="live-pulse" />
          Live
        </div>

        {/* Notifications */}
        <button className="header-icon-btn" id="notifications-btn" title="Notifications">
          <Bell size={17} />
          <div className="notification-dot" />
        </button>

        {/* Help */}
        <button className="header-icon-btn" id="help-btn" title="Help">
          <HelpCircle size={17} />
        </button>
      </div>
    </header>
  )
}
