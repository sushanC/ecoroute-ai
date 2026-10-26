import { isValidCoordinate } from './routingService'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

export const ROUTE_COLORS = [
  '#15803d', '#2563eb', '#c2410c', '#7c3aed', '#0f766e', '#be123c', '#4d7c0f', '#0369a1',
]

export function getEntityId(item, fallback) {
  return String(item?._id || item?.[fallback] || '')
}

export function getBinSeverity(fillLevel) {
  if (fillLevel === null || fillLevel === undefined || fillLevel === '') return 'unknown'
  const fill = Number(fillLevel)
  if (!Number.isFinite(fill)) return 'unknown'
  if (fill >= 91) return 'critical'
  if (fill >= 41) return 'warning'
  return 'normal'
}

export function getTruckState(status) {
  const value = String(status || '').trim().toLowerCase()
  if (['busy', 'active', 'on-route', 'en-route', 'in-progress'].includes(value)) return 'active'
  if (['available', 'idle'].includes(value)) return 'idle'
  return 'unavailable'
}

export function getTruckColor(truckId) {
  const text = String(truckId || '')
  let hash = 0
  for (let index = 0; index < text.length; index += 1) hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0
  return ROUTE_COLORS[(hash >>> 0) % ROUTE_COLORS.length]
}

export function createRoutePlans(bins, requests, trucks) {
  const priorityBins = bins
    .filter((bin) => Number(bin.fillLevel) >= 71 && isValidCoordinate(bin))
    .map((bin) => ({
      type: 'bin',
      id: getEntityId(bin, 'binId'),
      point: { lat: Number(bin.lat), lng: Number(bin.lng) },
      item: bin,
    }))

  const eligibleRequests = requests
    .filter((request) => ['pending', 'in-progress'].includes(String(request.status || '').toLowerCase())
      && isValidCoordinate(request))
    .sort((a, b) => (PRIORITY_ORDER[String(a.priority || '').toLowerCase()] ?? 99)
      - (PRIORITY_ORDER[String(b.priority || '').toLowerCase()] ?? 99))
    .map((request) => ({
      type: 'request',
      id: getEntityId(request, 'requestId'),
      point: { lat: Number(request.lat), lng: Number(request.lng) },
      item: request,
    }))

  const allStops = [...priorityBins, ...eligibleRequests]
  if (!trucks.length) return []

  // Preserve the existing planner: keep priority bins first, sort requests by priority,
  // then distribute the ordered stops into balanced slices across the fleet.
  const stopsPerTruck = Math.ceil(allStops.length / trucks.length)
  return trucks.map((truck, index) => ({
    truck,
    truckId: getEntityId(truck, 'truckId'),
    color: getTruckColor(truck.truckId || getEntityId(truck, 'truckId')),
    stops: allStops.slice(index * stopsPerTruck, (index + 1) * stopsPerTruck),
  }))
}
