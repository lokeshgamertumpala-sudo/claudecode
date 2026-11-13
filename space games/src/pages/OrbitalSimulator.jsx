import {
  Globe,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Minimize,
  Target,
  AlertTriangle,
} from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Line } from '@react-three/drei'
import { Vector3 } from 'three'
import { useOrbitalStore, calculateOrbitalParams, EARTH_RADIUS, EARTH_MU } from '../stores/orbitalStore'
import { clsx } from 'clsx'
import React, { useEffect, useState, useMemo } from 'react'

export function OrbitalSimulator() {
  const {
    orbitalParams,
    simulationRunning,
    simulationSpeed,
    simulationTime,
    satellitePosition,
    orbitalPath,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    setSimulationSpeed,
    setSimulationTime,
    updateSatellitePosition,
    calculateOrbitalPath,
    updateOrbitalParam,
    massBudget,
    powerBudget,
    constraintViolations,
  } = useOrbitalStore()

  const [localParams, setLocalParams] = useState(orbitalParams)
  const [showOrbit, setShowOrbit] = useState(true)
  const [showEarth, setShowEarth] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [cameraMode, setCameraMode] = useState('free')
  const [followTarget, setFollowTarget] = useState(null)

  useEffect(() => {
    if (simulationRunning) {
      const interval = setInterval(() => {
        setSimulationTime(prev => prev + 1000 * simulationSpeed)
      }, 1000 / 60)
      return () => clearInterval(interval)
    }
  }, [simulationRunning, simulationSpeed, setSimulationTime])

  useEffect(() => {
    if (orbitalParams) {
      const path = calculateOrbitalPath(orbitalParams)
      const pos = getSatellitePosition(orbitalParams, simulationTime)
      updateSatellitePosition(pos)
    }
  }, [orbitalParams, simulationTime, calculateOrbitalPath, updateSatellitePosition])

  useEffect(() => {
    setLocalParams(orbitalParams)
  }, [orbitalParams])

  const handleParamChange = (key, value) => {
    setLocalParams(prev => ({ ...prev, [key]: value }))
  }

  const applyParams = () => {
    Object.entries(localParams).forEach(([key, value]) => {
      if (orbitalParams[key] !== value) {
        updateOrbitalParam(key, value)
      }
    })
  }

  const resetParams = () => {
    setLocalParams(orbitalParams)
  }

  const altitude = orbitalParams.altitude
  const orbitalData = calculateOrbitalParams(altitude)
  const period = formatTime(orbitalData.period)

  return (
    <div className="h-full flex flex-col space-overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        <div className="flex-1 lg:w-3/4 h-full min-h-0">
          <Canvas
            camera={{ position: [15, 10, 15], fov: 50 }}
            onCreated={({ gl }) => { gl.setClearColor(0x0a1e35, 1); }}
            style={{ width: '100%', height: '100%' }}
          >
            <color attach="background" args={[0x0a1e35]} />
            <fog attach="fog" args={["#0a1e35", 10, 100]} />
            <Stars radius={200} depth={100} count={3000} factor={4} saturation={0} color="#ffffff" />
            <ambientLight intensity={0.6} color="#ffffff" />
            <directionalLight position={[50, 50, 50]} intensity={1.5} color="#ffffff" castShadow />
            <directionalLight position={[-50, -50, -50]} intensity={0.5} color="#88aaff" />

            {showGrid && (
              <gridHelper args={[200, 20, '#1a3a5c', '#0f2a4a']} position={[0, 0, 0]} />
            )}

            {showEarth && (
              <Earth
                radius={EARTH_RADIUS / 1000}
                rotationSpeed={0.001}
                inclination={orbitalParams.inclination}
              />
            )}

            {showOrbit && orbitalPath.length > 0 && (
              <OrbitPath points={orbitalPath} />
            )}

            <Satellite
              position={satellitePosition}
              orbitalParams={orbitalParams}
              cameraMode={cameraMode}
              followTarget={followTarget}
              setFollowTarget={setFollowTarget}
            />

            <OrbitControls
              enablePan={cameraMode === 'free'}
              enableZoom={true}
              enableRotate={cameraMode === 'free'}
              minDistance={5}
              maxDistance={200}
              target={cameraMode === 'follow' && followTarget ? [followTarget.x, followTarget.y, followTarget.z] : [0, 0, 0]}
            />
          </Canvas>
        </div>

        <div className="w-full lg:w-1/4 space-overflow-y-auto space-p-4 gap-4 flex flex-col">
          <div className="glass rounded-2xl p-4 border-l-4 border-primary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-space-100">Orbital Simulator</h2>
              <span className={clsx('badge', simulationRunning ? 'badge-success' : 'badge-info')}>
                {simulationRunning ? 'Running' : 'Paused'}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setCameraMode('free')} className={clsx('btn-ghost btn-sm', cameraMode === 'free' && 'bg-accent-500/20 text-accent-400')}>
                <Minimize className="h-4 w-4 mr-1" /> Free
              </button>
              <button onClick={() => setCameraMode('follow')} className={clsx('btn-ghost btn-sm', cameraMode === 'follow' && 'bg-accent-500/20 text-accent-400')}>
                <Target className="h-4 w-4 mr-1" /> Follow
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={simulationRunning ? pauseSimulation : startSimulation} className="btn-primary flex-1">
                {simulationRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                {simulationRunning ? 'Pause' : 'Start'}
              </button>
              <button onClick={resetSimulation} className="btn-secondary">
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm text-space-400 flex-1">Speed: {simulationSpeed}x</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={simulationSpeed}
                onChange={e => setSimulationSpeed(parseFloat(e.target.value))}
                className="w-24 accent-accent-500"
              />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-space-400">Time</span>
                <span className="font-mono text-space-100">{formatTime(simulationTime / 1000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Period</span>
                <span className="font-mono text-space-100">{period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Altitude</span>
                <span className="font-mono text-space-100">{altitude} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Velocity</span>
                <span className="font-mono text-space-100">{orbitalData.velocity.toFixed(2)} km/s</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 border-l-4 border-accent-500">
            <h3 className="font-semibold text-space-100 mb-4">Orbital Parameters</h3>
            <div className="space-y-3">
              {[
                { key: 'altitude', label: 'Altitude (km)', min: 200, max: 50000, step: 10 },
                { key: 'inclination', label: 'Inclination (deg)', min: 0, max: 180, step: 0.1 },
                { key: 'eccentricity', label: 'Eccentricity', min: 0, max: 0.99, step: 0.01 },
                { key: 'argumentOfPerigee', label: 'Arg. of Perigee (deg)', min: 0, max: 360, step: 1 },
                { key: 'raan', label: 'RAAN (deg)', min: 0, max: 360, step: 1 },
              ].map(param => (
                <div key={param.key} className="space-y-1">
                  <label className="text-xs text-space-400">{param.label}: {localParams[param.key]}</label>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={localParams[param.key]}
                    onChange={e => handleParamChange(param.key, parseFloat(e.target.value))}
                    className="w-full accent-accent-500"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button onClick={applyParams} className="btn-primary flex-1 btn-sm">Apply</button>
                <button onClick={resetParams} className="btn-secondary btn-sm">Reset</button>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 border-l-4 border-warning">
            <h3 className="font-semibold text-space-100 mb-3">Display Options</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showOrbit} onChange={e => setShowOrbit(e.target.checked)} className="w-4 h-4 accent-accent-500" />
                <span className="text-sm text-space-300">Show Orbit Path</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showEarth} onChange={e => setShowEarth(e.target.checked)} className="w-4 h-4 accent-accent-500" />
                <span className="text-sm text-space-300">Show Earth</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} className="w-4 h-4 accent-accent-500" />
                <span className="text-sm text-space-300">Show Grid</span>
              </label>
            </div>
          </div>

          {constraintViolations.length > 0 && (
            <div className="glass rounded-2xl p-4 border-l-4 border-destructive">
              <h3 className="font-semibold text-destructive mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Design Warnings
              </h3>
              <ul className="space-y-2 text-sm">
                {constraintViolations.map((v, i) => (
                  <li key={i} className="flex items-start gap-2 text-destructive/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                    {v.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Earth({ radius, rotationSpeed, inclination }) {
  const sphereRef = useRef()
  const [texture] = useState(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 1024, 512)
    gradient.addColorStop(0, '#1a3a6e')
    gradient.addColorStop(0.3, '#2d5a9e')
    gradient.addColorStop(0.6, '#1e5f3a')
    gradient.addColorStop(0.8, '#2d8a4e')
    gradient.addColorStop(1, '#ffffff')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 512)
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`
      ctx.fillRect(Math.random() * 1024, Math.random() * 512, 1, 1)
    }
    return new THREE.CanvasTexture(canvas)
  })

  useEffect(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += rotationSpeed
    }
  }, [rotationSpeed])

  return (
    <mesh ref={sphereRef} rotation={[-inclination * Math.PI / 180, 0, 0]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function OrbitPath({ points }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(points.length * 3)
    points.forEach((p, i) => {
      pos[i * 3] = p.x
      pos[i * 3 + 1] = p.y
      pos[i * 3 + 2] = p.z
    })
    return pos
  }, [points])

  return (
    <line2>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineMaterial color="#00d4ff" transparent opacity={0.6} linewidth={2} />
    </line2>
  )
}

function Satellite({ position, orbitalParams, cameraMode, followTarget, setFollowTarget }) {
  const groupRef = useRef()

  useEffect(() => {
    if (cameraMode === 'follow' && groupRef.current) {
      setFollowTarget(groupRef.current.position)
    }
  }, [cameraMode, position, setFollowTarget])

  useEffect(() => {
    if (groupRef.current && position) {
      groupRef.current.position.set(position.x, position.y, position.z)
    }
  }, [position])

  const inclination = orbitalParams.inclination * Math.PI / 180

  return (
    <group ref={groupRef} rotation={[-inclination, 0, 0]}>
      <mesh>
        <boxGeometry args={[1, 0.5, 1.5]} />
        <meshStandardMaterial color={0x2a4a6b} roughness={0.7} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 1.5, 8]} />
        <meshStandardMaterial color={0x64748b} roughness={0.3} metalness={0.8} />
      </mesh>
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * 2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[3, 1.5]} />
          <meshStandardMaterial color={0x0d1b2a} roughness={0.3} metalness={0.8} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshStandardMaterial color={0xdc2626} roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  )
}

function getSatellitePosition(orbitalParams, timeMs) {
  const { altitude, inclination, eccentricity, argumentOfPerigee, raan } = orbitalParams
  const a = EARTH_RADIUS + altitude
  const n = Math.sqrt(EARTH_MU / Math.pow(a, 3))
  const timeSeconds = timeMs / 1000
  const M = n * timeSeconds
  const E = M
  const trueAnomaly = 2 * Math.atan(Math.sqrt((1 + eccentricity) / (1 - eccentricity)) * Math.tan(E / 2))
  const r = a * (1 - eccentricity * Math.cos(E))
  const argLat = trueAnomaly + argumentOfPerigee * Math.PI / 180
  const incRad = inclination * Math.PI / 180
  const raanRad = raan * Math.PI / 180
  const x = r * (Math.cos(argLat) * Math.cos(raanRad) - Math.sin(argLat) * Math.sin(raanRad) * Math.cos(incRad))
  const y = r * (Math.cos(argLat) * Math.sin(raanRad) + Math.sin(argLat) * Math.cos(raanRad) * Math.cos(incRad))
  const z = r * Math.sin(argLat) * Math.sin(incRad)
  return { x: x / 1000, y: y / 1000, z: z / 1000 }
}

function formatTime(seconds) {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`
  return `${mins}m ${secs}s`
}

const EARTH_MU = 3.986004418e5
const EARTH_RADIUS = 6371

export default OrbitalSimulator