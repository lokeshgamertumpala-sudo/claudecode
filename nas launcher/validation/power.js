const SOLAR_CONSTANT = 1361;
const EARTH_ALBEDO = 0.3;
const EARTH_IR = 237;
const SOLAR_CELL_EFFICIENCY = 0.28;
const BATTERY_DOD = 0.8;
const BATTERY_EFFICIENCY = 0.9;

export async function validatePower(satellite) {
  const power = satellite.power || {};
  const orbit = satellite.orbit || {};
  const bus = satellite.bus || {};
  const payload = satellite.payload || {};

  const solarArea = power.solar_array_area_m2 || 0.04;
  const batteryCapacity = power.battery_capacity_wh || 20;
  const orbitAvgPower = power.orbit_avg_power_w || 5;
  const altitude = orbit.altitude_km || 500;
  const inclination = orbit.inclination_deg || 97.4;
  const payloadPower = payload.power_w || 2;
  const busPower = 3;

  const warnings = [];
  const errors = [];

  const eclipseFraction = calculateEclipseFraction(altitude, inclination);
  const sunFraction = 1 - eclipseFraction;

  const generatedPower = solarArea * SOLAR_CONSTANT * SOLAR_CELL_EFFICIENCY * sunFraction;
  const totalLoad = busPower + payloadPower;
  const avgLoad = orbitAvgPower || totalLoad;

  const energyGeneratedOrbit = generatedPower * (1 - eclipseFraction) * 90 / 60;
  const energyConsumedOrbit = avgLoad * 90 / 60;
  const energyDeficit = energyConsumedOrbit - energyGeneratedOrbit;

  const requiredBattery = Math.max(0, energyDeficit / BATTERY_EFFICIENCY / BATTERY_DOD);
  const availableBattery = batteryCapacity * BATTERY_DOD * BATTERY_EFFICIENCY;

  if (generatedPower < totalLoad * 1.2) {
    warnings.push(`Solar array may be undersized: ${generatedPower.toFixed(1)}W generated vs ${totalLoad}W load (1.2x margin recommended)`);
  }

  if (energyDeficit > 0) {
    if (availableBattery < energyDeficit) {
      errors.push(`Battery capacity insufficient: need ${requiredBattery.toFixed(1)}Wh for eclipse, have ${availableBattery.toFixed(1)}Wh usable`);
    } else {
      warnings.push(`Battery will cycle ${(energyDeficit / availableBattery * 100).toFixed(0)}% each orbit`);
    }
  }

  if (batteryCapacity < 10) {
    warnings.push('Battery capacity < 10 Wh: very limited eclipse operation');
  }

  const solarFluxOrbit = SOLAR_CONSTANT * (1 - EARTH_ALBEDO * 0.5) * Math.pow(6371 / (6371 + altitude), 2);
  const arrayTemp = estimateArrayTemperature(solarFluxOrbit, solarArea);
  if (arrayTemp > 100) {
    warnings.push(`Solar array temperature may exceed 100°C: ${arrayTemp.toFixed(0)}°C`);
  }

  return {
    passed: errors.length === 0,
    power_budget: {
      solar_array_area_m2: solarArea,
      generated_power_w: generatedPower.toFixed(1),
      total_load_w: totalLoad,
      avg_load_w: avgLoad,
      eclipse_fraction: eclipseFraction.toFixed(3),
      sun_fraction: sunFraction.toFixed(3),
      energy_per_orbit_wh: {
        generated: energyGeneratedOrbit.toFixed(1),
        consumed: energyConsumedOrbit.toFixed(1),
        deficit: energyDeficit.toFixed(1)
      },
      battery: {
        capacity_wh: batteryCapacity,
        usable_wh: availableBattery.toFixed(1),
        required_wh: requiredBattery.toFixed(1),
        depth_of_discharge_pct: (energyDeficit / availableBattery * 100).toFixed(1)
      },
      solar_array_temp_c: arrayTemp.toFixed(1)
    },
    warnings,
    errors
  };
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

function estimateArrayTemperature(solarFlux, area) {
  const emissivity = 0.85;
  const absorptivity = 0.9;
  const stefanBoltzmann = 5.67e-8;
  const tempK = Math.pow((absorptivity * solarFlux) / (emissivity * stefanBoltzmann), 0.25);
  return tempK - 273.15;
}