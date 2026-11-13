import { describe, it, expect } from 'vitest'
import {
  G0,
  MU_EARTH,
  MU_MARS,
  MU_MOON,
  MU_JUPITER,
  AU,
  calculateDeltaV,
  calculateMassRatio,
  calculatePropellantMass,
  calculateBurnTime,
  calculateTWR,
  hohmannTransfer,
  calculateOrbitalPeriod,
  calculateOrbitalVelocity,
  calculateTransferTime,
  calculateMaxPayloadFraction,
  calculateEscapeVelocity,
  calculateSphereOfInfluence,
  formatNumber,
  formatDuration,
} from './calculations'

describe('constants', () => {
  it('exports physically correct values', () => {
    expect(G0).toBe(9.80665)
    expect(MU_EARTH).toBe(398600.4418)
    expect(MU_MARS).toBe(42828.37)
    expect(MU_MOON).toBe(4902.8)
    expect(MU_JUPITER).toBe(126686531)
    expect(AU).toBe(149597870.7)
  })
})

describe('calculateDeltaV', () => {
  it('applies the Tsiolkovsky rocket equation', () => {
    // isp=320s, massRatio=e -> deltaV = 320 * 9.80665 * 1
    expect(calculateDeltaV(320, Math.E)).toBeCloseTo(320 * G0, 6)
  })

  it('returns 0 when massRatio is 1 (no propellant expended)', () => {
    expect(calculateDeltaV(450, 1)).toBe(0)
  })

  it('grows with isp and mass ratio', () => {
    const a = calculateDeltaV(300, 5)
    const b = calculateDeltaV(400, 5)
    const c = calculateDeltaV(400, 10)
    expect(b).toBeGreaterThan(a)
    expect(c).toBeGreaterThan(b)
  })
})

describe('calculateMassRatio', () => {
  it('inverts calculateDeltaV exactly', () => {
    const deltaV = 9400
    const isp = 320
    const massRatio = calculateMassRatio(deltaV, isp)
    expect(calculateDeltaV(isp, massRatio)).toBeCloseTo(deltaV, 6)
  })

  it('returns 1 for zero deltaV', () => {
    expect(calculateMassRatio(0, 300)).toBe(1)
  })
})

describe('calculatePropellantMass', () => {
  it('computes propellant required for a target deltaV', () => {
    // dryMass=1000, deltaV=1000, isp=320
    // massRatio = exp(1000/(320*9.80665)) ≈ 1.4170
    const expected = 1000 * (Math.exp(1000 / (320 * G0)) - 1)
    expect(calculatePropellantMass(1000, 1000, 320)).toBeCloseTo(expected, 6)
  })

  it('returns 0 for zero deltaV', () => {
    expect(calculatePropellantMass(1000, 0, 320)).toBe(0)
  })
})

describe('calculateBurnTime', () => {
  it('computes propellant consumption time', () => {
    // propMass=1000 kg, isp=300 s, thrust=300 kN
    expect(calculateBurnTime(1000, 300, 300 * 1000)).toBeCloseTo((1000 * 300 * G0) / (300 * 1000), 6)
  })

  it('halves when thrust doubles', () => {
    const t1 = calculateBurnTime(1000, 320, 200 * 1000)
    const t2 = calculateBurnTime(1000, 320, 400 * 1000)
    expect(t1 / t2).toBeCloseTo(2, 6)
  })
})

describe('calculateTWR', () => {
  it('computes thrust-to-weight ratio', () => {
    // thrust=98.0665 N, mass=10 kg -> 1.0
    expect(calculateTWR(10 * G0, 10)).toBeCloseTo(1, 6)
  })

  it('is below 1 for insufficient thrust', () => {
    expect(calculateTWR(100, 1000)).toBeLessThan(1)
  })
})

describe('hohmannTransfer', () => {
  it('computes LEO to GEO transfer correctly', () => {
    const r1 = 6571 // km (200 km altitude)
    const r2 = 42164 // km (GEO)
    const t = hohmannTransfer(r1, r2, MU_EARTH)

    // Known values: deltaV1 ≈ 2.442 km/s, deltaV2 ≈ 1.201 km/s
    expect(t.deltaV1 / 1000).toBeCloseTo(2.442, 2)
    expect(t.deltaV2 / 1000).toBeCloseTo(1.201, 2)
    expect(t.totalDeltaV / 1000).toBeCloseTo(3.643, 2)
  })

  it('returns negative deltaV2 for deorbit (r2 < r1)', () => {
    const t = hohmannTransfer(42164, 6571, MU_EARTH)
    expect(t.deltaV1).toBeLessThan(0)
    expect(t.deltaV2).toBeLessThan(0)
  })

  it('throws or returns NaN for identical radii', () => {
    const t = hohmannTransfer(6571, 6571, MU_EARTH)
    // Both impulses zero for identical radii
    expect(t.deltaV1).toBeCloseTo(0, 6)
    expect(t.deltaV2).toBeCloseTo(0, 6)
  })

  it('computes transfer time of half the target orbital period', () => {
    const r1 = 6571
    const r2 = 42164
    const t = hohmannTransfer(r1, r2, MU_EARTH)
    const a = (r1 + r2) / 2
    const expectedTime = Math.PI * Math.sqrt(Math.pow(a, 3) / MU_EARTH)
    expect(t.transferTime).toBeCloseTo(expectedTime, 6)
  })

  it('uses Mars mu when provided', () => {
    const t = hohmannTransfer(3797, 3797, MU_MARS)
    expect(t.deltaV1).toBeCloseTo(0, 6)
  })
})

describe('calculateOrbitalPeriod', () => {
  it('LEO (~600 km) period is ~96.5 minutes', () => {
    const r = 6371 + 600
    const period = calculateOrbitalPeriod(r, MU_EARTH)
    expect(period).toBeGreaterThan(5700)
    expect(period).toBeLessThan(5900)
  })

  it('period increases with radius', () => {
    const p1 = calculateOrbitalPeriod(6571, MU_EARTH)
    const p2 = calculateOrbitalPeriod(42164, MU_EARTH)
    expect(p2).toBeGreaterThan(p1)
  })
})

describe('calculateOrbitalVelocity', () => {
  it('LEO circular velocity ≈ 7.55 km/s', () => {
    const v = calculateOrbitalVelocity(6571, MU_EARTH)
    expect(v).toBeCloseTo(7.55, 1)
  })
})

describe('calculateTransferTime', () => {
  it('returns a positive value for a Hohmann transfer', () => {
    const t = calculateTransferTime(6571, 42164, MU_EARTH)
    expect(t).toBeGreaterThan(0)
  })
})

describe('calculateMaxPayloadFraction', () => {
  it('higher structural coefficient reduces payload fraction', () => {
    const good = calculateMaxPayloadFraction(10, 0.1)
    const bad = calculateMaxPayloadFraction(10, 0.3)
    expect(good).toBeGreaterThan(bad)
    expect(good).toBeLessThanOrEqual(1)
  })
})

describe('calculateEscapeVelocity', () => {
  it('Earth surface escape velocity ≈ 11.18 km/s', () => {
    const v = calculateEscapeVelocity(6371, MU_EARTH)
    expect(v).toBeCloseTo(11.18, 1)
  })
})

describe('calculateSphereOfInfluence', () => {
  it('returns a positive radius', () => {
    expect(calculateSphereOfInfluence(6371, MU_EARTH, 1.32712440018e11)).toBeGreaterThan(0)
  })
})

describe('formatNumber', () => {
  it('formats billions', () => {
    expect(formatNumber(1.5e9)).toBe('1.50B')
  })

  it('formats millions', () => {
    expect(formatNumber(2.5e6)).toBe('2.50M')
  })

  it('formats thousands', () => {
    expect(formatNumber(3500)).toBe('3.50K')
  })

  it('formats small numbers with decimals', () => {
    expect(formatNumber(3.14159, 4)).toBe('3.1416')
  })
})

describe('formatDuration', () => {
  it('formats seconds', () => {
    expect(formatDuration(45.6)).toBe('46s')
  })

  it('formats minutes', () => {
    expect(formatDuration(120)).toBe('2.0m')
  })

  it('formats hours', () => {
    expect(formatDuration(7200)).toBe('2.0h')
  })

  it('formats days', () => {
    expect(formatDuration(86400 * 2)).toBe('2.0d')
  })
})