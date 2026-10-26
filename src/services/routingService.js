const DEFAULT_ROUTING_BASE_URL = 'https://router.project-osrm.org'
const MAX_CACHE_ENTRIES = 80
const routeCache = new Map()

export function isValidCoordinate(point) {
  if (point?.lat === null || point?.lat === undefined || point?.lat === '') return false
  if (point?.lng === null || point?.lng === undefined || point?.lng === '') return false
  const lat = Number(point?.lat)
  const lng = Number(point?.lng)
  return Number.isFinite(lat)
    && Number.isFinite(lng)
    && lat >= -90 && lat <= 90
    && lng >= -180 && lng <= 180
}

export function toLeafletPosition([longitude, latitude]) {
  return [Number(latitude), Number(longitude)]
}

function routeCacheKey(points) {
  return points.map(({ lat, lng }) => `${Number(lng)},${Number(lat)}`).join(';')
}

export async function getRoadRoute(points, { signal } = {}) {
  if (!Array.isArray(points) || points.length < 2 || points.some((point) => !isValidCoordinate(point))) {
    throw new Error('A road route needs at least two valid coordinates.')
  }

  const key = routeCacheKey(points)
  if (routeCache.has(key)) return routeCache.get(key)

  const baseUrl = (import.meta.env.VITE_ROUTING_BASE_URL || DEFAULT_ROUTING_BASE_URL).replace(/\/$/, '')
  const coordinatePath = points.map(({ lat, lng }) => `${Number(lng)},${Number(lat)}`).join(';')
  const url = `${baseUrl}/route/v1/driving/${coordinatePath}?overview=full&geometries=geojson&steps=false`
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error(`Routing service returned ${response.status}.`)

  const payload = await response.json()
  const route = payload?.code === 'Ok' ? payload.routes?.[0] : null
  const coordinates = route?.geometry?.coordinates
  if (
    !Array.isArray(coordinates)
    || coordinates.length < 2
    || !Number.isFinite(Number(route.distance))
    || !Number.isFinite(Number(route.duration))
  ) {
    throw new Error(payload?.message || 'No road route was returned for these stops.')
  }

  const result = {
    positions: coordinates
      .filter((coordinate) => Array.isArray(coordinate) && coordinate.length >= 2
        && Number.isFinite(Number(coordinate[0])) && Number.isFinite(Number(coordinate[1])))
      .map(toLeafletPosition),
    distanceMeters: Number(route.distance),
    durationSeconds: Number(route.duration),
  }
  if (result.positions.length < 2) throw new Error('The routing service returned invalid road geometry.')

  routeCache.set(key, result)
  if (routeCache.size > MAX_CACHE_ENTRIES) routeCache.delete(routeCache.keys().next().value)
  return result
}
