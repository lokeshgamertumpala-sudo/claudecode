import { useState, useEffect } from 'react'
import {
  SlidersHorizontal,
  Play,
  Loader2,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Navigation,
  Cloud,
} from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Environment } from '@react-three/drei'
import { useEngineeringStore } from '../stores/engineeringStore'
import SpacecraftModel from '../components/SpacecraftModel'
import ResultsPanel from '../components/ResultsPanel'
import ParameterPanel from '../components/ParameterPanel'

export default function EngineeringSim() {
  const {
    specs,
    simulationResults,
    isSimulating,
    updateSpacecraft,
    updateTrajectory,
    updateEnvironment,
    runSimulation,
    resetToDefaults
  } = useEngineeringStore()
  const [activeTab, setActiveTab] = useState('spacecraft')
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (simulationResults) setShowResults(true)
  }, [simulationResults])

  const handleSimulate = async () => {
    await runSimulation()
    setShowResults(true)
  }

  const tabs = [
    { id: 'spacecraft', label: 'Spacecraft', icon: SlidersHorizontal },
    { id: 'trajectory', label: 'Trajectory', icon: Navigation },
    { id: 'environment', label: 'Environment', icon: Cloud },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Engineering Simulator</h1>
          <p className="text-muted-foreground mt-1">High-fidelity spacecraft design and mission simulation</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="btn-primary"
          >
            {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </button>
          <button
            onClick={resetToDefaults}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="border-b border-border">
          <nav className="tabs overflow-x-auto p-1" role="tablist">
            {tabs.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''} flex items-center gap-2 px-4 py-2`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <ParameterPanel
            tab={activeTab}
            specs={specs}
            onUpdateSpacecraft={updateSpacecraft}
            onUpdateTrajectory={updateTrajectory}
            onUpdateEnvironment={updateEnvironment}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl overflow-hidden canvas-container">
            <Canvas
              camera={{ position: [0, 5, 15], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
            >
              <color attach="background" args={[0x0a0e17]} />
              <fog attach="fog" args={['#0a0e17', 10, 100]} />

              <Environment
                preset="city"
                background={false}
                files={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']}
              />
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} />

              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 20, 10]} intensity={2} castShadow />
              <pointLight position={[-10, 10, -10]} intensity={1} color="#00d4ff" />

              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={50}
              />

              <SpacecraftModel specs={specs.spacecraft} />

              <gridHelper args={[50, 10]} />
            </Canvas>
          </div>
        </div>

        <div>
          <ResultsPanel
            results={simulationResults}
            isSimulating={isSimulating}
            visible={showResults}
          />
        </div>
      </div>

      {simulationResults && simulationResults.warnings.length > 0 && (
        <div className="glass rounded-2xl p-4 border-l-4 border-warning">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-warning mb-2">Design Warnings</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {simulationResults.warnings.map((warning, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}