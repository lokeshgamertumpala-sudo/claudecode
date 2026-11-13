import { useState } from 'react'
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ChevronDown,
  Target,
  DollarSign,
  Calendar,
  Flag,
  Loader2
} from 'lucide-react'
import { useMissionStore } from '../stores/missionStore'
import { motion, AnimatePresence } from 'framer-motion'

const destinations = ['Moon', 'Mars', 'Venus', 'Mercury', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Asteroid Belt', 'Sun-Earth L2', 'Custom']
const statuses = ['planning', 'active', 'completed', 'cancelled']

export default function MissionDesigner() {
  const { missions, addMission, updateMission, deleteMission, selectMission, selectedMissionId, filters, setFilters } = useMissionStore()
  const [showForm, setShowForm] = useState(false)
  const [editingMission, setEditingMission] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    destination: 'Mars',
    launchDate: '',
    status: 'planning',
    deltaV: '',
    payloadMass: '',
    cost: '',
    duration: '',
    description: '',
    stages: [{ name: '', deltaV: '', mass: '' }],
  })
  const [stageCount, setStageCount] = useState(1)

  const resetForm = () => {
    setFormData({
      name: '',
      destination: 'Mars',
      launchDate: '',
      status: 'planning',
      deltaV: '',
      payloadMass: '',
      cost: '',
      duration: '',
      description: '',
      stages: [{ name: '', deltaV: '', mass: '' }],
    })
    setStageCount(1)
    setEditingMission(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const missionData = {
      ...formData,
      deltaV: parseFloat(formData.deltaV) || 0,
      payloadMass: parseFloat(formData.payloadMass) || 0,
      cost: parseFloat(formData.cost) || 0,
      duration: parseInt(formData.duration) || 0,
      stages: formData.stages.map(s => ({
        name: s.name,
        deltaV: parseFloat(s.deltaV) || 0,
        mass: parseFloat(s.mass) || 0,
      })).filter(s => s.name),
    }

    if (editingMission) {
      updateMission(editingMission.id, missionData)
    } else {
      addMission(missionData)
    }
    resetForm()
    setShowForm(false)
  }

  const handleEdit = (mission) => {
    setEditingMission(mission)
    setFormData({
      name: mission.name,
      destination: mission.destination,
      launchDate: mission.launchDate,
      status: mission.status,
      deltaV: mission.deltaV.toString(),
      payloadMass: mission.payloadMass.toString(),
      cost: mission.cost.toString(),
      duration: mission.duration.toString(),
      description: mission.description,
      stages: mission.stages.map(s => ({ name: s.name, deltaV: s.deltaV.toString(), mass: s.mass.toString() })),
    })
    setStageCount(mission.stages.length)
    setShowForm(true)
  }

  const addStage = () => {
    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, { name: '', deltaV: '', mass: '' }],
    }))
    setStageCount(c => c + 1)
  }

  const removeStage = (index) => {
    if (stageCount <= 1) return
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index),
    }))
    setStageCount(c => c - 1)
  }

  const updateStage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.map((s, i) => i === index ? { ...s, [field]: value } : s),
    }))
  }

  const filteredMissions = missions.filter(m =>
    (!filters.status || m.status === filters.status) &&
    (!filters.destination || m.destination.toLowerCase().includes(filters.destination.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mission Designer</h1>
          <p className="text-muted-foreground mt-1">Design and plan space missions with orbital mechanics</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> New Mission
        </button>
      </div>

      <div className="glass p-4 rounded-xl flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={e => setFilters({ status: e.target.value })}
          className="input flex-1 min-w-[180px]"
        >
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={filters.destination}
          onChange={e => setFilters({ destination: e.target.value })}
          className="input flex-1 min-w-[180px]"
        >
          <option value="">All Destinations</option>
          {destinations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingMission ? 'Edit Mission' : 'New Mission'}</h2>
                <button onClick={() => { setShowForm(false); resetForm() }} className="btn-ghost btn-icon">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Mission Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Destination</label>
                    <select
                      value={formData.destination}
                      onChange={e => setFormData({...formData, destination: e.target.value})}
                      className="input"
                    >
                      {destinations.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Launch Date</label>
                    <input
                      type="date"
                      value={formData.launchDate}
                      onChange={e => setFormData({...formData, launchDate: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className="input"
                    >
                      {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Total Delta-V (km/s)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.deltaV}
                      onChange={e => setFormData({...formData, deltaV: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Payload Mass (kg)</label>
                    <input
                      type="number"
                      value={formData.payloadMass}
                      onChange={e => setFormData({...formData, payloadMass: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Cost (Billion $)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.cost}
                      onChange={e => setFormData({...formData, cost: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Duration (days)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="input"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Mission Stages</h3>
                    <button type="button" onClick={addStage} className="text-sm text-primary hover:underline flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Add Stage
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.stages.map((stage, index) => (
                      <div key={index} className="grid gap-3 sm:grid-cols-4 glass p-4 rounded-xl">
                        <input
                          type="text"
                          placeholder="Stage Name"
                          value={stage.name}
                          onChange={e => updateStage(index, 'name', e.target.value)}
                          className="input"
                        />
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Delta-V (km/s)"
                          value={stage.deltaV}
                          onChange={e => updateStage(index, 'deltaV', e.target.value)}
                          className="input"
                        />
                        <input
                          type="number"
                          placeholder="Mass (kg)"
                          value={stage.mass}
                          onChange={e => updateStage(index, 'mass', e.target.value)}
                          className="input"
                        />
                        <button
                          type="button"
                          onClick={() => removeStage(index)}
                          disabled={stageCount <= 1}
                          className="btn-ghost btn-icon"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <Save className="w-4 h-4" />
                    {editingMission ? 'Update Mission' : 'Create Mission'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filteredMissions.map(mission => (
          <div key={mission.id} className="glass rounded-2xl p-6 hover:border-primary/30 transition-colors group card-hover">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{mission.name}</h3>
                <p className="text-sm text-muted-foreground">{mission.destination}</p>
              </div>
              <span className={`badge ${mission.status === 'active' ? 'badge-success' : mission.status === 'planning' ? 'badge-primary' : mission.status === 'completed' ? 'badge-info' : 'badge-destructive'}`}>
                {mission.status.charAt(0).toUpperCase() + mission.status.slice(1)}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-4 h-4" /> {mission.deltaV} km/s ΔV
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" /> ${mission.cost}B
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" /> {mission.launchDate}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Flag className="w-4 h-4" /> {mission.payloadMass} kg
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mission.description}</p>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <button
                onClick={() => handleEdit(mission)}
                className="flex-1 btn-secondary btn-sm"
              >
                <Edit className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => deleteMission(mission.id)}
                className="btn-destructive btn-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredMissions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No missions found. Create your first mission!</p>
        </div>
      )}
    </div>
  )
}