import { forwardRef } from 'react'
import { motion } from 'framer-motion'

const StatCard = forwardRef(({ label, value, icon: Icon, color, trend }, ref) => (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="stat-card"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        {trend && <p className="text-xs text-success mt-1">{trend}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
))

StatCard.displayName = 'StatCard'
export default StatCard