import {
  Rocket,
  Target,
  DollarSign,
  Calendar,
  Flag,
  ChevronRight,
  Trash2,
  Edit
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function MissionList({ missions, title, limit }) {
  const displayMissions = limit ? missions.slice(0, limit) : missions

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {displayMissions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No missions found</p>
        ) : (
          displayMissions.map(mission => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{mission.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{mission.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`badge ${mission.status === 'active' ? 'badge-success' : mission.status === 'planning' ? 'badge-primary' : mission.status === 'completed' ? 'badge-info' : 'badge-destructive'}`}>
                  {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
                </span>
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {mission.deltaV} km/s</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${mission.cost}B</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}