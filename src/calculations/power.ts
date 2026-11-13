import type { SpacecraftComponent, PowerBudget, ScientificInstrument } from '@/types';
import { SOLAR_CONSTANT, DEFAULT_SOLAR_PANEL_EFFICIENCY, DEFAULT_SYSTEM_LOSSES, DEFAULT_BATTERY_DEPTH_OF_DISCHARGE } from '@/constants';

export function calculateSolarPanelArea(components: SpacecraftComponent[]): number {
  return components
    .filter(c => c.type === 'solar_panel')
    .reduce((sum, c) => sum + (c.dimensions.width * c.dimensions.height), 0);
}

export function calculateGeneratedPower(
  area: number,
  irradiance: number = SOLAR_CONSTANT,
  efficiency: number = DEFAULT_SOLAR_PANEL_EFFICIENCY,
  losses: number = DEFAULT_SYSTEM_LOSSES
): number {
  return area * irradiance * efficiency * (1 - losses);
}

export function calculateEclipsePower(
  generatedPower: number,
  eclipseFraction: number,
  batteryCapacity: number,
  dod: number = DEFAULT_BATTERY_DEPTH_OF_DISCHARGE
): number {
  const usableBattery = batteryCapacity * dod;
  const eclipsePower = generatedPower * eclipseFraction;
  return Math.min(eclipsePower, usableBattery / (eclipseFraction * 3600));
}

export function calculatePowerBudget(
  components: SpacecraftComponent[],
  instruments: ScientificInstrument[],
  orbitalParams: { altitude: number; inclination: number; eccentricity: number },
  batteryCapacity: number = 100
): PowerBudget {
  const solarPanelArea = calculateSolarPanelArea(components);
  const generatedPower = calculateGeneratedPower(solarPanelArea);

  const payloadPower = instruments.reduce((sum, inst) => sum + inst.powerConsumption, 0);

  const busPower = components
    .filter(c => c.type !== 'solar_panel' && c.type !== 'instrument' && c.type !== 'sensor')
    .reduce((sum, c) => sum + c.powerConsumption, 0);

  const communicationPower = components
    .filter(c => c.type === 'antenna' || c.type === 'communication_dish')
    .reduce((sum, c) => sum + c.powerConsumption, 0);

  const thermalPower = components
    .filter(c => c.type === 'thermal_control')
    .reduce((sum, c) => sum + c.powerConsumption, 0);

  const totalConsumption = payloadPower + busPower + communicationPower + thermalPower;
  const powerMargin = generatedPower - totalConsumption;
  const powerMarginPercent = generatedPower > 0 ? (powerMargin / generatedPower) * 100 : 0;

  const orbitalRadius = 6371000 + orbitalParams.altitude;
  const beta = Math.asin(6371000 / orbitalRadius);
  const eclipseFraction = (2 * beta) / (2 * Math.PI);
  const period = 2 * Math.PI * Math.sqrt(Math.pow(orbitalRadius, 3) / 3.986004418e14);
  const eclipseDuration = period * eclipseFraction;

  return {
    solarPanelArea,
    solarIrradiance: SOLAR_CONSTANT,
    panelEfficiency: DEFAULT_SOLAR_PANEL_EFFICIENCY,
    systemLosses: DEFAULT_SYSTEM_LOSSES,
    generatedPower,
    payloadPower,
    busPower,
    communicationPower,
    thermalPower,
    totalConsumption,
    batteryCapacity,
    eclipseDuration,
    powerMargin,
    powerMarginPercent,
  };
}

export function checkPowerConstraint(budget: PowerBudget, minMargin: number = 0.2): { passed: boolean; margin: number; percent: number } {
  return {
    passed: budget.powerMarginPercent >= minMargin * 100,
    margin: budget.powerMargin,
    percent: budget.powerMarginPercent,
  };
}

export function formatPower(watts: number): string {
  if (watts < 1) return `${(watts * 1000).toFixed(1)} mW`;
  if (watts < 1000) return `${watts.toFixed(1)} W`;
  if (watts < 1000000) return `${(watts / 1000).toFixed(1)} kW`;
  return `${(watts / 1000000).toFixed(2)} MW`;
}

export function formatEnergy(joules: number): string {
  if (joules < 1000) return `${joules.toFixed(1)} J`;
  if (joules < 3600000) return `${(joules / 1000).toFixed(1)} kJ`;
  const wh = joules / 3600;
  if (wh < 1000) return `${wh.toFixed(1)} Wh`;
  return `${(wh / 1000).toFixed(2)} kWh`;
}