import json
import math
from typing import Dict, Any

# Constants
SOLAR_CONSTANT = 1361  # W/m^2
EARTH_ALBEDO = 0.3
BATTERY_DOD_LIMIT = 0.8  # 80% max depth of discharge


def calculate_solar_generation(satellite: Dict[str, Any], orbit: Dict[str, Any]) -> Dict[str, float]:
    """Calculate orbit-average solar power generation."""
    power = satellite.get('power', {})
    panels = power.get('solar_panels', [])

    total_area = sum(p.get('area_m2', 0) for p in panels)
    avg_efficiency = sum(p.get('efficiency', 0.3) for p in panels) / max(len(panels), 1) if panels else 0.3

    # Orbit parameters
    altitude = orbit.get('altitude_km', 550)
    inclination = orbit.get('inclination_deg', 97.4)

    # Eclipse fraction (simplified for circular orbit)
    r_earth = 6371
    r_orbit = r_earth + altitude
    beta = math.asin(r_earth / r_orbit)
    eclipse_fraction = beta / math.pi

    # Sunlit fraction
    sunlit_fraction = 1 - eclipse_fraction

    # Solar flux at orbit (negligible variation in LEO)
    solar_flux = SOLAR_CONSTANT

    # Incidence angle factor (average for sun-tracking vs fixed)
    # Assume deployable panels are sun-tracking, body-mounted are fixed
    incidence_factor = 0.0
    for p in panels:
        if p.get('orientation') == 'sun-tracking' or p.get('type') == 'deployable':
            incidence_factor += p.get('area_m2', 0) * 0.95  # Near-optimal
        else:
            incidence_factor += p.get('area_m2', 0) * 0.35  # Fixed, average cosine

    if total_area > 0:
        avg_incidence = incidence_factor / total_area
    else:
        avg_incidence = 0.35

    # Temperature derating (solar cells lose ~0.4%/°C above 25°C)
    # Assume 60°C operating temp -> 35°C above 25°C -> ~14% loss
    temp_derating = 0.86

    # Lifetime degradation (assume 5 year mission, 2.5%/year)
    lifetime_derating = 0.875

    # Orbit-average generation
    p_gen = total_area * solar_flux * avg_efficiency * avg_incidence * temp_derating * lifetime_derating * sunlit_fraction

    # Peak generation (full sun, optimal angle)
    p_peak = total_area * solar_flux * avg_efficiency * 0.95 * temp_derating * lifetime_derating

    return {
        'total_area_m2': total_area,
        'avg_efficiency': avg_efficiency,
        'eclipse_fraction': eclipse_fraction,
        'sunlit_fraction': sunlit_fraction,
        'avg_incidence_factor': avg_incidence,
        'temp_derating': temp_derating,
        'lifetime_derating': lifetime_derating,
        'orbit_average_w': p_gen,
        'peak_w': p_peak,
        'eclipse_duration_min': eclipse_fraction * 90  # Approx orbital period
    }


def calculate_power_consumption(satellite: Dict[str, Any]) -> Dict[str, float]:
    """Calculate power consumption by subsystem."""
    payload = satellite.get('payload', {})
    comms = satellite.get('comms', {})
    bus = satellite.get('bus', {})

    # Payload power
    payload_power = sum(inst.get('power_w', 0) for inst in payload.get('instruments', []))

    # Comms power (transmitters)
    comms_power = sum(t.get('power_w', 0) for t in comms.get('transponders', []))

    # Bus power (avionics, ADCS, thermal heaters, etc.)
    bus_base = 15  # Base avionics
    adcs_power = 5  # Reaction wheels, magnetorquers
    thermal_heaters = satellite.get('thermal', {}).get('heaters_w', 10)
    bus_power = bus_base + adcs_power + thermal_heaters

    # Duty cycles (fraction of orbit)
    payload_duty = 0.3  # Payload operates 30% of orbit
    comms_duty = 0.15   # Comms 15% of orbit
    bus_duty = 1.0      # Bus always on

    # Orbit-average consumption
    avg_consumption = (payload_power * payload_duty +
                       comms_power * comms_duty +
                       bus_power * bus_duty)

    # Peak consumption (all on)
    peak_consumption = payload_power + comms_power + bus_power

    return {
        'payload_w': payload_power,
        'comms_w': comms_power,
        'bus_w': bus_power,
        'payload_duty': payload_duty,
        'comms_duty': comms_duty,
        'bus_duty': bus_duty,
        'orbit_average_w': avg_consumption,
        'peak_w': peak_consumption,
        'breakdown': {
            'payload_avg': payload_power * payload_duty,
            'comms_avg': comms_power * comms_duty,
            'bus_avg': bus_power * bus_duty
        }
    }


def calculate_battery_requirements(satellite: Dict[str, Any], solar_gen: Dict[str, float],
                                    consumption: Dict[str, float]) -> Dict[str, float]:
    """Calculate battery sizing and depth of discharge."""
    power = satellite.get('power', {})
    battery = power.get('battery', {})

    capacity_wh = battery.get('capacity_wh', 50)
    voltage = battery.get('voltage_v', 28)
    capacity_ah = capacity_wh / voltage if voltage > 0 else 0

    # Energy needed during eclipse
    eclipse_duration_h = solar_gen['eclipse_duration_min'] / 60
    eclipse_energy_wh = consumption['orbit_average_w'] * eclipse_duration_h

    # Depth of discharge per orbit
    dod = eclipse_energy_wh / capacity_wh if capacity_wh > 0 else 1.0

    # Required capacity for 80% DoD limit
    required_wh = eclipse_energy_wh / BATTERY_DOD_LIMIT

    # Number of cycles per day
    orbits_per_day = 24 * 60 / (90 * (1 + 0.1))  # ~14-15 orbits/day

    # Mission life cycles
    mission_years = 5
    total_cycles = orbits_per_day * 365 * mission_years

    return {
        'capacity_wh': capacity_wh,
        'capacity_ah': capacity_ah,
        'voltage_v': voltage,
        'eclipse_energy_wh': eclipse_energy_wh,
        'eclipse_duration_h': eclipse_duration_h,
        'dod_per_orbit': dod,
        'dod_percent': dod * 100,
        'required_wh_for_80_dod': required_wh,
        'margin': (capacity_wh - required_wh) / required_wh if required_wh > 0 else 0,
        'orbits_per_day': orbits_per_day,
        'mission_cycles': total_cycles
    }


def analyze_power(satellite: Dict[str, Any]) -> Dict[str, Any]:
    """Main power analysis entry point."""
    orbit = satellite.get('orbit', {})

    solar = calculate_solar_generation(satellite, orbit)
    consumption = calculate_power_consumption(satellite)
    battery = calculate_battery_requirements(satellite, solar, consumption)

    # Power margin
    margin = (solar['orbit_average_w'] - consumption['orbit_average_w']) / consumption['orbit_average_w'] if consumption['orbit_average_w'] > 0 else 0

    warnings = []
    if margin < 0.3:
        warnings.append(f"Low power margin: {margin:.0%} (recommend >30%)")
    if battery['dod_per_orbit'] > BATTERY_DOD_LIMIT:
        warnings.append(f"Battery DoD {battery['dod_per_orbit']:.0%} exceeds 80% limit")
    if solar['total_area_m2'] == 0:
        warnings.append("No solar panels defined")
    if consumption['orbit_average_w'] > solar['orbit_average_w']:
        warnings.append("Average consumption exceeds generation - not power positive")

    # Score
    score = 100
    if margin < 0.3: score -= 25
    if battery['dod_per_orbit'] > BATTERY_DOD_LIMIT: score -= 25
    if consumption['orbit_average_w'] > solar['orbit_average_w']: score -= 30
    if solar['total_area_m2'] == 0: score = 0
    score = max(0, score)

    status = 'pass' if score >= 70 else 'conditional' if score >= 50 else 'fail'

    return {
        'status': status,
        'score': score,
        'generation_w': round(solar['orbit_average_w'], 1),
        'peak_generation_w': round(solar['peak_w'], 1),
        'consumption_w': round(consumption['orbit_average_w'], 1),
        'peak_consumption_w': round(consumption['peak_w'], 1),
        'margin_percent': round(margin * 100, 1),
        'solar_area_m2': round(solar['total_area_m2'], 3),
        'solar_efficiency': round(solar['avg_efficiency'] * 100, 1),
        'eclipse_fraction': round(solar['eclipse_fraction'], 3),
        'eclipse_duration_min': round(solar['eclipse_duration_min'], 1),
        'battery_capacity_wh': round(battery['capacity_wh'], 1),
        'battery_dod_percent': round(battery['dod_percent'], 1),
        'battery_margin': round(battery['margin'] * 100, 1),
        'payload_power_w': round(consumption['payload_w'], 1),
        'comms_power_w': round(consumption['comms_w'], 1),
        'bus_power_w': round(consumption['bus_w'], 1),
        'warnings': warnings
    }


if __name__ == '__main__':
    test_sat = {
        'bus': {'mass_kg': 50},
        'power': {
            'solar_panels': [
                {'area_m2': 0.3, 'efficiency': 0.3, 'type': 'deployable', 'orientation': 'sun-tracking'},
                {'area_m2': 0.1, 'efficiency': 0.28, 'type': 'body-mounted'}
            ],
            'battery': {'capacity_wh': 100, 'voltage_v': 28}
        },
        'payload': {
            'instruments': [{'power_w': 30}, {'power_w': 15}]
        },
        'comms': {
            'transponders': [{'power_w': 5}, {'power_w': 3}]
        },
        'thermal': {'heaters_w': 10},
        'orbit': {'altitude_km': 550, 'inclination_deg': 97.4}
    }
    print(json.dumps(analyze_power(test_sat), indent=2))