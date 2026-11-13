import {
  SlidersHorizontal,
  Navigation,
  Cloud,
  HelpCircle
} from 'lucide-react'

const spacecraftFields = [
  { key: 'dryMass', label: 'Dry Mass (kg)', type: 'number', min: 100, step: 100, help: 'Spacecraft mass without propellant' },
  { key: 'propellantMass', label: 'Propellant Mass (kg)', type: 'number', min: 100, step: 100, help: 'Total propellant capacity' },
  { key: 'engineIsp', label: 'Engine Isp (s)', type: 'number', min: 150, max: 450, step: 1, help: 'Specific impulse of main engines' },
  { key: 'engineCount', label: 'Engine Count', type: 'number', min: 1, max: 20, step: 1, help: 'Number of main engines' },
  { key: 'thrustPerEngine', label: 'Thrust per Engine (kN)', type: 'number', min: 10, step: 10, help: 'Vacuum thrust per engine' },
  { key: 'tankPressure', label: 'Tank Pressure (bar)', type: 'number', min: 1, max: 50, step: 1, help: 'Propellant tank operating pressure' },
  { key: 'tankMaterial', label: 'Tank Material', type: 'select', options: ['Al-Li 2195', 'Al 2219', 'Ti-6Al-4V', 'Carbon Composite', 'Inconel 718'], help: 'Propellant tank material' },
  { key: 'structureMaterial', label: 'Structure Material', type: 'select', options: ['Carbon Composite', 'Al-Li 2195', 'Ti-6Al-4V', 'Steel 300M'], help: 'Primary structure material' },
  { key: 'powerGeneration', label: 'Power Generation (W)', type: 'number', min: 100, step: 100, help: 'Electrical power generation capacity' },
  { key: 'thermalControl', label: 'Thermal Control', type: 'select', options: ['Active', 'Passive', 'Hybrid'], help: 'Thermal management system type' },
  { key: 'commsPower', label: 'Comms Power (W)', type: 'number', min: 10, step: 10, help: 'RF communications power' },
  { key: 'dataRate', label: 'Data Rate (Mbps)', type: 'number', min: 1, step: 1, help: 'Maximum downlink data rate' },
]

const trajectoryFields = [
  { key: 'departureBody', label: 'Departure Body', type: 'select', options: ['Earth', 'Moon', 'Mars', 'LEO', 'GEO', 'L1', 'L2'], help: 'Starting celestial body or orbit' },
  { key: 'arrivalBody', label: 'Arrival Body', type: 'select', options: ['Mars', 'Moon', 'Venus', 'Jupiter', 'Saturn', 'Mercury', 'Asteroid'], help: 'Target celestial body' },
  { key: 'departureDate', label: 'Departure Date', type: 'date', help: 'Planned launch/departure date' },
  { key: 'arrivalDate', label: 'Arrival Date', type: 'date', help: 'Planned arrival date' },
  { key: 'transferType', label: 'Transfer Type', type: 'select', options: ['Hohmann', 'Bi-elliptic', 'Low-thrust', 'Ballistic Capture', 'Gravity Assist'], help: 'Trajectory transfer method' },
  { key: 'flybyBodies', label: 'Gravity Assist Bodies', type: 'text', help: 'Comma-separated list of flyby bodies' },
  { key: 'deltaVBudget', label: 'Delta-V Budget (km/s)', type: 'number', min: 0.1, step: 0.1, help: 'Total delta-V allocated for mission' },
  { key: 'margin', label: 'Design Margin', type: 'number', min: 0, max: 0.5, step: 0.05, help: 'Fractional margin on delta-V budget' },
]

const environmentFields = [
  { key: 'solarFlux', label: 'Solar Flux (W/m²)', type: 'number', min: 10, max: 3000, step: 10, help: 'Solar constant at target distance' },
  { key: 'radiationModel', label: 'Radiation Model', type: 'select', options: ['AP-8/AE-8', 'CRRES', 'SPENVIS', 'JPL', 'Custom'], help: 'Radiation environment model' },
  { key: 'micrometeoroidFlux', label: 'Micrometeoroid Flux', type: 'number', min: 1e-9, max: 1e-3, step: 1e-7, help: 'Particles/m²/s' },
  { key: 'thermalEnvironment', label: 'Thermal Environment', type: 'select', options: ['Deep Space', 'Planetary Orbit', 'Surface', 'Lunar Shadow', 'Venus Orbit'], help: 'Thermal environment classification' },
]

export default function ParameterPanel({ tab, specs, onUpdateSpacecraft, onUpdateTrajectory, onUpdateEnvironment }) {
  const fields = tab === 'spacecraft' ? spacecraftFields : tab === 'trajectory' ? trajectoryFields : environmentFields
  const currentSpecs = specs[tab]
  const updater = tab === 'spacecraft' ? onUpdateSpacecraft : tab === 'trajectory' ? onUpdateTrajectory : onUpdateEnvironment

  const TabIcons = { spacecraft: SlidersHorizontal, trajectory: Navigation, environment: Cloud }
  const TabIcon = TabIcons[tab]

  const handleChange = (key, value) => {
    if (key === 'flybyBodies') {
      value = value.split(',').map(s => s.trim()).filter(Boolean)
    } else if (key === 'margin' || key === 'micrometeoroidFlux') {
      value = parseFloat(value)
    } else if (['dryMass', 'propellantMass', 'engineIsp', 'engineCount', 'thrustPerEngine', 'tankPressure', 'powerGeneration', 'commsPower', 'dataRate', 'solarFlux', 'deltaVBudget'].includes(key)) {
      value = parseFloat(value)
    }
    updater({ [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <TabIcon className="w-6 h-6 text-primary" />
        <h3 className="font-semibold text-lg capitalize">{tab} Parameters</h3>
      </div>

      <div className="space-y-4">
        {fields.map(field => (
          <div key={field.key} className="glass p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="font-medium">{field.label}</label>
              <button className="p-1 hover:bg-secondary rounded text-muted-foreground" title={field.help}>
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            {field.type === 'select' ? (
              <select
                value={currentSpecs[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                className="input w-full"
              >
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'date' ? (
              <input
                type="date"
                value={currentSpecs[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                className="input w-full"
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={currentSpecs[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                min={field.min}
                max={field.max}
                step={field.step}
                placeholder={field.help}
                className="input w-full"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}