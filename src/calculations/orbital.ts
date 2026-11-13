import type { OrbitalParameters, OrbitalState, Vector3 } from '@/types';
import { EARTH_RADIUS, EARTH_GRAVITATIONAL_PARAMETER } from '@/constants';

export function calculateOrbitalRadius(altitude: number): number {
  return EARTH_RADIUS + altitude;
}

export function calculateCircularVelocity(orbitalRadius: number): number {
  return Math.sqrt(EARTH_GRAVITATIONAL_PARAMETER / orbitalRadius);
}

export function calculateOrbitalPeriod(orbitalRadius: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(orbitalRadius, 3) / EARTH_GRAVITATIONAL_PARAMETER);
}

export function calculateAngularVelocity(orbitalRadius: number): number {
  return Math.sqrt(EARTH_GRAVITATIONAL_PARAMETER / Math.pow(orbitalRadius, 3));
}

export function calculateOrbitalState(params: OrbitalParameters): OrbitalState {
  const orbitalRadius = calculateOrbitalRadius(params.altitude);
  const velocity = calculateCircularVelocity(orbitalRadius);
  const period = calculateOrbitalPeriod(orbitalRadius);
  const angularVelocity = calculateAngularVelocity(orbitalRadius);

  const inclinationRad = (params.inclination * Math.PI) / 180;
  const raanRad = (params.raan * Math.PI) / 180;
  const argPerigeeRad = (params.argumentOfPerigee * Math.PI) / 180;
  const trueAnomalyRad = (params.trueAnomaly * Math.PI) / 180;

  const cosInc = Math.cos(inclinationRad);
  const sinInc = Math.sin(inclinationRad);
  const cosRaan = Math.cos(raanRad);
  const sinRaan = Math.sin(raanRad);
  const cosArgPerigee = Math.cos(argPerigeeRad);
  const sinArgPerigee = Math.sin(argPerigeeRad);
  const cosTrueAnomaly = Math.cos(trueAnomalyRad);
  const sinTrueAnomaly = Math.sin(trueAnomalyRad);

  const r = orbitalRadius;

  const posPerifocal = {
    x: r * cosTrueAnomaly,
    y: r * sinTrueAnomaly,
    z: 0,
  };

  const velPerifocal = {
    x: -velocity * sinTrueAnomaly,
    y: velocity * (cosTrueAnomaly + params.eccentricity),
    z: 0,
  };

  const position: Vector3 = {
    x: (cosRaan * cosArgPerigee - sinRaan * sinArgPerigee * cosInc) * posPerifocal.x +
       (-cosRaan * sinArgPerigee - sinRaan * cosArgPerigee * cosInc) * posPerifocal.y,
    y: (sinRaan * cosArgPerigee + cosRaan * sinArgPerigee * cosInc) * posPerifocal.x +
       (-sinRaan * sinArgPerigee + cosRaan * cosArgPerigee * cosInc) * posPerifocal.y,
    z: sinInc * sinArgPerigee * posPerifocal.x + sinInc * cosArgPerigee * posPerifocal.y,
  };

  const velocityVec: Vector3 = {
    x: (cosRaan * cosArgPerigee - sinRaan * sinArgPerigee * cosInc) * velPerifocal.x +
       (-cosRaan * sinArgPerigee - sinRaan * cosArgPerigee * cosInc) * velPerifocal.y,
    y: (sinRaan * cosArgPerigee + cosRaan * sinArgPerigee * cosInc) * velPerifocal.x +
       (-sinRaan * sinArgPerigee + cosRaan * cosArgPerigee * cosInc) * velPerifocal.y,
    z: sinInc * sinArgPerigee * velPerifocal.x + sinInc * cosArgPerigee * velPerifocal.y,
  };

  return {
    position,
    velocity: velocityVec,
    orbitalElements: params,
    period,
    velocity_magnitude: velocity,
    angularVelocity,
  };
}

export function propagateOrbit(state: OrbitalState, deltaTime: number): OrbitalState {
  const newTrueAnomaly = state.orbitalElements.trueAnomaly +
    (state.angularVelocity * deltaTime * 180) / Math.PI;

  const newParams: OrbitalParameters = {
    ...state.orbitalElements,
    trueAnomaly: newTrueAnomaly % 360,
  };

  return calculateOrbitalState(newParams);
}

export function calculateEclipseFraction(params: OrbitalParameters): number {
  const orbitalRadius = calculateOrbitalRadius(params.altitude);
  const beta = Math.asin(EARTH_RADIUS / orbitalRadius);
  const eclipseAngle = 2 * beta;
  const orbitAngle = 2 * Math.PI;
  return eclipseAngle / orbitAngle;
}

export function calculateGroundTrackRepeat(params: OrbitalParameters): number {
  const period = calculateOrbitalPeriod(calculateOrbitalRadius(params.altitude));
  const siderealDay = 86164.0905;
  const orbitsPerDay = siderealDay / period;
  return Math.round(orbitsPerDay * 100) / 100;
}

export function calculateDeltaVForAltitudeChange(
  initialAltitude: number,
  targetAltitude: number
): number {
  const r1 = calculateOrbitalRadius(initialAltitude);
  const r2 = calculateOrbitalRadius(targetAltitude);
  const v1 = calculateCircularVelocity(r1);
  const v2 = calculateCircularVelocity(r2);
  const vTransfer1 = Math.sqrt(EARTH_GRAVITATIONAL_PARAMETER * (2 / r1 - 2 / (r1 + r2)));
  const vTransfer2 = Math.sqrt(EARTH_GRAVITATIONAL_PARAMETER * (2 / r2 - 2 / (r1 + r2)));
  return Math.abs(vTransfer1 - v1) + Math.abs(vTransfer2 - v2);
}

export function calculateRadiationExposure(params: OrbitalParameters, durationDays: number): number {
  const altitude = params.altitude;
  let flux = 0;

  if (altitude < 2000000) {
    flux = 1e-3 * Math.exp(-altitude / 500000);
  } else if (altitude < 20000000) {
    flux = 1e-2 * Math.exp(-(altitude - 2000000) / 5000000);
  } else {
    flux = 1e-1;
  }

  if (params.inclination > 60 && params.inclination < 120) {
    flux *= 5;
  }

  return flux * durationDays * 86400;
}

export function calculateThermalCycles(params: OrbitalParameters, durationDays: number): number {
  const period = calculateOrbitalPeriod(calculateOrbitalRadius(params.altitude));
  const orbitsPerDay = 86400 / period;
  const eclipseFraction = calculateEclipseFraction(params);
  return Math.floor(orbitsPerDay * durationDays * eclipseFraction);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} min`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} h`;
  return `${(seconds / 86400).toFixed(1)} d`;
}

export function formatVelocity(velocity: number): string {
  if (velocity < 1000) return `${velocity.toFixed(1)} m/s`;
  return `${(velocity / 1000).toFixed(2)} km/s`;
}

export function formatDistance(distance: number): string {
  if (distance < 1000) return `${distance.toFixed(1)} m`;
  if (distance < 1000000) return `${(distance / 1000).toFixed(1)} km`;
  return `${(distance / 1000000).toFixed(2)} Mkm`;
}