import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const MissionDesigner = lazy(() => import('./pages/MissionDesigner'))
const EngineeringSim = lazy(() => import('./pages/EngineeringSim'))
const AICopilot = lazy(() => import('./pages/AICopilot'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const OrbitalSimulator = lazy(() => import('./pages/OrbitalSimulator'))
const SatelliteDesigner = lazy(() => import('./pages/SatelliteDesigner'))
const SketchAnalyzer = lazy(() => import('./pages/SketchAnalyzer'))
const MissionReport = lazy(() => import('./pages/MissionReport'))

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mission-designer" element={<MissionDesigner />} />
          <Route path="engineering-sim" element={<EngineeringSim />} />
          <Route path="ai-copilot" element={<AICopilot />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="orbital-simulator" element={<OrbitalSimulator />} />
          <Route path="satellite-designer" element={<SatelliteDesigner />} />
          <Route path="sketch-analyzer" element={<SketchAnalyzer />} />
          <Route path="mission-report" element={<MissionReport />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
