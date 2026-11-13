import type { SpacecraftComponent, MassBudget } from '@/types';
import { COMPONENT_DEFAULTS, DEFAULT_STRUCTURAL_MASS_FRACTION, DEFAULT_THERMAL_MASS_FRACTION, DEFAULT_POWER_MASS_FRACTION } from '@/constants';

export function calculateComponentMass(component: SpacecraftComponent): number {
  const volume = component.dimensions.width * component.dimensions.height * component.dimensions.depth;
  const defaults = COMPONENT_DEFAULTS[component.type];
  const density = defaults?.density || 2700;
  return volume * density;
}

export function calculateTotalMass(components: SpacecraftComponent[]): number {
  return components.reduce((sum, comp) => sum + comp.mass, 0);
}

export function calculateMassBudget(components: SpacecraftComponent[], massLimit: number): MassBudget {
  const categoryMass: Record<string, number> = {
    main_body: 0,
    solar_panels: 0,
    instruments: 0,
    communications: 0,
    propulsion: 0,
    thermal: 0,
    power: 0,
    structure: 0,
    other: 0,
  };

  components.forEach(comp => {
    switch (comp.type) {
      case 'main_body':
        categoryMass.main_body += comp.mass;
        break;
      case 'solar_panel':
        categoryMass.solar_panels += comp.mass;
        break;
      case 'instrument':
      case 'sensor':
        categoryMass.instruments += comp.mass;
        break;
      case 'antenna':
      case 'communication_dish':
        categoryMass.communications += comp.mass;
        break;
      case 'propulsion':
        categoryMass.propulsion += comp.mass;
        break;
      case 'thermal_control':
        categoryMass.thermal += comp.mass;
        break;
      case 'battery':
        categoryMass.power += comp.mass;
        break;
      case 'structural_support':
      case 'reaction_wheel':
      case 'star_tracker':
        categoryMass.structure += comp.mass;
        break;
      default:
        categoryMass.other += comp.mass;
    }
  });

  const totalDryMass = Object.values(categoryMass).reduce((sum, m) => sum + m, 0);
  const structuralMass = totalDryMass * DEFAULT_STRUCTURAL_MASS_FRACTION;
  const thermalMass = totalDryMass * DEFAULT_THERMAL_MASS_FRACTION;
  const powerMass = totalDryMass * DEFAULT_POWER_MASS_FRACTION;

  const propellantMass = totalDryMass * 0.1;
  const totalWetMass = totalDryMass + structuralMass + thermalMass + powerMass + propellantMass;
  const margin = massLimit - totalWetMass;
  const marginPercent = massLimit > 0 ? (margin / massLimit) * 100 : 0;

  return {
    mainBody: categoryMass.main_body,
    solarPanels: categoryMass.solar_panels,
    instruments: categoryMass.instruments,
    communications: categoryMass.communications,
    propulsion: categoryMass.propulsion,
    thermal: categoryMass.thermal + thermalMass,
    power: categoryMass.power + powerMass,
    structure: categoryMass.structure + structuralMass,
    other: categoryMass.other,
    totalDryMass: totalDryMass + structuralMass + thermalMass + powerMass,
    propellantMass,
    totalWetMass,
    massLimit,
    margin,
    marginPercent,
  };
}

export function estimateComponentMass(type: string, dimensions: { width: number; height: number; depth: number }): number {
  const defaults = COMPONENT_DEFAULTS[type];
  const density = defaults?.density || 2700;
  const volume = dimensions.width * dimensions.height * dimensions.depth;
  return volume * density;
}

export function calculateRequiredSolarPanelArea(powerRequired: number, efficiency: number = 0.28, losses: number = 0.25, irradiance: number = 1361): number {
  const effectiveIrradiance = irradiance * (1 - losses);
  return powerRequired / (effectiveIrradiance * efficiency);
}

export function calculateSolarPanelMass(area: number, specificMass: number = 2.5): number {
  return area * specificMass;
}

export function formatMass(kg: number): string {
  if (kg < 1) return `${(kg * 1000).toFixed(1)} g`;
  if (kg < 1000) return `${kg.toFixed(1)} kg`;
  return `${(kg / 1000).toFixed(2)} t`;
}

export function checkMassConstraint(budget: MassBudget): { passed: boolean; margin: number; percent: number } {
  return {
    passed: budget.margin >= 0,
    margin: budget.margin,
    percent: budget.marginPercent,
  };
}