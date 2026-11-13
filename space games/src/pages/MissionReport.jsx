import {
  Download,
  Rocket,
  Satellite,
  Globe,
  Zap,
  Scale,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronDown,
  Printer,
} from 'lucide-react'
import { useOrbitalStore, calculateOrbitalParams } from '../stores/orbitalStore'
import { clsx } from 'clsx'
import React from 'react'

export function MissionReport() {
  const {
    missionConfig,
    spacecraftParams,
    orbitalParams,
    massBudget,
    powerBudget,
    constraintViolations,
    sketchAnalysis,
  } = useOrbitalStore()

  const orbitalData = calculateOrbitalParams(orbitalParams.altitude)

  const generateReport = () => {
    const report = {
      metadata: {
        generated: new Date().toISOString(),
        version: '1.0.0',
        tool: 'ORBITFORGE AI',
      },
      mission: missionConfig,
      spacecraft: spacecraftParams,
      orbit: { ...orbitalParams, ...orbitalData },
      massBudget,
      powerBudget,
      constraints: constraintViolations,
      instruments: spacecraftParams.instruments,
      sketchAnalysis: sketchAnalysis ? {
        components: sketchAnalysis.components.map(c => ({
          type: c.type,
          name: c.name,
          source: c.source,
        }))
      } : null,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${missionConfig.name.replace(/\s+/g, '_')}_mission_report.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const printReport = () => {
    window.print()
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-space-100">Mission Report</h1>
          <p className="text-space-400 mt-1">Comprehensive mission design documentation and analysis</p>
        </div>
        <div className="flex gap-3">
          <button onClick={printReport} className="btn-secondary">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button onClick={generateReport} className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Report Header */}
      <div className="panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-space-50">{missionConfig.name}</h2>
            <p className="text-space-400 mt-1">Mission Design Report • Generated {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={clsx('badge',
              constraintViolations.some(v => v.severity === 'danger') ? 'badge-danger' :
              constraintViolations.some(v => v.severity === 'warning') ? 'badge-warning' : 'badge-success'
            )}>
              {constraintViolations.some(v => v.severity === 'danger') ? 'Violations' :
               constraintViolations.some(v => v.severity === 'warning') ? 'Warnings' : 'All Clear'}
            </span>
            <span className="badge badge-info">{missionConfig.objective.replace('-', ' ')}</span>
            <span className="badge badge-info">{missionConfig.targetOrbit.toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-space-800/50 border border-space-700">
            <div className="flex items-center gap-2 text-space-400 text-sm mb-1">
              <Rocket className="h-4 w-4" />
              Launch Vehicle
            </div>
            <div className="font-mono text-lg text-space-100">{missionConfig.launchVehicle.replace('-', ' ').toUpperCase()}</div>
          </div>
          <div className="p-4 rounded-lg bg-space-800/50 border border-space-700">
            <div className="flex items-center gap-2 text-space-400 text-sm mb-1">
              <Target className="h-4 w-4" />
              Target Orbit
            </div>
            <div className="font-mono text-lg text-space-100">{orbitalParams.altitude} km • {orbitalParams.inclination}°</div>
          </div>
          <div className="p-4 rounded-lg bg-space-800/50 border border-space-700">
            <div className="flex items-center gap-2 text-space-400 text-sm mb-1">
              <Clock className="h-4 w-4" />
              Orbital Period
            </div>
            <div className="font-mono text-lg text-space-100">{orbitalData.period.toFixed(1)} min</div>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      <div className="space-y-4">
        {renderSection('overview', 'Mission Overview', Info, () => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Mission Name" value={missionConfig.name} />
              <InfoRow label="Objective" value={missionConfig.objective.replace('-', ' ')} />
              <InfoRow label="Target Orbit" value={missionConfig.targetOrbit.toUpperCase()} />
              <InfoRow label="Launch Vehicle" value={missionConfig.launchVehicle.replace('-', ' ').toUpperCase()} />
            </div>
            <div className="p-4 rounded-lg bg-space-800/50 border border-space-700">
              <h4 className="font-medium text-space-300 mb-2">Mission Description</h4>
              <p className="text-space-400">
                This mission is designed for {missionConfig.objective.replace('-', ' ')} operations
                in {missionConfig.targetOrbit.toUpperCase()} at {orbitalParams.altitude} km altitude
                with {orbitalParams.inclination}° inclination. The spacecraft will be launched on a
                {missionConfig.launchVehicle.replace('-', ' ').toUpperCase()} vehicle.
              </p>
            </div>
          </div>
        ))}

        {renderSection('spacecraft', 'Spacecraft Configuration', Satellite, () => (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(spacecraftParams).filter(([k]) => k !== 'instruments').map(([category, params]) => (
                <div key={category} className="p-4 rounded-lg bg-space-800/50 border border-space-700">
                  <h4 className="font-medium text-space-300 mb-3 capitalize">{category.replace(/([A-Z])/g, ' $1')}</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(params).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-space-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-mono text-space-100">
                          {typeof value === 'number' ?
                            (key.includes('mass') ? `${value} kg` : key.includes('power') ? `${value} W` :
                             key.includes('efficiency') ? `${(value * 100).toFixed(0)}%` :
                             key.includes('thrust') ? `${value} N` :
                             key.includes('isp') ? `${value} s` :
                             key.includes('capacity') ? `${value} Wh` : value) : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {renderSection('orbit', 'Orbital Parameters', Globe, () => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <OrbitParamCard label="Altitude" value={`${orbitalParams.altitude} km`} icon={Target} />
            <OrbitParamCard label="Inclination" value={`${orbitalParams.inclination}°`} icon={Target} />
            <OrbitParamCard label="Eccentricity" value={orbitalParams.eccentricity.toFixed(3)} icon={Target} />
            <OrbitParamCard label="Arg. of Perigee" value={`${orbitalParams.argumentOfPerigee}°`} icon={Target} />
            <OrbitParamCard label="RAAN" value={`${orbitalParams.raan}°`} icon={Target} />
            <OrbitParamCard label="Orbital Radius" value={`${orbitalData.radius.toFixed(1)} km`} icon={Globe} />
            <OrbitParamCard label="Velocity" value={`${orbitalData.velocity.toFixed(3)} km/s`} icon={Zap} />
            <OrbitParamCard label="Period" value={`${orbitalData.period.toFixed(1)} min`} icon={Clock} />
          </div>
        ))}

        {renderSection('budgets', 'Mass & Power Budgets', Scale, () => (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mass Budget */}
            <div className="panel">
              <h4 className="font-semibold text-space-100 mb-4 flex items-center gap-2">
                <Scale className="h-5 w-5 text-accent-400" />
                Mass Budget
              </h4>
              {massBudget && (
                <div className="space-y-3">
                  <BudgetRow label="Main Body" value={`${massBudget.breakdown.mainBody} kg`} />
                  <BudgetRow label="Solar Panels" value={`${massBudget.breakdown.solarPanels} kg`} />
                  <BudgetRow label="Antenna" value={`${massBudget.breakdown.antenna} kg`} />
                  <BudgetRow label="Instruments" value={`${massBudget.breakdown.instruments} kg`} />
                  <BudgetRow label="Propulsion" value={`${massBudget.breakdown.propulsion} kg`} />
                  <BudgetRow label="Structure" value={`${massBudget.breakdown.structure} kg`} />
                  <BudgetRow label="Thermal" value={`${massBudget.breakdown.thermal} kg`} />
                  <BudgetRow label="Avionics" value={`${massBudget.breakdown.avionics} kg`} />
                  <BudgetRow label="Power System" value={`${massBudget.breakdown.power} kg`} />
                  <div className="border-t border-space-700 pt-2" />
                  <BudgetRow label="Dry Mass" value={`${massBudget.dryMass.toFixed(1)} kg`} bold />
                  <BudgetRow label="Propellant" value={`${massBudget.propellantMass.toFixed(1)} kg`} />
                  <BudgetRow label="Wet Mass" value={`${massBudget.wetMass.toFixed(1)} kg`} bold />
                  <BudgetRow label="Mass Limit" value={`${massBudget.maxMass} kg`} />
                  <BudgetRow
                    label="Margin"
                    value={`${massBudget.margin >= 0 ? '+' : ''}${massBudget.margin.toFixed(1)} kg (${massBudget.marginPercent.toFixed(1)}%)`}
                    color={massBudget.margin >= 0 ? 'text-success-400' : 'text-danger-400'}
                  />
                </div>
              )}
            </div>

            {/* Power Budget */}
            <div className="panel">
              <h4 className="font-semibold text-space-100 mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent-400" />
                Power Budget
              </h4>
              {powerBudget && (
                <div className="space-y-3">
                  <BudgetRow label="Solar Generated" value={`${powerBudget.generated.toFixed(0)} W`} color="text-success-400" />
                  <div className="border-t border-space-700 pt-2" />
                  <BudgetRow label="Instruments" value={`${powerBudget.consumption.instruments.toFixed(0)} W`} />
                  <BudgetRow label="Avionics" value={`${powerBudget.consumption.avionics.toFixed(0)} W`} />
                  <BudgetRow label="Thermal Control" value={`${powerBudget.consumption.thermal.toFixed(0)} W`} />
                  <BudgetRow label="Propulsion" value={`${powerBudget.consumption.propulsion.toFixed(0)} W`} />
                  <BudgetRow label="Communications" value={`${powerBudget.consumption.communication.toFixed(0)} W`} />
                  <div className="border-t border-space-700 pt-2" />
                  <BudgetRow label="Total Consumption" value={`${powerBudget.totalConsumption.toFixed(0)} W`} bold />
                  <BudgetRow label="Net Margin" value={`${powerBudget.margin >= 0 ? '+' : ''}${powerBudget.margin.toFixed(0)} W (${powerBudget.marginPercent.toFixed(1)}%)`}
                    color={powerBudget.margin >= 0 ? 'text-success-400' : 'text-danger-400'}
                  />
                  <div className="pt-2 border-t border-space-700">
                    <p className="text-xs text-space-500">
                      Panel Area: {powerBudget.panelArea.toFixed(1)} m² • Efficiency: {(powerBudget.efficiency * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {renderSection('constraints', 'Constraint Verification',
          constraintViolations.some(v => v.severity === 'danger') ? XCircle :
          constraintViolations.some(v => v.severity === 'warning') ? AlertTriangle : CheckCircle2,
          () => (
          <div className="space-y-3">
            {constraintViolations.length === 0 ? (
              <div className="panel border-success-500/30">
                <div className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="h-8 w-8 text-success-400" />
                  <div>
                    <h4 className="font-semibold text-success-400">All Constraints Satisfied</h4>
                    <p className="text-space-400 text-sm">Mission configuration is within all defined limits</p>
                  </div>
                </div>
              </div>
            ) : (
              constraintViolations.map((v, i) => (
                <div key={i} className={clsx('p-4 rounded-lg border flex items-start gap-3',
                  v.severity === 'danger' ? 'bg-danger-500/10 border-danger-500/30' : 'bg-warning-500/10 border-warning-500/30'
                )}>
                  <div className={clsx('flex-shrink-0 mt-0.5', v.severity === 'danger' ? 'text-danger-400' : 'text-warning-400')}>
                    {v.severity === 'danger' ? <XCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-space-100">{v.message}</p>
                    <p className="text-xs text-space-500 mt-1">Current: {v.value} • Limit: {v.limit}</p>
                  </div>
                  <span className={clsx('badge ml-auto', v.severity === 'danger' ? 'badge-danger' : 'badge-warning')}>
                    {v.severity.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </div>
        ))}

        {renderSection('instruments', 'Science Instruments', Target, () => (
          <div className="space-y-3">
            {spacecraftParams.instruments.length === 0 ? (
              <div className="panel text-center py-8">
                <p className="text-space-400">No instruments configured</p>
              </div>
            ) : (
              spacecraftParams.instruments.map((inst) => (
                <div key={inst.id} className="panel">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔬</span>
                      <div>
                        <h4 className="font-semibold text-space-100">{inst.name}</h4>
                        <p className="text-xs text-space-500 capitalize">{inst.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-space-400">
                        <Scale className="h-4 w-4" /> {inst.mass} kg
                      </span>
                      <span className="flex items-center gap-1 text-space-400">
                        <Zap className="h-4 w-4" /> {inst.power} W
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ))}

        {renderSection('ai', 'AI Analysis', Info, () => (
          <div className="space-y-4">
            {sketchAnalysis ? (
              <div className="space-y-3">
                <p className="text-space-400">Sketch analysis performed with NVIDIA Kimi 3.1 Pro vision model</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sketchAnalysis.components.map((comp, i) => (
                    <div key={i} className="panel-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{componentTypes.find(c => c.id === comp.type)?.icon || '📦'}</span>
                        <span className="font-medium text-space-100">{comp.name}</span>
                      </div>
                      <span className={clsx('badge text-xs',
                        comp.source === 'detected' && 'badge-info',
                        comp.source === 'inferred' && 'badge-warning',
                        comp.source === 'estimated' && 'badge-warning',
                      )}>
                        {comp.source}
                      </span>
                      {comp.notes && <p className="text-xs text-space-500 mt-2">{comp.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="panel text-center py-8">
                <Info className="h-12 w-12 text-space-600 mx-auto mb-3" />
                <p className="text-space-400">No sketch analysis performed</p>
                <p className="text-space-500 text-sm mt-1">Upload a spacecraft sketch in the Sketch Analyzer to generate AI analysis</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function renderSection(id, title, Icon, children) {
  // eslint-disable-next-line no-unused-vars
  const expanded = true // Simplified for now
  return (
    <div key={id} className="panel">
      <button className="w-full flex items-center justify-between p-4 hover:bg-space-800/50 transition-colors" onClick={() => {}}>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-space-100">{title}</h3>
        </div>
        <ChevronDown className="h-5 w-5 text-space-500" />
      </button>
      <div className="px-4 pb-4">{children()}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-space-800/50 border border-space-700">
      <p className="text-xs text-space-500 uppercase tracking-wider">{label}</p>
      <p className="font-mono text-space-100 mt-1">{value}</p>
    </div>
  )
}

function OrbitParamCard({ label, value, icon: Icon }) {
  return (
    <div className="panel-sm text-center">
      <Icon className="h-5 w-5 text-accent-400 mx-auto mb-2" />
      <p className="text-xs text-space-500 uppercase tracking-wider">{label}</p>
      <p className="font-mono text-lg text-space-100 mt-1">{value}</p>
    </div>
  )
}

function BudgetRow({ label, value, bold, color }) {
  return (
    <div className={clsx('flex justify-between text-sm', bold && 'font-semibold')}>
      <span className="text-space-400">{label}</span>
      <span className={clsx('font-mono', color || 'text-space-100')}>{value}</span>
    </div>
  )
}

const componentTypes = [
  { id: 'mainBody', name: 'Main Body', icon: '📦' },
  { id: 'solarPanels', name: 'Solar Panels', icon: '☀️' },
  { id: 'antenna', name: 'Antenna/Dish', icon: '📡' },
  { id: 'instruments', name: 'Instruments', icon: '🔬' },
  { id: 'propulsion', name: 'Propulsion', icon: '🚀' },
  { id: 'thermal', name: 'Thermal', icon: '🌡️' },
]// default export for lazy loading
export default MissionReport
