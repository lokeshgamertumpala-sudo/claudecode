import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { SpacecraftDesigner } from '@/pages/SpacecraftDesigner'
import { MissionDesigner } from '@/pages/MissionDesigner'
import { Simulation } from '@/pages/Simulation'
import { Analysis } from '@/pages/Analysis'
import { SketchAnalyzer } from '@/pages/SketchAnalyzer'
import { Reports } from '@/pages/Reports'
import { Settings } from '@/pages/Settings'
import { useUIStore } from '@/stores'

function App() {
  const { activeTab } = useUIStore()

  return (
    <div className="min-h-screen bg-space-950">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="spacecraft" element={<SpacecraftDesigner />} />
          <Route path="mission" element={<MissionDesigner />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="sketch" element={<SketchAnalyzer />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App