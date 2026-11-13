import json
import math
from typing import Dict, Any

# Constants
BOLTZMANN = 1.380649e-23  # J/K
LIGHT_SPEED = 299792458  # m/s


def calculate_link_budget(satellite: Dict[str, Any], orbit: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate communication link budget for downlink and uplink."""
    comms = satellite.get('comms', {})
    antennas = comms.get('antennas', [])

    # Support both transponders array and legacy transponder_w/data_rate_mbps
    transponders = comms.get('transponders', [])
    if not transponders and 'transponder_w' in comms:
        transponders = [{
            'power_w': comms.get('transponder_w', 5),
            'data_rate_mbps': comms.get('data_rate_mbps', 10),
            'band': 'S-band'
        }]

    if not antennas or not transponders:
        return {'error': 'No antennas or transponders defined'}

    # Use best antenna (highest gain) and highest power transponder
    best_antenna = max(antennas, key=lambda a: a.get('gain_dbi', 0))
    best_tx = max(transponders, key=lambda t: t.get('power_w', 0))

    # Frequency
    freq_ghz = best_antenna.get('frequency_ghz', 2.4)
    freq_hz = freq_ghz * 1e9
    wavelength = LIGHT_SPEED / freq_hz

    # Antenna gains
    tx_gain_dbi = best_antenna.get('gain_dbi', 10)
    tx_gain = 10 ** (tx_gain_dbi / 10)

    # Ground station antenna (assume 15m dish at S-band, 10m at X-band)
    if freq_ghz < 4:
        gs_diameter = 15  # S-band
        gs_efficiency = 0.65
    else:
        gs_diameter = 10  # X-band
        gs_efficiency = 0.7

    gs_area = math.pi * (gs_diameter / 2) ** 2
    gs_gain = gs_efficiency * (math.pi * gs_diameter / wavelength) ** 2
    gs_gain_dbi = 10 * math.log10(gs_gain)

    # Transmit power
    tx_power_w = best_tx.get('power_w', 2)
    tx_power_dbm = 10 * math.log10(tx_power_w * 1000)

    # Range (slant range at min elevation)
    altitude = orbit.get('altitude_km', 550)
    min_elevation = 10  # degrees

    # Slant range calculation
    r_earth = 6371
    r_sat = r_earth + altitude
    max_slant_range = math.sqrt(r_sat**2 - r_earth**2 * math.cos(math.radians(min_elevation))**2) - r_earth * math.sin(math.radians(min_elevation))
    max_range_km = max_slant_range

    # Free space path loss
    fspl_db = 20 * math.log10(4 * math.pi * max_range_km * 1000 / wavelength)

    # Atmospheric loss
    atm_loss_db = 0.5  # Clear sky at S/X-band

    # Pointing losses
    pointing_loss_db = 0.5  # 0.5 dB each end

    # Polarization loss
    pol_loss_db = 0.3  # 0.3 dB for circular

    # Implementation loss
    impl_loss_db = 2.0

    # Total losses
    total_losses = fspl_db + atm_loss_db + pointing_loss_db + pol_loss_db + impl_loss_db

    # Received power (dBm)
    rx_power_dbm = tx_power_dbm + tx_gain_dbi + gs_gain_dbi - total_losses

    # Noise temperature
    if freq_ghz < 4:
        tsys = 150  # S-band
    else:
        tsys = 200  # X-band

    # Data rate
    data_rate_mbps = best_tx.get('data_rate_mbps', 1)
    data_rate_bps = data_rate_mbps * 1e6

    # Eb/N0 calculation
    # Eb/N0 (dB) = Pr (dBm) - 10*log10(k*T*R)
    # where k = Boltzmann, T = system noise temp, R = data rate
    noise_power_dbw = 10 * math.log10(BOLTZMANN * tsys * data_rate_bps)
    noise_power_dbm = noise_power_dbw + 30  # Convert dBW to dBm

    eb_n0_db = rx_power_dbm - noise_power_dbm

    # Required Eb/N0 for different modulations (with coding)
    # BPSK/QPSK with rate 1/2 coding: ~2-3 dB for BER 1e-5
    # Uncoded BPSK: ~9.6 dB for BER 1e-6
    required_eb_n0 = 4.0  # Coded QPSK

    link_margin = eb_n0_db - required_eb_n0

    # Contact time per pass
    angular_radius = math.acos(r_earth / r_sat * math.cos(math.radians(min_elevation)))
    pass_fraction = angular_radius / math.pi
    orbital_period = 90  # minutes, approximate
    contact_time_min = pass_fraction * orbital_period * 2  # Full pass

    # Data volume per pass
    data_per_pass_mb = data_rate_mbps * contact_time_min * 60 / 8  # MB

    # Passes per day
    orbits_per_day = 24 * 60 / orbital_period
    passes_per_day = orbits_per_day * 0.5  # ~half have ground station visibility

    return {
        'frequency_ghz': freq_ghz,
        'tx_power_w': tx_power_w,
        'tx_power_dbm': round(tx_power_dbm, 1),
        'tx_gain_dbi': tx_gain_dbi,
        'gs_diameter_m': gs_diameter,
        'gs_gain_dbi': round(gs_gain_dbi, 1),
        'max_range_km': round(max_range_km, 1),
        'fspl_db': round(fspl_db, 1),
        'total_losses_db': round(total_losses, 1),
        'rx_power_dbm': round(rx_power_dbm, 1),
        'data_rate_mbps': data_rate_mbps,
        'tsys_k': tsys,
        'eb_n0_db': round(eb_n0_db, 1),
        'required_eb_n0_db': required_eb_n0,
        'link_margin_db': round(link_margin, 1),
        'contact_time_min': round(contact_time_min, 1),
        'data_per_pass_mb': round(data_per_pass_mb, 1),
        'passes_per_day': round(passes_per_day, 1),
        'total_data_per_day_mb': round(data_per_pass_mb * passes_per_day, 1)
    }


def analyze_comms(satellite: Dict[str, Any]) -> Dict[str, Any]:
    """Main communications analysis entry point."""
    orbit = satellite.get('orbit', {})

    link = calculate_link_budget(satellite, orbit)

    if 'error' in link:
        return {
            'status': 'fail',
            'score': 0,
            'error': link['error'],
            'warnings': ['No communications system defined']
        }

    warnings = []
    if link['link_margin_db'] < 3:
        warnings.append(f"Low link margin: {link['link_margin_db']:.1f} dB (recommend >6 dB)")
    elif link['link_margin_db'] < 6:
        warnings.append(f"Marginal link margin: {link['link_margin_db']:.1f} dB (recommend >6 dB for telemetry)")
    if link['passes_per_day'] < 2:
        warnings.append(f"Limited ground contacts: {link['passes_per_day']:.1f} passes/day")
    if link['data_per_pass_mb'] < 10:
        warnings.append(f"Low data volume per pass: {link['data_per_pass_mb']:.1f} MB")

    # Score
    score = 100
    if link['link_margin_db'] < 3: score -= 30
    elif link['link_margin_db'] < 6: score -= 15
    if link['passes_per_day'] < 2: score -= 20
    if link['data_per_pass_mb'] < 10: score -= 15
    score = max(0, score)

    status = 'pass' if score >= 70 else 'conditional' if score >= 50 else 'fail'

    return {
        'status': status,
        'score': score,
        'frequency_ghz': link['frequency_ghz'],
        'tx_power_w': link['tx_power_w'],
        'tx_gain_dbi': link['tx_gain_dbi'],
        'gs_gain_dbi': link['gs_gain_dbi'],
        'max_range_km': link['max_range_km'],
        'link_margin_db': link['link_margin_db'],
        'data_rate_mbps': link['data_rate_mbps'],
        'contact_time_min': link['contact_time_min'],
        'data_per_pass_mb': link['data_per_pass_mb'],
        'passes_per_day': link['passes_per_day'],
        'total_data_per_day_mb': link['total_data_per_day_mb'],
        'eb_n0_db': link['eb_n0_db'],
        'warnings': warnings
    }


if __name__ == '__main__':
    test_sat = {
        'comms': {
            'antennas': [
                {'type': 'patch', 'gain_dbi': 8, 'frequency_ghz': 2.4, 'polarization': 'RHCP'},
                {'type': 'dish', 'gain_dbi': 25, 'frequency_ghz': 8.4, 'polarization': 'RHCP'}
            ],
            'transponders': [
                {'band': 'S-band', 'power_w': 2, 'data_rate_mbps': 1},
                {'band': 'X-band', 'power_w': 10, 'data_rate_mbps': 50}
            ]
        },
        'orbit': {'altitude_km': 550, 'inclination_deg': 97.4}
    }
    print(json.dumps(analyze_comms(test_sat), indent=2))