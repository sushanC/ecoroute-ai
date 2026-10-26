import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LocateFixed,
  MapPinned,
  RefreshCw,
  Route as RouteIcon,
  Truck,
} from 'lucide-react'
import RouteMap from '../../components/RouteMap/RouteMap'
import { useAuth } from '../../context/AuthContext'
import { fetchRouteData } from '../../services/routeDataService'
import { isValidCoordinate } from '../../services/routingService'
import { createRoutePlans, getEntityId, getTruckColor, getTruckState } from '../../services/routePlanning'
import './RouteOptimization.css'

const OPEN_REQUEST_STATUSES = ['pending', 'in-progress']

const formatDistance = (meters) => meters >= 1000
  ? `${(meters / 1000).toFixed(1)} km`
  : `${Math.round(meters)} m`

const formatDuration = (seconds) => {
  const minutes = Math.round(seconds / 60)
  return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr ${minutes % 60} min`
}

export default function RouteOptimization() {
  const { token } = useAuth()
  const [data, setData] = useState({ bins: [], requests: [], trucks: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [routeState, setRouteState] = useState({ status: 'empty', routes: [] })
  const refreshController = useRef(null)

  const loadData = useCallback(async ({ signal, isRefresh = false } = {}) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const nextData = await fetchRouteData({ token, signal })
      setData(nextData)
      setLastUpdated(new Date())
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.message || 'Could not load the operations data.')
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => loadData({ signal: controller.signal }))
    return () => controller.abort()
  }, [loadData])

  useEffect(() => () => refreshController.current?.abort(), [])

  const refresh = () => {
    refreshController.current?.abort()
    const controller = new AbortController()
    refreshController.current = controller
    loadData({ signal: controller.signal, isRefresh: true })
  }

  const onRoutesChange = useCallback((nextRouteState) => setRouteState(nextRouteState), [])

  const openRequests = useMemo(() => data.requests.filter((request) =>
    OPEN_REQUEST_STATUSES.includes(String(request.status || '').toLowerCase())), [data.requests])
  const activeTrucks = useMemo(() => data.trucks.filter((truck) => getTruckState(truck.status) === 'active'), [data.trucks])
  const availableTrucks = useMemo(() => data.trucks.filter((truck) => getTruckState(truck.status) === 'idle'), [data.trucks])
  const criticalBins = useMemo(() => data.bins.filter((bin) => Number(bin.fillLevel) >= 91), [data.bins])

  const invalidCoordinateCount = useMemo(() => [
    ...data.bins,
    ...openRequests,
    ...data.trucks,
  ].filter((item) => !isValidCoordinate(item)).length, [data.bins, data.trucks, openRequests])

  const routeByTruck = useMemo(() => new Map(routeState.routes.map((route) => [route.truckId, route])), [routeState.routes])
  const planByTruck = useMemo(() => new Map(createRoutePlans(data.bins, openRequests, data.trucks)
    .map((plan) => [plan.truckId, plan])), [data.bins, data.trucks, openRequests])
  const totalRoadDistance = routeState.routes.reduce((sum, route) => sum + route.distanceMeters, 0)
  const longestTripSeconds = routeState.routes.reduce((longest, route) => Math.max(longest, route.durationSeconds), 0)

  return (
    <div className="route-ops-page">
      <header className="route-ops-header">
        <div>
          <div className="route-ops-eyebrow"><span className="route-ops-live-dot" /> FLEET OPERATIONS <span className="route-ops-eyebrow-divider">/</span> BENGALURU
          </div>
          <h1>Route optimization</h1>
          <p>Explore collection assets and road-based route previews across the MG Road service area.</p>
        </div>
        <div className="route-ops-header-actions">
          <span className="route-ops-area-chip"><MapPinned size={15} /> MG Road, Bengaluru</span>
          <button type="button" className="route-ops-refresh" onClick={refresh} disabled={loading || refreshing}>
            <RefreshCw size={15} className={refreshing ? 'route-ops-spin' : ''} />
            {refreshing ? 'Refreshing' : 'Refresh data'}
          </button>
        </div>
      </header>

      {error && (
        <div className="route-ops-error" role="alert">
          <div><AlertTriangle size={18} /><span>{error}</span></div>
          <button type="button" onClick={refresh}>Retry</button>
        </div>
      )}

      {loading && !lastUpdated ? (
        <>
          <div className="route-ops-kpis" aria-label="Loading route data">
            {[0, 1, 2, 3].map((key) => <div key={key} className="route-ops-kpi route-ops-skeleton"><span /><b /></div>)}
          </div>
          <div className="route-ops-loading-map"><div className="route-ops-skeleton-block" />Loading fleet and collection data…</div>
        </>
      ) : (
        <>
          <section className="route-ops-kpis" aria-label="Fleet summary">
            <KpiCard label="Active trucks" value={activeTrucks.length} detail="Reported on route or busy" icon={<Truck size={18} />} tone="green" />
            <KpiCard label="Available trucks" value={availableTrucks.length} detail="Reported available or idle" icon={<CheckCircle2 size={18} />} tone="blue" />
            <KpiCard label="Open requests" value={openRequests.length} detail="Pending and in progress" icon={<Clock3 size={18} />} tone="violet" />
            <KpiCard label="Critical bins" value={criticalBins.length} detail="91% fill or higher" icon={<AlertTriangle size={18} />} tone="red" />
          </section>

          <section className="route-ops-workspace">
            <div className="route-ops-map-card">
              <div className="route-ops-map-heading">
                <div>
                  <div className="route-ops-section-kicker"><LocateFixed size={13} /> OPERATIONS MAP</div>
                  <h2>Collection operations map</h2>
                  <p>Bins, pickup requests, truck positions and planned road routes</p>
                </div>
                <div className="route-ops-map-meta">
                  {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  <span className="route-ops-map-source">OSM streets</span>
                </div>
              </div>

              <RouteMap
                bins={data.bins}
                requests={openRequests}
                trucks={data.trucks}
                selectedItem={selectedItem}
                onSelectItem={setSelectedItem}
                onRoutesChange={onRoutesChange}
              />

              {invalidCoordinateCount > 0 && (
                <p className="route-ops-coordinate-note" role="status">
                  {invalidCoordinateCount} record{invalidCoordinateCount === 1 ? '' : 's'} omitted from the map because coordinates are missing or invalid.
                </p>
              )}
            </div>

            <aside className="route-ops-sidebar">
              <section className="route-ops-side-card route-ops-route-summary">
                <div className="route-ops-side-heading">
                  <div><span className="route-ops-section-kicker">ROAD ROUTING</span><h3>Route estimates</h3></div>
                  <RouteIcon size={18} />
                </div>
                <div className="route-ops-estimates">
                  <div><span>Fleet road distance</span><strong>{routeState.routes.length ? formatDistance(totalRoadDistance) : '—'}</strong></div>
                  <div><span>Longest trip estimate</span><strong>{routeState.routes.length ? formatDuration(longestTripSeconds) : '—'}</strong></div>
                </div>
                <p className="route-ops-footnote">
                  {routeState.status === 'loading'
                    ? 'Requesting road geometry from OSRM…'
                    : routeState.routes.length
                      ? 'OSRM road-network estimates; not traffic-aware or live GPS.'
                      : routeState.status === 'error' || routeState.status === 'partial'
                        ? 'Some road routes are unavailable; no straight-line distance is substituted.'
                        : 'Route totals appear when eligible collection stops are available.'}
                </p>
              </section>

              <section className="route-ops-side-card route-ops-fleet-card">
                <div className="route-ops-side-heading">
                  <div><span className="route-ops-section-kicker">FLEET</span><h3>Truck routes <span>{data.trucks.length}</span></h3></div>
                </div>
                {loading && !data.trucks.length ? <p className="route-ops-muted">Loading fleet…</p> : data.trucks.length ? (
                  <div className="route-ops-truck-list">
                    {data.trucks.map((truck) => {
                      const truckId = getEntityId(truck, 'truckId')
                      const route = routeByTruck.get(truckId)
                      const plan = planByTruck.get(truckId)
                      const state = getTruckState(truck.status)
                      const isSelected = selectedItem?.type === 'truck' && selectedItem.id === truckId
                      return (
                        <button
                          type="button"
                          className={`route-ops-truck-row${isSelected ? ' is-selected' : ''}`}
                          key={truckId}
                          onClick={() => setSelectedItem({ type: 'truck', id: truckId })}
                          aria-pressed={isSelected}
                        >
                          <span className="route-ops-truck-color" style={{ backgroundColor: getTruckColor(truck.truckId) }} />
                          <span className="route-ops-truck-main">
                            <span className="route-ops-truck-title"><strong>{truck.truckId || 'Truck'}</strong><i className={`route-ops-status-dot route-ops-status-dot--${state}`} /></span>
                            <span className="route-ops-truck-meta">{truck.status || 'Unknown status'} · {plan?.stops.length ?? 0} planned stops</span>
                            <span className="route-ops-load-track" aria-label={`Truck load ${truck.currentLoad ?? 0} of ${truck.capacity ?? 0} kilograms`}>
                              <i style={{ width: `${truck.capacity > 0 ? Math.min(100, Math.max(0, Number(truck.currentLoad) / Number(truck.capacity) * 100)) : 0}%`, backgroundColor: getTruckColor(truck.truckId) }} />
                            </span>
                            <span className="route-ops-truck-meta route-ops-truck-measure">
                              {truck.currentLoad ?? '—'} / {truck.capacity ?? '—'} kg
                              {route ? <><span>·</span>{formatDistance(route.distanceMeters)}<span>·</span>{formatDuration(route.durationSeconds)}</> : null}
                            </span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : <EmptyInline message="No trucks returned by the fleet API." />}
              </section>

              <section className="route-ops-side-card route-ops-planner-card">
                <span className="route-ops-section-kicker">PLANNING PREVIEW</span>
                <h3>How stops are ordered</h3>
                <ul>
                  <li>Bins at 71% fill and above are included first.</li>
                  <li>Open requests follow in high, medium, then low priority order.</li>
                  <li>The existing planner distributes the ordered list across trucks.</li>
                </ul>
                <p>Assignments are a map preview and are not saved to truck records.</p>
              </section>
            </aside>
          </section>
        </>
      )}
    </div>
  )
}

function KpiCard({ label, value, detail, icon, tone }) {
  return (
    <div className="route-ops-kpi">
      <span className={`route-ops-kpi-icon route-ops-kpi-icon--${tone}`}>{icon}</span>
      <span className="route-ops-kpi-label">{label}</span>
      <strong>{value}</strong>
      <span className="route-ops-kpi-detail">{detail}</span>
    </div>
  )
}

function EmptyInline({ message }) {
  return <p className="route-ops-empty-inline">{message}</p>
}
