#!/usr/bin/env python3
"""
StellarForge AI - Validation Runner
Orchestrates all physics validation modules and outputs aggregated JSON report.
"""
import json
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

# Import validation modules
sys.path.insert(0, str(Path(__file__).parent))

from orbital import analyze_orbital
from thermal import analyze_thermal
from power import analyze_power
from comms import analyze_comms
from structural import analyze_structural


def run_validation(satellite_spec: dict) -> dict:
    """Run all validation modules and aggregate results."""

    results = {}
    errors = []

    # Run each validator
    validators = [
        ('orbital', analyze_orbital),
        ('thermal', analyze_thermal),
        ('power', analyze_power),
        ('comms', analyze_comms),
        ('structural', analyze_structural)
    ]

    for name, validator in validators:
        try:
            result = validator(satellite_spec)
            results[name] = result
            print(f"[{name}] Completed - Status: {result.get('status', 'unknown')}, Score: {result.get('score', 0)}", file=sys.stderr)
        except Exception as e:
            error_msg = f"{name} validation failed: {str(e)}"
            print(f"[{name}] ERROR: {error_msg}", file=sys.stderr)
            traceback.print_exc(file=sys.stderr)
            errors.append(error_msg)
            results[name] = {
                'status': 'error',
                'score': 0,
                'error': str(e)
            }

    # Calculate overall score
    valid_scores = [r.get('score', 0) for r in results.values() if 'score' in r and r['status'] != 'error']
    overall_score = sum(valid_scores) / len(valid_scores) if valid_scores else 0

    # Determine overall status
    statuses = [r.get('status', 'fail') for r in results.values()]
    if 'error' in statuses:
        overall_status = 'error'
    elif all(s == 'pass' for s in statuses):
        overall_status = 'pass'
    elif any(s == 'fail' for s in statuses):
        overall_status = 'fail'
    else:
        overall_status = 'conditional'

    # Collect all warnings
    all_warnings = []
    for name, result in results.items():
        if 'warnings' in result:
            for w in result['warnings']:
                all_warnings.append(f"[{name}] {w}")

    # Collect all recommendations
    recommendations = []
    if overall_score < 50:
        recommendations.append("Fundamental redesign recommended - multiple subsystems fail validation")
    elif overall_score < 70:
        recommendations.append("Significant design changes needed before proceeding to detailed design")
    else:
        recommendations.append("Design is viable - proceed to detailed design with noted improvements")

    # Add category-specific recommendations
    for name, result in results.items():
        if 'warnings' in result and result['warnings']:
            cat_name = name.capitalize()
            for w in result['warnings'][:2]:  # Top 2 warnings per category
                recommendations.append(f"{cat_name}: {w}")

    # Aggregate report
    report = {
        'overall': {
            'status': overall_status,
            'score': round(overall_score, 1),
            'summary': get_summary(overall_status, overall_score)
        },
        'orbital': results.get('orbital', {}),
        'thermal': results.get('thermal', {}),
        'power': results.get('power', {}),
        'comms': results.get('comms', {}),
        'structural': results.get('structural', {}),
        'warnings': all_warnings,
        'recommendations': recommendations[:8],  # Limit to top 8
        'errors': errors,
        'timestamp': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    }

    return report


def get_summary(status: str, score: float) -> str:
    """Generate human-readable summary."""
    if status == 'pass':
        return f"Design validated successfully (Score: {score:.0f}/100). All subsystems meet requirements."
    elif status == 'conditional':
        return f"Design viable with modifications (Score: {score:.0f}/100). Some subsystems need improvement."
    elif status == 'fail':
        return f"Design requires major changes (Score: {score:.0f}/100). Multiple subsystems fail validation."
    else:
        return f"Validation incomplete due to errors (Score: {score:.0f}/100)."


def main():
    """Main entry point - reads satellite spec from file or stdin."""
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
        try:
            with open(input_file, 'r') as f:
                satellite = json.load(f)
        except Exception as e:
            print(f"Error reading input file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Read from stdin
        try:
            satellite = json.load(sys.stdin)
        except Exception as e:
            print(f"Error reading stdin: {e}", file=sys.stderr)
            sys.exit(1)

    # Run validation
    report = run_validation(satellite)

    # Output JSON to stdout
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()