import { describe, expect, it } from 'vitest'
import { getBinSeverity, getTruckColor, getTruckState } from './routePlanning'

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

  it('assigns stable presentation colors independently of route decisions', () => {
    expect(getTruckColor('TRK-01')).toBe(getTruckColor('TRK-01'))
  })
})
