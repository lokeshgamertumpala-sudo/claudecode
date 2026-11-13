export const G0 = 9.80665
export const MU_EARTH = 398600.4418
export const MU_MARS = 42828.37
export const MU_MOON = 4902.8
export const MU_JUPITER = 126686531
export const AU = 149597870.7

export function calculateDeltaV(isp, massRatio) {
  return isp * G0 * Math.log(massRatio)
}

export function calculateMassRatio(deltaV, isp) {
  return Math.exp(deltaV / (isp * G0))
}

export function calculatePropellantMass(dryMass, deltaV, isp) {
  const massRatio = calculateMassRatio(deltaV, isp)
  return dryMass * (massRatio - 1)
}

export function calculateBurnTime(propellantMass, isp, thrust) {
  return (propellantMass * isp * G0) / thrust
}

export function calculateTWR(thrust, mass) {
  return thrust / (mass * G0)
}

export function hohmannTransfer(r1, r2, mu = MU_EARTH) {
  const a = (r1 + r2) / 2
  const v1 = Math.sqrt(mu / r1)
  const v2 = Math.sqrt(mu / r2)
  const v_peri = Math.sqrt(mu * (2 / r1 - 1 / a))
  const v_apo = Math.sqrt(mu * (2 / r2 - 1 / a))

  return {
    deltaV1: v_peri - v1,
    deltaV2: v2 - v_apo,
    totalDeltaV: Math.abs(v_peri - v1) + Math.abs(v2 - v_apo),
    transferTime: Math.PI * Math.sqrt(a ** 3 / mu),
  }
}

export function biEllipticTransfer(r1, r2, rb, mu = MU_EARTH) {
  const a1 = (r1 + rb) / 2
  const a2 = (r2 + rb) / 2
  const v1 = Math.sqrt(mu / r1)
  const v2 = Math.sqrt(mu / r2)

  const v_peri1 = Math.sqrt(mu * (2 / r1 - 1 / a1))
  const v_apo1 = Math.sqrt(mu * (2 / rb - 1 / a1))
  const v_peri2 = Math.sqrt(mu * (2 / rb - 1 / a2))
  const v_apo2 = Math.sqrt(mu * (2 / r2 - 1 / a2))

  return {
    deltaV1: v_peri1 - v1,
    deltaV2: v_apo1 - v_peri2,
    deltaV3: v2 - v_apo2,
    totalDeltaV: Math.abs(v_peri1 - v1) + Math.abs(v_apo1 - v_peri2) + Math.abs(v2 - v_apo2),
    transferTime: Math.PI * (Math.sqrt(a1 ** 3 / mu) + Math.sqrt(a2 ** 3 / mu)),
  }
}

export function calculateLaunchC3(v_inf) {
  return v_inf ** 2
}

export function calculateArrivalVinf(v_spacecraft, v_planet, angle = 0) {
  return Math.sqrt(v_spacecraft ** 2 + v_planet ** 2 - 2 * v_spacecraft * v_planet * Math.cos(angle))
}

export function porkchopPlot(departureBody, arrivalBody, departureDate, arrivalDate) {
  return { departureDate, arrivalDate, c3: 0, vinf: 0 }
}

export function calculateRadiationDose(shielding, environment, time) {
  const baseDose = environment === 'jupiter' ? 5000 : environment === 'earth' ? 10 : 1
  const attenuation = Math.exp(-shielding / 10)
  return baseDose * attenuation * (time / 365)
}

export function calculateThermalLoad(power, emissivity, area, solarFlux, albedo = 0.3) {
  const absorbed = solarFlux * area * (1 - albedo) * 0.25
  const emitted = 5.67e-8 * emissivity * area
  return absorbed + power - emitted
}

export function calculateCommRange(txPower, txGain, rxGain, frequency, dataRate, snr = 10) {
  const wavelength = 3e8 / frequency
  const fspl = 20 * Math.log10(4 * Math.PI / wavelength)
  const margin = txPower + txGain + rxGain - fspl - 10 * Math.log10(dataRate) - snr
  return margin > 0 ? Math.pow(10, margin / 20) : 0
}

export function calculateOrbitalPeriod(semiMajorAxis, mu = MU_EARTH) {
  return 2 * Math.PI * Math.sqrt(semiMajorAxis ** 3 / mu)
}

export function calculateEscapeVelocity(radius, mu = MU_EARTH) {
  return Math.sqrt(2 * mu / radius)
}

export function calculateCircularVelocity(radius, mu = MU_EARTH) {
  return Math.sqrt(mu / radius)
}

export function calculateSphereOfInfluence(radius, mu_planet, mu_sun) {
  return radius * Math.pow(mu_planet / mu_sun, 2 / 5)
}

export function formatNumber(num, decimals = 2) {
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B'
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M'
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K'
  return num.toFixed(decimals)
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(0)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`
  return `${(seconds / 86400).toFixed(1)}d`
}