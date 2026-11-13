import type { AIAnalysisResult, DetectedComponent, DimensionEstimate, SketchUpload } from '@/types';

const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1';
const MODEL_ID = 'moonshotai/kimi-k2-instruct';

interface NVIDIAMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;
}

interface NVIDIARequest {
  model: string;
  messages: NVIDIAMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

interface NVIDIAResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: NVIDIAMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class NVIDIAService {
  private apiKey: string | null = null;
  private baseUrl: string = NVIDIA_API_BASE;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.startsWith('nvapi-');
  }

  async analyzeSketch(sketch: SketchUpload): Promise<AIAnalysisResult> {
    if (!this.isConfigured()) {
      return this.getMockAnalysis(sketch);
    }

    try {
      const base64Image = sketch.preview.split(',')[1];
      const systemPrompt = `You are an aerospace engineering AI assistant specialized in spacecraft design analysis.
Analyze the uploaded 2D spacecraft sketch and identify:
1. Visible spacecraft components (main body, solar panels, antennas, dishes, instruments, sensors, propulsion, structural elements)
2. Any visible dimension labels or scale indicators
3. Spatial relationships between components
4. Estimated dimensions based on visual proportions

Return a structured JSON response with:
- components: array of detected components with type, name, boundingBox [x,y,width,height], confidence (0-1), detectedLabels
- dimensions: array of dimension estimates with componentId, dimension (width/height/depth/radius), value, unit, source (detected/inferred/user_provided/default), confidence, labelText
- confidence: overall confidence 0-1
- rawResponse: your full analysis text

Component types: main_body, solar_panel, antenna, communication_dish, instrument, sensor, propulsion, structural_support, battery, thermal_control, reaction_wheel, star_tracker

Be precise. Distinguish between detected measurements (from labels/scale) and inferred estimates (from visual proportions).`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this spacecraft sketch and extract components and dimensions.' },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
              ],
            },
          ],
          max_tokens: 2048,
          temperature: 0.1,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`NVIDIA API error: ${response.status} - ${error}`);
      }

      const data: NVIDIAResponse = await response.json();
      const content = data.choices[0]?.message?.content || '';

      return this.parseAnalysisResponse(content);
    } catch (error) {
      console.error('NVIDIA API error:', error);
      return this.getMockAnalysis(sketch);
    }
  }

  async explainSimulationResults(data: {
    orbitalAnalysis: any;
    massBudget: any;
    powerBudget: any;
    constraints: any;
  }): Promise<string> {
    if (!this.isConfigured()) {
      return this.getMockExplanation(data);
    }

    try {
      const systemPrompt = `You are an aerospace engineering AI assistant. Explain the mission simulation results
using the provided actual calculated data. Be specific with numbers and units.
Identify key trade-offs, constraint violations, and recommendations.
Do not fabricate calculations. Reference the actual data provided.`;

      const userPrompt = `Analyze these mission simulation results:

ORBITAL ANALYSIS:
- Period: ${data.orbitalAnalysis.period?.toFixed(1)} s (${(data.orbitalAnalysis.period / 3600).toFixed(2)} h)
- Velocity: ${data.orbitalAnalysis.velocity?.toFixed(1)} m/s
- Angular Velocity: ${data.orbitalAnalysis.angularVelocity?.toFixed(6)} rad/s
- Eclipse Fraction: ${(data.orbitalAnalysis.eclipseFraction * 100).toFixed(1)}%
- Ground Track Repeat: ${data.orbitalAnalysis.groundTrackRepeat} orbits/day
- Radiation Exposure (1 yr): ${data.orbitalAnalysis.radiationExposure?.toExponential(2)} rad
- Thermal Cycles (1 yr): ${data.orbitalAnalysis.thermalCycles}

MASS BUDGET:
- Total Dry Mass: ${data.massBudget.totalDryMass?.toFixed(1)} kg
- Propellant Mass: ${data.massBudget.propellantMass?.toFixed(1)} kg
- Total Wet Mass: ${data.massBudget.totalWetMass?.toFixed(1)} kg
- Mass Limit: ${data.massBudget.massLimit} kg
- Margin: ${data.massBudget.margin?.toFixed(1)} kg (${data.massBudget.marginPercent?.toFixed(1)}%)
- Breakdown: Body: ${data.massBudget.mainBody} kg, Solar: ${data.massBudget.solarPanels} kg, Instruments: ${data.massBudget.instruments} kg, Comm: ${data.massBudget.communications} kg, Prop: ${data.massBudget.propulsion} kg

POWER BUDGET:
- Solar Panel Area: ${data.powerBudget.solarPanelArea?.toFixed(2)} m²
- Generated Power: ${data.powerBudget.generatedPower?.toFixed(1)} W
- Total Consumption: ${data.powerBudget.totalConsumption?.toFixed(1)} W
- Power Margin: ${data.powerBudget.powerMargin?.toFixed(1)} W (${data.powerBudget.powerMarginPercent?.toFixed(1)}%)
- Eclipse Duration: ${data.powerBudget.eclipseDuration?.toFixed(1)} s
- Battery Capacity: ${data.powerBudget.batteryCapacity} Wh

CONSTRAINTS:
- Passed: ${data.constraints.passed}
- Violations: ${JSON.stringify(data.constraints.violations)}
- Warnings: ${JSON.stringify(data.constraints.warnings)}
- Score: ${data.constraints.score}

Provide a concise engineering assessment with specific recommendations.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.3,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.status}`);
      }

      const data2: NVIDIAResponse = await response.json();
      return data2.choices[0]?.message?.content || 'Analysis unavailable';
    } catch (error) {
      console.error('NVIDIA explanation error:', error);
      return this.getMockExplanation(data);
    }
  }

  async generateMissionReport(data: any): Promise<string> {
    if (!this.isConfigured()) {
      return this.getMockReport(data);
    }

    try {
      const systemPrompt = `You are an aerospace engineering AI assistant. Generate a professional mission design report
based on the provided data. Include executive summary, spacecraft configuration, mission profile,
engineering analysis, risk assessment, and recommendations. Use proper technical formatting.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Generate a mission report for: ${JSON.stringify(data, null, 2)}` },
          ],
          max_tokens: 3000,
          temperature: 0.2,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.status}`);
      }

      const data2: NVIDIAResponse = await response.json();
      return data2.choices[0]?.message?.content || 'Report generation failed';
    } catch (error) {
      console.error('NVIDIA report error:', error);
      return this.getMockReport(data);
    }
  }

  async suggestMissionConfiguration(objectives: string[], constraints: any): Promise<any> {
    if (!this.isConfigured()) {
      return this.getMockSuggestions(objectives, constraints);
    }

    try {
      const systemPrompt = `You are an aerospace engineering AI assistant. Suggest spacecraft configuration
and mission parameters based on objectives and constraints. Provide specific component recommendations
with masses, power, and dimensions. Return structured JSON.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Objectives: ${objectives.join(', ')}\nConstraints: ${JSON.stringify(constraints)}` },
          ],
          max_tokens: 2048,
          temperature: 0.3,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        throw new Error(`NVIDIA API error: ${response.status}`);
      }

      const data2: NVIDIAResponse = await response.json();
      return JSON.parse(data2.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('NVIDIA suggestions error:', error);
      return this.getMockSuggestions(objectives, constraints);
    }
  }

  private parseAnalysisResponse(content: string): AIAnalysisResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          components: parsed.components || [],
          dimensions: parsed.dimensions || [],
          confidence: parsed.confidence || 0.5,
          rawResponse: content,
        };
      }
    } catch {
      // Fall through to mock
    }
    return this.getMockAnalysis({ preview: '', width: 0, height: 0, file: new File([], '') });
  }

  private getMockAnalysis(sketch: SketchUpload): AIAnalysisResult {
    return {
      components: [
        {
          type: 'main_body',
          name: 'Main Bus (Detected)',
          boundingBox: [100, 150, 200, 150],
          confidence: 0.85,
          detectedLabels: ['Main Bus', '1.5m'],
        },
        {
          type: 'solar_panel',
          name: 'Solar Array Port (Detected)',
          boundingBox: [50, 180, 120, 300],
          confidence: 0.78,
          detectedLabels: ['Solar Panel', '2.0m x 1.0m'],
        },
        {
          type: 'solar_panel',
          name: 'Solar Array Starboard (Detected)',
          boundingBox: [430, 180, 120, 300],
          confidence: 0.78,
          detectedLabels: ['Solar Panel', '2.0m x 1.0m'],
        },
        {
          type: 'communication_dish',
          name: 'High Gain Antenna (Inferred)',
          boundingBox: [250, 80, 80, 80],
          confidence: 0.65,
          detectedLabels: [],
        },
        {
          type: 'instrument',
          name: 'Science Instrument (Inferred)',
          boundingBox: [180, 280, 60, 60],
          confidence: 0.55,
          detectedLabels: [],
        },
      ],
      dimensions: [
        { componentId: 'main_body', dimension: 'width', value: 1.5, unit: 'm', source: 'detected', confidence: 0.85, labelText: '1.5m' },
        { componentId: 'main_body', dimension: 'height', value: 1.5, unit: 'm', source: 'detected', confidence: 0.85, labelText: '1.5m' },
        { componentId: 'main_body', dimension: 'depth', value: 1.5, unit: 'm', source: 'inferred', confidence: 0.6, labelText: '' },
        { componentId: 'solar_panel', dimension: 'width', value: 2.0, unit: 'm', source: 'detected', confidence: 0.78, labelText: '2.0m' },
        { componentId: 'solar_panel', dimension: 'height', value: 1.0, unit: 'm', source: 'detected', confidence: 0.78, labelText: '1.0m' },
        { componentId: 'solar_panel', dimension: 'depth', value: 0.05, unit: 'm', source: 'default', confidence: 0.5, labelText: '' },
        { componentId: 'communication_dish', dimension: 'width', value: 1.2, unit: 'm', source: 'inferred', confidence: 0.65, labelText: '' },
        { componentId: 'communication_dish', dimension: 'height', value: 1.2, unit: 'm', source: 'inferred', confidence: 0.65, labelText: '' },
        { componentId: 'communication_dish', dimension: 'depth', value: 0.5, unit: 'm', source: 'default', confidence: 0.5, labelText: '' },
        { componentId: 'instrument', dimension: 'width', value: 0.3, unit: 'm', source: 'default', confidence: 0.5, labelText: '' },
        { componentId: 'instrument', dimension: 'height', value: 0.3, unit: 'm', source: 'default', confidence: 0.5, labelText: '' },
        { componentId: 'instrument', dimension: 'depth', value: 0.4, unit: 'm', source: 'default', confidence: 0.5, labelText: '' },
      ],
      confidence: 0.72,
      rawResponse: 'Mock analysis - NVIDIA API not configured or failed. Please configure NVIDIA_API_KEY in .env for real AI analysis.',
    };
  }

  private getMockExplanation(data: any): string {
    return `## Mission Simulation Analysis (Mock - Configure NVIDIA API for AI Analysis)

### Orbital Assessment
The spacecraft is in a **${(data.orbitalAnalysis.period / 3600).toFixed(1)}-hour orbit** at **${(data.orbitalAnalysis.velocity / 1000).toFixed(2)} km/s** velocity.
The **${(data.orbitalAnalysis.eclipseFraction * 100).toFixed(1)}% eclipse fraction** means the spacecraft spends significant time in Earth's shadow,
requiring adequate battery capacity for ${(data.orbitalAnalysis.eclipseFraction * data.orbitalAnalysis.period / 60).toFixed(0)} minutes per orbit.

### Mass Budget Status
**Total Wet Mass: ${data.massBudget.totalWetMass?.toFixed(1)} kg** against a limit of **${data.massBudget.massLimit} kg**.
**Margin: ${data.massBudget.margin?.toFixed(1)} kg (${data.massBudget.marginPercent?.toFixed(1)}%)** - ${data.massBudget.margin && data.massBudget.margin > 0 ? '✅ PASS' : '❌ FAIL'}

Key mass drivers: Main body (${data.massBudget.mainBody} kg), Solar arrays (${data.massBudget.solarPanels} kg), Instruments (${data.massBudget.instruments} kg).

### Power Budget Status
**Generated: ${data.powerBudget.generatedPower?.toFixed(0)} W** vs **Consumed: ${data.powerBudget.totalConsumption?.toFixed(0)} W**
**Margin: ${data.powerBudget.powerMargin?.toFixed(0)} W (${data.powerBudget.powerMarginPercent?.toFixed(1)}%)** - ${data.powerBudget.powerMargin && data.powerBudget.powerMargin > 0 ? '✅ PASS' : '❌ FAIL'}

Eclipse duration of ${(data.powerBudget.eclipseDuration / 60).toFixed(0)} minutes requires ${(data.powerBudget.totalConsumption * data.powerBudget.eclipseDuration / 3600).toFixed(0)} Wh battery capacity.

### Key Trade-offs
1. **Solar Area vs Mass**: Current ${data.powerBudget.solarPanelArea?.toFixed(1)} m² arrays add ${data.massBudget.solarPanels} kg but provide ${data.powerBudget.generatedPower?.toFixed(0)} W
2. **Instruments vs Resources**: ${data.massBudget.instruments} kg of instruments consume ${data.powerBudget.payloadPower?.toFixed(0)} W
3. **Orbit Altitude**: Current altitude balances resolution, coverage, and radiation environment

### Recommendations
- ${data.massBudget.margin && data.massBudget.margin < 0 ? 'Reduce mass or increase launch vehicle capability' : 'Mass margin is adequate'}
- ${data.powerBudget.powerMargin && data.powerBudget.powerMargin < data.powerBudget.generatedPower * 0.2 ? 'Increase solar array area or reduce power consumption' : 'Power margin meets 20% requirement'}
- Verify thermal design for ${data.orbitalAnalysis.thermalCycles} cycles/year
- Consider radiation hardening for ${data.orbitalAnalysis.radiationExposure?.toExponential(1)} rad/year exposure`;
  }

  private getMockReport(data: any): string {
    return `# Mission Design Report: ${data.mission?.name || 'Untitled Mission'}

## Executive Summary
This report documents the design and analysis of the ${data.mission?.name || 'mission'} spacecraft
for the ${data.mission?.description || 'specified mission objectives'}.

## Spacecraft Configuration
- **Name**: ${data.spacecraft?.name || 'Unnamed Spacecraft'}
- **Total Mass**: ${data.massBudget?.totalWetMass?.toFixed(1) || 'N/A'} kg (Wet) / ${data.massBudget?.totalDryMass?.toFixed(1) || 'N/A'} kg (Dry)
- **Power Generation**: ${data.powerBudget?.generatedPower?.toFixed(0) || 'N/A'} W
- **Power Consumption**: ${data.powerBudget?.totalConsumption?.toFixed(0) || 'N/A'} W

## Mission Profile
- **Orbit**: ${data.orbitalAnalysis?.period ? `${(data.orbitalAnalysis.period / 3600).toFixed(1)}h period, ${data.orbitalParameters?.altitude / 1000} km altitude, ${data.orbitalParameters?.inclination}° inclination` : 'TBD'}
- **Duration**: ${data.mission?.constraints?.minMissionDuration || 'TBD'} days
- **Launch Vehicle**: ${data.mission?.launchVehicle?.name || 'TBD'}

## Engineering Analysis
### Mass Budget
${Object.entries(data.massBudget || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

### Power Budget
${Object.entries(data.powerBudget || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

### Orbital Analysis
${Object.entries(data.orbitalAnalysis || {}).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

## Constraint Evaluation
- **Overall**: ${data.constraints?.passed ? 'PASS' : 'FAIL'}
- **Score**: ${data.constraints?.score || 'N/A'}/100
- **Violations**: ${data.constraints?.violations?.length || 0}
- **Warnings**: ${data.constraints?.warnings?.length || 0}

## Risk Assessment
1. **Mass Growth**: Monitor during detailed design
2. **Power Margin**: ${data.powerBudget?.powerMarginPercent && data.powerBudget.powerMarginPercent < 20 ? 'Below 20% requirement' : 'Adequate'}
3. **Radiation**: ${data.orbitalAnalysis?.radiationExposure ? `${data.orbitalAnalysis.radiationExposure.toExponential(1)} rad/year` : 'TBD'}
4. **Thermal**: ${data.orbitalAnalysis?.thermalCycles || 'TBD'} cycles/year

## Recommendations
1. Proceed to Preliminary Design Review (PDR)
2. Conduct detailed thermal analysis
3. Validate radiation tolerance of selected components
4. Optimize solar array deployment mechanism
5. Define contingency operations for eclipse management

---
*Report generated by ORBITFORGE AI - Configure NVIDIA_API_KEY for AI-enhanced reports*`;
  }

  private getMockSuggestions(objectives: string[], constraints: any): any {
    return {
      spacecraft: {
        mainBody: { width: 1.5, height: 1.5, depth: 1.5, mass: 150 },
        solarPanels: [{ area: 4.0, mass: 50, power: 1600 }],
        instruments: objectives.includes('earth_observation') ? [{ type: 'multispectral_imager', mass: 8.5, power: 22 }] : [],
        communications: { type: 'communication_dish', diameter: 1.2, mass: 15, power: 150 },
        propulsion: { type: 'chemical', mass: 20, deltaV: 500 },
      },
      orbit: {
        altitude: constraints.maxTotalMass && constraints.maxTotalMass < 500 ? 500000 : 650000,
        inclination: objectives.includes('earth_observation') ? 98.2 : 28.5,
      },
      rationale: 'Mock suggestions - Configure NVIDIA_API_KEY for AI-generated recommendations',
    };
  }
}

export const nvidiaService = new NVIDIAService();

export async function initializeNVIDIAService(): Promise<boolean> {
  const apiKey = import.meta.env.VITE_NVIDIA_API_KEY || localStorage.getItem('nvidia_api_key');
  if (apiKey) {
    nvidiaService.setApiKey(apiKey);
    return true;
  }
  return false;
}