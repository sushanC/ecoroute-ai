import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
// import { useState, useContext } from 'react'
import {
  Search,
  Bell,
  HelpCircle
} from 'lucide-react'
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
  '/users': 'Users',
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

  ...users.map(user => ({
    name: user.name,
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
                filteredResults.map((item, index) => (
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

        {/* Notifications */}
        <button
          className="header-icon-btn"
          title="Notifications"
        >
          <Bell size={17} />
          <div className="notification-dot" />
        </button>

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