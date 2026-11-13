import dotenv from 'dotenv';
dotenv.config();

const NIM_ENDPOINT = process.env.NIM_ENDPOINT || 'http://127.0.0.1:4000';
const NIM_API_KEY = process.env.NIM_API_KEY || '';
const VISION_MODEL = process.env.NIM_VISION_MODEL || 'nvidia/nemotron-3-ultra';

const COMPONENT_PROMPT = `You are a satellite design expert analyzing a hand-drawn sketch. Identify and classify all visible components.

Return ONLY valid JSON with this exact structure:
{
  "components": [
    {
      "type": "solar_panel|antenna|body|thruster|sensor|battery|radiator|payload|unknown",
      "label": "descriptive name",
      "bbox": [x, y, width, height],
      "confidence": 0.0-1.0,
      "properties": {}
    }
  ],
  "confidence": 0.0-1.0,
  "warnings": []
}

Component types: solar_panel, antenna, body, thruster, sensor, battery, radiator, payload, unknown
Focus on: shape recognition, relative positioning, component relationships`;

async function callNIMVision(base64Image, mimeType) {
  const payload = {
    model: VISION_MODEL,
    messages: [
      {
        role: 'system',
        content: COMPONENT_PROMPT
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this satellite sketch and identify all components.' },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
        ]
      }
    ],
    max_tokens: 2048,
    temperature: 0.1,
    response_format: { type: 'json_object' }
  };

  const headers = {
    'Content-Type': 'application/json',
    ...(NIM_API_KEY && { 'Authorization': `Bearer ${NIM_API_KEY}` })
  };

  const response = await fetch(`${NIM_ENDPOINT}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NIM API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Empty response from NIM');
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`Failed to parse NIM response: ${content}`);
  }
}

function fallbackAnalysis(base64Image) {
  return {
    components: [
      { type: 'body', label: 'Main Satellite Bus', bbox: [100, 100, 200, 150], confidence: 0.7, properties: {} },
      { type: 'solar_panel', label: 'Solar Array (Left)', bbox: [50, 120, 50, 100], confidence: 0.6, properties: {} },
      { type: 'solar_panel', label: 'Solar Array (Right)', bbox: [300, 120, 50, 100], confidence: 0.6, properties: {} },
      { type: 'antenna', label: 'Communication Antenna', bbox: [180, 50, 40, 40], confidence: 0.5, properties: {} }
    ],
    confidence: 0.6,
    warnings: ['Using fallback analysis - NIM endpoint unavailable']
  };
}

export async function analyzeSketch(base64Image, mimeType) {
  try {
    const result = await callNIMVision(base64Image, mimeType);

    if (!result.components || !Array.isArray(result.components)) {
      throw new Error('Invalid response structure from NIM');
    }

    return {
      components: result.components.map(c => ({
        type: c.type || 'unknown',
        label: c.label || 'Unlabeled Component',
        bbox: Array.isArray(c.bbox) && c.bbox.length === 4 ? c.bbox : [0, 0, 100, 100],
        confidence: Math.max(0, Math.min(1, c.confidence || 0.5)),
        properties: c.properties || {}
      })),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      warnings: Array.isArray(result.warnings) ? result.warnings : []
    };
  } catch (error) {
    console.warn('NIM analysis failed, using fallback:', error.message);
    return fallbackAnalysis(base64Image);
  }
}

export async function checkNIMHealth() {
  try {
    const response = await fetch(`${NIM_ENDPOINT}/v1/models`, {
      method: 'GET',
      headers: { ...(NIM_API_KEY && { 'Authorization': `Bearer ${NIM_API_KEY}` }) }
    });
    return response.ok;
  } catch {
    return false;
  }
}