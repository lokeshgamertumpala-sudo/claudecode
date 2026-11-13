import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEngineeringStore } from './engineeringStore'

describe('engineeringStore', () => {
  beforeEach(() => {
    useEngineeringStore.setState({
      specs: useEngineeringStore.getState().specs,
      simulationResults: null,
      isSimulating: false,
    })
  })

  describe('updateSpacecraft', () => {
    it('merges spacecraft spec updates', () => {
      const { updateSpacecraft, specs } = useEngineeringStore.getState()
      updateSpacecraft({ dryMass: 2500, engineIsp: 350 })
      const s = useEngineeringStore.getState().specs
      expect(s.spacecraft.dryMass).toBe(2500)
      expect(s.spacecraft.engineIsp).toBe(350)
      expect(s.spacecraft.propellantMass).toBe(specs.spacecraft.propellantMass)
    })

    it('replaces nested objects completely when provided', () => {
      const { updateSpacecraft } = useEngineeringStore.getState()
      updateSpacecraft({ customField: 'test' })
      expect(useEngineeringStore.getState().specs.spacecraft.customField).toBe('test')
    })
  })

  describe('updateTrajectory', () => {
    it('merges trajectory spec updates', () => {
      const { updateTrajectory } = useEngineeringStore.getState()
      updateTrajectory({ deltaVBudget: 8.0, transferType: 'Bi-elliptic' })
      const t = useEngineeringStore.getState().specs.trajectory
      expect(t.deltaVBudget).toBe(8.0)
      expect(t.transferType).toBe('Bi-elliptic')
      expect(t.departureBody).toBe('Earth')
    })
  })

  describe('updateEnvironment', () => {
    it('merges environment spec updates', () => {
      const { updateEnvironment } = useEngineeringStore.getState()
      updateEnvironment({ solarFlux: 1400, radiationModel: 'Custom' })
      const e = useEngineeringStore.getState().specs.environment
      expect(e.solarFlux).toBe(1400)
      expect(e.radiationModel).toBe('Custom')
    })
  })

  describe('runSimulation', () => {
    it('sets isSimulating true then false', async () => {
      const { runSimulation } = useEngineeringStore.getState()
      const promise = runSimulation()
      expect(useEngineeringStore.getState().isSimulating).toBe(true)
      await promise
      expect(useEngineeringStore.getState().isSimulating).toBe(false)
    })

    it('computes correct deltaV using rocket equation', async () => {
      const { updateSpacecraft, runSimulation } = useEngineeringStore.getState()
      // dryMass=2000, propellantMass=5000, engineIsp=320
      // totalMass = 7000, deltaV = 320 * 9.81 * ln(7000/2000)
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      const expectedDeltaV = 320 * 9.81 * Math.log(7000 / 2000)
      expect(results.deltaV).toBeCloseTo(expectedDeltaV / 1000, 2) // in km/s
    })

    it('computes correct TWR', async () => {
      const { updateSpacecraft, runSimulation } = useEngineeringStore.getState()
      updateSpacecraft({ dryMass: 1000, propellantMass: 1000, engineCount: 2, thrustPerEngine: 500 })
      // totalMass = 2000, totalThrust = 1000 kN = 1,000,000 N
      // twr = 1,000,000 / (2000 * 9.81) ≈ 51
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      const expectedTwr = (2 * 500 * 1000) / (2000 * 9.81)
      expect(results.twr).toBeCloseTo(expectedTwr, 1)
    })

    it('computes burn time correctly', async () => {
      const { updateSpacecraft, runSimulation } = useEngineeringStore.getState()
      updateSpacecraft({ propellantMass: 2000, engineIsp: 300, engineCount: 1, thrustPerEngine: 200 })
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      // burnTime = (propMass * Isp * g0) / totalThrust
      const expectedBurnTime = (2000 * 300 * 9.81) / (200 * 1000)
      expect(results.burnTime).toBeCloseTo(expectedBurnTime, 0)
    })

    it('computes cost estimate', async () => {
      const { runSimulation } = useEngineeringStore.getState()
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      // cost = (dryMass * 25000 + propMass * 5000) / 1e9
      const expectedCost = (2000 * 25000 + 5000 * 5000) / 1e9
      expect(results.costEstimate).toBeCloseTo(expectedCost, 2)
    })

    it('sets feasibility based on deltaV margin', async () => {
      const { updateSpacecraft, updateTrajectory, runSimulation } = useEngineeringStore.getState()
      updateSpacecraft({ dryMass: 100, propellantMass: 1000 }) // very high deltaV
      updateTrajectory({ deltaVBudget: 1.0, margin: 0.1 })
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      expect(results.feasibility).toBe('Feasible')
    })

    it('generates warnings for low TWR', async () => {
      const { updateSpacecraft, runSimulation } = useEngineeringStore.getState()
      updateSpacecraft({ dryMass: 10000, propellantMass: 1000, engineCount: 1, thrustPerEngine: 50 })
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      expect(results.warnings.some(w => w.includes('thrust-to-weight'))).toBe(true)
    })

    it('generates warning when dry mass exceeds propellant mass', async () => {
      const { updateSpacecraft, runSimulation } = useEngineeringStore.getState()
      updateSpacecraft({ dryMass: 6000, propellantMass: 5000 })
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      expect(results.warnings.some(w => w.includes('Dry mass exceeds'))).toBe(true)
    })

    it('generates warning for insufficient deltaV margin', async () => {
      const { updateSpacecraft, updateTrajectory, runSimulation } = useEngineeringStore.getState()
      updateSpacecraft({ dryMass: 1900, propellantMass: 100 }) // very low deltaV
      updateTrajectory({ deltaVBudget: 10.0, margin: 0.1 })
      await runSimulation()
      const results = useEngineeringStore.getState().simulationResults
      expect(results.warnings.some(w => w.includes('delta-V margin'))).toBe(true)
    })
  })

  describe('resetToDefaults', () => {
    it('restores default specs and clears results', async () => {
      const { updateSpacecraft, runSimulation, resetToDefaults } = useEngineeringStore.getState()
      updateSpacecraft({ dryMass: 9999 })
      await runSimulation()
      expect(useEngineeringStore.getState().specs.spacecraft.dryMass).toBe(9999)
      resetToDefaults()
      const defaults = useEngineeringStore.getState().specs
      expect(defaults.spacecraft.dryMass).toBe(2000)
      expect(useEngineeringStore.getState().simulationResults).toBeNull()
    })
  })

  describe('persistence', () => {
    it('uses localStorage under the orbitforge-engineering key', () => {
      const key = useEngineeringStore.persist.getOptions().name
      expect(key).toBe('orbitforge-engineering')
    })
  })
})