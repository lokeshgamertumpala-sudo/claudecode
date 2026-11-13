import json
import math
import sys
from dataclasses import dataclass
from typing import Dict, Any

# Constants
MU_EARTH = 3.986004418e14  # m^3/s^2
R_EARTH = 6371000  # m
J2 = 1.08263e-3
SOLAR_CONSTANT = 1361  # W/m^2


@dataclass
class OrbitParams:
    altitude_km: float
    inclination_deg: float
    eccentricity: float
    arg_perigee_deg: float = 0
    raan_deg: float = 0
    true_anomaly_deg: float = 0

    @property
    def semi_major_axis(self) -> float:
        return R_EARTH + self.altitude_km * 1000

    @property
    def period_seconds(self) -> float:
        return 2 * math.pi * math.sqrt(self.semi_major_axis**3 / MU_EARTH)

    @property
    def period_minutes(self) -> float:
        return self.period_seconds / 60

    @property
    def velocity_ms(self) -> float:
        return math.sqrt(MU_EARTH / self.semi_major_axis)

    @property
    def eclipse_fraction(self) -> float:
        # Simplified eclipse calculation for circular orbits
        beta = math.asin(R_EARTH / self.semi_major_axis)
        return beta / math.pi


def calculate_lifetime_years(altitude_km: float, mass_kg: float, area_m2: float, cd: float = 2.2) -> float:
    """Estimate orbital lifetime due to atmospheric drag."""
    # Simplified model - exponential atmosphere
    h = altitude_km
    if h > 600:
        return 25.0  # Very long
    elif h > 500:
        return 10.0
    elif h > 400:
        return 3.0
    elif h > 300:
        return 1.0
    else:
        return 0.25


def calculate_ground_track(orbit: OrbitParams, duration_hours: float = 24) -> Dict[str, Any]:
    """Calculate ground track parameters."""
    period_min = orbit.period_minutes
    orbits_per_day = 24 * 60 / period_min

    # Ground track shift per orbit due to Earth rotation
    earth_rotation_per_orbit = 360 * period_min / (24 * 60)

    return {
        'orbits_per_day': round(orbits_per_day, 1),
        'ground_track_shift_deg': round(earth_rotation_per_orbit, 1),
        'repeat_cycle_days': round(360 / earth_rotation_per_orbit, 1) if earth_rotation_per_orbit > 0 else 0
    }


def calculate_passes_per_day(orbit: OrbitParams, ground_station_lat: float, ground_station_lon: float,
                             min_elevation_deg: float = 10) -> Dict[str, Any]:
    """Estimate ground station passes per day."""
    # Simplified: max latitude reachable = inclination
    max_lat = orbit.inclination_deg
    if orbit.inclination_deg > 90:
        max_lat = 180 - orbit.inclination_deg

    if abs(ground_station_lat) > max_lat + 5:  # 5 deg margin
        return {'passes_per_day': 0, 'avg_duration_min': 0, 'total_contact_min': 0}

    # Rough estimate
    period_min = orbit.period_minutes
    orbits_per_day = 24 * 60 / period_min
    # Fraction of orbits with visibility
    visibility_fraction = max(0, 1 - abs(ground_station_lat) / max_lat) if max_lat > 0 else 0
    passes = orbits_per_day * visibility_fraction * 0.5  # ~half ascending/descending

    # Pass duration approximation
    angular_radius = math.acos(R_EARTH / orbit.semi_major_axis * math.cos(math.radians(min_elevation_deg)))
    pass_duration = (2 * angular_radius / (2 * math.pi)) * period_min

    return {
        'passes_per_day': round(passes, 1),
        'avg_duration_min': round(pass_duration, 1),
        'total_contact_min': round(passes * pass_duration, 1)
    }


def analyze_orbital(satellite: Dict[str, Any]) -> Dict[str, Any]:
    """Main orbital analysis entry point."""
    orbit_data = satellite.get('orbit', {})
    bus = satellite.get('bus', {})

    orbit = OrbitParams(
        altitude_km=orbit_data.get('altitude_km', 550),
        inclination_deg=orbit_data.get('inclination_deg', 97.4),
        eccentricity=orbit_data.get('eccentricity', 0.001)
    )

    mass = bus.get('mass_kg', 50)
    # Estimate cross-sectional area from bus dimensions
    dims = bus.get('dimensions_m', [0.1, 0.1, 0.3])
    area = max(dims[0]*dims[1], dims[1]*dims[2], dims[0]*dims[2])

    lifetime = calculate_lifetime_years(orbit.altitude_km, mass, area)
    ground_track = calculate_ground_track(orbit)
    passes = calculate_passes_per_day(orbit, 0, 0)  # Equatorial station

    warnings = []
    if lifetime < 2:
        warnings.append(f"Short orbital lifetime: {lifetime:.1f} years")
    if orbit.eclipse_fraction > 0.4:
        warnings.append(f"High eclipse fraction: {orbit.eclipse_fraction:.0%}")
    if passes['passes_per_day'] < 2:
        warnings.append("Limited ground station access")

    score = 100
    if lifetime < 5: score -= 15
    if orbit.eclipse_fraction > 0.35: score -= 10
    if passes['passes_per_day'] < 4: score -= 10
    score = max(0, score)

    status = 'pass' if score >= 70 else 'conditional' if score >= 50 else 'fail'

    return {
        'status': status,
        'score': score,
        'lifetime_years': round(lifetime, 1),
        'period_minutes': round(orbit.period_minutes, 1),
        'velocity_kms': round(orbit.velocity_ms / 1000, 2),
        'eclipse_fraction': round(orbit.eclipse_fraction, 3),
        'eclipse_duration_min': round(orbit.eclipse_fraction * orbit.period_minutes, 1),
        'passes_per_day': passes['passes_per_day'],
        'avg_pass_duration_min': passes['avg_duration_min'],
        'total_contact_min_per_day': passes['total_contact_min'],
        'ground_track': ground_track,
        'warnings': warnings
    }


if __name__ == '__main__':
    # Test
    test_sat = {
        'bus': {'mass_kg': 50, 'dimensions_m': [0.2, 0.2, 0.4]},
        'orbit': {'altitude_km': 550, 'inclination_deg': 97.4, 'eccentricity': 0.001}
    }
    print(json.dumps(analyze_orbital(test_sat), indent=2))