import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import generateRouter from './routes/generate.js';
import { validateSatellite } from '../validation/index.js';
import { setupWebSocketServer } from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static(join(__dirname, '../public')));

app.use('/api/generate', generateRouter);

app.post('/api/validate', async (req, res) => {
  try {
    const { satellite } = req.body;
    if (!satellite) {
      return res.status(400).json({ error: 'No satellite specification provided' });
    }
    const result = await validateSatellite(satellite);
    res.json(result);
  } catch (error) {
    console.error('[Validate] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/analyze-sketch', upload.single('sketch'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No sketch image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const analysis = await analyzeSketchWithNIM(base64Image, mimeType);
    res.json(analysis);
  } catch (error) {
    console.error('[Analyze Sketch] Error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function analyzeSketchWithNIM(base64Image, mimeType) {
  const nimUrl = process.env.NIM_URL || 'http://127.0.0.1:4000';
  const nimApiKey = process.env.NIM_API_KEY;

  try {
    const response = await fetch(`${nimUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(nimApiKey && { 'Authorization': `Bearer ${nimApiKey}` })
      },
      body: JSON.stringify({
        model: process.env.NIM_MODEL || 'nvidia/nemotron-3-ultra',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this satellite sketch and extract structured component data. Return JSON with:
- bus: { dimensions_m: [x,y,z], structure_material: string, mass_kg: number }
- power: { solar_array_area_m2: number, battery_capacity_wh: number, orbit_avg_power_w: number }
- comms: { antenna_type: string, frequency_band: string, tx_power_w: number, data_rate_mbps: number }
- thermal: { radiator_area_m2: number, heat_load_w: number, operating_temp_c: [min,max] }
- payload: { type: string, mass_kg: number, power_w: number, data_rate_mbps: number }
- orbit: { altitude_km: number, inclination_deg: number, eccentricity: number }
Only return valid JSON.`
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Image}` }
            }
          ]
        }],
        max_tokens: 2048,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`NIM API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    try {
      return JSON.parse(content);
    } catch {
      return getDefaultSatelliteSpec();
    }
  } catch (error) {
    console.warn('[NIM] Fallback to default spec:', error.message);
    return getDefaultSatelliteSpec();
  }
}

function getDefaultSatelliteSpec() {
  return {
    bus: { dimensions_m: [0.1, 0.1, 0.3], structure_material: 'aluminum', mass_kg: 4 },
    power: { solar_array_area_m2: 0.04, battery_capacity_wh: 20, orbit_avg_power_w: 5 },
    comms: { antenna_type: 'patch', frequency_band: 'UHF', tx_power_w: 1, data_rate_mbps: 0.01 },
    thermal: { radiator_area_m2: 0.02, heat_load_w: 3, operating_temp_c: [-20, 60] },
    payload: { type: 'camera', mass_kg: 0.5, power_w: 2, data_rate_mbps: 1 },
    orbit: { altitude_km: 500, inclination_deg: 97.4, eccentricity: 0.001 }
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

const server = createServer(app);
setupWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`🚀 StellarForge AI server running at http://localhost:${PORT}`);
  console.log(`📡 NIM endpoint: ${process.env.NIM_URL || 'http://127.0.0.1:4000'}`);
  console.log(`🔌 WebSocket available at ws://localhost:${PORT}/ws`);
});