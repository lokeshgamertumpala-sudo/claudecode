import json
import math
from typing import Dict, Any

# Constants
SOLAR_CONSTANT = 1361  # W/m^2
EARTH_ALBEDO = 0.3
EARTH_IR = 237  # W/m^2
STEFAN_BOLTZMANN = 5.670374419e-8  # W/m^2/K^4


def calculate_absorbed_power(satellite: Dict[str, Any], orbit: Dict[str, Any]) -> Dict[str, float]:
    """Calculate absorbed heat from external sources."""
    bus = satellite.get('bus', {})
    thermal = satellite.get('thermal', {})
    power = satellite.get('power', {})

    # Surface areas (estimate from bus dimensions)
    dims = bus.get('dimensions_m', [0.1, 0.1, 0.3])
    areas = {
        'x_face': dims[1] * dims[2],
        'y_face': dims[0] * dims[2],
        'z_face': dims[0] * dims[1]
    }
    total_area = 2 * sum(areas.values())

    # Solar absorptivity (alpha) - assume 0.2 for MLI, 0.9 for solar panels
    alpha_mli = 0.2
    alpha_solar = 0.9

    # Solar flux at orbit
    altitude = orbit.get('altitude_km', 550)
    solar_flux = SOLAR_CONSTANT

    # Eclipse fraction
    r_earth = 6371
    r_orbit = r_earth + altitude
    beta = math.asin(r_earth / r_orbit)
    eclipse_fraction = beta / math.pi

    # Absorbed solar (sunlit portion)
    solar_area = sum(sp.get('area_m2', 0) for sp in power.get('solar_panels', []))
    bus_sunlit_area = total_area / 4  # Average projected area

    absorbed_solar = (solar_area * alpha_solar + bus_sunlit_area * alpha_mli) * solar_flux * (1 - eclipse_fraction)

    # Albedo (reflected solar from Earth)
    albedo_flux = SOLAR_CONSTANT * EARTH_ALBEDO * (r_earth / r_orbit)**2
    absorbed_albedo = bus_sunlit_area * alpha_mli * albedo_flux * (1 - eclipse_fraction)

    # Earth IR
    absorbed_ir = bus_sunlit_area * 0.9 * EARTH_IR * (r_earth / r_orbit)**2

    # Internal dissipation
    payload_power = sum(inst.get('power_w', 0) for inst in satellite.get('payload', {}).get('instruments', []))
    bus_power = 20  # Estimate for bus avionics
    comms_power = sum(t.get('power_w', 0) for t in satellite.get('comms', {}).get('transponders', []))
    internal_power = payload_power + bus_power + comms_power

    return {
        'solar': absorbed_solar,
        'albedo': absorbed_albedo,
        'earth_ir': absorbed_ir,
        'internal': internal_power,
        'total': absorbed_solar + absorbed_albedo + absorbed_ir + internal_power,
        'eclipse_fraction': eclipse_fraction,
        'solar_area': solar_area,
        'bus_area': bus_sunlit_area,
        'internal_breakdown': {
            'payload': payload_power,
            'bus': bus_power,
            'comms': comms_power
        }
    }


def calculate_radiator_capacity(satellite: Dict[str, Any]) -> Dict[str, float]:
    """Calculate radiator heat rejection capacity."""
    thermal = satellite.get('thermal', {})
    radiators = thermal.get('radiators', [])

    total_area = sum(r.get('area_m2', 0) for r in radiators)
    avg_emissivity = sum(r.get('emissivity', 0.85) for r in radiators) / max(len(radiators), 1)
    avg_absorptivity = sum(r.get('absorptivity', 0.15) for r in radiators) / max(len(radiators), 1)

    # View factor to deep space (assume 0.8 for body-mounted, 1.0 for deployable)
    view_factor = 0.9

    return {
        'total_area': total_area,
        'avg_emissivity': avg_emissivity,
        'avg_absorptivity': avg_absorptivity,
        'view_factor': view_factor
    }


def solve_temperatures(absorbed: Dict[str, float], radiator: Dict[str, float],
                       heater_power: float = 0) -> Dict[str, float]:
    """Solve steady-state temperatures for hot and cold cases."""

    epsilon = radiator['avg_emissivity']
    A = radiator['total_area']
    F = radiator['view_factor']

    # Minimum radiator area if none specified (use body panels as radiators)
    if A <= 0:
        A = 0.1  # Default small radiator
        epsilon = 0.8
        F = 0.8

    # Hot case: max absorbed, radiators see some Earth IR and albedo
    # Radiator view factor to Earth ~0.2 in hot case
    F_earth_hot = 0.2
    F_space_hot = 1 - F_earth_hot

    # Heat loads in hot case
    q_internal = absorbed['internal']
    q_solar_on_rad = absorbed['solar'] * 0.1  # Small fraction of solar hits radiators
    q_albedo_on_rad = absorbed['albedo'] * 0.3
    q_earth_ir_on_rad = A * radiator['avg_absorptivity'] * EARTH_IR * F_earth_hot

    q_hot = q_internal + q_solar_on_rad + q_albedo_on_rad + q_earth_ir_on_rad

    # Cold case: eclipse, only internal + heaters, radiators see deep space
    q_cold = absorbed['internal'] + heater_power

    # Stefan-Boltzmann: q = epsilon * sigma * A * F * T^4
    # T = (q / (epsilon * sigma * A * F))^0.25

    if A > 0 and epsilon > 0:
        T_hot_k = (q_hot / (epsilon * STEFAN_BOLTZMANN * A * F_space_hot)) ** 0.25
        T_cold_k = (q_cold / (epsilon * STEFAN_BOLTZMANN * A * F)) ** 0.25
    else:
        T_hot_k = 320  # ~47°C fallback
        T_cold_k = 250  # ~-23°C fallback

    # Clamp to reasonable bounds
    T_hot_k = max(250, min(400, T_hot_k))
    T_cold_k = max(180, min(320, T_cold_k))

    # Radiator margin at 50°C (323K) and -20°C (253K)
    margin_hot = (epsilon * STEFAN_BOLTZMANN * A * F_space_hot * 323**4) / max(q_hot, 1)
    margin_cold = (epsilon * STEFAN_BOLTZMANN * A * F * 253**4) / max(q_cold, 1)

    return {
        'hot_case_k': T_hot_k,
        'hot_case_c': T_hot_k - 273.15,
        'cold_case_k': T_cold_k,
        'cold_case_c': T_cold_k - 273.15,
        'heat_rejected_hot_w': q_hot,
        'heat_rejected_cold_w': q_cold,
        'radiator_margin_hot': margin_hot,
        'radiator_margin_cold': margin_cold
    }


def analyze_thermal(satellite: Dict[str, Any]) -> Dict[str, Any]:
    """Main thermal analysis entry point."""
    orbit = satellite.get('orbit', {})
    thermal = satellite.get('thermal', {})

    absorbed = calculate_absorbed_power(satellite, orbit)
    radiator = calculate_radiator_capacity(satellite)
    heater_power = thermal.get('heaters_w', 0)

    temps = solve_temperatures(absorbed, radiator, heater_power)

    # Component temperature limits (typical)
    limits = {
        'battery': {'min': -10, 'max': 40},
        'electronics': {'min': -20, 'max': 60},
        'payload': {'min': -10, 'max': 50},
        'structure': {'min': -40, 'max': 80}
    }

    # Check margins
    hot_c = temps['hot_case_c']
    cold_c = temps['cold_case_c']

    warnings = []
    if hot_c > limits['electronics']['max']:
        warnings.append(f"Hot case ({hot_c:.1f}°C) exceeds electronics limit ({limits['electronics']['max']}°C)")
    if cold_c < limits['electronics']['min']:
        warnings.append(f"Cold case ({cold_c:.1f}°C) below electronics limit ({limits['electronics']['min']}°C)")
    if hot_c > limits['battery']['max']:
        warnings.append(f"Hot case ({hot_c:.1f}°C) exceeds battery limit ({limits['battery']['max']}°C)")
    if cold_c < limits['battery']['min']:
        warnings.append(f"Cold case ({cold_c:.1f}°C) below battery limit ({limits['battery']['min']}°C)")
    if temps['radiator_margin_hot'] < 1.2:
        warnings.append(f"Radiator margin low in hot case: {temps['radiator_margin_hot']:.2f}x")

    # Score based on margins
    score = 100
    if hot_c > limits['electronics']['max']: score -= 20
    if cold_c < limits['electronics']['min']: score -= 20
    if temps['radiator_margin_hot'] < 1.2: score -= 15
    if temps['radiator_margin_cold'] < 1.1: score -= 10
    score = max(0, score)

    status = 'pass' if score >= 70 else 'conditional' if score >= 50 else 'fail'

    return {
        'status': status,
        'score': score,
        'hot_case_c': round(hot_c, 1),
        'cold_case_c': round(cold_c, 1),
        'absorbed_power_w': round(absorbed['total'], 1),
        'internal_power_w': round(absorbed['internal'], 1),
        'radiator_area_m2': round(radiator['total_area'], 3),
        'radiator_emissivity': round(radiator['avg_emissivity'], 2),
        'radiator_margin_hot': round(temps['radiator_margin_hot'], 2),
        'radiator_margin_cold': round(temps['radiator_margin_cold'], 2),
        'heater_power_w': heater_power,
        'mli_layers': thermal.get('mli_layers', 15),
        'heat_pipes': thermal.get('heat_pipes', False),
        'warnings': warnings
    }


if __name__ == '__main__':
    test_sat = {
        'bus': {'dimensions_m': [0.2, 0.2, 0.4], 'mass_kg': 50},
        'thermal': {
            'radiators': [{'area_m2': 0.1, 'emissivity': 0.85, 'absorptivity': 0.15}],
            'mli_layers': 15,
            'heaters_w': 10,
            'heat_pipes': True
        },
        'power': {
            'solar_panels': [{'area_m2': 0.3, 'efficiency': 0.3}],
            'battery': {'capacity_wh': 100}
        },
        'payload': {
            'instruments': [{'power_w': 30}, {'power_w': 15}]
        },
        'comms': {
            'transponders': [{'power_w': 5}, {'power_w': 3}]
        },
        'orbit': {'altitude_km': 550}
    }
    print(json.dumps(analyze_thermal(test_sat), indent=2))