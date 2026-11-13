import type { ExportData, SpacecraftConfig, MissionConfig, SimulationState, MassBudget, PowerBudget } from '@/types';
import { calculateMassBudget } from '@/calculations/mass';
import { calculatePowerBudget } from '@/calculations/power';
import { calculateOrbitalState, calculateEclipseFraction, calculateGroundTrackRepeat, calculateRadiationExposure, calculateThermalCycles } from '@/calculations/orbital';

export function generateExportData(
  spacecraft: SpacecraftConfig,
  mission: MissionConfig,
  simulation: SimulationState
): ExportData {
  const massBudget = calculateMassBudget(spacecraft.components, mission.constraints.maxTotalMass);

  const powerBudget = calculatePowerBudget(
    spacecraft.components,
    mission.instruments,
    mission.orbitalParameters,
    100
  );

  const orbitalState = calculateOrbitalState(mission.orbitalParameters);
  const eclipseFraction = calculateEclipseFraction(mission.orbitalParameters);
  const groundTrackRepeat = calculateGroundTrackRepeat(mission.orbitalParameters);
  const radiationExposure = calculateRadiationExposure(mission.orbitalParameters, 365);
  const thermalCycles = calculateThermalCycles(mission.orbitalParameters, 365);

  const constraintEvaluation = evaluateConstraints(massBudget, powerBudget, mission.constraints);

  return {
    spacecraft,
    mission,
    simulation,
    analysis: {
      massBudget,
      powerBudget,
      orbitalAnalysis: {
        period: orbitalState.period,
        velocity: orbitalState.velocity_magnitude,
        angularVelocity: orbitalState.angularVelocity,
        eclipseFraction,
        groundTrackRepeat,
        deltaVBudget: 0,
        radiationExposure,
        thermalCycles,
      },
      constraintEvaluation,
    },
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
}

function evaluateConstraints(massBudget: MassBudget, powerBudget: PowerBudget, constraints: any): any {
  const violations: any[] = [];
  const warnings: any[] = [];

  if (massBudget.margin < 0) {
    violations.push({
      constraint: 'maxTotalMass',
      expected: massBudget.massLimit,
      actual: massBudget.totalWetMass,
      severity: 'error',
      description: `Mass exceeds limit by ${Math.abs(massBudget.margin).toFixed(1)} kg`,
    });
  } else if (massBudget.marginPercent < constraints.minMassMargin * 100) {
    warnings.push({
      constraint: 'minMassMargin',
      expected: constraints.minMassMargin * 100,
      actual: massBudget.marginPercent,
      description: `Mass margin below recommended ${(constraints.minMassMargin * 100).toFixed(1)}%`,
    });
  }

  if (powerBudget.powerMargin < 0) {
    violations.push({
      constraint: 'maxTotalPower',
      expected: powerBudget.generatedPower,
      actual: powerBudget.totalConsumption,
      severity: 'error',
      description: `Power consumption exceeds generation by ${Math.abs(powerBudget.powerMargin).toFixed(1)} W`,
    });
  } else if (powerBudget.powerMarginPercent < constraints.minPowerMargin * 100) {
    warnings.push({
      constraint: 'minPowerMargin',
      expected: constraints.minPowerMargin * 100,
      actual: powerBudget.powerMarginPercent,
      description: `Power margin below recommended ${(constraints.minPowerMargin * 100).toFixed(1)}%`,
    });
  }

  const score = Math.max(0, 100 - violations.length * 25 - warnings.length * 10);

  return {
    passed: violations.length === 0,
    violations,
    warnings,
    score,
  };
}

export function downloadExportData(data: ExportData, filename?: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `orbitforge-mission-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateMissionReport(data: ExportData): string {
  const { spacecraft, mission, analysis } = data;
  const { massBudget, powerBudget, orbitalAnalysis, constraintEvaluation } = analysis;

  return `# Mission Design Report: ${mission.name}

## Executive Summary
This report documents the design and analysis of the **${spacecraft.name}** spacecraft
for the **${mission.name}** mission.

**Mission Description**: ${mission.description}

**Overall Status**: ${constraintEvaluation.passed ? '✅ ALL CONSTRAINTS SATISFIED' : '❌ CONSTRAINT VIOLATIONS DETECTED'}
**Mission Score**: ${constraintEvaluation.score}/100

---

## Spacecraft Configuration

### General
- **Name**: ${spacecraft.name}
- **Description**: ${spacecraft.description}
- **Created**: ${new Date(spacecraft.createdAt).toLocaleDateString()}
- **Last Modified**: ${new Date(spacecraft.updatedAt).toLocaleDateString()}

### Mass Properties
- **Total Dry Mass**: ${massBudget.totalDryMass.toFixed(1)} kg
- **Propellant Mass**: ${massBudget.propellantMass.toFixed(1)} kg
- **Total Wet Mass**: ${massBudget.totalWetMass.toFixed(1)} kg
- **Mass Limit**: ${massBudget.massLimit} kg
- **Mass Margin**: ${massBudget.margin.toFixed(1)} kg (${massBudget.marginPercent.toFixed(1)}%)

### Mass Breakdown
| Subsystem | Mass (kg) |
|-----------|-----------|
| Main Body | ${massBudget.mainBody.toFixed(1)} |
| Solar Panels | ${massBudget.solarPanels.toFixed(1)} |
| Instruments | ${massBudget.instruments.toFixed(1)} |
| Communications | ${massBudget.communications.toFixed(1)} |
| Propulsion | ${massBudget.propulsion.toFixed(1)} |
| Thermal Control | ${massBudget.thermal.toFixed(1)} |
| Power Systems | ${massBudget.power.toFixed(1)} |
| Structure | ${massBudget.structure.toFixed(1)} |
| Other | ${massBudget.other.toFixed(1)} |
| **Total Dry** | **${massBudget.totalDryMass.toFixed(1)}** |
| Propellant | ${massBudget.propellantMass.toFixed(1)} |
| **Total Wet** | **${massBudget.totalWetMass.toFixed(1)}** |

### Power Properties
- **Solar Panel Area**: ${powerBudget.solarPanelArea.toFixed(2)} m²
- **Solar Irradiance**: ${powerBudget.solarIrradiance} W/m²
- **Panel Efficiency**: ${(powerBudget.panelEfficiency * 100).toFixed(1)}%
- **System Losses**: ${(powerBudget.systemLosses * 100).toFixed(1)}%
- **Generated Power**: ${powerBudget.generatedPower.toFixed(1)} W
- **Total Consumption**: ${powerBudget.totalConsumption.toFixed(1)} W
- **Power Margin**: ${powerBudget.powerMargin.toFixed(1)} W (${powerBudget.powerMarginPercent.toFixed(1)}%)
- **Battery Capacity**: ${powerBudget.batteryCapacity} Wh
- **Eclipse Duration**: ${powerBudget.eclipseDuration.toFixed(1)} s

### Power Breakdown
| Subsystem | Power (W) |
|-----------|-----------|
| Payload (Instruments) | ${powerBudget.payloadPower.toFixed(1)} |
| Bus Systems | ${powerBudget.busPower.toFixed(1)} |
| Communications | ${powerBudget.communicationPower.toFixed(1)} |
| Thermal Control | ${powerBudget.thermalPower.toFixed(1)} |
| **Total** | **${powerBudget.totalConsumption.toFixed(1)}** |

---

## Mission Profile

### Orbital Parameters
- **Altitude**: ${(mission.orbitalParameters.altitude / 1000).toFixed(1)} km
- **Inclination**: ${mission.orbitalParameters.inclination.toFixed(1)}°
- **Eccentricity**: ${mission.orbitalParameters.eccentricity.toFixed(4)}
- **Argument of Perigee**: ${mission.orbitalParameters.argumentOfPerigee.toFixed(1)}°
- **RAAN**: ${mission.orbitalParameters.raan.toFixed(1)}°
- **Epoch**: ${new Date(mission.orbitalParameters.epoch).toLocaleDateString()}

### Orbital Analysis
- **Orbital Period**: ${(orbitalAnalysis.period / 3600).toFixed(2)} h (${orbitalAnalysis.period.toFixed(1)} s)
- **Orbital Velocity**: ${(orbitalAnalysis.velocity / 1000).toFixed(2)} km/s
- **Angular Velocity**: ${orbitalAnalysis.angularVelocity.toExponential(3)} rad/s
- **Eclipse Fraction**: ${(orbitalAnalysis.eclipseFraction * 100).toFixed(1)}%
- **Ground Track Repeat**: ${orbitalAnalysis.groundTrackRepeat} orbits/day
- **Radiation Exposure (1 yr)**: ${orbitalAnalysis.radiationExposure.toExponential(2)} rad
- **Thermal Cycles (1 yr)**: ${orbitalAnalysis.thermalCycles}

### Launch Vehicle
- **Vehicle**: ${mission.launchVehicle.name}
- **Provider**: ${mission.launchVehicle.provider}
- **Max Payload Mass**: ${mission.launchVehicle.maxPayloadMass.toLocaleString()} kg
- **Fairing Diameter**: ${mission.launchVehicle.fairingDiameter} m
- **Estimated Cost**: $${mission.launchVehicle.cost.toLocaleString()}

---

## Mission Objectives
${mission.objectives.map((obj, i) => `
### ${i + 1}. ${obj.name} (${obj.priority.toUpperCase()})
**Type**: ${obj.type.replace('_', ' ')}
**Description**: ${obj.description}
**Required Instruments**: ${obj.requiredInstruments.join(', ') || 'None'}
**Orbit Constraints**: ${obj.minOrbitAltitude / 1000}-${obj.maxOrbitAltitude / 1000} km, ${obj.minInclination}-${obj.maxInclination}°
**Duration**: ${obj.missionDuration} days
`).join('')}

---

## Scientific Instruments
${mission.instruments.map((inst, i) => `
### ${i + 1}. ${inst.name}
**Type**: ${inst.type.replace('_', ' ')}
**Mass**: ${inst.mass} kg
**Power**: ${inst.powerConsumption} W
**Data Rate**: ${inst.dataRate} Mbps
**Field of View**: ${inst.fieldOfView}°
${inst.wavelengthRange ? `**Wavelength Range**: ${inst.wavelengthRange[0]}-${inst.wavelengthRange[1]} nm` : ''}
${inst.resolution ? `**Resolution**: ${inst.resolution}` : ''}
**Operating Temperature**: ${inst.operatingTemperature[0]}°C to ${inst.operatingTemperature[1]}°C
**Description**: ${inst.description}
`).join('')}

---

## Constraint Evaluation

### Overall Status
${constraintEvaluation.passed ? '✅ **ALL CONSTRAINTS SATISFIED**' : '❌ **CONSTRAINT VIOLATIONS DETECTED**'}
**Mission Score**: ${constraintEvaluation.score}/100

### Violations (${constraintEvaluation.violations.length})
${constraintEvaluation.violations.map((v: any) => `
- **${v.constraint}**: ${v.description}
  - Expected: ${v.expected}
  - Actual: ${v.actual}
  - Severity: ${v.severity.toUpperCase()}
`).join('') || 'None'}

### Warnings (${constraintEvaluation.warnings.length})
${constraintEvaluation.warnings.map((w: any) => `
- **${w.constraint}**: ${w.description}
  - Expected: ${w.expected}
  - Actual: ${w.actual}
`).join('') || 'None'}

---

## Engineering Trade-offs

### Mass vs Capability
- Current configuration uses ${((massBudget.totalWetMass / massBudget.massLimit) * 100).toFixed(1)}% of available mass margin
- Each additional kg of instruments requires ${(massBudget.totalWetMass / Math.max(1, mission.instruments.length)).toFixed(1)} kg average
- Propellant fraction: ${((massBudget.propellantMass / massBudget.totalWetMass) * 100).toFixed(1)}%

### Power vs Operations
- Power margin: ${powerBudget.powerMarginPercent.toFixed(1)}% (requirement: ${mission.constraints.minPowerMargin * 100}%)
- Eclipse operations require ${(powerBudget.totalConsumption * powerBudget.eclipseDuration / 3600).toFixed(0)} Wh battery capacity
- Solar array specific power: ${(powerBudget.generatedPower / powerBudget.solarPanelArea).toFixed(0)} W/m²

### Orbit vs Performance
- Altitude: ${(mission.orbitalParameters.altitude / 1000).toFixed(0)} km balances resolution vs coverage
- Inclination: ${mission.orbitalParameters.inclination.toFixed(1)}° enables ${mission.orbitalParameters.inclination > 90 ? 'polar/sun-synchronous' : 'mid-latitude'} coverage
- Period: ${(orbitalAnalysis.period / 3600).toFixed(1)} h allows ${Math.floor(24 / (orbitalAnalysis.period / 3600))} orbits/day

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Mass Growth | Medium | High | 10% design margin, regular mass audits |
| Power Shortfall | ${powerBudget.powerMarginPercent < 20 ? 'High' : 'Low'} | High | Battery reserve, load shedding plan |
| Radiation Damage | ${orbitalAnalysis.radiationExposure > 1e4 ? 'Medium' : 'Low'} | Medium | Rad-hard components, shielding |
| Thermal Cycling | ${orbitalAnalysis.thermalCycles > 5000 ? 'High' : 'Medium'} | Medium | Thermal control design, qualification testing |
| Launch Delay | Low | High | Compatible with multiple launch vehicles |

---

## Recommendations

1. **${constraintEvaluation.passed ? 'Proceed to Preliminary Design Review (PDR)' : 'Resolve constraint violations before PDR'}**
2. Conduct detailed thermal analysis for ${orbitalAnalysis.thermalCycles} cycles/year
3. Validate radiation tolerance for ${orbitalAnalysis.radiationExposure.toExponential(1)} rad/year environment
4. Optimize solar array deployment mechanism for ${powerBudget.solarPanelArea.toFixed(1)} m²
5. Define contingency operations for ${(powerBudget.eclipseDuration / 60).toFixed(0)}-minute eclipses
6. Perform coupled loads analysis with ${mission.launchVehicle.name} fairing
7. Develop detailed mission operations timeline
8. Initiate long-lead procurement for critical components

---

## Appendices

### A. Component Details
${spacecraft.components.map((c, i) => `
#### ${i + 1}. ${c.name} (${c.type})
- **Position**: [${c.position.x.toFixed(2)}, ${c.position.y.toFixed(2)}, ${c.position.z.toFixed(2)}] m
- **Dimensions**: ${c.dimensions.width} × ${c.dimensions.height} × ${c.dimensions.depth} m
- **Mass**: ${c.mass} kg
- **Power**: ${c.powerConsumption} W
- **Visible**: ${c.visible ? 'Yes' : 'No'}
`).join('')}

### B. Simulation Events
${data.simulation.events.slice(-20).map((e, i) => `
- **${new Date(e.time * 1000).toISOString().substr(11, 12)}**: ${e.type.replace('_', ' ').toUpperCase()} - ${e.description}
`).join('')}

---

*Report generated by ORBITFORGE AI v${data.version} on ${new Date(data.exportedAt).toLocaleString()}*
*This is an educational simulation tool - not for actual mission design*`;
}

export function downloadMissionReport(report: string, filename?: string): void {
  const blob = new Blob([report], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `orbitforge-report-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}