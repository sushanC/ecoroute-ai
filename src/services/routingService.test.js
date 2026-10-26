import { afterEach, describe, expect, it, vi } from 'vitest'
import { getRoadRoute, isValidCoordinate, toLeafletPosition } from './routingService'

afterEach(() => vi.unstubAllGlobals())

describe('road routing service', () => {
  it('validates coordinates and converts GeoJSON longitude-latitude order for Leaflet', () => {
    expect(isValidCoordinate({ lat: 12.97, lng: 77.6 })).toBe(true)
    expect(isValidCoordinate({ lat: 91, lng: 77.6 })).toBe(false)
    expect(isValidCoordinate({ lat: 12.97, lng: undefined })).toBe(false)
    expect(toLeafletPosition([77.6, 12.97])).toEqual([12.97, 77.6])
  })

  it('returns OSRM road geometry, distance and duration and caches successful responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 'Ok',
        routes: [{
          distance: 1834.5,
          duration: 512,
          geometry: { coordinates: [[77.6011, 12.9711], [77.6022, 12.9722]] },
        }],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const points = [{ lat: 12.9711, lng: 77.6011 }, { lat: 12.9722, lng: 77.6022 }]

    const first = await getRoadRoute(points)
    const second = await getRoadRoute(points)

    expect(first).toEqual({
      positions: [[12.9711, 77.6011], [12.9722, 77.6022]],
      distanceMeters: 1834.5,
      durationSeconds: 512,
    })
    expect(second).toEqual(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toContain('/route/v1/driving/77.6011,12.9711;77.6022,12.9722')
  })

  it('fails clearly when the provider returns no road route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 'NoRoute', message: 'No route found' }),
    }))
    await expect(getRoadRoute([
      { lat: 11.1, lng: 78.1 }, { lat: 11.2, lng: 78.2 },
    ])).rejects.toThrow('No route found')
  })
})
