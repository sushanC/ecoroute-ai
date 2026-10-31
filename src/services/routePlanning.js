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
