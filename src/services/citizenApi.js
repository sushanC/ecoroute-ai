const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Could not complete the request.')
  return data
}

export const getRequests = (token) => request('/api/requests', token)
export const getCurrentUser = (token) => request('/api/auth/me', token).then((data) => data.user || data)
export const getRequest = (token, id) => request(`/api/requests/${encodeURIComponent(id)}`, token)
export const createRequest = (token, payload) => request('/api/requests', token, {
  method: 'POST',
  body: JSON.stringify(payload),
})
export const cancelRequest = (token, id) => request(`/api/requests/${encodeURIComponent(id)}`, token, {
  method: 'PUT',
  body: JSON.stringify({ status: 'cancelled' }),
})
export const getRewardHistory = (token, userId) => request(`/api/rewards/history/${encodeURIComponent(userId)}`, token)

