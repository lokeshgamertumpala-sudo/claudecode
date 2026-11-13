const EARTH_RADIUS_KM = 6371;
const EARTH_MU = 398600.4418;
const J2 = 0.00108263;

export async function validateOrbital(satellite) {
  const orbit = satellite.orbit || {};
  const altitude = orbit.altitude_km || 500;
  const inclination = orbit.inclination_deg || 97.4;
  const eccentricity = orbit.eccentricity || 0.001;
  const bus = satellite.bus || {};
  const mass = bus.mass_kg || 4;

  const warnings = [];
  const errors = [];

  if (altitude < 160) {
    errors.push('Altitude below 160 km: rapid orbital decay, satellite will re-enter within hours');
  } else if (altitude < 200) {
    warnings.push('Very low altitude (<200 km): short lifetime, high drag');
  } else if (altitude > 35786) {
    warnings.push('Altitude above GEO: consider if intentional');
  }

  if (inclination < 0 || inclination > 180) {
    errors.push('Inclination must be between 0 and 180 degrees');
  }

  if (eccentricity < 0 || eccentricity >= 1) {
    errors.push('Eccentricity must be between 0 and 1');
  } else if (eccentricity > 0.1) {
    warnings.push('High eccentricity orbit: thermal cycling and comms challenges');
  }

  const a = EARTH_RADIUS_KM + altitude;
  const period_min = 2 * Math.PI * Math.sqrt(a ** 3 / EARTH_MU) / 60;
  const velocity_kms = Math.sqrt(EARTH_MU / a);

  const raan_rate_deg_day = -1.5 * J2 * Math.pow(EARTH_RADIUS_KM / a, 2) * Math.cos(inclination * Math.PI / 180) * 1440;
  const arg_perigee_rate_deg_day = 0.75 * J2 * Math.pow(EARTH_RADIUS_KM / a, 2) * (5 * Math.cos(inclination * Math.PI / 180) ** 2 - 1) * 1440;

  const drag_accel = estimateDragAcceleration(altitude, mass, bus.dimensions_m || [0.1, 0.1, 0.3]);
  const lifetime_years = estimateOrbitalLifetime(altitude, drag_accel, mass);

  if (lifetime_years < 0.5) {
    errors.push(`Estimated orbital lifetime < 6 months (${lifetime_years.toFixed(2)} years)`);
  } else if (lifetime_years < 2) {
    warnings.push(`Short orbital lifetime: ~${lifetime_years.toFixed(1)} years`);
  }

  const eclipse_fraction = calculateEclipseFraction(altitude, inclination);
  const avg_sun_fraction = 1 - eclipse_fraction;

  return {
    passed: errors.length === 0,
    orbital_parameters: {
      semi_major_axis_km: a,
      period_min: period_min.toFixed(1),
      velocity_kms: velocity_kms.toFixed(2),
      raan_rate_deg_day: raan_rate_deg_day.toFixed(3),
      arg_perigee_rate_deg_day: arg_perigee_rate_deg_day.toFixed(3),
      eclipse_fraction: eclipse_fraction.toFixed(3),
      avg_sun_fraction: avg_sun_fraction.toFixed(3),
      estimated_lifetime_years: lifetime_years.toFixed(2)
    },
    warnings,
    errors
  };
}

function estimateDragAcceleration(altitude_km, mass_kg, dimensions_m) {
  const rho = atmosphericDensity(altitude_km);
  const cd = 2.2;
  const [x, y, z] = dimensions_m;
  const area = Math.max(x * y, y * z, z * x);
  const v = Math.sqrt(EARTH_MU / (EARTH_RADIUS_KM + altitude_km)) * 1000;
  return 0.5 * rho * cd * area * v * v / mass_kg;
}

function atmosphericDensity(altitude_km) {
  if (altitude_km < 200) return 2.5e-10 * Math.exp(-(altitude_km - 100) / 10);
  if (altitude_km < 300) return 2.5e-11 * Math.exp(-(altitude_km - 200) / 20);
  if (altitude_km < 400) return 3.9e-12 * Math.exp(-(altitude_km - 300) / 30);
  if (altitude_km < 500) return 1.1e-12 * Math.exp(-(altitude_km - 400) / 40);
  if (altitude_km < 600) return 3.3e-13 * Math.exp(-(altitude_km - 500) / 50);
  return 1e-13 * Math.exp(-(altitude_km - 600) / 60);
}

function estimateOrbitalLifetime(altitude_km, drag_accel, mass_kg) {
  if (altitude_km > 600) return 25;
  if (altitude_km > 500) return 10;
  if (altitude_km > 400) return 3;
  if (altitude_km > 300) return 0.5;
  return 0.05;
}

function calculateEclipseFraction(altitude_km, inclination_deg) {
  const EARTH_RADIUS_KM = 6371;
  const beta = Math.asin(Math.min(1, Math.max(-1, Math.sin(inclination_deg * Math.PI / 180) * Math.sin(23.44 * Math.PI / 180))));
  const rho = Math.asin(Math.min(1, Math.max(-1, EARTH_RADIUS_KM / (EARTH_RADIUS_KM + altitude_km))));
  const tanBeta = Math.tan(beta);
  const tanRho = Math.tan(rho);
  const arg = Math.min(1, Math.max(-1, tanBeta * tanRho));
  const eclipse_angle = Math.acos(arg);
  return isNaN(eclipse_angle) ? 0.35 : eclipse_angle / Math.PI;
}