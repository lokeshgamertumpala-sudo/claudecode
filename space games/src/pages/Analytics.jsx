import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts'
import { useMissionStore } from '../stores/missionStore'
import { useEngineeringStore } from '../stores/engineeringStore'

const COLORS = ['#00d4ff', '#00ff88', '#ffaa00', '#ff4466', '#aa44ff', '#44ffaa']

const missionData = [
  { name: 'Mars Sample Return', deltaV: 6.2, cost: 4.2, duration: 980, payload: 1200, year: 2028 },
  { name: 'Europa Clipper', deltaV: 8.9, cost: 5.0, duration: 2100, payload: 2500, year: 2024 },
  { name: 'Artemis III', deltaV: 4.1, cost: 7.5, duration: 30, payload: 45000, year: 2025 },
  { name: 'Titan Orbiter', deltaV: 12.5, cost: 6.8, duration: 3650, payload: 3200, year: 2030 },
  { name: 'Venus Atmosphere', deltaV: 5.8, cost: 3.2, duration: 400, payload: 800, year: 2027 },
  { name: 'Lunar Gateway', deltaV: 3.8, cost: 2.1, duration: 180, payload: 15000, year: 2026 },
]

const timelineData = [
  { year: '2024', missions: 2, budget: 8.5, deltaV: 15.0 },
  { year: '2025', missions: 3, budget: 12.3, deltaV: 22.4 },
  { year: '2026', missions: 4, budget: 15.7, deltaV: 28.9 },
  { year: '2027', missions: 3, budget: 11.2, deltaV: 19.6 },
  { year: '2028', missions: 4, budget: 18.9, deltaV: 35.2 },
  { year: '2029', missions: 2, budget: 9.8, deltaV: 16.3 },
  { year: '2030', missions: 3, budget: 14.5, deltaV: 25.7 },
]

const destinationData = [
  { name: 'Mars', value: 3, color: '#ff6b35' },
  { name: 'Moon', value: 4, color: '#c0c0c0' },
  { name: 'Jupiter', value: 2, color: '#d4a574' },
  { name: 'Venus', value: 1, color: '#e6c87a' },
  { name: 'Saturn', value: 1, color: '#f4d59e' },
  { name: 'Other', value: 2, color: '#00d4ff' },
]

const costBreakdown = [
  { category: 'Spacecraft', value: 45 },
  { category: 'Launch', value: 25 },
  { category: 'Operations', value: 15 },
  { category: 'Science', value: 10 },
  { category: 'Contingency', value: 5 },
]

export default function Analytics() {
  const { missions } = useMissionStore()
  const { simulationResults } = useEngineeringStore()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Mission portfolio analytics and engineering metrics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary"> <Filter className="w-4 h-4" /> Filters </button>
          <button className="btn-secondary"> <Calendar className="w-4 h-4" /> Time Range </button>
          <button className="btn-secondary"> <Download className="w-4 h-4" /> Export </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Missions" value={missions.length} icon={BarChart3} color="text-primary" />
        <StatCard label="Total Budget" value={`$${missions.reduce((s, m) => s + m.cost, 0).toFixed(1)}B`} icon={TrendingUp} color="text-success" />
        <StatCard label="Avg Delta-V" value={`${(missions.reduce((s, m) => s + m.deltaV, 0) / missions.length).toFixed(1)} km/s`} icon={Activity} color="text-cyan-400" />
        <StatCard label="Success Rate" value={`${Math.round((missions.filter(m => m.status === 'completed').length / missions.length) * 100)}%`} icon={PieChart} color="text-amber-400" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Mission Timeline</h3>
            <p className="text-sm text-muted-foreground">Budget and delta-V trends by year</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Budget ($B)', angle: -90, position: 'insideLeft', offset: 20 }} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} label={{ value: 'Delta-V (km/s)', angle: 90, position: 'insideRight', offset: 20 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="budget" name="Budget ($B)" fill="#00d4ff" radius={[4, 4, 0, 0]} maxBarWidth={40} />
              <Line yAxisId="right" type="monotone" dataKey="deltaV" name="Delta-V (km/s)" stroke="#00ff88" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Destinations Distribution</h3>
            <p className="text-sm text-muted-foreground">Missions by target body</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={destinationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {destinationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v) => `${v} missions`} />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Mission Comparison</h3>
            <p className="text-sm text-muted-foreground">Delta-V vs Cost vs Payload</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={missionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} tick={{ rotation: -15 }} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="deltaV" name="Delta-V (km/s)" fill="#00d4ff" maxBarWidth={30} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="left" dataKey="cost" name="Cost ($B)" fill="#ffaa00" maxBarWidth={30} radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="payload" name="Payload (kg)" stroke="#00ff88" strokeWidth={2} dot={{ r: 4 }} yAxis={{ domain: [0, 50000] }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Cost Breakdown</h3>
            <p className="text-sm text-muted-foreground">Typical mission cost distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={costBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                nameKey="category"
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {costBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v) => `${v}%`} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <MetricCard title="Propulsion Efficiency" value="87%" trend="+3.2%" trendUp icon={TrendingUp} description="Average Isp across fleet" />
        <MetricCard title="Launch Reliability" value="94.2%" trend="+1.1%" trendUp icon={Activity} description="Successful launches / total" />
        <MetricCard title="Cost per kg to Orbit" value="$2,840" trend="-$320" trendUp icon={BarChart3} description="Weighted average across vehicles" />
      </div>

      {simulationResults && (
        <div className="glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">Latest Simulation Results</h3>
            <p className="text-sm text-muted-foreground">Engineering analysis output</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">Total Mass</p><p className="text-xl font-mono font-bold text-foreground mt-1">{simulationResults.totalMass.toFixed(0)} kg</p></div>
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">Delta-V</p><p className="text-xl font-mono font-bold text-foreground mt-1">{simulationResults.deltaV.toFixed(2)} km/s</p></div>
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">TWR</p><p className="text-xl font-mono font-bold text-foreground mt-1">{simulationResults.twr.toFixed(2)}</p></div>
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">Burn Time</p><p className="text-xl font-mono font-bold text-foreground mt-1">{simulationResults.burnTime.toFixed(0)} s</p></div>
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">Payload Fraction</p><p className="text-xl font-mono font-bold text-foreground mt-1">{(simulationResults.payloadFraction * 100).toFixed(1)}%</p></div>
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">Cost Estimate</p><p className="text-xl font-mono font-bold text-foreground mt-1">${simulationResults.costEstimate.toFixed(2)}B</p></div>
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">Delta-V Margin</p><p className="text-xl font-mono font-bold text-foreground mt-1">{simulationResults.deltaVMargin.toFixed(1)}%</p></div>
            <div className="glass p-4 rounded-xl"><p className="text-xs text-muted-foreground uppercase tracking-wider">Feasibility</p><p className="text-xl font-mono font-bold text-foreground mt-1">{simulationResults.feasibility}</p></div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, value, trend, trendUp, icon: Icon, description }) {
  return (
    <div className="glass rounded-2xl p-6 card-hover">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
        <Icon className="w-5 h-5 text-primary/50" />
      </div>
      <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>{trend}</span>
        <span className="text-muted-foreground">vs last period</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">{description}</p>
    </div>
  )
}