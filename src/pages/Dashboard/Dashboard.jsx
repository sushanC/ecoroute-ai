import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  AreaChart,
  Area
} from 'recharts'

import {
  ClipboardList,
  Clock3,
  AlertTriangle,
  Truck,
  Weight,
  Zap,
  Activity,
  RefreshCw,
  TrendingUp,
  MapPinned
} from 'lucide-react'

import './Dashboard.css'

function Card({ title, value, icon: Icon, bg, color }) {
  return (
    <div className="db-card">
      <div className="db-card-top">
        <div>
          <p className="db-label">{title}</p>
          <h3 className="db-value">{value}</h3>

          <span className="db-live">
            <TrendingUp size={12} />
            Live Update
          </span>
        </div>

        <div className="db-icon" style={{ background: bg }}>
          <Icon size={20} color={color} />
        </div>
      </div>
    </div>
  )
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="db-panel">
      <div className="db-panel-head">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>

      {children}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    overflowBins: 0,
    activeTrucks: 0,
    wasteCollected: '0t',
    fuelSaved: '0%'
  })

  const [bins, setBins] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)

    try {
      const [statsRes, binsRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats'),
        fetch('http://localhost:5000/api/bins')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (binsRes.ok) {
        const binsData = await binsRes.json()
        setBins(binsData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const cards = [
    {
      title: 'Total Requests',
      value: stats.totalRequests,
      icon: ClipboardList,
      bg: '#e0f2fe',
      color: '#0284c7'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: Clock3,
      bg: '#fef3c7',
      color: '#d97706'
    },
    {
      title: 'Overflow Bins',
      value: stats.overflowBins,
      icon: AlertTriangle,
      bg: '#fee2e2',
      color: '#dc2626'
    },
    {
      title: 'Active Trucks',
      value: stats.activeTrucks,
      icon: Truck,
      bg: '#dcfce7',
      color: '#16a34a'
    },
    {
      title: 'Waste Collected',
      value: stats.wasteCollected,
      icon: Weight,
      bg: '#f3e8ff',
      color: '#9333ea'
    },
    {
      title: 'Fuel Saved',
      value: stats.fuelSaved,
      icon: Zap,
      bg: '#ecfccb',
      color: '#65a30d'
    }
  ]

  const trendData = [
    { day: 'Mon', value: 18 },
    { day: 'Tue', value: 24 },
    { day: 'Wed', value: 20 },
    { day: 'Thu', value: 28 },
    { day: 'Fri', value: 26 },
    { day: 'Sat', value: 32 },
    { day: 'Sun', value: 30 }
  ]

  return (
    <div className="dashboard-modern">
      {/* Header */}
      <section className="db-hero">
        <div className="db-hero-left">
          <span className="db-badge">
            <Activity size={14} />
            System Operational
          </span>

          <h1>MG Road Smart Operations Center</h1>

          <p>
            Real-time waste collection intelligence with route optimization,
            live smart bins, and fleet performance analytics.
          </p>
        </div>

        <button className="db-refresh" onClick={fetchData}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh Data
        </button>
      </section>

      {/* Stats Cards */}
      <section className="db-grid">
        {cards.map((item) => (
          <Card key={item.title} {...item} />
        ))}
      </section>

      {/* Charts */}
      <section className="db-layout">
        {/* Smart Bins */}
        <div className="wide">
          <Panel
            title="Smart Bin Fill Levels"
            subtitle="Live status across MG Road network"
          >
            <div className="chart-box large-chart">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={bins}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="binId" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />

                  <Bar dataKey="fillLevel" radius={[8, 8, 0, 0]}>
                    {bins.map((bin, i) => (
                      <Cell
                        key={i}
                        fill={
                          bin.fillLevel >= 91
                            ? '#ef4444'
                            : bin.fillLevel >= 71
                            ? '#f59e0b'
                            : '#10b981'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        {/* Collection Trend */}
        <Panel
          title="Collection Trend"
          subtitle="Last 7 days performance"
        >
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient
                    id="greenFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="#10b981"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="#10b981"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="url(#greenFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </section>

      {/* Bottom Cards */}
      <section className="db-layout-2">
        <Panel
          title="Fleet Snapshot"
          subtitle="Operational metrics"
        >
          <div className="mini-grid">
            {[
              ['Avg Route Time', '22 min'],
              ['Fuel Efficiency', '+' + stats.fuelSaved],
              ['On-Time Pickups', '96%'],
              ['Fleet Health', 'Excellent']
            ].map(([label, val]) => (
              <div className="mini-card" key={label}>
                <p>{label}</p>
                <h4>{val}</h4>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Coverage Zone"
          subtitle="Primary service region"
        >
          <div className="zone-box">
            <div className="zone-icon">
              <MapPinned size={24} />
            </div>

            <h4>MG Road Zone</h4>
            <p>Smart collection network active and stable</p>
          </div>
        </Panel>
      </section>
    </div>
  )
}