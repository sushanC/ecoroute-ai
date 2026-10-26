import { describe, expect, it } from 'vitest'
import { createRoutePlans, getBinSeverity, getTruckColor, getTruckState } from './routePlanning'

describe('route planning data helpers', () => {
  it('classifies bins using the backend fill thresholds', () => {
    expect(getBinSeverity(0)).toBe('normal')
    expect(getBinSeverity(40)).toBe('normal')
    expect(getBinSeverity(41)).toBe('warning')
    expect(getBinSeverity(71)).toBe('warning')
    expect(getBinSeverity(91)).toBe('critical')
    expect(getBinSeverity(null)).toBe('unknown')
  })

  it('maps the actual truck status vocabulary to active, idle, or unavailable', () => {
    expect(getTruckState('Busy')).toBe('active')
    expect(getTruckState('Available')).toBe('idle')
    expect(getTruckState('maintenance')).toBe('unavailable')
  })

  it('keeps priority bins first, orders open requests by priority, and balances stops across trucks', () => {
    const bins = [
      { _id: 'b-high', binId: 'B-1', fillLevel: 71, lat: 12.97, lng: 77.60 },
      { _id: 'b-low', binId: 'B-2', fillLevel: 70, lat: 12.98, lng: 77.61 },
    ]
    const requests = [
      { _id: 'r-medium', priority: 'Medium', status: 'pending', lat: 12.96, lng: 77.59 },
      { _id: 'r-high', priority: 'High', status: 'in-progress', lat: 12.95, lng: 77.58 },
      { _id: 'r-cancelled', priority: 'High', status: 'cancelled', lat: 12.94, lng: 77.57 },
    ]
    const trucks = [
      { _id: 't1', truckId: 'TRK-01', lat: 12.97, lng: 77.60 },
      { _id: 't2', truckId: 'TRK-02', lat: 12.98, lng: 77.61 },
    ]

    const plans = createRoutePlans(bins, requests, trucks)
    expect(plans).toHaveLength(2)
    expect(plans[0].stops.map(({ id }) => id)).toEqual(['b-high', 'r-high'])
    expect(plans[1].stops.map(({ id }) => id)).toEqual(['r-medium'])
    expect(plans[0].color).toBe(getTruckColor('TRK-01'))
  })

  it('skips records without valid coordinates', () => {
    const plans = createRoutePlans(
      [{ _id: 'bad-bin', fillLevel: 99, lat: 200, lng: 77 }],
      [{ _id: 'bad-request', status: 'pending', lat: 12.9, lng: null }],
      [{ truckId: 'TRK-01', lat: 12.97, lng: 77.6 }],
    )
    expect(plans[0].stops).toEqual([])
  })
})
