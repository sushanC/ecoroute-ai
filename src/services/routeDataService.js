const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function fetchCollection(path, { token, signal } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await fetch(`${API_BASE_URL}/api/${path}`, { headers, signal })

  if (!response.ok) {
    throw new Error(`Unable to load ${path}. The server returned ${response.status}.`)
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error(`The ${path} endpoint returned an unexpected response.`)
  }
  return data
}

export async function fetchRouteData({ token, signal } = {}) {
  const [bins, requests, trucks] = await Promise.all([
    fetchCollection('bins', { token, signal }),
    fetchCollection('requests', { token, signal }),
    fetchCollection('trucks', { token, signal }),
  ])

  return { bins, requests, trucks }
}

export async function generateRoutePreview({ token, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/api/routes/optimize-preview`, {
    method: 'POST',
    signal,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || `Unable to generate route preview (${response.status}).`)
  return data
}
