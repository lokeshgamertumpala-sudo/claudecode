import express from 'express';
import { analyzeSketch } from '../nim-client.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const SKETCH_PROMPT = fs.readFileSync(path.join(__dirname, '../../prompts/sketch-analysis.txt'), 'utf-8');

router.post('/', async (req, res) => {
  try {
    const { image, metadata } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Extract base64 from data URL if needed
    const base64 = image.includes('base64,') ? image.split('base64,')[1] : image;

    let result;
    try {
      result = await analyzeSketch(base64, SKETCH_PROMPT);
    } catch (nimError) {
      console.warn('[Analyze] NIM call failed, using mock:', nimError.message);
      return res.json(getMockAnalysis());
    }

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (e) {
      // Try to extract JSON from response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.warn('[Analyze] Failed to parse extracted JSON, using mock:', parseError.message);
          return res.json(getMockAnalysis());
        }
      } else {
        console.warn('[Analyze] No JSON found in response, using mock');
        return res.json(getMockAnalysis());
      }
    }

    // Ensure required structure
    if (!parsed.satellite) {
      console.warn('[Analyze] Invalid response structure, using mock');
      return res.json(getMockAnalysis());
    }

    // Add metadata
    parsed.confidence = parsed.confidence || 0.7;
    parsed.warnings = parsed.warnings || [];
    parsed.sketch_quality = parsed.sketch_quality || 'fair';

    res.json(parsed);
  } catch (error) {
    console.error('[Analyze] Unexpected error:', error.message);
    res.json(getMockAnalysis());
  }
});

function getMockAnalysis() {
  return {
    satellite: {
      bus: { type: 'smallsat', dimensions_m: [0.2, 0.2, 0.4], mass_kg: 12, structure_material: 'aluminum' },
      power: { solar_panels: [{ type: 'deployable', area_m2: 0.8, efficiency: 0.28, orientation: 'sun-tracking' }], battery_capacity_wh: 60 },
      comms: { antennas: [{ type: 'patch', frequency_ghz: 2.2, gain_dbi: 6, pointing: 'nadir' }], transponder_w: 5, data_rate_mbps: 10 },
      thermal: { radiators: [{ area_m2: 0.02, emissivity: 0.85, absorptivity: 0.15, location: 'external-panel' }], mli_layers: 15, heaters_w: 5, heat_pipes: false },
      payload: { instruments: [{ name: 'camera', type: 'camera', power_w: 3, data_rate_mbps: 10, mass_kg: 0.5, fov_deg: 30, aperture_m: 0.05 }] },
      adcs: { type: '3-axis', actuators: ['reaction-wheels', 'magnetorquers'], sensors: ['sun-sensor', 'magnetometer', 'gyro'], pointing_accuracy_deg: 1 },
      propulsion: { type: 'none', delta_v_ms: 0, thrusters: 0 },
      orbit: { type: 'LEO', altitude_km: 550, inclination_deg: 97.4, eccentricity: 0.001, ltan: '10:30' }
    },
    confidence: 0.75,
    warnings: ['Using mock data - NIM API unavailable'],
    sketch_quality: 'fair'
  };
}

export default router;