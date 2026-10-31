import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateRoutePreview } from './routeDataService'

afterEach(() => vi.unstubAllGlobals())

describe('backend route optimization preview API', () => {
  it('sends an authenticated preview-only request and returns the backend response', async () => {
    const payload = { runId: 'run-1', previewStatus: 'ready', routes: [] }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload })
    vi.stubGlobal('fetch', fetchMock)

    await expect(generateRoutePreview({ token: 'jwt-token' })).resolves.toEqual(payload)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toContain('/api/routes/optimize-preview')
    expect(options.method).toBe('POST')
    expect(options.headers.Authorization).toBe('Bearer jwt-token')
    expect(options.body).toBe('{}')
  })

  it('surfaces the protected backend preview error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ message: 'Road routing is unavailable.' }) }))
    await expect(generateRoutePreview({ token: 'jwt-token' })).rejects.toThrow('Road routing is unavailable.')
  })
})
