import { useState, useEffect } from 'react'
import {
  Rocket,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  DollarSign,
  Loader2
} from 'lucide-react'
import { useMissionStore } from '../stores/missionStore'
import { useEngineeringStore } from '../stores/engineeringStore'
import StatCard from '../components/StatCard'
import MissionList from '../components/MissionList'
import ChartWidget from '../components/ChartWidget'
import QuickAction from '../components/QuickAction'

export default function Dashboard() {
  const { missions, getFilteredMissions } = useMissionStore()
  const { simulationResults, runSimulation } = useEngineeringStore()
  const [recentActivity, setRecentActivity] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setRecentActivity([
      { id: 1, type: 'mission_created', mission: 'Mars Sample Return', time: '2 hours ago' },
      { id: 2, type: 'simulation_complete', mission: 'Europa Clipper', result: 'Feasible', time: '5 hours ago' },
      { id: 3, type: 'milestone', mission: 'Artemis III', detail: 'Design Review Passed', time: '1 day ago' },
      { id: 4, type: 'alert', mission: 'Titan Orbiter', detail: 'Delta-V margin below threshold', time: '2 days ago' },
    ])
  }, [])

  const stats = [
    { label: 'Active Missions', value: missions.filter(m => m.status === 'active').length, icon: Rocket, color: 'text-primary', trend: '+2 this month' },
    { label: 'Total Delta-V', value: `${missions.reduce((sum, m) => sum + m.deltaV, 0).toFixed(1)} km/s`, icon: Target, color: 'text-cyan-400', trend: 'Across all missions' },
    { label: 'Budget Allocated', value: `$${missions.reduce((sum, m) => sum + m.cost, 0).toFixed(1)}B`, icon: DollarSign, color: 'text-success', trend: 'FY 2024' },
    { label: 'Avg Duration', value: `${Math.round(missions.reduce((sum, m) => sum + m.duration, 0) / missions.length)} days`, icon: Clock, color: 'text-amber-400', trend: 'Per mission' },
  ]

  const quickActions = [
    { label: 'New Mission', href: '/mission-designer', icon: Rocket, color: 'from-primary to-blue-500' },
    { label: 'Run Simulation', onClick: () => { setIsLoading(true); runSimulation().finally(() => setIsLoading(false)) }, icon: TrendingUp, color: 'from-cyan-500 to-teal-500', disabled: isLoading },
    { label: 'AI Copilot', href: '/ai-copilot', icon: Target, color: 'from-purple-500 to-pink-500' },
    { label: 'View Analytics', href: '/analytics', icon: TrendingUp, color: 'from-orange-500 to-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mission Control</h1>
          <p className="text-muted-foreground mt-1">Overview of all space mission programs and engineering simulations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, i) => (
            <QuickAction key={i} {...action} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartWidget title="Mission Timeline" subtitle="Launch schedule and mission phases" />
        </div>
        <div>
          <ChartWidget title="Delta-V Distribution" subtitle="Propulsion requirements by destination" type="pie" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MissionList missions={getFilteredMissions()} title="Recent Missions" limit={5} />
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className={`w-2 h-2 mt-2 rounded-full ${activity.type === 'alert' ? 'bg-destructive' : activity.type === 'simulation_complete' ? 'bg-success' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.mission}</p>
                  <p className="text-sm text-muted-foreground">{activity.detail || activity.result || activity.type.replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {simulationResults && (
        <div className="glass rounded-2xl p-6 border-l-4 border-primary animate-slide-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Latest Simulation Complete</h3>
                <p className="text-sm text-muted-foreground">Spacecraft design feasibility analysis</p>
              </div>
            </div>
            <span className={`badge ${simulationResults.feasibility === 'Feasible' ? 'badge-success' : 'badge-destructive'}`}>
              {simulationResults.feasibility}
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div><p className="text-xs text-muted-foreground">Delta-V</p><p className="font-mono text-lg">{simulationResults.deltaV.toFixed(2)} km/s</p></div>
            <div><p className="text-xs text-muted-foreground">TWR</p><p className="font-mono text-lg">{simulationResults.twr.toFixed(2)}</p></div>
            <div><p className="text-xs text-muted-foreground">Cost</p><p className="font-mono text-lg">${simulationResults.costEstimate.toFixed(2)}B</p></div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  )
}