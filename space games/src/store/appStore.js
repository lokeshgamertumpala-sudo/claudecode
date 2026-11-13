import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

const defaultOrbitalParams = {
  altitude: 600, // km
  inclination: 98.2, // degrees (sun-synchronous)
  eccentricity: 0.0,
  argumentOfPerigee: 0,
  raan: 0,
  trueAnomaly: 0,
  epoch: Date.now(),
}

const defaultMissionConfig = {
  name: 'Earth Observation Mission',
  objective: 'earth-observation',
  targetOrbit: 'leo',
  launchVehicle: 'falcon9',
  constraints: {
    maxMass: 2000, // kg
    maxPower: 2000, // W
    minLifetime: 5, // years
    maxCost: 500, // million USD
  },
  instruments: [],
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // App state
      isInitialized: false,
      currentPage: 'dashboard',
      sidebarOpen: true,

      // Spacecraft configuration
      spacecraftParams: defaultSpacecraftParams,
      spacecraftId: null,

      // Orbital parameters
      orbitalParams: defaultOrbitalParams,

      // Mission configuration
      missionConfig: defaultMissionConfig,

      // Sketch analysis
      sketchFile: null,
      sketchAnalysis: null,
      sketchConfirmed: false,

      // Simulation state
      simulationRunning: false,
      simulationSpeed: 1,
      simulationTime: 0,
      orbitalPath: [],
      satellitePosition: { x: 0, y: 0, z: 0 },

      // Calculated budgets
      massBudget: null,
      powerBudget: null,
      constraintViolations: [],

      // AI integration
      aiModel: 'kimi-3.1-pro',
      apiKey: null,
      aiResponses: [],

      // 3D viewport
      selectedComponent: null,
      cameraPosition: { x: 10, y: 8, z: 10 },
      showGrid: true,
      showAxes: true,
      wireframe: false,

      // UI state
      notifications: [],
      loadingStates: {},
      modals: {},

      // Actions
      initializeApp: () => {
        const apiKey = import.meta.env.VITE_NVIDIA_API_KEY || localStorage.getItem('nvidia_api_key')
        set({
          isInitialized: true,
          apiKey,
          spacecraftParams: { ...defaultSpacecraftParams },
          orbitalParams: { ...defaultOrbitalParams },
          missionConfig: { ...defaultMissionConfig },
        })
        get().calculateBudgets()
        get().calculateOrbitalPath()
      },

      setCurrentPage: (page) => set({ currentPage: page }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Spacecraft parameter actions
      updateSpacecraftParam: (category, key, value) => set((state) => {
        const newParams = { ...state.spacecraftParams, [category]: { ...state.spacecraftParams[category], [key]: value } }
        return { spacecraftParams: newParams }
      }),

      updateSpacecraftCategory: (category, params) => set((state) => ({
        spacecraftParams: { ...state.spacecraftParams, [category]: { ...state.spacecraftParams[category], ...params } }
      })),

      addInstrument: (instrument) => set((state) => ({
        spacecraftParams: {
          ...state.spacecraftParams,
          instruments: [...state.spacecraftParams.instruments, { ...instrument, id: `inst-${Date.now()}` }]
        }
      })),

      removeInstrument: (id) => set((state) => ({
        spacecraftParams: {
          ...state.spacecraftParams,
          instruments: state.spacecraftParams.instruments.filter(inst => inst.id !== id)
        }
      })),

      updateInstrument: (id, updates) => set((state) => ({
        spacecraftParams: {
          ...state.spacecraftParams,
          instruments: state.spacecraftParams.instruments.map(inst =>
            inst.id === id ? { ...inst, ...updates } : inst
          )
        }
      })),

      loadSampleSpacecraft: (sample) => {
        const samples = {
          cubesat: {
            mainBody: { width: 0.3, height: 0.1, depth: 0.1, mass: 4 },
            solarPanels: { count: 4, width: 0.3, height: 0.2, mass: 0.5, efficiency: 0.28, deployed: true },
            antenna: { diameter: 0.2, mass: 0.1, type: 'patch' },
            instruments: [{ id: 'inst-1', name: 'Camera', mass: 0.2, power: 2, type: 'optical' }],
            propulsion: { type: 'cold-gas', mass: 0.5, thrust: 0.1, isp: 70 },
            structure: { mass: 0.8 },
            thermal: { mass: 0.2 },
            avionics: { mass: 0.3, power: 1 },
            power: { batteryCapacity: 50, mass: 0.5 },
          },
          smallsat: {
            mainBody: { width: 1.0, height: 0.5, depth: 0.8, mass: 150 },
            solarPanels: { count: 2, width: 2.0, height: 1.0, mass: 20, efficiency: 0.30, deployed: true },
            antenna: { diameter: 0.8, mass: 10, type: 'parabolic' },
            instruments: [
              { id: 'inst-1', name: 'Multispectral Imager', mass: 25, power: 30, type: 'optical' },
              { id: 'inst-2', name: 'Thermal Camera', mass: 15, power: 20, type: 'science' },
            ],
            propulsion: { type: 'electric', mass: 40, thrust: 0.5, isp: 1800 },
            structure: { mass: 50 },
            thermal: { mass: 20 },
            avionics: { mass: 10, power: 8 },
            power: { batteryCapacity: 1000, mass: 25 },
          },
          default: defaultSpacecraftParams,
        }
        set({ spacecraftParams: samples[sample] || defaultSpacecraftParams })
        get().calculateBudgets()
      },

      resetSpacecraft: () => set({ spacecraftParams: { ...defaultSpacecraftParams } }),

      // Orbital parameter actions
      updateOrbitalParam: (key, value) => set((state) => ({
        orbitalParams: { ...state.orbitalParams, [key]: value }
      })),

      setOrbitalParams: (params) => set({ orbitalParams: { ...get().orbitalParams, ...params } }),

      // Mission config actions
      updateMissionConfig: (key, value) => set((state) => ({
        missionConfig: { ...state.missionConfig, [key]: value }
      })),

      updateMissionConstraints: (constraints) => set((state) => ({
        missionConfig: { ...state.missionConfig, constraints: { ...state.missionConfig.constraints, ...constraints } }
      })),

      // Sketch actions
      setSketchFile: (file) => set({ sketchFile: file }),
      setSketchAnalysis: (analysis) => set({ sketchAnalysis: analysis, sketchConfirmed: false }),
      confirmSketch: () => set({ sketchConfirmed: true }),
      clearSketch: () => set({ sketchFile: null, sketchAnalysis: null, sketchConfirmed: false }),

      // Simulation actions
      startSimulation: () => set({ simulationRunning: true, simulationTime: 0 }),
      pauseSimulation: () => set({ simulationRunning: false }),
      resetSimulation: () => set({ simulationRunning: false, simulationTime: 0, satellitePosition: { x: 0, y: 0, z: 0 } }),
      setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
      updateSimulationTime: (time) => set({ simulationTime: time }),
      updateSatellitePosition: (position) => set({ satellitePosition: position }),

      // 3D viewport actions
      setSelectedComponent: (component) => set({ selectedComponent: component }),
      setCameraPosition: (position) => set({ cameraPosition: position }),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
      toggleWireframe: () => set((state) => ({ wireframe: !state.wireframe })),

      // Calculation actions
      calculateBudgets: () => {
        const { spacecraftParams, missionConfig } = get()
        const massBudget = calculateMassBudget(spacecraftParams, missionConfig.constraints.maxMass)
        const powerBudget = calculatePowerBudget(spacecraftParams)
        const constraintViolations = checkConstraints(massBudget, powerBudget, missionConfig.constraints)
        set({ massBudget, powerBudget, constraintViolations })
      },

      calculateOrbitalPath: () => {
        const { orbitalParams } = get()
        const path = generateOrbitalPath(orbitalParams)
        set({ orbitalPath: path })
      },

      // AI actions
      setApiKey: (key) => {
        localStorage.setItem('nvidia_api_key', key)
        set({ apiKey: key })
      },
      addAiResponse: (response) => set((state) => ({
        aiResponses: [...state.aiResponses, { ...response, id: Date.now(), timestamp: new Date().toISOString() }]
      })),
      clearAiResponses: () => set({ aiResponses: [] }),

      // Notification actions
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { ...notification, id: Date.now() }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      clearNotifications: () => set({ notifications: [] }),

      // Loading states
      setLoading: (key, loading) => set((state) => ({
        loadingStates: { ...state.loadingStates, [key]: loading }
      })),

      // Modal actions
      openModal: (key, data) => set((state) => ({
        modals: { ...state.modals, [key]: { open: true, data } }
      })),
      closeModal: (key) => set((state) => ({
        modals: { ...state.modals, [key]: { open: false, data: null } }
      })),
    }),
    {
      name: 'orbitforge-storage',
      partialize: (state) => ({
        spacecraftParams: state.spacecraftParams,
        orbitalParams: state.orbitalParams,
        missionConfig: state.missionConfig,
        apiKey: state.apiKey,
        cameraPosition: state.cameraPosition,
        showGrid: state.showGrid,
        showAxes: state.showAxes,
        wireframe: state.wireframe,
      }),
    }
  )
)

// Orbital mechanics calculations
export const EARTH_MU = 3.986004418e14 // m^3/s^2
export const EARTH_RADIUS = 6371000 // m

export function calculateOrbitalParams(altitudeKm) {
  const altitude = altitudeKm * 1000 // convert to meters
  const radius = EARTH_RADIUS + altitude
  const velocity = Math.sqrt(EARTH_MU / radius)
  const period = 2 * Math.PI * Math.sqrt(Math.pow(radius, 3) / EARTH_MU)
  const angularVelocity = Math.sqrt(EARTH_MU / Math.pow(radius, 3))

  return {
    altitude: altitudeKm,
    radius: radius / 1000, // km
    velocity: velocity / 1000, // km/s
    period: period / 60, // minutes
    angularVelocity: angularVelocity * 1000, // deg/s * 1000 for precision
  }
}

export function generateOrbitalPath(orbitalParams, numPoints = 100) {
  const { altitude, inclination } = orbitalParams
  const { radius } = calculateOrbitalParams(altitude)
  const radiusKm = radius
  const incRad = inclination * Math.PI / 180

  const path = []
  for (let i = 0; i <= numPoints; i++) {
    const theta = (i / numPoints) * 2 * Math.PI
    const x = radiusKm * Math.cos(theta)
    const y = radiusKm * Math.sin(theta) * Math.cos(incRad)
    const z = radiusKm * Math.sin(theta) * Math.sin(incRad)
    path.push([x, y, z])
  }
  return path
}

export function getSatellitePosition(orbitalParams, timeSeconds) {
  const { altitude, inclination, eccentricity = 0 } = orbitalParams
  const { angularVelocity, radius } = calculateOrbitalParams(altitude)
  const incRad = inclination * Math.PI / 180

  // Mean anomaly
  const M = angularVelocity * timeSeconds / 1000 // Convert angularVelocity back to rad/s

  // For circular orbit, true anomaly = mean anomaly
  const theta = M

  const x = radius * Math.cos(theta)
  const y = radius * Math.sin(theta) * Math.cos(incRad)
  const z = radius * Math.sin(theta) * Math.sin(incRad)

  return { x, y, z }
}

// Mass budget calculations
function calculateMassBudget(params, maxMass) {
  const mainBodyMass = params.mainBody.mass || 0
  const solarPanelsMass = (params.solarPanels.mass || 0) * (params.solarPanels.count || 0)
  const antennaMass = params.antenna.mass || 0
  const instrumentsMass = params.instruments.reduce((sum, inst) => sum + (inst.mass || 0), 0)
  const propulsionMass = params.propulsion.mass || 0
  const structureMass = params.structure.mass || 0
  const thermalMass = params.thermal.mass || 0
  const avionicsMass = params.avionics.mass || 0
  const powerMass = params.power.mass || 0

  const dryMass = mainBodyMass + solarPanelsMass + antennaMass + instrumentsMass +
                  propulsionMass + structureMass + thermalMass + avionicsMass + powerMass

  const propellantMass = 0 // Simplified - would need delta-v calculation
  const wetMass = dryMass + propellantMass
  const margin = maxMass - wetMass
  const marginPercent = (margin / maxMass) * 100

  return {
    breakdown: {
      mainBody: mainBodyMass,
      solarPanels: solarPanelsMass,
      antenna: antennaMass,
      instruments: instrumentsMass,
      propulsion: propulsionMass,
      structure: structureMass,
      thermal: thermalMass,
      avionics: avionicsMass,
      power: powerMass,
    },
    dryMass,
    propellantMass,
    wetMass,
    maxMass,
    margin,
    marginPercent,
    status: margin >= 0 ? 'ok' : margin > -100 ? 'warning' : 'danger',
  }
}

// Power budget calculations
function calculatePowerBudget(params) {
  const solarConstant = 1361 // W/m^2
  const panelArea = (params.solarPanels.width || 0) * (params.solarPanels.height || 0) * (params.solarPanels.count || 0)
  const efficiency = params.solarPanels.efficiency || 0.28
  const losses = 0.77 // Temperature, cosine, aging, wiring losses

  const generatedPower = panelArea * solarConstant * efficiency * losses

  const instrumentsPower = params.instruments.reduce((sum, inst) => sum + (inst.power || 0), 0)
  const avionicsPower = params.avionics.power || 0
  const thermalPower = 50 // Estimated thermal control power
  const propulsionPower = params.propulsion.type === 'electric' ? 500 : 0
  const commPower = 100 // Communication system power

  const totalConsumption = instrumentsPower + avionicsPower + thermalPower + propulsionPower + commPower
  const margin = generatedPower - totalConsumption
  const marginPercent = (margin / generatedPower) * 100

  return {
    generated: generatedPower,
    consumption: {
      instruments: instrumentsPower,
      avionics: avionicsPower,
      thermal: thermalPower,
      propulsion: propulsionPower,
      communication: commPower,
    },
    totalConsumption,
    margin,
    marginPercent,
    panelArea,
    efficiency,
    status: margin >= 0 ? 'ok' : margin > -100 ? 'warning' : 'danger',
  }
}

// Constraint checking
function checkConstraints(massBudget, powerBudget, constraints) {
  const violations = []

  if (massBudget.wetMass > constraints.maxMass) {
    violations.push({
      type: 'mass',
      severity: 'danger',
      message: `Mass exceeds limit: ${massBudget.wetMass.toFixed(1)} kg > ${constraints.maxMass} kg`,
      value: massBudget.wetMass,
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
}

export { calculateMassBudget, calculatePowerBudget, checkConstraints }