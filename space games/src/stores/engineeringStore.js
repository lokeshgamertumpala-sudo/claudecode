import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultSpecs = {
  spacecraft: {
    dryMass: 2000,
    propellantMass: 5000,
    engineIsp: 320,
    engineCount: 4,
    thrustPerEngine: 200,
    tankPressure: 20,
    tankMaterial: 'Al-Li 2195',
    structureMaterial: 'Carbon Composite',
    powerGeneration: 5000,
    thermalControl: 'Active',
    commsPower: 150,
    dataRate: 100,
  },
  trajectory: {
    departureBody: 'Earth',
    arrivalBody: 'Mars',
    departureDate: '2026-01-15',
    arrivalDate: '2026-07-20',
    transferType: 'Hohmann',
    flybyBodies: [],
    deltaVBudget: 6.0,
    margin: 0.15,
  },
  environment: {
    solarFlux: 1361,
    radiationModel: 'AP-8/AE-8',
    micrometeoroidFlux: 1e-6,
    thermalEnvironment: 'Deep Space',
  },
}

export const useEngineeringStore = create(
  persist(
    (set, get) => ({
      specs: defaultSpecs,
      simulationResults: null,
      isSimulating: false,

      updateSpacecraft: (updates) => set(state => ({
        specs: { ...state.specs, spacecraft: { ...state.specs.spacecraft, ...updates } }
      })),

      updateTrajectory: (updates) => set(state => ({
        specs: { ...state.specs, trajectory: { ...state.specs.trajectory, ...updates } }
      })),

      updateEnvironment: (updates) => set(state => ({
        specs: { ...state.specs, environment: { ...state.specs.environment, ...updates } }
      })),

      setSimulationResults: (results) => set({ simulationResults: results, isSimulating: false }),
      setSimulating: (isSimulating) => set({ isSimulating }),

      runSimulation: async () => {
        set({ isSimulating: true })
        const { specs } = get()

        await new Promise(resolve => setTimeout(resolve, 1500))

        const { spacecraft, trajectory } = specs
        const totalMass = spacecraft.dryMass + spacecraft.propellantMass
        const totalThrust = spacecraft.engineCount * spacecraft.thrustPerEngine
        const twr = totalThrust * 1000 / (totalMass * 9.81)
        const deltaV = spacecraft.engineIsp * 9.81 * Math.log(totalMass / spacecraft.dryMass)
        const burnTime = (spacecraft.propellantMass * spacecraft.engineIsp * 9.81) / totalThrust
        const payloadFraction = spacecraft.dryMass / totalMass
        const costEstimate = (spacecraft.dryMass * 25000 + spacecraft.propellantMass * 5000) / 1e9

        const results = {
          totalMass,
          totalThrust,
          twr: Math.max(0, twr),
          deltaV: Math.max(0, deltaV),
          burnTime: Math.max(0, burnTime),
          payloadFraction: Math.max(0, Math.min(1, payloadFraction)),
          costEstimate: Math.max(0, costEstimate),
          deltaVMargin: trajectory.deltaVBudget > 0 ? ((deltaV - trajectory.deltaVBudget) / trajectory.deltaVBudget * 100) : 0,
          thermalLoad: spacecraft.powerGeneration * 0.3,
          radiationDose: trajectory.transferType === 'Hohmann' ? 50 : 80,
          commsMargin: spacecraft.commsPower > 100 ? 'Adequate' : 'Marginal',
          feasibility: deltaV >= trajectory.deltaVBudget * (1 - trajectory.margin) ? 'Feasible' : 'Infeasible',
          warnings: [],
        }

        if (twr < 1.2) results.warnings.push('Low thrust-to-weight ratio for launch')
        if (results.deltaVMargin < -5) results.warnings.push('Insufficient delta-V margin')
        if (spacecraft.dryMass > spacecraft.propellantMass) results.warnings.push('Dry mass exceeds propellant mass')

        set({ simulationResults: results, isSimulating: false })
        return results
      },

      resetToDefaults: () => set({ specs: defaultSpecs, simulationResults: null }),
    }),
    { name: 'orbitforge-engineering' }
  )
)