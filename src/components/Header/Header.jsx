import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import {
  Search,
  HelpCircle
} from 'lucide-react'
import { AuthContext } from '../../context/AuthContext'
import NotificationBell from '../NotificationBell/NotificationBell'
import ThemeToggle from '../ThemeToggle/ThemeToggle'
import './Header.css'

const routeLabels = {
  '/dashboard': 'Dashboard',
  '/requests': 'User Request',
  '/bins': 'Smart Bins',
  '/routes': 'Route Optimization',
  '/trucks': 'Truck Management',
  '/rewards': 'Rewards',
  '/settings': 'Settings',
  '/users': 'Users',
  '/user-dashboard': 'Dashboard',
  '/my-requests': 'My Requests',
  '/profile': 'Profile',
}

export default function Header() {
  const [users, setUsers] = useState([])
  const [trucks, setTrucks] = useState([])
  const [bins, setBins] = useState([])
  const [requests, setRequests] = useState([])
  const location = useLocation()
  const navigate = useNavigate()

  const currentPage =
    routeLabels[location.pathname] || 'EcoRoute AI'

  const { user } = useContext(AuthContext)

  const [searchTerm, setSearchTerm] = useState('')
  const [showResults, setShowResults] = useState(false)

  const searchItems = [
    { name: 'Dashboard', path: '/dashboard', type: 'Page' },
    { name: 'Users', path: '/users', type: 'Page' },
    { name: 'Rewards', path: '/rewards', type: 'Page' },
    { name: 'Smart Bins', path: '/bins', type: 'Page' },
    { name: 'Trucks', path: '/trucks', type: 'Page' },
    { name: 'Routes', path: '/routes', type: 'Page' },

    ...users.map(u => ({
      name: u.name,
      path: '/users',
      type: 'User'
    })),

    ...trucks.map(truck => ({
      name: truck.truckId,
      path: '/trucks',
      type: 'Truck'
    })),

    ...bins.map(bin => ({
      name: bin.binId,
      path: '/bins',
      type: 'Bin'
    })),

    ...requests.map(req => ({
      name: req.name,
      path: '/requests',
      type: 'Request'
    }))
  ]

  const filteredResults = searchItems.filter(
    (item) =>
      item.name &&
      item.name.toLowerCase().includes(
        searchTerm.toLowerCase()
      )
  )

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        const [usersRes, trucksRes, binsRes, requestsRes] =
          await Promise.all([
            fetch('http://localhost:5000/api/users'),
            fetch('http://localhost:5000/api/trucks'),
            fetch('http://localhost:5000/api/bins'),
            fetch('http://localhost:5000/api/requests')
          ])

        if (usersRes.ok) setUsers(await usersRes.json())
        if (trucksRes.ok) setTrucks(await trucksRes.json())
        if (binsRes.ok) setBins(await binsRes.json())
        if (requestsRes.ok) setRequests(await requestsRes.json())
      } catch (error) {
        console.error('Search data fetch failed', error)
      }
    }

    fetchSearchData()
  }, [])

  /* Close search dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.header-search')) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
          />

          {showResults && searchTerm && (
            <div className="search-dropdown">
              {filteredResults.length > 0 ? (
                filteredResults.slice(0, 8).map((item, index) => (
                  <div
                    key={index}
                    className="search-result-item"
                    onClick={() => {
                      navigate(item.path)
                      setSearchTerm('')
                      setShowResults(false)
                    }}
                  >
                    <div className="search-result-name">
                      {item.type === 'User' && '👤 '}
                      {item.type === 'Truck' && '🚛 '}
                      {item.type === 'Bin' && '🗑 '}
                      {item.type === 'Request' && '📦 '}
                      {item.type === 'Page' && '📄 '}
                      {item.name}
                    </div>
                    <div className="search-result-type">
                      {item.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="search-result-item">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Badge */}
        <div className="header-live-badge">
          <div className="live-pulse" />
          Live
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell />

        {/* Help */}
        <button
          className="header-icon-btn"
          title="Help"
        >
          <HelpCircle size={17} />
        </button>
      </div>
    </header>
  )
}