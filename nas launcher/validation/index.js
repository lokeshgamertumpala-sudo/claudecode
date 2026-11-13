import { validateOrbital } from './orbital.js';
import { validatePower } from './power.js';
import { validateStructural } from './structural.js';

export async function validateSatellite(satellite) {
  const results = await Promise.allSettled([
    validateOrbital(satellite),
    validatePower(satellite),
    validateStructural(satellite)
  ]);

  const orbital = results[0].status === 'fulfilled' ? results[0].value : { passed: false, error: results[0].reason?.message };
  const power = results[1].status === 'fulfilled' ? results[1].value : { passed: false, error: results[1].reason?.message };
  const structural = results[2].status === 'fulfilled' ? results[2].value : { passed: false, error: results[2].reason?.message };

  const allPassed = orbital.passed && power.passed && structural.passed;
  const warnings = [...(orbital.warnings || []), ...(power.warnings || []), ...(structural.warnings || [])];
  const errors = [...(orbital.errors || []), ...(power.errors || []), ...(structural.errors || [])];

  return {
    passed: allPassed,
    orbital,
    power,
    structural,
    warnings,
    errors,
    timestamp: new Date().toISOString()
  };
}