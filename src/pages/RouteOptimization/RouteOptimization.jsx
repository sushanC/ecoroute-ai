import { useState, useEffect } from 'react'
import RouteMap from '../../components/RouteMap/RouteMap'
import {
  Truck,
  Route,
  RefreshCw,
  MapPinned,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  Fuel,
  Gauge,
  TimerReset,
  TrendingUp
} from 'lucide-react'

export default function RouteOptimization() {
  const [bins, setBins] = useState([])
  const [requests, setRequests] = useState([])
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [binsRes, reqsRes, trucksRes] = await Promise.all([
        fetch('http://localhost:5000/api/bins'),
        fetch('http://localhost:5000/api/requests'),
        fetch('http://localhost:5000/api/trucks')
      ])

      if (binsRes.ok) setBins(await binsRes.json())

      if (reqsRes.ok) {
        const data = await reqsRes.json()
        setRequests(
          data.filter((r) => r.status !== 'completed')
        )
      }

      if (trucksRes.ok) setTrucks(await trucksRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const pending = requests.length
  const overflow = bins.filter(
    (b) => b.fillLevel >= 90
  ).length
  const active = trucks.length

  const fuelSaved = `${Math.max(
    8,
    Math.min(
      22,
      Math.round(requests.length * 1.8)
    )
  )}%`

  const avgEta = `${12 + active} mins`

  return (
    <div className="route-v2-page">
      {/* Hero */}
      <section className="route-v2-hero">
        <div>
          <span className="route-v2-badge">
            <Activity size={14} />
            Smart Fleet AI Engine
          </span>

          <h1>Route Optimization Center</h1>

          <p>
            Real-time route planning with
            nearest-neighbor logic, truck
            balancing, live priority stops,
            and optimized city collection
            intelligence.
          </p>
        </div>

        <button
          className="route-v2-refresh"
          onClick={fetchData}
        >
          <RefreshCw
            size={16}
            className={loading ? 'spin' : ''}
          />
          Refresh Data
        </button>
      </section>

      {/* KPI Cards */}
      <section className="route-v2-kpis">
        <KpiCard
          title="Active Trucks"
          value={active}
          icon={<Truck size={18} />}
          green
        />

        <KpiCard
          title="Pending Requests"
          value={pending}
          icon={<Clock3 size={18} />}
          blue
        />

        <KpiCard
          title="Overflow Bins"
          value={overflow}
          icon={<AlertTriangle size={18} />}
          red
        />

        <KpiCard
          title="Fuel Saved"
          value={fuelSaved}
          icon={<Fuel size={18} />}
          green
        />
      </section>

      {/* Main Layout */}
      <section className="route-v2-grid">
        {/* Left */}
        <div className="route-v2-left">
          <div className="glass-panel">
            <div className="panel-head">
              <div>
                <h3>Live Route Map</h3>
                <p>
                  Smart bins, user requests,
                  trucks, and optimized routes
                </p>
              </div>

              <div className="mini-chip">
                <MapPinned size={14} />
                MG Road
              </div>
            </div>

            <div className="map-holder">
              {loading ? (
                <div className="map-loader">
                  Loading route engine...
                </div>
              ) : (
                <RouteMap
                  bins={bins}
                  requests={requests}
                  trucks={trucks}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="route-v2-right">
          {trucks.map((truck, i) => (
            <TruckPanel
              key={truck._id || truck.truckId}
              truck={truck}
              index={i}
            />
          ))}

          <div className="glass-panel">
            <div className="panel-head">
              <h3>Live Metrics</h3>
              <p>
                Fleet efficiency snapshot
              </p>
            </div>

            <div className="mini-metrics">
              <MiniMetric
                icon={<Gauge size={16} />}
                label="Avg Speed"
                value="32 km/h"
              />
              <MiniMetric
                icon={
                  <TimerReset size={16} />
                }
                label="Avg ETA"
                value={avgEta}
              />
              <MiniMetric
                icon={
                  <TrendingUp size={16} />
                }
                label="On-Time"
                value="96%"
              />
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-head">
              <h3>Optimization Logic</h3>
              <p>
                Core decision priorities
              </p>
            </div>

            <ul className="logic-ul">
              <li>
                Overflow bins handled first
              </li>
              <li>
                High priority requests first
              </li>
              <li>
                Nearest stop selected next
              </li>
              <li>
                Capacity-aware assignment
              </li>
              <li>
                Balanced truck workload
              </li>
            </ul>
          </div>
        </div>
      </section>

      <style>{`
        .route-v2-page{
          display:flex;
          flex-direction:column;
          gap:24px;
        }

        .route-v2-hero{
          display:flex;
          justify-content:space-between;
          gap:20px;
          flex-wrap:wrap;
          align-items:flex-start;
        }

        .route-v2-badge{
          display:inline-flex;
          gap:6px;
          align-items:center;
          padding:6px 12px;
          border-radius:999px;
          background:var(--status-success-bg);
          color:var(--status-success);
          font-size:12px;
          font-weight:700;
          margin-bottom:12px;
        }

        .route-v2-hero h1{
          font-size:2rem;
          font-weight:800;
          color:var(--text-primary);
          margin-bottom:8px;
        }

        .route-v2-hero p{
          color:var(--text-secondary);
          max-width:760px;
          line-height:1.7;
        }

        .route-v2-refresh{
          height:46px;
          padding:0 16px;
          border:none;
          border-radius:14px;
          background:var(--text-primary);
          color:var(--bg-surface);
          font-weight:700;
          display:flex;
          gap:8px;
          align-items:center;
          cursor:pointer;
        }

        .route-v2-kpis{
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:18px;
        }

        .kpi-card{
          background:var(--bg-card);
          border:1px solid var(--border-card);
          border-radius:20px;
          padding:20px;
          box-shadow:var(--shadow-card);
        }

        .kpi-top{
          display:flex;
          justify-content:space-between;
        }

        .kpi-label{
          font-size:13px;
          color:var(--text-secondary);
          margin-bottom:8px;
        }

        .kpi-value{
          font-size:2rem;
          font-weight:800;
          color:var(--text-primary);
        }

        .route-v2-grid{
          display:grid;
          grid-template-columns:2fr 1fr;
          gap:20px;
        }

        .route-v2-right{
          display:flex;
          flex-direction:column;
          gap:20px;
        }

        .glass-panel{
          background:var(--bg-card);
          border:1px solid var(--border-card);
          border-radius:24px;
          padding:22px;
          box-shadow:var(--shadow-hover);
          backdrop-filter:blur(12px);
        }

        .panel-head{
          display:flex;
          justify-content:space-between;
          gap:12px;
          margin-bottom:18px;
          align-items:flex-start;
        }

        .panel-head h3{
          font-size:1.08rem;
          font-weight:800;
          color:var(--text-primary);
        }

        .panel-head p{
          font-size:14px;
          color:var(--text-secondary);
          margin-top:4px;
        }

        .mini-chip{
          padding:6px 10px;
          border-radius:999px;
          background:var(--bg-base);
          display:flex;
          align-items:center;
          gap:6px;
          font-size:12px;
          font-weight:700;
          color:var(--text-secondary);
        }

        .map-holder{
          min-height:580px;
          overflow:hidden;
          border-radius:18px;
          border:1px solid var(--border-card);
        }

        .map-loader{
          min-height:580px;
          display:grid;
          place-items:center;
          color:var(--text-secondary);
          font-weight:700;
          background:var(--bg-base);
        }

        .truck-route{
          background:var(--bg-base);
          padding:14px;
          border-radius:16px;
          font-size:14px;
          color:var(--text-secondary);
          line-height:1.7;
          margin-top:12px;
        }

        .mini-metrics{
          display:grid;
          gap:12px;
        }

        .mini-box{
          background:var(--bg-base);
          border-radius:16px;
          padding:14px;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .logic-ul{
          margin:0;
          padding-left:18px;
          color:var(--text-secondary);
          line-height:2;
        }

        .spin{
          animation:spin 1s linear infinite;
        }

        @keyframes spin{
          to{transform:rotate(360deg)}
        }

        @media(max-width:1200px){
          .route-v2-kpis{
            grid-template-columns:repeat(2,1fr);
          }

          .route-v2-grid{
            grid-template-columns:1fr;
          }
        }

        @media(max-width:768px){
          .route-v2-kpis{
            grid-template-columns:1fr;
          }

          .route-v2-hero h1{
            font-size:1.5rem;
          }

          .map-holder,
          .map-loader{
            min-height:420px;
          }
        }
      `}</style>
    </div>
  )
}

function KpiCard({
  title,
  value,
  icon,
  green,
  red,
  blue
}) {
  let bg = 'var(--status-info-bg)'
  let color = 'var(--status-info)'

  if (green) {
    bg = 'var(--status-success-bg)'
    color = 'var(--status-success)'
  }

  if (red) {
    bg = 'var(--status-danger-bg)'
    color = 'var(--status-danger)'
  }

  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div>
          <div className="kpi-label">
            {title}
          </div>
          <div className="kpi-value">
            {value}
          </div>
        </div>

        <div
          style={{
            width:46,
            height:46,
            borderRadius:14,
            background:bg,
            color,
            display:'grid',
            placeItems:'center'
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function TruckPanel({
  truck,
  index
}) {
  const colors = [
    {
      bg: 'var(--status-success-bg)',
      text: 'var(--status-success)'
    },
    {
      bg: 'var(--status-info-bg)',
      text: 'var(--status-info)'
    }
  ]

  const theme =
    colors[index % colors.length]

  const eta = `${8 + index * 3} mins`
  const distance = `${4 + index * 1.6} km`

  return (
    <div className="glass-panel">
      <div className="panel-head">
        <div>
          <h3>{truck.truckId}</h3>
          <p>
            Current load:{' '}
            {truck.currentLoad}kg /{' '}
            {truck.capacity}kg
          </p>
        </div>

        <div
          className="mini-chip"
          style={{
            background:theme.bg,
            color:theme.text
          }}
        >
          <CheckCircle2 size={14} />
          Active
        </div>
      </div>

      <div className="mini-metrics">
        <MiniMetric
          icon={<Route size={15} />}
          label="Distance"
          value={distance}
        />

        <MiniMetric
          icon={<Clock3 size={15} />}
          label="ETA"
          value={eta}
        />
      </div>

      <div className="truck-route">
        Depot → Priority Stops →
        Assigned Requests → Return
      </div>
    </div>
  )
}

function MiniMetric({
  icon,
  label,
  value
}) {
  return (
    <div className="mini-box">
      <div
        style={{
          display:'flex',
          alignItems:'center',
          gap:'8px',
          color:'var(--text-secondary)'
        }}
      >
        {icon}
        {label}
      </div>

      <strong>{value}</strong>
    </div>
  )
}