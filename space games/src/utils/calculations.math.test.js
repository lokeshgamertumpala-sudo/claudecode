import { describe, it, expect } from 'vitest'
import {
  calculateDeltaV,
  calculateMassRatio,
  calculatePropellantMass,
  calculateBurnTime,
  calculateTWR,
  hohmannTransfer,
  biEllipticTransfer,
  calculateOrbitalPeriod,
  calculateOrbitalVelocity,
  calculateCircularVelocity,
  calculateEscapeVelocity,
  calculateTransferTime,
  calculateMaxPayloadFraction,
  calculateSphereOfInfluence,
  calculateLaunchC3,
  calculateArrivalVinf,
  calculateRadiationDose,
  calculateThermalLoad,
  calculateCommRange,
  formatNumber as calcFormatNumber,
  formatDuration,
  G0,
  MU_EARTH,
  MU_MARS,
  MU_MOON,
  MU_JUPITER,
  AU,
} from './src/utils/calculations'

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
    expect(calculateDeltaV(320, Math.E)).toBeCloseTo(320 * G0, 6)
  })

  it('returns 0 when massRatio is 1', () => {
    expect(calculateDeltaV(450, 1)).toBe(0)
  })

  it('grows with isp and mass ratio', () => {
    expect(calculateDeltaV(400, 5)).toBeGreaterThan(calculateDeltaV(300, 5))
    expect(calculateDeltaV(400, 10)).toBeGreaterThan(calculateDeltaV(400, 5))
  })
})

describe('calculateMassRatio', () => {
  it('inverts calculateDeltaV exactly', () => {
    const deltaV = 9400
    const isp = 320
    expect(calculateDeltaV(isp, calculateMassRatio(deltaV, isp))).toBeCloseTo(deltaV, 6)
  })

  it('returns 1 for zero deltaV', () => {
    expect(calculateMassRatio(0, 300)).toBe(1)
  })
})

describe('calculatePropellantMass', () => {
  it('computes propellant required for a target deltaV', () => {
    const expected = 1000 * (Math.exp(1000 / (320 * G0)) - 1)
    expect(calculatePropellantMass(1000, 1000, 320)).toBeCloseTo(expected, 6)
  })

  it('returns 0 for zero deltaV', () => {
    expect(calculatePropellantMass(1000, 0, 320)).toBe(0)
  })
})

describe('calculateBurnTime', () => {
  it('computes propellant consumption time', () => {
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
    expect(calculateTWR(10 * G0, 10)).toBeCloseTo(1, 6)
  })

  it('is below 1 for insufficient thrust', () => {
    expect(calculateTWR(100, 1000)).toBeLessThan(1)
  })
})

describe('hohmannTransfer', () => {
  it('computes LEO to GEO transfer correctly', () => {
    const t = hohmannTransfer(6571, 42164, MU_EARTH)
    expect(t.deltaV1 / 1000).toBeCloseTo(2.442, 2)
    expect(t.deltaV2 / 1000).toBeCloseTo(1.201, 2)
    expect(t.totalDeltaV / 1000).toBeCloseTo(3.643, 2)
  })

  it('returns negative impulses for deorbit (r2 < r1)', () => {
    const t = hohmannTransfer(42164, 6571, MU_EARTH)
    expect(t.deltaV1).toBeLessThan(0)
    expect(t.deltaV2).toBeLessThan(0)
  })

  it('returns zero impulses for identical radii', () => {
    const t = hohmannTransfer(6571, 6571, MU_EARTH)
    expect(t.deltaV1).toBeCloseTo(0, 6)
    expect(t.deltaV2).toBeCloseTo(0, 6)
  })

  it('computes transfer time of half the elliptical orbit period', () => {
    const r1 = 6571
    const r2 = 42164
    const t = hohmannTransfer(r1, r2, MU_EARTH)
    const a = (r1 + r2) / 2
    expect(t.transferTime).toBeCloseTo(Math.PI * Math.sqrt(Math.pow(a, 3) / MU_EARTH), 6)
  })
})

describe('biEllipticTransfer', () => {
  it('returns three impulses and a total', () => {
    const t = biEllipticTransfer(6571, 400000, 600000, MU_EARTH)
    expect(t).toHaveProperty('deltaV1')
    expect(t).toHaveProperty('deltaV2')
    expect(t).toHaveProperty('deltaV3')
    expect(t.totalDeltaV).toBeGreaterThan(0)
  })

  it('saves delta-V over Hohmann for very large radius ratios', () => {
    const h = hohmannTransfer(6571, 500000, MU_EARTH)
    const b = biEllipticTransfer(6571, 500000, 900000, MU_EARTH)
    expect(b.totalDeltaV).toBeLessThan(h.totalDeltaV)
  })
})

describe('orbital element helpers', () => {
  it('LEO period is ~96.5 minutes', () => {
    const period = calculateOrbitalPeriod(6371 + 600, MU_EARTH)
    expect(period).toBeGreaterThan(5700)
    expect(period).toBeLessThan(5900)
  })

  it('period increases with semi-major axis', () => {
    expect(calculateOrbitalPeriod(42164, MU_EARTH)).toBeGreaterThan(calculateOrbitalPeriod(6571, MU_EARTH))
  })

  it('LEO circular velocity ~7.55 km/s', () => {
    expect(calculateOrbitalVelocity(6571, MU_EARTH)).toBeCloseTo(7.55, 1)
  })

  it('escape velocity is sqrt(2)x circular velocity', () => {
    const c = calculateCircularVelocity(6571, MU_EARTH)
    const e = calculateEscapeVelocity(6571, MU_EARTH)
    expect(e / c).toBeCloseTo(Math.SQRT2, 6)
  })

  it('Earth surface escape velocity ~11.18 km/s', () => {
    expect(calculateEscapeVelocity(6371, MU_EARTH)).toBeCloseTo(11.18, 1)
  })

  it('transfer time is half the period of the transfer ellipse', () => {
    const expected = Math.PI * Math.sqrt(Math.pow((6571 + 42164) / 2, 3) / MU_EARTH)
    expect(calculateTransferTime(6571, 42164, MU_EARTH)).toBeCloseTo(expected, 6)
  })

  it('max payload fraction decreases as structural coefficient rises', () => {
    expect(calculateMaxPayloadFraction(10, 0.1)).toBeGreaterThan(calculateMaxPayloadFraction(10, 0.3))
    expect(calculateMaxPayloadFraction(10, 0.1)).toBeLessThanOrEqual(1)
  })

  it('SOI scales with the 2/5 power of the mu ratio', () => {
    const expected = 6371 * Math.pow(MU_EARTH / 1.32712440018e11, 2 / 5)
    expect(calculateSphereOfInfluence(6371, MU_EARTH, 1.32712440018e11)).toBeCloseTo(expected, 6)
  })
})

describe('interplanetary helpers', () => {
  it('C3 is the square of hyperbolic excess velocity', () => {
    expect(calculateLaunchC3(3)).toBe(9)
  })

  it('arrival v-inf is 0 for identical velocities at 0 angle', () => {
    expect(calculateArrivalVinf(10, 10, 0)).toBeCloseTo(0, 6)
  })

  it('arrival v-inf is the sum for opposing velocities', () => {
    expect(calculateArrivalVinf(10, 5, Math.PI)).toBeCloseTo(15, 6)
  })
})

describe('environment models', () => {
  it('radiation dose is higher at Jupiter and lower with shielding', () => {
    const heavy = calculateRadiationDose(10, 'jupiter', 365)
    const light = calculateRadiationDose(2, 'jupiter', 365)
    expect(heavy).toBeLessThan(light)
    expect(calculateRadiationDose(10, 'earth', 365)).toBeLessThan(light)
  })

  it('thermal load grows with power', () => {
    const low = calculateThermalLoad(100, 0.8, 2, 1361)
    const high = calculateThermalLoad(500, 0.8, 2, 1361)
    expect(high).toBeGreaterThan(low)
  })

  it('comm range is 0 when the link budget is negative', () => {
    expect(calculateCommRange(1, 1, 1, 1e9, 1e9, 100)).toBe(0)
  })

  it('comm range is positive with adequate margin', () => {
    expect(calculateCommRange(100, 40, 40, 8.4e9, 1000)).toBeGreaterThan(0)
  })
})

describe('formatNumber (calculations)', () => {
  it('formats billions, millions, thousands and small numbers', () => {
    expect(calcFormatNumber(1.5e9)).toBe('1.50B')
    expect(calcFormatNumber(2.5e6)).toBe('2.50M')
    expect(calcFormatNumber(3500)).toBe('3.50K')
    expect(calcFormatNumber(3.14159, 4)).toBe('3.1416')
  })
})

describe('formatDuration', () => {
  it('formats s/m/h/d units', () => {
    expect(formatDuration(45.6)).toBe('46s')
    expect(formatDuration(120)).toBe('2.0m')
    expect(formatDuration(7200)).toBe('2.0h')
    expect(formatDuration(86400 * 2)).toBe('2.0d')
  })
})
