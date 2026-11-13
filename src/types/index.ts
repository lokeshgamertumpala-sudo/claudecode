export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface SpacecraftComponent {
  id: string;
  name: string;
  type: ComponentType;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  dimensions: ComponentDimensions;
  mass: number;
  powerConsumption: number;
  visible: boolean;
  metadata: Record<string, unknown>;
}

export type ComponentType =
  | 'main_body'
  | 'solar_panel'
  | 'antenna'
  | 'communication_dish'
  | 'instrument'
  | 'sensor'
  | 'propulsion'
  | 'structural_support'
  | 'battery'
  | 'thermal_control'
  | 'reaction_wheel'
  | 'star_tracker';

export interface ComponentDimensions {
  width: number;
  height: number;
  depth: number;
  radius?: number;
  segments?: number;
}

export interface SpacecraftConfig {
  id: string;
  name: string;
  description: string;
  components: SpacecraftComponent[];
  totalMass: number;
  totalPowerConsumption: number;
  totalPowerGeneration: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrbitalParameters {
  altitude: number;
  inclination: number;
  eccentricity: number;
  argumentOfPerigee: number;
  raan: number;
  trueAnomaly: number;
  epoch: string;
}

export interface OrbitalState {
  position: Vector3;
  velocity: Vector3;
  orbitalElements: OrbitalParameters;
  period: number;
  velocity_magnitude: number;
  angularVelocity: number;
}

export interface MassBudget {
  mainBody: number;
  solarPanels: number;
  instruments: number;
  communications: number;
  propulsion: number;
  thermal: number;
  power: number;
  structure: number;
  other: number;
  totalDryMass: number;
  propellantMass: number;
  totalWetMass: number;
  massLimit: number;
  margin: number;
  marginPercent: number;
}

export interface PowerBudget {
  solarPanelArea: number;
  solarIrradiance: number;
  panelEfficiency: number;
  systemLosses: number;
  generatedPower: number;
  payloadPower: number;
  busPower: number;
  communicationPower: number;
  thermalPower: number;
  totalConsumption: number;
  batteryCapacity: number;
  eclipseDuration: number;
  powerMargin: number;
  powerMarginPercent: number;
}

export interface MissionObjective {
  id: string;
  name: string;
  description: string;
  type: 'science' | 'communication' | 'navigation' | 'earth_observation' | 'technology_demo' | 'exploration';
  priority: 'primary' | 'secondary' | 'tertiary';
  requiredInstruments: string[];
  minOrbitAltitude: number;
  maxOrbitAltitude: number;
  minInclination: number;
  maxInclination: number;
  missionDuration: number;
  successCriteria: Record<string, unknown>;
}

export interface ScientificInstrument {
  id: string;
  name: string;
  type: 'camera' | 'spectrometer' | 'magnetometer' | 'radiometer' | 'particle_detector' | 'lidar' | 'radar' | 'custom';
  mass: number;
  powerConsumption: number;
  dataRate: number;
  fieldOfView: number;
  wavelengthRange?: [number, number];
  resolution?: number;
  operatingTemperature: [number, number];
  description: string;
}

export interface MissionConfig {
  id: string;
  name: string;
  description: string;
  spacecraftId: string;
  objectives: MissionObjective[];
  instruments: ScientificInstrument[];
  orbitalParameters: OrbitalParameters;
  launchVehicle: LaunchVehicleConfig;
  constraints: MissionConstraints;
  createdAt: string;
  updatedAt: string;
}

export interface LaunchVehicleConfig {
  id: string;
  name: string;
  maxPayloadMass: number;
  maxPayloadVolume: Vector3;
  fairingDiameter: number;
  fairingHeight: number;
  targetOrbit: OrbitalParameters;
  cost: number;
  provider: string;
}

export interface MissionConstraints {
  maxTotalMass: number;
  maxTotalPower: number;
  maxDimensions: Vector3;
  minPowerMargin: number;
  minMassMargin: number;
  maxDataRate: number;
  minMissionDuration: number;
  thermalLimits: [number, number];
  radiationLimit: number;
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  timeScale: number;
  currentTime: number;
  orbitalState: OrbitalState | null;
  trajectory: Vector3[];
  events: SimulationEvent[];
}

export interface SimulationEvent {
  id: string;
  time: number;
  type: 'eclipse_entry' | 'eclipse_exit' | 'ground_station_contact' | 'maneuver' | 'instrument_operation' | 'anomaly';
  description: string;
  data: Record<string, unknown>;
}

export interface AIAnalysisResult {
  components: DetectedComponent[];
  dimensions: DimensionEstimate[];
  confidence: number;
  rawResponse: string;
}

export interface DetectedComponent {
  type: ComponentType;
  name: string;
  boundingBox: [number, number, number, number];
  confidence: number;
  detectedLabels: string[];
}

export interface DimensionEstimate {
  componentId: string;
  dimension: keyof ComponentDimensions;
  value: number;
  unit: 'm' | 'cm' | 'mm' | 'in';
  source: 'detected' | 'inferred' | 'user_provided' | 'default';
  confidence: number;
  labelText?: string;
}

export interface SketchUpload {
  file: File;
  preview: string;
  width: number;
  height: number;
  analysis?: AIAnalysisResult;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  simulationSpeed: number;
  cameraSensitivity: number;
  showOrbitPath: boolean;
  showEarth: boolean;
  showStars: boolean;
  autoSave: boolean;
}

export interface ExportData {
  spacecraft: SpacecraftConfig;
  mission: MissionConfig;
  simulation: SimulationState;
  analysis: {
    massBudget: MassBudget;
    powerBudget: PowerBudget;
    orbitalAnalysis: OrbitalAnalysis;
    constraintEvaluation: ConstraintEvaluation;
  };
  exportedAt: string;
  version: string;
}

export interface OrbitalAnalysis {
  period: number;
  velocity: number;
  angularVelocity: number;
  eclipseFraction: number;
  groundTrackRepeat: number;
  deltaVBudget: number;
  radiationExposure: number;
  thermalCycles: number;
}

export interface ConstraintEvaluation {
  passed: boolean;
  violations: ConstraintViolation[];
  warnings: ConstraintWarning[];
  score: number;
}

export interface ConstraintViolation {
  constraint: string;
  expected: number;
  actual: number;
  severity: 'error' | 'warning';
  description: string;
}

export interface ConstraintWarning {
  constraint: string;
  expected: number;
  actual: number;
  description: string;
}