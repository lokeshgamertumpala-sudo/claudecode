import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MissionConfig, MissionObjective, ScientificInstrument, OrbitalParameters, LaunchVehicleConfig, MissionConstraints, SimulationState, SimulationEvent } from '@/types';
import { LAUNCH_VEHICLES, MISSION_OBJECTIVE_TEMPLATES, INSTRUMENT_LIBRARY, SAMPLE_MISSIONS } from '@/constants';
import { v4 as uuidv4 } from 'uuid';
import { calculateOrbitalState, calculateEclipseFraction, calculateGroundTrackRepeat, calculateRadiationExposure, calculateThermalCycles } from '@/calculations';

interface MissionState {
  currentMission: MissionConfig | null;
  objectives: MissionObjective[];
  instruments: ScientificInstrument[];
  orbitalParameters: OrbitalParameters;
  launchVehicle: LaunchVehicleConfig | null;
  constraints: MissionConstraints;
  simulation: SimulationState;
  availableLaunchVehicles: LaunchVehicleConfig[];
  availableObjectives: MissionObjective[];
  availableInstruments: ScientificInstrument[];

  createNewMission: (name: string, description: string, spacecraftId: string) => void;
  loadMission: (mission: MissionConfig) => void;
  setOrbitalParameters: (params: Partial<OrbitalParameters>) => void;
  setLaunchVehicle: (vehicleId: string) => void;
  addObjective: (objective: MissionObjective) => void;
  removeObjective: (id: string) => void;
  addInstrument: (instrument: ScientificInstrument) => void;
  removeInstrument: (id: string) => void;
  updateConstraints: (constraints: Partial<MissionConstraints>) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;
  setTimeScale: (scale: number) => void;
  stepSimulation: (deltaTime: number) => void;
  addSimulationEvent: (event: Omit<SimulationEvent, 'id'>) => void;
  loadSampleMission: (sampleId: string) => void;
  getOrbitalAnalysis: () => {
    period: number;
    velocity: number;
    angularVelocity: number;
    eclipseFraction: number;
    groundTrackRepeat: number;
    deltaVBudget: number;
    radiationExposure: number;
    thermalCycles: number;
  };
}

const defaultOrbitalParams: OrbitalParameters = {
  altitude: 650000,
  inclination: 98.2,
  eccentricity: 0.001,
  argumentOfPerigee: 0,
  raan: 0,
  trueAnomaly: 0,
  epoch: new Date().toISOString(),
};

const defaultConstraints: MissionConstraints = {
  maxTotalMass: 2000,
  maxTotalPower: 1200,
  maxDimensions: { x: 5.2, y: 5.2, z: 12.6 },
  minPowerMargin: 0.2,
  minMassMargin: 0.1,
  maxDataRate: 100,
  minMissionDuration: 365,
  thermalLimits: [-30, 60],
  radiationLimit: 100000,
};

const defaultSimulation: SimulationState = {
  isRunning: false,
  isPaused: false,
  timeScale: 100,
  currentTime: 0,
  orbitalState: null,
  trajectory: [],
  events: [],
};

export const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      currentMission: null,
      objectives: [],
      instruments: [],
      orbitalParameters: defaultOrbitalParams,
      launchVehicle: LAUNCH_VEHICLES[0],
      constraints: defaultConstraints,
      simulation: defaultSimulation,
      availableLaunchVehicles: LAUNCH_VEHICLES,
      availableObjectives: MISSION_OBJECTIVE_TEMPLATES,
      availableInstruments: Object.values(INSTRUMENT_LIBRARY),

      createNewMission: (name: string, description: string, spacecraftId: string) => {
        const mission: MissionConfig = {
          id: uuidv4(),
          name,
          description,
          spacecraftId,
          objectives: [],
          instruments: [],
          orbitalParameters: defaultOrbitalParams,
          launchVehicle: LAUNCH_VEHICLES[0],
          constraints: defaultConstraints,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({
          currentMission: mission,
          objectives: [],
          instruments: [],
          orbitalParameters: defaultOrbitalParams,
          launchVehicle: LAUNCH_VEHICLES[0],
          constraints: defaultConstraints,
          simulation: { ...defaultSimulation, orbitalState: calculateOrbitalState(defaultOrbitalParams) },
        });
      },

      loadMission: (mission: MissionConfig) => {
        set({
          currentMission: mission,
          objectives: mission.objectives,
          instruments: mission.instruments,
          orbitalParameters: mission.orbitalParameters,
          launchVehicle: mission.launchVehicle,
          constraints: mission.constraints,
          simulation: { ...defaultSimulation, orbitalState: calculateOrbitalState(mission.orbitalParameters) },
        });
      },

      setOrbitalParameters: (params: Partial<OrbitalParameters>) => {
        const newParams = { ...get().orbitalParameters, ...params };
        set({
          orbitalParameters: newParams,
          currentMission: get().currentMission ? {
            ...get().currentMission!,
            orbitalParameters: newParams,
            updatedAt: new Date().toISOString(),
          } : null,
          simulation: get().simulation.isRunning ? get().simulation : {
            ...get().simulation,
            orbitalState: calculateOrbitalState(newParams),
          },
        });
      },

      setLaunchVehicle: (vehicleId: string) => {
        const vehicle = LAUNCH_VEHICLES.find(v => v.id === vehicleId);
        if (vehicle) {
          set({
            launchVehicle: vehicle,
            currentMission: get().currentMission ? {
              ...get().currentMission!,
              launchVehicle: vehicle,
              updatedAt: new Date().toISOString(),
            } : null,
            constraints: {
              ...get().constraints,
              maxTotalMass: vehicle.maxPayloadMass,
              maxDimensions: vehicle.maxPayloadVolume,
            },
          });
        }
      },

      addObjective: (objective: MissionObjective) => {
        const newObjectives = [...get().objectives, objective];
        set({
          objectives: newObjectives,
          currentMission: get().currentMission ? {
            ...get().currentMission!,
            objectives: newObjectives,
            updatedAt: new Date().toISOString(),
          } : null,
        });
      },

      removeObjective: (id: string) => {
        const newObjectives = get().objectives.filter(o => o.id !== id);
        set({
          objectives: newObjectives,
          currentMission: get().currentMission ? {
            ...get().currentMission!,
            objectives: newObjectives,
            updatedAt: new Date().toISOString(),
          } : null,
        });
      },

      addInstrument: (instrument: ScientificInstrument) => {
        const newInstruments = [...get().instruments, instrument];
        set({
          instruments: newInstruments,
          currentMission: get().currentMission ? {
            ...get().currentMission!,
            instruments: newInstruments,
            updatedAt: new Date().toISOString(),
          } : null,
        });
      },

      removeInstrument: (id: string) => {
        const newInstruments = get().instruments.filter(i => i.id !== id);
        set({
          instruments: newInstruments,
          currentMission: get().currentMission ? {
            ...get().currentMission!,
            instruments: newInstruments,
            updatedAt: new Date().toISOString(),
          } : null,
        });
      },

      updateConstraints: (constraints: Partial<MissionConstraints>) => {
        const newConstraints = { ...get().constraints, ...constraints };
        set({
          constraints: newConstraints,
          currentMission: get().currentMission ? {
            ...get().currentMission!,
            constraints: newConstraints,
            updatedAt: new Date().toISOString(),
          } : null,
        });
      },

      startSimulation: () => {
        const orbitalState = calculateOrbitalState(get().orbitalParameters);
        set({
          simulation: {
            ...get().simulation,
            isRunning: true,
            isPaused: false,
            currentTime: 0,
            orbitalState,
            trajectory: [orbitalState.position],
            events: [],
          },
        });
      },

      pauseSimulation: () => {
        set({
          simulation: {
            ...get().simulation,
            isRunning: false,
            isPaused: true,
          },
        });
      },

      resumeSimulation: () => {
        set({
          simulation: {
            ...get().simulation,
            isRunning: true,
            isPaused: false,
          },
        });
      },

      resetSimulation: () => {
        const orbitalState = calculateOrbitalState(get().orbitalParameters);
        set({
          simulation: {
            ...defaultSimulation,
            orbitalState,
            trajectory: [orbitalState.position],
          },
        });
      },

      setTimeScale: (scale: number) => {
        set({
          simulation: {
            ...get().simulation,
            timeScale: Math.max(1, Math.min(scale, 10000)),
          },
        });
      },

      stepSimulation: (deltaTime: number) => {
        const { simulation, orbitalParameters } = get();
        if (!simulation.isRunning || simulation.isPaused || !simulation.orbitalState) return;

        const { propagateOrbit } = await import('@/calculations/orbital');
        const newState = propagateOrbit(simulation.orbitalState, deltaTime * simulation.timeScale);

        const newTrajectory = [...simulation.trajectory, newState.position];
        if (newTrajectory.length > 1000) newTrajectory.shift();

        const newTime = simulation.currentTime + deltaTime * simulation.timeScale;

        const period = newState.period;
        const orbitProgress = (newTime % period) / period;
        const prevProgress = ((newTime - deltaTime * simulation.timeScale) % period) / period;

        let newEvents = [...simulation.events];
        if (orbitProgress < prevProgress) {
          newEvents.push({
            id: uuidv4(),
            time: newTime,
            type: 'maneuver',
            description: 'Completed orbit',
            data: { orbitNumber: Math.floor(newTime / period) },
          });
        }

        const eclipseFraction = calculateEclipseFraction(orbitalParameters);
        const inEclipse = orbitProgress < eclipseFraction || orbitProgress > (1 - eclipseFraction);
        const wasInEclipse = prevProgress < eclipseFraction || prevProgress > (1 - eclipseFraction);

        if (inEclipse && !wasInEclipse) {
          newEvents.push({
            id: uuidv4(),
            time: newTime,
            type: 'eclipse_entry',
            description: 'Entered Earth shadow',
            data: {},
          });
        } else if (!inEclipse && wasInEclipse) {
          newEvents.push({
            id: uuidv4(),
            time: newTime,
            type: 'eclipse_exit',
            description: 'Exited Earth shadow',
            data: {},
          });
        }

        if (newEvents.length > 100) newEvents = newEvents.slice(-100);

        set({
          simulation: {
            ...simulation,
            currentTime: newTime,
            orbitalState: newState,
            trajectory: newTrajectory,
            events: newEvents,
          },
        });
      },

      addSimulationEvent: (event: Omit<SimulationEvent, 'id'>) => {
        set({
          simulation: {
            ...get().simulation,
            events: [...get().simulation.events, { ...event, id: uuidv4() }],
          },
        });
      },

      loadSampleMission: (sampleId: string) => {
        const sample = SAMPLE_MISSIONS.find(s => s.id === sampleId);
        if (!sample) return;

        const mission: MissionConfig = {
          id: uuidv4(),
          name: sample.name,
          description: sample.description,
          spacecraftId: '',
          objectives: sample.objectives.map(id => MISSION_OBJECTIVE_TEMPLATES.find(o => o.id === id)).filter(Boolean) as MissionObjective[],
          instruments: sample.instruments.map(id => INSTRUMENT_LIBRARY[id]).filter(Boolean) as ScientificInstrument[],
          orbitalParameters: sample.orbit,
          launchVehicle: LAUNCH_VEHICLES[0],
          constraints: {
            ...defaultConstraints,
            maxTotalMass: sample.massLimit,
            maxTotalPower: sample.powerLimit,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          currentMission: mission,
          objectives: mission.objectives,
          instruments: mission.instruments,
          orbitalParameters: mission.orbitalParameters,
          constraints: mission.constraints,
          simulation: { ...defaultSimulation, orbitalState: calculateOrbitalState(mission.orbitalParameters) },
        });
      },

      getOrbitalAnalysis: () => {
        const { orbitalParameters } = get();
        const state = calculateOrbitalState(orbitalParameters);
        const eclipseFraction = calculateEclipseFraction(orbitalParameters);
        const groundTrackRepeat = calculateGroundTrackRepeat(orbitalParameters);
        const radiationExposure = calculateRadiationExposure(orbitalParameters, 365);
        const thermalCycles = calculateThermalCycles(orbitalParameters, 365);

        return {
          period: state.period,
          velocity: state.velocity_magnitude,
          angularVelocity: state.angularVelocity,
          eclipseFraction,
          groundTrackRepeat,
          deltaVBudget: 0,
          radiationExposure,
          thermalCycles,
        };
      },
    }),
    {
      name: 'orbitforge-mission',
      partialize: (state) => ({
        currentMission: state.currentMission,
        objectives: state.objectives,
        instruments: state.instruments,
        orbitalParameters: state.orbitalParameters,
        launchVehicle: state.launchVehicle,
        constraints: state.constraints,
      }),
    }
  )
);