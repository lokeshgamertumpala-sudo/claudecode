import { motion } from 'framer-motion'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  TrendingUp,
  Target,
  Zap,
  Fuel,
  Weight,
  DollarSign,
  Clock
} from 'lucide-react'

const metricConfig = [
  { key: 'totalMass', label: 'Total Mass', unit: 'kg', icon: Weight, format: v => v.toLocaleString(), color: 'text-cyan-400' },
  { key: 'deltaV', label: 'Delta-V', unit: 'km/s', icon: Target, format: v => v.toFixed(2), color: 'text-primary', highlight: true },
  { key: 'twr', label: 'Thrust/Weight', unit: '', icon: Zap, format: v => v.toFixed(2), color: 'text-amber-400' },
  { key: 'burnTime', label: 'Burn Time', unit: 's', icon: Clock, format: v => v.toFixed(0), color: 'text-orange-400' },
  { key: 'payloadFraction', label: 'Payload Fraction', unit: '%', icon: Fuel, format: v => (v * 100).toFixed(1), color: 'text-success' },
  { key: 'costEstimate', label: 'Cost Estimate', unit: 'B $', icon: DollarSign, format: v => v.toFixed(2), color: 'text-yellow-400' },
  { key: 'deltaVMargin', label: 'Delta-V Margin', unit: '%', icon: TrendingUp, format: v => v.toFixed(1), color: 'text-purple-400' },
  { key: 'thermalLoad', label: 'Thermal Load', unit: 'W', icon: Zap, format: v => v.toLocaleString(), color: 'text-red-400' },
]

export default function ResultsPanel({ results, isSimulating, visible }) {
  if (!visible && !results) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass rounded-2xl p-6 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Simulation Results
        </h3>
        {isSimulating && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Running...
          </div>
        )}
      </div>

      {results ? (
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className={`p-4 rounded-xl border-l-4 ${results.feasibility === 'Feasible' ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${results.feasibility === 'Feasible' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {results.feasibility === 'Feasible' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-semibold">{results.feasibility === 'Feasible' ? 'Design Feasible' : 'Design Infeasible'}</p>
                <p className="text-sm text-muted-foreground">
                  {results.feasibility === 'Feasible'
                    ? 'All mission requirements satisfied with adequate margins'
                    : 'Design does not meet mission requirements - revisions needed'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {metricConfig.map(({ key, label, unit, icon: Icon, format, color, highlight }) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`p-4 rounded-xl glass ${highlight ? 'border border-primary/30 bg-primary/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} bg-opacity-20`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className={`font-mono text-lg font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
                      {format(results[key])} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {results.warnings.length > 0 && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
              <h4 className="font-medium text-warning mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Design Warnings ({results.warnings.length})
              </h4>
              <ul className="space-y-2">
                {results.warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-4 rounded-xl glass">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Additional Metrics
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricRow label="Radiation Dose" value={`${results.radiationDose} krad`} />
              <MetricRow label="Comms Margin" value={results.commsMargin} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <p className="text-center">Configure parameters and run simulation to see results</p>
        </div>
      )}
    </motion.div>
  )
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  )
}