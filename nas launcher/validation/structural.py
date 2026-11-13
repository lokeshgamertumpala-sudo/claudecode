import json
import math
from typing import Dict, Any


def estimate_mass_properties(satellite: Dict[str, Any]) -> Dict[str, float]:
    """Estimate mass and CG from components."""
    bus = satellite.get('bus', {})
    power = satellite.get('power', {})
    comms = satellite.get('comms', {})
    thermal = satellite.get('thermal', {})
    payload = satellite.get('payload', {})
    adcs = satellite.get('adcs', {})
    propulsion = satellite.get('propulsion', {})

    # Base bus structure mass (from dimensions and material)
    dims = bus.get('dimensions_m', [0.1, 0.1, 0.3])
    volume = dims[0] * dims[1] * dims[2]
    material = bus.get('structure_material', 'aluminum')
    density = {'aluminum': 2700, 'composite': 1600, 'titanium': 4500}.get(material, 2700)
    # Structure is ~10% of volume as material
    struct_mass = volume * density * 0.1

    # Solar panels
    solar_mass = sum(p.get('area_m2', 0) * 2.5 for p in power.get('solar_panels', []))  # 2.5 kg/m2

    # Battery
    battery_wh = power.get('battery', {}).get('capacity_wh', 50)
    battery_mass = battery_wh / 200  # 200 Wh/kg for Li-ion

    # Antennas
    antenna_mass = sum(2.0 if a.get('type') == 'dish' else 0.5 for a in comms.get('antennas', []))

    # Transponders
    transponder_mass = sum(0.8 for t in comms.get('transponders', []))

    # Radiators
    radiator_mass = sum(r.get('area_m2', 0) * 3.0 for r in thermal.get('radiators', []))

    # MLI
    mli_mass = thermal.get('mli_layers', 15) * 0.02 * sum(dims) * 2  # Rough estimate

    # Payload
    payload_mass = sum(inst.get('mass_kg', 1.0) for inst in payload.get('instruments', []))

    # ADCS
    adcs_mass = 3.0  # Reaction wheels + magnetorquers

    # Propulsion
    prop_mass = 0
    if propulsion.get('type') != 'none':
        prop_mass = propulsion.get('delta_v_ms', 0) * bus.get('mass_kg', 50) / 3000  # Rough rocket equation

    # Harness & margins (20%)
    dry_mass = (struct_mass + solar_mass + battery_mass + antenna_mass +
                transponder_mass + radiator_mass + mli_mass + payload_mass +
                adcs_mass + prop_mass)
    total_mass = dry_mass * 1.2

    return {
        'structure_kg': struct_mass,
        'solar_kg': solar_mass,
        'battery_kg': battery_mass,
        'antenna_kg': antenna_mass,
        'transponder_kg': transponder_mass,
        'radiator_kg': radiator_mass,
        'mli_kg': mli_mass,
        'payload_kg': payload_mass,
        'adcs_kg': adcs_mass,
        'propulsion_kg': prop_mass,
        'dry_mass_kg': dry_mass,
        'total_mass_kg': total_mass,
        'specified_mass_kg': bus.get('mass_kg', total_mass)
    }


def calculate_modal_frequency(satellite: Dict[str, Any], mass_props: Dict[str, float]) -> Dict[str, float]:
    """Estimate first modal frequency."""
    bus = satellite.get('bus', {})
    dims = bus.get('dimensions_m', [0.1, 0.1, 0.3])
    material = bus.get('structure_material', 'aluminum')

    # Material properties
    props = {
        'aluminum': {'E': 70e9, 'rho': 2700},
        'composite': {'E': 140e9, 'rho': 1600},
        'titanium': {'E': 110e9, 'rho': 4500}
    }
    mat = props.get(material, props['aluminum'])

    # Equivalent beam model for satellite bus
    # First bending mode of cantilever beam: f = 0.56 * sqrt(E*I / (m*L^3))
    L = max(dims)  # Longest dimension
    I = min(dims[0], dims[1]) ** 4 / 12  # Second moment of area (simplified)
    m = mass_props['total_mass_kg']

    f_hz = 0.56 * math.sqrt(mat['E'] * I / (m * L**3))

    # Apply factor for real spacecraft (typically 1.5-2x higher than simple beam)
    f_hz *= 1.8

    return {
        'first_mode_hz': f_hz,
        'length_m': L,
        'equivalent_e_gnpa': mat['E'] / 1e9
    }


def calculate_loads(satellite: Dict[str, Any], mass_props: Dict[str, float]) -> Dict[str, float]:
    """Calculate quasi-static launch loads."""
    mass = mass_props['total_mass_kg']

    # Launch vehicle loads (typical for smallsat rideshare)
    # Axial: 10-15g, Lateral: 5-8g
    axial_g = 12
    lateral_g = 6

    axial_load_n = mass * axial_g * 9.81
    lateral_load_n = mass * lateral_g * 9.81

    # Bending moment at base
    dims = satellite.get('bus', {}).get('dimensions_m', [0.1, 0.1, 0.3])
    L = max(dims)
    bending_moment_nm = lateral_load_n * L / 2

    return {
        'axial_g': axial_g,
        'lateral_g': lateral_g,
        'axial_load_n': axial_load_n,
        'lateral_load_n': lateral_load_n,
        'bending_moment_nm': bending_moment_nm
    }


def calculate_stress(satellite: Dict[str, Any], loads: Dict[str, float], mass_props: Dict[str, float]) -> Dict[str, float]:
    """Calculate structural stresses."""
    bus = satellite.get('bus', {})
    dims = bus.get('dimensions_m', [0.1, 0.1, 0.3])
    material = bus.get('structure_material', 'aluminum')

    # Material strength
    strengths = {
        'aluminum': {'yield_mpa': 280, 'ultimate_mpa': 310},
        'composite': {'yield_mpa': 600, 'ultimate_mpa': 800},
        'titanium': {'yield_mpa': 880, 'ultimate_mpa': 950}
    }
    mat = strengths.get(material, strengths['aluminum'])

    # Cross-section at base
    A = dims[0] * dims[1]  # m2
    I = dims[0] * dims[1]**3 / 12  # m4 (bending about weak axis)
    c = dims[1] / 2

    # Axial stress
    sigma_axial = loads['axial_load_n'] / A / 1e6  # MPa

    # Bending stress
    sigma_bending = loads['bending_moment_nm'] * c / I / 1e6  # MPa

    # Combined stress
    sigma_combined = sigma_axial + sigma_bending

    # Safety factors
    sf_yield = mat['yield_mpa'] / sigma_combined if sigma_combined > 0 else 999
    sf_ultimate = mat['ultimate_mpa'] / sigma_combined if sigma_combined > 0 else 999

    return {
        'axial_stress_mpa': sigma_axial,
        'bending_stress_mpa': sigma_bending,
        'combined_stress_mpa': sigma_combined,
        'yield_strength_mpa': mat['yield_mpa'],
        'ultimate_strength_mpa': mat['ultimate_mpa'],
        'safety_factor_yield': sf_yield,
        'safety_factor_ultimate': sf_ultimate
    }


def check_cg_envelope(satellite: Dict[str, Any], mass_props: Dict[str, float]) -> Dict[str, Any]:
    """Check CG location against launcher envelope."""
    bus = satellite.get('bus', {})
    dims = bus.get('dimensions_m', [0.1, 0.1, 0.3])

    # Typical launcher CG envelope: +/- 2-3 cm from geometric center
    cg_limit = 0.03  # 3 cm

    # Estimate CG offset (simplified - assume symmetric)
    cg_offset_x = 0.0
    cg_offset_y = 0.0
    cg_offset_z = 0.0

    # Check if within envelope
    within_x = abs(cg_offset_x) <= cg_limit
    within_y = abs(cg_offset_y) <= cg_limit
    within_z = abs(cg_offset_z) <= cg_limit

    return {
        'cg_offset_x_m': cg_offset_x,
        'cg_offset_y_m': cg_offset_y,
        'cg_offset_z_m': cg_offset_z,
        'cg_limit_m': cg_limit,
        'within_envelope': within_x and within_y and within_z
    }


def analyze_structural(satellite: Dict[str, Any]) -> Dict[str, Any]:
    """Main structural analysis entry point."""
    mass_props = estimate_mass_properties(satellite)
    modal = calculate_modal_frequency(satellite, mass_props)
    loads = calculate_loads(satellite, mass_props)
    stress = calculate_stress(satellite, loads, mass_props)
    cg = check_cg_envelope(satellite, mass_props)

    warnings = []
    if modal['first_mode_hz'] < 50:
        warnings.append(f"First mode {modal['first_mode_hz']:.1f} Hz below 50 Hz requirement")
    if modal['first_mode_hz'] < 35:
        warnings.append(f"First mode critically low: {modal['first_mode_hz']:.1f} Hz")
    if stress['safety_factor_yield'] < 1.5:
        warnings.append(f"Yield SF {stress['safety_factor_yield']:.2f} below 1.5 requirement")
    if stress['safety_factor_ultimate'] < 2.0:
        warnings.append(f"Ultimate SF {stress['safety_factor_ultimate']:.2f} below 2.0 requirement")
    if not cg['within_envelope']:
        warnings.append("CG outside launcher envelope")

    # Compare with specified mass
    mass_diff = abs(mass_props['total_mass_kg'] - mass_props['specified_mass_kg']) / mass_props['specified_mass_kg']
    if mass_diff > 0.2:
        warnings.append(f"Mass estimate differs from spec by {mass_diff:.0%}")

    # Score
    score = 100
    if modal['first_mode_hz'] < 50: score -= 20
    if modal['first_mode_hz'] < 35: score -= 15
    if stress['safety_factor_yield'] < 1.5: score -= 20
    if stress['safety_factor_ultimate'] < 2.0: score -= 15
    if not cg['within_envelope']: score -= 10
    if mass_diff > 0.2: score -= 10
    score = max(0, score)

    status = 'pass' if score >= 70 else 'conditional' if score >= 50 else 'fail'

    return {
        'status': status,
        'score': score,
        'total_mass_kg': round(mass_props['total_mass_kg'], 1),
        'dry_mass_kg': round(mass_props['dry_mass_kg'], 1),
        'mass_breakdown': {k: round(v, 2) for k, v in mass_props.items() if k.endswith('_kg') and k != 'total_mass_kg' and k != 'dry_mass_kg' and k != 'specified_mass_kg'},
        'first_mode_hz': round(modal['first_mode_hz'], 1),
        'axial_load_g': loads['axial_g'],
        'lateral_load_g': loads['lateral_g'],
        'combined_stress_mpa': round(stress['combined_stress_mpa'], 1),
        'yield_strength_mpa': stress['yield_strength_mpa'],
        'ultimate_strength_mpa': stress['ultimate_strength_mpa'],
        'safety_factor_yield': round(stress['safety_factor_yield'], 2),
        'safety_factor_ultimate': round(stress['safety_factor_ultimate'], 2),
        'cg_within_envelope': cg['within_envelope'],
        'warnings': warnings
    }


if __name__ == '__main__':
    test_sat = {
        'bus': {'dimensions_m': [0.2, 0.2, 0.4], 'mass_kg': 50, 'structure_material': 'aluminum'},
        'power': {'solar_panels': [{'area_m2': 0.3}], 'battery': {'capacity_wh': 100}},
        'comms': {'antennas': [{'type': 'patch'}, {'type': 'dish'}], 'transponders': [{}, {}]},
        'thermal': {'radiators': [{'area_m2': 0.1}], 'mli_layers': 15},
        'payload': {'instruments': [{'mass_kg': 2.0}, {'mass_kg': 1.5}]},
        'adcs': {'type': '3-axis', 'actuators': ['reaction-wheels', 'magnetorquers']},
        'propulsion': {'type': 'cold-gas', 'delta_v_ms': 50}
    }
    print(json.dumps(analyze_structural(test_sat), indent=2))