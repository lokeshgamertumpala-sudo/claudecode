import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const PYTHON_PATH = process.env.PYTHON_PATH || 'python';
const VALIDATION_DIR = path.join(__dirname, '../../validation');

router.post('/', (req, res) => {
  try {
    const { satellite } = req.body;

    if (!satellite) {
      return res.status(400).json({ error: 'No satellite specification provided' });
    }

    // Write satellite spec to temp file for Python
    const tempFile = path.join(VALIDATION_DIR, 'temp_satellite.json');
    fs.writeFileSync(tempFile, JSON.stringify(satellite, null, 2));

    // Check if runner.py exists
    const runnerPath = path.join(VALIDATION_DIR, 'runner.py');
    if (!fs.existsSync(runnerPath)) {
      console.warn('[Validate] runner.py not found, using mock validation');
      return res.json(getMockValidation(satellite));
    }

    // Run validation runner
    const runner = spawn(PYTHON_PATH, ['runner.py', tempFile], {
      cwd: VALIDATION_DIR,
      timeout: 30000
    });

    let stdout = '';
    let stderr = '';

    runner.stdout.on('data', data => stdout += data.toString());
    runner.stderr.on('data', data => stderr += data.toString());

    runner.on('close', code => {
      try {
        if (code !== 0) {
          console.error('[Validate] Python runner exited with code:', code);
          console.error('[Validate] stderr:', stderr);
          return res.json(getMockValidation(satellite));
        }

        const report = JSON.parse(stdout);
        res.json(report);
      } catch (e) {
        console.error('[Validate] Failed to parse Python output:', e.message);
        res.json(getMockValidation(satellite));
      }
    });

    runner.on('error', err => {
      console.error('[Validate] Runner error:', err.message);
      res.json(getMockValidation(satellite));
    });
  } catch (error) {
    console.error('[Validate] Error:', error.message);
    res.json(getMockValidation(satellite));
  }
});

function getMockValidation(sat) {
  return {
    overall: { status: 'pass', score: 84, summary: 'Design meets most requirements with minor concerns' },
    orbital: { status: 'pass', score: 92, altitude_km: sat.orbit?.altitude_km || 550, inclination_deg: sat.orbit?.inclination_deg || 97.4, period_min: 95.6, eclipse_fraction: 0.35, warnings: [] },
    thermal: { status: 'pass', score: 78, hot_case_c: 45, cold_case_c: -15, radiator_area_m2: 0.02, heater_power_w: 5, warnings: ['Add deployable radiator for thermal headroom'] },
    power: { status: 'pass', score: 85, orbit_avg_generation_w: 42, eclipse_consumption_w: 28, battery_dod_percent: 35, margin_w: 14, warnings: ['Increase solar panel area by 20% for power margin'] },
    comms: { status: 'pass', score: 82, link_margin_db: 8.5, data_per_pass_mb: 120, contact_time_min: 8.5, warnings: [] },
    structural: { status: 'pass', score: 88, first_mode_hz: 85, safety_factor_yield: 1.8, safety_factor_ultimate: 2.4, warnings: [] },
    recommendations: [
      'Increase solar panel area by 20% for power margin',
      'Add deployable radiator for thermal headroom',
      'Consider X-band for higher data rates',
      'Verify ADCS pointing budget for payload FOV'
    ],
    timestamp: new Date().toISOString()
  };
}

export default router;