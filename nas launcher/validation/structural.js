const MATERIAL_PROPS = {
  aluminum: { density: 2700, yield_strength: 276e6, youngs_modulus: 69e9, cte: 23e-6, thermal_conductivity: 167 },
  'aluminum-7075': { density: 2810, yield_strength: 503e6, youngs_modulus: 71.7e9, cte: 23.6e-6, thermal_conductivity: 130 },
  titanium: { density: 4430, yield_strength: 880e6, youngs_modulus: 116e9, cte: 8.6e-6, thermal_conductivity: 21.9 },
  'carbon-fiber': { density: 1600, yield_strength: 600e6, youngs_modulus: 70e9, cte: 0.5e-6, thermal_conductivity: 5 },
  'carbon-fiber-epoxy': { density: 1550, yield_strength: 700e6, youngs_modulus: 120e9, cte: -0.5e-6, thermal_conductivity: 8 },
  invar: { density: 8100, yield_strength: 276e6, youngs_modulus: 144e9, cte: 1.2e-6, thermal_conductivity: 10 },
  steel: { density: 7850, yield_strength: 250e6, youngs_modulus: 200e9, cte: 12e-6, thermal_conductivity: 50 }
};

const LAUNCH_LOADS = {
  falcon9: { axial_g: 6.5, lateral_g: 3.0, acoustic_db: 142 },
  electron: { axial_g: 12, lateral_g: 5, acoustic_db: 138 },
  ariane6: { axial_g: 5.5, lateral_g: 2.5, acoustic_db: 140 },
  vega: { axial_g: 7, lateral_g: 3.5, acoustic_db: 141 },
  default: { axial_g: 8, lateral_g: 4, acoustic_db: 140 }
};

export async function validateStructural(satellite) {
  const bus = satellite.bus || {};
  const orbit = satellite.orbit || {};
  const payload = satellite.payload || {};

  const dimensions = bus.dimensions_m || [0.1, 0.1, 0.3];
  const material = bus.structure_material || 'aluminum';
  const busMass = bus.mass_kg || 4;
  const payloadMass = payload.mass_kg || 0.5;
  const totalMass = busMass + payloadMass;
  const altitude = orbit.altitude_km || 500;

  const mat = MATERIAL_PROPS[material] || MATERIAL_PROPS.aluminum;
  const launchVehicle = bus.launch_vehicle || 'default';
  const loads = LAUNCH_LOADS[launchVehicle] || LAUNCH_LOADS.default;

  const warnings = [];
  const errors = [];

  const [Lx, Ly, Lz] = dimensions;
  const volume = Lx * Ly * Lz;
  const structuralMass = totalMass * 0.3;
  const wallThickness = estimateWallThickness(structuralMass, volume, mat.density);

  if (wallThickness < 0.5e-3) {
    warnings.push(`Very thin walls (${(wallThickness * 1000).toFixed(1)} mm): consider minimum gauge`);
  } else if (wallThickness > 5e-3) {
    warnings.push(`Thick walls (${(wallThickness * 1000).toFixed(1)} mm): mass inefficient`);
  }

  const axialLoad = totalMass * loads.axial_g * 9.81;
  const lateralLoad = totalMass * loads.lateral_g * 9.81;

  const crossSection = Ly * Lz;
  const axialStress = axialLoad / crossSection;
  const safetyFactorYield = mat.yield_strength / axialStress;

  if (safetyFactorYield < 1.5) {
    errors.push(`Launch axial stress exceeds yield with SF ${safetyFactorYield.toFixed(2)} (min 1.5 required)`);
  } else if (safetyFactorYield < 2.0) {
    warnings.push(`Low structural margin: yield safety factor ${safetyFactorYield.toFixed(2)}`);
  }

  const bendingStress = estimateBendingStress(lateralLoad, Lx, crossSection, mat.youngs_modulus);
  const combinedStress = axialStress + bendingStress;
  const sfCombined = mat.yield_strength / combinedStress;

  if (sfCombined < 1.5) {
    errors.push(`Combined launch stress exceeds yield with SF ${sfCombined.toFixed(2)}`);
  }

  const freq1 = estimateFirstFrequency(Lx, Ly, Lz, mat.youngs_modulus, mat.density, totalMass);
  if (freq1 < 50) {
    warnings.push(`First structural mode ${freq1.toFixed(1)} Hz < 50 Hz: may couple with launch vehicle`);
  } else if (freq1 < 100) {
    warnings.push(`First mode ${freq1.toFixed(1)} Hz: verify separation from LV dynamics`);
  }

  const deltaT = 120;
  const thermalStress = mat.youngs_modulus * mat.cte * deltaT;
  if (thermalStress > mat.yield_strength * 0.5) {
    warnings.push(`High thermal stress (${(thermalStress / 1e6).toFixed(0)} MPa): consider CTE matching or flexures`);
  }

  const acousticPressure = Math.pow(10, (loads.acoustic_db - 120) / 20) * 20e-6;
  const panelStress = estimatePanelStress(acousticPressure, Math.max(Lx, Ly, Lz), wallThickness, mat.youngs_modulus);
  if (panelStress > mat.yield_strength * 0.3) {
    warnings.push(`Acoustic panel stress high: ${(panelStress / 1e6).toFixed(0)} MPa`);
  }

  const deploymentLoad = payloadMass * 20 * 9.81;
  const deployStress = deploymentLoad / crossSection;
  if (deployStress > mat.yield_strength * 0.5) {
    warnings.push(`Deployment shock stress high: consider dampening`);
  }

  return {
    passed: errors.length === 0,
    structural_analysis: {
      material: material,
      material_properties: {
        density_kgm3: mat.density,
        yield_strength_mpa: (mat.yield_strength / 1e6).toFixed(0),
        youngs_modulus_gpa: (mat.youngs_modulus / 1e9).toFixed(1),
        cte_ppmk: (mat.cte * 1e6).toFixed(1),
        thermal_conductivity_wmk: mat.thermal_conductivity
      },
      geometry: {
        dimensions_m: dimensions,
        volume_m3: volume.toFixed(6),
        estimated_wall_thickness_mm: (wallThickness * 1000).toFixed(2),
        cross_section_m2: crossSection.toFixed(6)
      },
      masses: {
        bus_kg: busMass,
        payload_kg: payloadMass,
        total_kg: totalMass,
        structural_est_kg: structuralMass.toFixed(1)
      },
      launch_loads: {
        vehicle: launchVehicle,
        axial_g: loads.axial_g,
        lateral_g: loads.lateral_g,
        acoustic_db: loads.acoustic_db
      },
      stress_analysis: {
        axial_load_n: axialLoad.toFixed(0),
        lateral_load_n: lateralLoad.toFixed(0),
        axial_stress_mpa: (axialStress / 1e6).toFixed(1),
        bending_stress_mpa: (bendingStress / 1e6).toFixed(1),
        combined_stress_mpa: (combinedStress / 1e6).toFixed(1),
        yield_safety_factor: safetyFactorYield.toFixed(2),
        combined_safety_factor: sfCombined.toFixed(2)
      },
      dynamics: {
        first_frequency_hz: freq1.toFixed(1),
        requirement_hz: 50
      },
      thermal_stress: {
        delta_t_c: deltaT,
        thermal_stress_mpa: (thermalStress / 1e6).toFixed(1),
        yield_fraction: (thermalStress / mat.yield_strength).toFixed(2)
      },
      acoustic: {
        pressure_pa: acousticPressure.toFixed(1),
        panel_stress_mpa: (panelStress / 1e6).toFixed(1)
      }
    },
    warnings,
    errors
  };
}

function estimateWallThickness(structuralMass, volume, density) {
  const surfaceArea = Math.pow(volume * 6, 2/3);
  return structuralMass / (surfaceArea * density);
}

function estimateBendingStress(lateralLoad, length, crossSection, youngsModulus) {
  const I = crossSection * Math.pow(length, 2) / 12;
  const M = lateralLoad * length / 4;
  const c = length / 2;
  return M * c / I;
}

function estimateFirstFrequency(Lx, Ly, Lz, E, rho, mass) {
  const D = E * Math.pow(Lx, 3) * Ly * Lz / 12;
  const mu = mass / (Lx * Ly * Lz);
  return 0.5 * Math.PI * Math.sqrt(D / (mu * Math.pow(Lx, 4)));
}

function estimatePanelStress(pressure, length, thickness, E) {
  const aspect = 1;
  const k = 4;
  return k * pressure * Math.pow(length / thickness, 2);
}