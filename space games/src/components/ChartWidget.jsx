import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
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

const COLORS = ['#00d4ff', '#00ff88', '#ffaa00', '#ff4466', '#aa44ff', '#44ffaa']

const sampleData = [
  { month: 'Jan', missions: 2, budget: 4.2, deltaV: 8.5 },
  { month: 'Feb', missions: 3, budget: 5.1, deltaV: 12.3 },
  { month: 'Mar', missions: 1, budget: 2.8, deltaV: 4.2 },
  { month: 'Apr', missions: 4, budget: 7.9, deltaV: 18.6 },
  { month: 'May', missions: 2, budget: 3.5, deltaV: 6.8 },
  { month: 'Jun', missions: 3, budget: 6.2, deltaV: 14.1 },
]

export default function ChartWidget({ title, subtitle, type = 'line' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="chart-container"
    >
      <div className="mb-6">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'line' && (
            <ComposedChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="budget" name="Budget ($B)" fill="#00d4ff" radius={[4, 4, 0, 0]} maxBarWidth={30} />
              <Line yAxisId="right" type="monotone" dataKey="deltaV" name="Delta-V (km/s)" stroke="#00ff88" strokeWidth={3} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
            </ComposedChart>
          )}
          {type === 'pie' && (
            <PieChart>
              <Pie
                data={[
                  { name: 'Mars', value: 3, color: '#ff6b35' },
                  { name: 'Moon', value: 4, color: '#c0c0c0' },
                  { name: 'Jupiter', value: 2, color: '#d4a574' },
                  { name: 'Venus', value: 1, color: '#e6c87a' },
                  { name: 'Other', value: 2, color: '#00d4ff' },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(v) => `${v} missions`} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          )}
          {type === 'bar' && (
            <BarChart data={sampleData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={60} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="budget" name="Budget ($B)" fill="#00d4ff" radius={[0, 4, 4, 0]} maxBarWidth={30} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}