import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import { LocateFixed, MapPinOff, RefreshCw, Route as RouteIcon, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import './RouteMap.css'
import { isValidCoordinate } from '../../services/routingService'
import { getBinSeverity, getEntityId, getTruckColor, getTruckState } from '../../services/routePlanning'

const DEMO_CENTER = [12.9735, 77.6075]
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
const noop = () => {}

const iconMarkup = {
  bin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3m2 0-.7 13H7.7L7 7m3 3v7m4-7v7"/></svg>',
  request: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  truck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"/><circle cx="7.5" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/></svg>',
}

const markerIcon = (type, variant, color) => L.divIcon({
  className: 'route-marker-host',
  html: `<span class="route-marker route-marker--${type} route-marker--${variant}" style="--route-marker-color:${color}">${iconMarkup[type]}</span>`,
  iconSize: [36, 42],
  iconAnchor: [18, 38],
  popupAnchor: [0, -34],
  tooltipAnchor: [0, -31],
})

const binMarker = (bin) => {
  const severity = getBinSeverity(bin.fillLevel)
  const variant = severity
  const color = severity === 'critical' ? '#b91c1c' : severity === 'warning' ? '#b45309' : severity === 'unknown' ? '#64748b' : '#15803d'
  return markerIcon('bin', variant, color)
}

const requestMarker = markerIcon('request', 'request', '#6d28d9')

const truckMarker = (state, color) => markerIcon('truck', state, color)

const formatUpdatedAt = (item) => {
  const timestamp = item?.updatedAt || item?.createdAt
  if (!timestamp) return 'Not provided'
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? 'Not provided' : date.toLocaleString()
}

function MapViewport({ positions, fitVersion }) {
  const map = useMap()
  useEffect(() => {
    if (!positions.length) return
    if (positions.length === 1) map.setView(positions[0], 15)
    else map.fitBounds(L.latLngBounds(positions), { padding: [42, 42], maxZoom: 16 })
  }, [fitVersion, map, positions])
  return null
}

function TileErrorWatcher({ onError }) {
  useMapEvents({ tileerror: onError })
  return null
}

function FilterToggle({ active, icon, label, onClick }) {
  return (
    <button
      className={`route-map-filter${active ? ' is-active' : ''}`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      {icon}<span>{label}</span>
    </button>
  )
}

function ItemDetails({ selected, onClose }) {
  if (!selected) return null
  const { type, item } = selected
  const name = item.binId || item.truckId || item.name || item._id || 'Map item'

  return (
    <aside className="route-map-selection" aria-live="polite">
      <div className="route-map-selection-heading">
        <div>
          <span className={`route-map-item-type route-map-item-type--${type}`}>{type}</span>
          <h4>{name}</h4>
        </div>
        <button type="button" className="route-map-icon-button" onClick={onClose} aria-label="Close selected item details">
          <X size={16} />
        </button>
      </div>
      <p className="route-map-selection-location">{item.location || 'Location not provided'}</p>
      {type === 'bin' && (
        <div className="route-map-detail-grid">
          <span>Fill level</span><strong>{Number.isFinite(Number(item.fillLevel)) ? `${item.fillLevel}%` : 'Not provided'}</strong>
          <span>Priority</span><strong>{getBinSeverity(item.fillLevel) === 'critical' ? 'Critical' : getBinSeverity(item.fillLevel) === 'warning' ? 'Collection threshold' : getBinSeverity(item.fillLevel) === 'unknown' ? 'Unknown fill level' : 'Normal'}</strong>
          <span>Last update</span><strong>{formatUpdatedAt(item)}</strong>
        </div>
      )}
      {type === 'request' && (
        <div className="route-map-detail-grid">
          <span>Status</span><strong>{item.status || 'Not provided'}</strong>
          <span>Priority</span><strong>{item.priority || 'Not provided'}</strong>
          <span>Waste type</span><strong>{Array.isArray(item.wasteTypes) && item.wasteTypes.length ? item.wasteTypes.join(', ') : item.wasteType || 'Not provided'}</strong>
          <span>Waste</span><strong>{item.wasteAmount != null ? `${item.wasteAmount} kg` : 'Not provided'}</strong>
        </div>
      )}
      {type === 'truck' && (
        <div className="route-map-detail-grid">
          <span>Fleet status</span><strong>{item.status || 'Unknown'}</strong>
          <span>Load / capacity</span><strong>{item.currentLoad ?? '—'} / {item.capacity ?? '—'} kg</strong>
          <span>Assignment</span><strong>{item.route || 'Unassigned'}</strong>
        </div>
      )}
    </aside>
  )
}

export default function RouteMap({
  bins = [],
  requests = [],
  trucks = [],
  routes = [],
  routeStatus = 'idle',
  selectedItem = null,
  onSelectItem = noop,
}) {
  const [filters, setFilters] = useState({ bins: true, requests: true, trucks: true, routes: true })
  const [fitVersion, setFitVersion] = useState(0)
  const [tileVersion, setTileVersion] = useState(0)
  const [tileFailed, setTileFailed] = useState(false)
  const routeByTruck = useMemo(() => new Map(routes.map((route) => [route.truckRecordId || route.truckId, route])), [routes])

  const visibleBins = useMemo(() => filters.bins ? bins.filter(isValidCoordinate) : [], [bins, filters.bins])
  const visibleRequests = useMemo(() => filters.requests
    ? requests.filter((request) => !['completed', 'cancelled'].includes(String(request.status || '').toLowerCase()) && isValidCoordinate(request))
    : [], [filters.requests, requests])
  const visibleTrucks = useMemo(() => filters.trucks ? trucks.filter(isValidCoordinate) : [], [filters.trucks, trucks])
  const activeRoutes = useMemo(() => filters.routes ? routes : [], [filters.routes, routes])

  const viewportPositions = useMemo(() => [
    ...visibleBins.map((item) => [Number(item.lat), Number(item.lng)]),
    ...visibleRequests.map((item) => [Number(item.lat), Number(item.lng)]),
    ...visibleTrucks.map((item) => [Number(item.lat), Number(item.lng)]),
    ...activeRoutes.flatMap((route) => route.positions),
  ], [activeRoutes, visibleBins, visibleRequests, visibleTrucks])

  const selected = useMemo(() => {
    if (!selectedItem?.type || !selectedItem?.id) return null
    const source = selectedItem.type === 'bin' ? bins
      : selectedItem.type === 'request' ? requests : trucks
    const item = source.find((entry) => getEntityId(entry, selectedItem.type === 'bin' ? 'binId' : selectedItem.type === 'truck' ? 'truckId' : 'requestId') === selectedItem.id)
    return item ? { type: selectedItem.type, item } : null
  }, [bins, requests, selectedItem, trucks])

  const toggleFilter = (key) => setFilters((current) => ({ ...current, [key]: !current[key] }))

  return (
    <div className="route-map-shell">
      <div className="route-map-toolbar" aria-label="Map layers and tools">
        <div className="route-map-filters">
          <FilterToggle active={filters.bins} label="Bins" icon={<span className="route-map-dot route-map-dot--bin" />} onClick={() => toggleFilter('bins')} />
          <FilterToggle active={filters.requests} label="Pickup requests" icon={<span className="route-map-dot route-map-dot--request" />} onClick={() => toggleFilter('requests')} />
          <FilterToggle active={filters.trucks} label="Trucks" icon={<span className="route-map-dot route-map-dot--truck" />} onClick={() => toggleFilter('trucks')} />
          <FilterToggle active={filters.routes} label="Routes" icon={<span className="route-map-route-swatch" />} onClick={() => toggleFilter('routes')} />
        </div>
        <button className="route-map-fit-button" type="button" onClick={() => setFitVersion((value) => value + 1)}>
          <LocateFixed size={15} /> Fit visible
        </button>
      </div>

      <div className="route-map-canvas">
        <MapContainer center={DEMO_CENTER} zoom={15} scrollWheelZoom zoomControl className="route-map-leaflet" aria-label="Waste collection operations map">
          <TileLayer
            key={tileVersion}
            attribution={MAP_ATTRIBUTION}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: () => setTileFailed(true), tileload: () => setTileFailed(false) }}
          />
          <TileErrorWatcher onError={() => setTileFailed(true)} />
          <MapViewport positions={viewportPositions} fitVersion={fitVersion} />

          {visibleBins.map((bin) => {
            const id = getEntityId(bin, 'binId')
            return (
              <Marker
                key={`bin-${id}`}
                position={[Number(bin.lat), Number(bin.lng)]}
                icon={binMarker(bin)}
                title={`Smart bin ${bin.binId || id}`}
                alt={`Smart bin ${bin.binId || id}, ${bin.fillLevel}% full`}
                eventHandlers={{ click: () => onSelectItem({ type: 'bin', id }) }}
              >
                <Tooltip>{bin.binId || 'Smart bin'} · {bin.fillLevel}% full</Tooltip>
                <Popup><strong>{bin.binId || 'Smart bin'}</strong><br />{bin.location}<br />Fill: {bin.fillLevel}%<br />Status: {bin.status || 'Not provided'}</Popup>
              </Marker>
            )
          })}

          {visibleRequests.map((request) => {
            const id = getEntityId(request, 'requestId')
            return (
              <Marker
                key={`request-${id}`}
                position={[Number(request.lat), Number(request.lng)]}
                icon={requestMarker}
                title={`Pickup request ${request.name || id}`}
                alt={`Pickup request at ${request.location || 'location not provided'}`}
                eventHandlers={{ click: () => onSelectItem({ type: 'request', id }) }}
              >
                <Tooltip>Pickup · {request.priority || 'Standard'} priority</Tooltip>
                <Popup><strong>Pickup request</strong><br />{request.name || 'Resident'}<br />{request.location}<br />{request.priority || 'Standard'} priority · {request.status}</Popup>
              </Marker>
            )
          })}

          {visibleTrucks.map((truck) => {
            const id = getEntityId(truck, 'truckId')
            const plan = routeByTruck.get(id)
            const state = getTruckState(truck.status)
            return (
              <Marker
                key={`truck-${id}`}
                position={[Number(truck.lat), Number(truck.lng)]}
                icon={truckMarker(state, getTruckColor(truck.truckId || id))}
                title={`Truck ${truck.truckId || id}: ${truck.status || 'unknown status'}`}
                alt={`Truck ${truck.truckId || id}, ${truck.status || 'unknown status'}`}
                eventHandlers={{ click: () => onSelectItem({ type: 'truck', id }) }}
              >
                <Tooltip>{truck.truckId || 'Truck'} · {truck.status || 'Unknown'}</Tooltip>
                <Popup><strong>{truck.truckId || 'Truck'}</strong><br />Status: {truck.status || 'Unknown'}<br />Load: {truck.currentLoad ?? '—'} / {truck.capacity ?? '—'} kg<br />Preview stops: {plan?.stops.length ?? 0}</Popup>
              </Marker>
            )
          })}

          {activeRoutes.filter((route) => route.positions?.length > 1).map((route) => {
            const selected = selectedItem?.type === 'truck' && selectedItem.id === (route.truckRecordId || route.truckId)
            return (
              <Polyline
                key={`route-${route.truckId}`}
                positions={route.positions}
                pathOptions={{ color: getTruckColor(route.truckId), weight: selected ? 8 : 5, opacity: selected ? 0.95 : 0.7, lineCap: 'round', lineJoin: 'round' }}
                eventHandlers={{ click: () => onSelectItem({ type: 'truck', id: route.truckRecordId || route.truckId }) }}
              />
            )
          })}
        </MapContainer>

        {tileFailed && (
          <div className="route-map-notice route-map-tile-error" role="status">
            <span>Map tiles are temporarily unavailable. Asset data and routes remain available.</span>
            <button type="button" onClick={() => { setTileFailed(false); setTileVersion((value) => value + 1) }}>Retry tiles</button>
          </div>
        )}

        {viewportPositions.length === 0 && (
          <div className="route-map-notice route-map-empty" role="status">
            <MapPinOff size={20} />
            <strong>No mappable assets in the selected layers</strong>
            <span>Check that the API records include valid latitude and longitude values.</span>
          </div>
        )}

        {routeStatus === 'loading' && (
          <div className="route-map-routing-status" role="status"><RefreshCw size={14} className="route-map-spin" /> Optimizing routes with road-network costs…</div>
        )}
        {(routeStatus === 'error' || routeStatus === 'partial') && (
          <div className="route-map-routing-status route-map-routing-warning" role="status">
            <RouteIcon size={14} />
            {routeStatus === 'partial' ? 'Preview contains unassigned work or route-provider warnings.' : 'Road routing is unavailable. No straight-line substitute is shown.'}
          </div>
        )}

        <ItemDetails selected={selected} onClose={() => onSelectItem(null)} />
      </div>

      <div className="route-map-footer">
        <div className="route-map-legend" aria-label="Map legend">
          <span><i className="route-map-legend-dot route-map-legend-dot--normal" /> Normal bin</span>
          <span><i className="route-map-legend-dot route-map-legend-dot--warning" /> Threshold</span>
          <span><i className="route-map-legend-dot route-map-legend-dot--critical" /> Critical</span>
          <span><i className="route-map-legend-dot route-map-legend-dot--request" /> Pickup request</span>
          {activeRoutes.map((route) => <span key={route.truckId}><i className="route-map-legend-line" style={{ backgroundColor: getTruckColor(route.truckId) }} /> {route.truckId || 'Truck'}</span>)}
        </div>
        <span className="route-map-attribution-note">OpenStreetMap · Planned routes via OSRM · Not GPS tracking</span>
      </div>
    </div>
  )
}
