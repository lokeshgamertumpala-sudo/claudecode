import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { Vector3 } from 'three'

const EARTH_RADIUS = 6371
const EARTH_MU = 3.986004418e5

const defaultOrbitalParams = {
  altitude: 600,
  inclination: 98.2,
  eccentricity: 0.0,
  argumentOfPerigee: 0,
  raan: 0,
  trueAnomaly: 0,
  epoch: Date.now(),
}

const defaultSpacecraftParams = {
  mainBody: { width: 2.0, height: 1.5, depth: 2.0, mass: 500 },
  solarPanels: { count: 2, width: 4.0, height: 2.0, mass: 50, efficiency: 0.28, deployed: true },
  antenna: { diameter: 1.5, mass: 25, type: 'parabolic' },
  instruments: [
    { id: 'inst-1', name: 'Multispectral Imager', mass: 45, power: 35, type: 'optical' },
    { id: 'inst-2', name: 'Spectrometer', mass: 30, power: 25, type: 'science' },
  ],
  propulsion: { type: 'chemical', mass: 120, thrust: 450, isp: 320 },
  structure: { mass: 180 },
  thermal: { mass: 60 },
  avionics: { mass: 40, power: 15 },
  power: { batteryCapacity: 5000, mass: 80 },
}

const defaultMissionConfig = {
  name: 'Earth Observation Mission',
  objective: 'earth-observation',
  targetOrbit: 'leo',
  launchVehicle: 'falcon9',
  constraints: {
    maxMass: 2000,
    maxPower: 2000,
    maxCost: 500,
    maxDimensions: { width: 5, height: 5, depth: 5 },
  },
}

export const useOrbitalStore = create(
  persist(
    (set, get) => ({
      orbitalParams: defaultOrbitalParams,
      spacecraftParams: defaultSpacecraftParams,
      missionConfig: defaultMissionConfig,
      simulationRunning: false,
      simulationSpeed: 1,
      simulationTime: 0,
      satellitePosition: null,
      orbitalPath: [],
      massBudget: null,
      powerBudget: null,
      constraintViolations: [],
      sketchFile: null,
      sketchAnalysis: null,
      sketchConfirmed: false,
      apiKey: typeof window !== 'undefined' ? (localStorage.getItem('nvidia_api_key') || null) : null,
      notifications: [],
      loadingStates: {},
      selectedComponent: null,
      cameraPosition: { x: 10, y: 8, z: 10 },
      showGrid: true,
      showAxes: true,
      wireframe: false,

      updateOrbitalParam: (key, value) => set(state => ({
        orbitalParams: { ...state.orbitalParams, [key]: value },
        constraintViolations: get().checkConstraints(
          { ...state.orbitalParams, [key]: value },
          state.spacecraftParams,
          state.missionConfig
        ),
      })),

      updateSpacecraftCategory: (category, updates) => set(state => {
        const newParams = { ...state.spacecraftParams, [category]: { ...state.spacecraftParams[category], ...updates } }
        return {
          spacecraftParams: newParams,
          constraintViolations: get().checkConstraints(state.orbitalParams, newParams, state.missionConfig),
        }
      }),

      updateSpacecraftParam: (category, key, value) => set(state => {
        const newParams = { ...state.spacecraftParams, [category]: { ...state.spacecraftParams[category], [key]: value } }
        return {
          spacecraftParams: newParams,
          constraintViolations: get().checkConstraints(state.orbitalParams, newParams, state.missionConfig),
        }
      }),

      updateSpacecraftListParam: (category, index, key, value) => set(state => {
        const list = [...state.spacecraftParams[category]]
        list[index] = { ...list[index], [key]: value }
        const newParams = { ...state.spacecraftParams, [category]: list }
        return {
          spacecraftParams: newParams,
          constraintViolations: get().checkConstraints(state.orbitalParams, newParams, state.missionConfig),
        }
      }),

      addSpacecraftListItem: (category, item) => set(state => {
        const list = [...(state.spacecraftParams[category] || [])]
        list.push({ ...item, id: uuidv4() })
        const newParams = { ...state.spacecraftParams, [category]: list }
        return {
          spacecraftParams: newParams,
          constraintViolations: get().checkConstraints(state.orbitalParams, newParams, state.missionConfig),
        }
      }),

      removeSpacecraftListItem: (category, index) => set(state => {
        const list = [...(state.spacecraftParams[category] || [])]
        list.splice(index, 1)
        const newParams = { ...state.spacecraftParams, [category]: list }
        return {
          spacecraftParams: newParams,
          constraintViolations: get().checkConstraints(state.orbitalParams, newParams, state.missionConfig),
        }
      }),

      updateMissionConfig: (updates) => set(state => ({
        missionConfig: { ...state.missionConfig, ...updates },
        constraintViolations: get().checkConstraints(state.orbitalParams, state.spacecraftParams, { ...state.missionConfig, ...updates }),
      })),

      setSimulationRunning: (running) => set({ simulationRunning: running }),
      setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
      setSimulationTime: (time) => set({ simulationTime: time }),

      startSimulation: () => set({ simulationRunning: true, simulationTime: 0 }),
      pauseSimulation: () => set({ simulationRunning: false }),
      resetSimulation: () => set({ simulationRunning: false, simulationTime: 0, satellitePosition: null, orbitalPath: [] }),

      updateSatellitePosition: (position) => set({ satellitePosition: position }),
      calculateOrbitalPath: (params) => generateOrbitalPath(params, 72),

      updateOrbitalPath: (path) => set({ orbitalPath: path }),

      setSketchFile: (file) => set({ sketchFile: file }),
      setSketchAnalysis: (analysis) => set({ sketchAnalysis: analysis }),
      confirmSketch: () => set(state => ({ sketchFile: null, sketchAnalysis: null })),
      clearSketch: () => set({ sketchFile: null, sketchAnalysis: null }),

      loadSampleSpacecraft: (sample) => {
        const samples = {
          cubesat: {
            mainBody: { width: 0.1, height: 0.1, depth: 0.1, mass: 1.33 },
            solarPanels: { count: 0, width: 0, height: 0, mass: 0, efficiency: 0.28, deployed: false },
            antenna: { diameter: 0.1, mass: 0.05, type: 'patch' },
            instruments: [{ id: uuidv4(), name: 'Camera', mass: 0.1, power: 2, type: 'optical' }],
            propulsion: { type: 'cold-gas', mass: 0.5, thrust: 0.01, isp: 50 },
            structure: { mass: 0.3 },
            thermal: { mass: 0.1 },
            avionics: { mass: 0.2, power: 1 },
            power: { batteryCapacity: 10, mass: 0.2 },
          },
          earthObs: {
            mainBody: { width: 2.0, height: 1.5, depth: 2.0, mass: 500 },
            solarPanels: { count: 2, width: 4.0, height: 2.0, mass: 50, efficiency: 0.28, deployed: true },
            antenna: { diameter: 1.5, mass: 25, type: 'parabolic' },
            instruments: [
              { id: uuidv4(), name: 'Multispectral Imager', mass: 45, power: 35, type: 'optical' },
              { id: uuidv4(), name: 'Spectrometer', mass: 30, power: 25, type: 'science' },
            ],
            propulsion: { type: 'chemical', mass: 120, thrust: 450, isp: 320 },
            structure: { mass: 180 },
            thermal: { mass: 60 },
            avionics: { mass: 40, power: 15 },
            power: { batteryCapacity: 5000, mass: 80 },
          },
          commSat: {
            mainBody: { width: 3.0, height: 2.0, depth: 2.5, mass: 1200 },
            solarPanels: { count: 2, width: 6.0, height: 3.0, mass: 120, efficiency: 0.3, deployed: true },
            antenna: { diameter: 2.5, mass: 80, type: 'parabolic' },
            instruments: [
              { id: uuidv4(), name: 'Ka-band Transponder', mass: 35, power: 120, type: 'comms' },
              { id: uuidv4(), name: 'Ku-band Transponder', mass: 25, power: 80, type: 'comms' },
            ],
            propulsion: { type: 'electric', mass: 200, thrust: 0.5, isp: 3000 },
            structure: { mass: 300 },
            thermal: { mass: 100 },
            avionics: { mass: 60, power: 25 },
            power: { batteryCapacity: 15000, mass: 200 },
          },
          deepSpace: {
            mainBody: { width: 2.5, height: 2.0, depth: 2.0, mass: 800 },
            solarPanels: { count: 2, width: 8.0, height: 4.0, mass: 200, efficiency: 0.32, deployed: true },
            antenna: { diameter: 3.0, mass: 120, type: 'parabolic' },
            instruments: [
              { id: uuidv4(), name: 'Camera', mass: 50, power: 40, type: 'optical' },
              { id: uuidv4(), name: 'Magnetometer', mass: 15, power: 10, type: 'science' },
              { id: uuidv4(), name: 'Plasma Analyzer', mass: 25, power: 20, type: 'science' },
            ],
            propulsion: { type: 'chemical', mass: 300, thrust: 450, isp: 320 },
            structure: { mass: 200 },
            thermal: { mass: 80 },
            avionics: { mass: 50, power: 20 },
            power: { batteryCapacity: 8000, mass: 150 },
          },
        }
        if (samples[sample]) {
          set(state => ({
            spacecraftParams: samples[sample],
            constraintViolations: get().checkConstraints(state.orbitalParams, samples[sample], state.missionConfig),
          }))
        }
      },

      recalcBudgets: () => set(state => {
        const massBudget = calculateMassBudget(state.spacecraftParams)
        const powerBudget = calculatePowerBudget(state.spacecraftParams)
        return { massBudget, powerBudget }
      }),

      checkConstraints: (orbitalParams, spacecraftParams, missionConfig) => {
        const massBudget = calculateMassBudget(spacecraftParams)
        const powerBudget = calculatePowerBudget(spacecraftParams)
        const constraints = missionConfig?.constraints || {}
        const violations = []

        if (massBudget.totalMass > constraints.maxMass) {
          violations.push({
            type: 'mass',
            severity: 'danger',
            message: `Mass exceeds limit: ${massBudget.totalMass.toFixed(1)} kg > ${constraints.maxMass} kg`,
            value: massBudget.totalMass,
            limit: constraints.maxMass,
          })
        } else if (massBudget.marginPercent < 10) {
          violations.push({
            type: 'mass',
            severity: 'warning',
            message: `Low mass margin: ${massBudget.marginPercent.toFixed(1)}%`,
            value: massBudget.marginPercent,
            limit: 10,
          })
        }

        if (powerBudget.totalConsumption > constraints.maxPower) {
          violations.push({
            type: 'power',
            severity: 'danger',
            message: `Power exceeds limit: ${powerBudget.totalConsumption.toFixed(1)} W > ${constraints.maxPower} W`,
            value: powerBudget.totalConsumption,
            limit: constraints.maxPower,
          })
        } else if (powerBudget.marginPercent < 15) {
          violations.push({
            type: 'power',
            severity: 'warning',
            message: `Low power margin: ${powerBudget.marginPercent.toFixed(1)}%`,
            value: powerBudget.marginPercent,
            limit: 15,
          })
        }

        return violations
      },

      setApiKey: (key) => set({ apiKey: key }),
      setLoading: (key, loading) => set(state => ({ loadingStates: { ...state.loadingStates, [key]: loading } })),
      addNotification: (notification) => set(state => ({
        notifications: [...state.notifications, { id: uuidv4(), timestamp: Date.now(), ...notification }],
      })),
      dismissNotification: (id) => set(state => ({
        notifications: state.notifications.filter(n => n.id !== id),
      })),
      clearNotifications: () => set({ notifications: [] }),
      setSelectedComponent: (component) => set({ selectedComponent: component }),
      setCameraPosition: (position) => set({ cameraPosition: position }),
      toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
      toggleAxes: () => set(state => ({ showAxes: !state.showAxes })),
      toggleWireframe: () => set(state => ({ wireframe: !state.wireframe })),
      resetSpacecraft: () => set(state => ({
        spacecraftParams: defaultSpacecraftParams,
        constraintViolations: get().checkConstraints(state.orbitalParams, defaultSpacecraftParams, state.missionConfig),
      })),
      confirmSketch: () => set(state => ({ sketchFile: null, sketchAnalysis: null, sketchConfirmed: true })),
      clearSketch: () => set({ sketchFile: null, sketchAnalysis: null, sketchConfirmed: false }),

      resetToDefaults: () => set({
        orbitalParams: defaultOrbitalParams,
        spacecraftParams: defaultSpacecraftParams,
        missionConfig: defaultMissionConfig,
        simulationRunning: false,
        simulationSpeed: 1,
        simulationTime: 0,
        satellitePosition: null,
        orbitalPath: [],
        massBudget: null,
        powerBudget: null,
        constraintViolations: [],
        sketchFile: null,
        sketchAnalysis: null,
      }),
    }),
    { name: 'orbitforge-orbital' }
  )
)

function calculateMassBudget(params) {
  let totalMass = 0
  const breakdown = {}

  for (const [category, config] of Object.entries(params)) {
    if (Array.isArray(config)) {
      const categoryMass = config.reduce((sum, item) => sum + (item.mass || 0), 0)
      breakdown[category] = { mass: categoryMass, items: config.length }
      totalMass += categoryMass
    } else if (config && typeof config === 'object') {
      const categoryMass = config.mass || 0
      breakdown[category] = { mass: categoryMass }
      totalMass += categoryMass
    }
  }

  return { totalMass, breakdown, marginPercent: 0 }
}

function calculatePowerBudget(params) {
  let totalConsumption = 0
  const breakdown = {}
  let totalGeneration = 0

  if (params.solarPanels?.deployed) {
    const area = params.solarPanels.count * params.solarPanels.width * params.solarPanels.height
    const efficiency = params.solarPanels.efficiency || 0.28
    const solarConstant = 1361
    totalGeneration = area * efficiency * solarConstant * 0.75
    breakdown.solarGeneration = { power: totalGeneration }
  }

  for (const [category, config] of Object.entries(params)) {
    if (Array.isArray(config)) {
      const categoryPower = config.reduce((sum, item) => sum + (item.power || 0), 0)
      if (categoryPower > 0) {
        breakdown[category] = { power: categoryPower, items: config.length }
        totalConsumption += categoryPower
      }
    } else if (config && typeof config === 'object' && config.power) {
      breakdown[category] = { power: config.power }
      totalConsumption += config.power
    }
  }

  return {
    totalConsumption,
    totalGeneration,
    netPower: totalGeneration - totalConsumption,
    marginPercent: totalGeneration > 0 ? ((totalGeneration - totalConsumption) / totalGeneration) * 100 : 0,
    breakdown,
  }
}

export function calculateOrbitalParams(altitudeKm) {
  const altitude = altitudeKm * 1000
  const radius = EARTH_RADIUS * 1000 + altitude
  const velocity = Math.sqrt(EARTH_MU / radius) * 1000
  const period = 2 * Math.PI * Math.sqrt(Math.pow(radius, 3) / (EARTH_MU * 1e6))
  const angularVelocity = Math.sqrt((EARTH_MU * 1e6) / Math.pow(radius, 3)) * 180 / Math.PI

  return {
    altitude: altitudeKm,
    radius: radius / 1000,
    velocity: velocity / 1000,
    period: period / 60,
    angularVelocity,
  }
}

export function generateOrbitalPath(orbitalParams, numPoints = 128) {
  const { altitude, inclination, eccentricity = 0, argumentOfPerigee = 0, raan = 0 } = orbitalParams
  const { radius } = calculateOrbitalParams(altitude)
  const incRad = inclination * Math.PI / 180
  const raanRad = raan * Math.PI / 180
  const argPRad = argumentOfPerigee * Math.PI / 180

  const path = []
  for (let i = 0; i <= numPoints; i++) {
    const trueAnomaly = (i / numPoints) * 2 * Math.PI
    const r = (radius * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly))
    const argLat = trueAnomaly + argPRad
    const x = r * (Math.cos(argLat) * Math.cos(raanRad) - Math.sin(argLat) * Math.sin(raanRad) * Math.cos(incRad))
    const y = r * (Math.cos(argLat) * Math.sin(raanRad) + Math.sin(argLat) * Math.cos(raanRad) * Math.cos(incRad))
    const z = r * Math.sin(argLat) * Math.sin(incRad)
    path.push(new Vector3(x, y, z))
  }
  return path
}

export function getSatellitePosition(orbitalParams, timeSeconds) {
  const { altitude, inclination, eccentricity = 0, argumentOfPerigee = 0, raan = 0 } = orbitalParams
  const { angularVelocity, radius } = calculateOrbitalParams(altitude)
  const incRad = inclination * Math.PI / 180
  const raanRad = raan * Math.PI / 180
  const argPRad = argumentOfPerigee * Math.PI / 180
  const trueAnomaly = angularVelocity * timeSeconds

  const r = (radius * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(trueAnomaly))
  const argLat = trueAnomaly + argPRad
  const x = r * (Math.cos(argLat) * Math.cos(raanRad) - Math.sin(argLat) * Math.sin(raanRad) * Math.cos(incRad))
  const y = r * (Math.cos(argLat) * Math.sin(raanRad) + Math.sin(argLat) * Math.cos(raanRad) * Math.cos(incRad))
  const z = r * Math.sin(argLat) * Math.sin(incRad)
  return { x, y, z }
}

export { calculateMassBudget, calculatePowerBudget, EARTH_RADIUS, EARTH_MU }
export default useOrbitalStore