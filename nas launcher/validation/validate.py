#!/usr/bin/env python3
import json
import sys
import math

def validate_orbital(sat):
    issues = []
    orbit = sat.get('orbit', {})
    altitude = orbit.get('altitude_km')
    inclination = orbit.get('inclination_deg')
    eccentricity = orbit.get('eccentricity', 0)

    if altitude is None:
        issues.append({'type': 'error', 'category': 'orbital', 'message': 'Orbit altitude required'})
    elif altitude < 160:
        issues.append({'type': 'error', 'category': 'orbital', 'message': f'Altitude {altitude}km too low (min 160km)'})
    elif altitude > 2000:
        issues.append({'type': 'warning', 'category': 'orbital', 'message': f'Altitude {altitude}km > 2000km (LEO range)'})

    if inclination is not None and (inclination < 0 or inclination > 180):
        issues.append({'type': 'error', 'category': 'orbital', 'message': f'Inclination {inclination}° out of range [0,180]'})

    if eccentricity < 0 or eccentricity >= 1:
        issues.append({'type': 'error', 'category': 'orbital', 'message': f'Eccentricity {eccentricity} invalid [0,1)'})

    period_min = None
    if altitude:
        mu = 398600.4418
        r = 6371 + altitude
        period_min = 2 * math.pi * math.sqrt(r**3 / mu) / 60

    return {'issues': issues, 'period_min': period_min}

def validate_power(sat):
    issues = []
    power = sat.get('power', {})
    solar_area = power.get('solar_area_m2', 0)
    battery_wh = power.get('battery_wh', 0)
    avg_power_w = power.get('avg_power_w', 0)
    orbit = sat.get('orbit', {})
    altitude = orbit.get('altitude_km', 500)

    if solar_area <= 0:
        issues.append({'type': 'error', 'category': 'power', 'message': 'Solar array area required'})

    if avg_power_w <= 0:
        issues.append({'type': 'error', 'category': 'power', 'message': 'Average power consumption required'})

    solar_constant = 1361
    efficiency = 0.28
    eclipse_fraction = 0.35
    generated_w = solar_area * solar_constant * efficiency * (1 - eclipse_fraction)

    if generated_w < avg_power_w:
        issues.append({'type': 'warning', 'category': 'power', 'message': f'Power deficit: {avg_power_w:.0f}W needed, {generated_w:.0f}W generated'})

    orbit_period = 2 * math.pi * math.sqrt((6371 + altitude)**3 / 398600.4418) / 60
    eclipse_min = orbit_period * eclipse_fraction
    energy_needed_wh = avg_power_w * eclipse_min / 60

    if battery_wh < energy_needed_wh:
        issues.append({'type': 'warning', 'category': 'power', 'message': f'Battery {battery_wh}Wh < eclipse need {energy_needed_wh:.0f}Wh'})

    return {'issues': issues, 'generated_w': generated_w, 'eclipse_min': eclipse_min, 'energy_needed_wh': energy_needed_wh}

def validate_structural(sat):
    issues = []
    bus = sat.get('bus', {})
    dims = bus.get('dimensions_m', [0.1, 0.1, 0.3])
    mass = bus.get('mass_kg', 0)
    material = bus.get('structure_material', 'aluminum')

    if mass <= 0:
        issues.append({'type': 'error', 'category': 'structural', 'message': 'Bus mass required'})

    volume = dims[0] * dims[1] * dims[2]
    density = {'aluminum': 2700, 'titanium': 4500, 'carbon-fiber': 1600, 'steel': 7850}.get(material, 2700)
    estimated_mass = volume * density * 0.3

    if mass > estimated_mass * 3:
        issues.append({'type': 'warning', 'category': 'structural', 'message': f'Mass {mass}kg high for volume {volume:.3f}m³'})

    payload = sat.get('payload', {})
    payload_mass = payload.get('mass_kg', 0)
    if payload_mass > mass * 0.6:
        issues.append({'type': 'warning', 'category': 'structural', 'message': f'Payload {payload_mass}kg > 60% bus mass'})

    return {'issues': issues, 'volume_m3': volume, 'estimated_mass_kg': estimated_mass}

def validate_thermal(sat):
    issues = []
    thermal = sat.get('thermal', {})
    radiator_area = thermal.get('radiator_area_m2', 0)
    power = sat.get('power', {})
    avg_power_w = power.get('avg_power_w', 0)

    if radiator_area <= 0 and avg_power_w > 50:
        issues.append({'type': 'warning', 'category': 'thermal', 'message': 'Radiator area recommended for >50W dissipation'})

    stefan_boltzmann = 5.67e-8
    emissivity = 0.85
    if radiator_area > 0:
        max_dissipation = radiator_area * emissivity * stefan_boltzmann * (320**4 - 270**4)
        if avg_power_w > max_dissipation:
            issues.append({'type': 'warning', 'category': 'thermal', 'message': f'Power {avg_power_w}W > radiator capacity {max_dissipation:.0f}W'})

    return {'issues': issues}

def validate_communications(sat):
    issues = []
    comms = sat.get('comms', {})
    freq = comms.get('frequency_ghz')
    tx_power = comms.get('tx_power_w', 0)
    antenna_gain = comms.get('antenna_gain_dbi', 0)
    data_rate = comms.get('data_rate_mbps', 0)
    orbit = sat.get('orbit', {})
    altitude = orbit.get('altitude_km', 500)

    if not freq:
        issues.append({'type': 'error', 'category': 'communications', 'message': 'Frequency band required'})
    elif freq < 1 or freq > 40:
        issues.append({'type': 'warning', 'category': 'communications', 'message': f'Frequency {freq}GHz unusual for satcom'})

    if tx_power <= 0:
        issues.append({'type': 'error', 'category': 'communications', 'message': 'TX power required'})

    wavelength = 3e8 / (freq * 1e9) if freq else 0.1
    range_m = (altitude + 6371) * 1000 * 2
    fspl_db = 20 * math.log10(range_m) + 20 * math.log10(freq * 1e9) - 147.55
    eirp = 10 * math.log10(tx_power) + antenna_gain
    margin = eirp - fspl_db + 10

    if margin < 3:
        issues.append({'type': 'warning', 'category': 'communications', 'message': f'Link margin {margin:.1f}dB low (need >3dB)'})

    return {'issues': issues, 'link_margin_db': margin, 'fspl_db': fspl_db}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No satellite spec provided'}))
        sys.exit(1)

    try:
        sat = json.loads(sys.argv[1])
    except json.JSONDecodeError as e:
        print(json.dumps({'error': f'Invalid JSON: {e}'}))
        sys.exit(1)

    results = {
        'orbital': validate_orbital(sat),
        'power': validate_power(sat),
        'structural': validate_structural(sat),
        'thermal': validate_thermal(sat),
        'communications': validate_communications(sat)
    }

    all_issues = []
    for cat, res in results.items():
        for issue in res.get('issues', []):
            issue['category'] = cat
            all_issues.append(issue)

    results['all_issues'] = all_issues
    results['passed'] = len([i for i in all_issues if i['type'] == 'error']) == 0

    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()