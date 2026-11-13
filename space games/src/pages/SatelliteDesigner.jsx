import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import {
  Box3,
  Vector3,
  MeshStandardMaterial,
  DoubleSide,
} from 'three'
import {
  Box as LucideBox,
  RotateCcw,
  Maximize,
  Grid,
  Settings,
  RefreshCw,
  Sliders,
  Trash2,
  Plus,
  Minus,
} from 'lucide-react'
import { useOrbitalStore } from '../stores/orbitalStore'
import { clsx } from 'clsx'
import React, { useRef, useMemo, useEffect, useState } from 'react'

const componentColors = {
  mainBody: 0x2a4a6b,
  solarPanels: 0x0d1b2a,
  antenna: 0x64748b,
  instruments: 0x7c3aed,
  propulsion: 0xdc2626,
  structure: 0x475569,
  thermal: 0xf59e0b,
}

function SatelliteDesigner() {
  const materials = useMemo(() => ({
    body: new MeshStandardMaterial({ color: 0x2a4a6b, roughness: 0.7, metalness: 0.3 }),
    panel: new MeshStandardMaterial({ color: 0x0d1b2a, roughness: 0.3, metalness: 0.8, side: DoubleSide }),
    panelBack: new MeshStandardMaterial({ color: 0x1a3a5c, roughness: 0.7, metalness: 0.2, side: DoubleSide }),
    antenna: new MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.6 }),
    dish: new MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.7, side: DoubleSide }),
    instrument: new MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.5, metalness: 0.4 }),
    propulsion: new MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6, metalness: 0.3 }),
    structure: new MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.2 }),
    thermal: new MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.7, metalness: 0.1 }),
    selected: new MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3, metalness: 0.5, emissive: 0x0ea5e9, emissiveIntensity: 0.3 }),
    wireframe: new MeshStandardMaterial({ color: 0x0ea5e9, wireframe: true, transparent: true, opacity: 0.5 }),
  }), [])
  // eslint-disable-next-line no-unused-vars
  const materialsRef = materials
  const {
    spacecraftParams,
    selectedComponent,
    setSelectedComponent,
    cameraPosition,
    setCameraPosition,
    showGrid,
    showAxes,
    wireframe,
    toggleGrid,
    toggleAxes,
    toggleWireframe,
    resetSpacecraft,
    calculateBudgets,
    massBudget,
    powerBudget,
  } = useOrbitalStore()

  const [localParams, setLocalParams] = useState(spacecraftParams)
  const [expandedCategories, setExpandedCategories] = useState({
    mainBody: true,
    solarPanels: true,
    antenna: true,
    instruments: true,
    propulsion: true,
    structure: true,
    thermal: true,
    avionics: true,
    power: true,
  })

  useEffect(() => {
    setLocalParams(spacecraftParams)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spacecraftParams])

  const updateParam = (category, key, value) => {
    setLocalParams(prev => ({
      ...prev,
      [category]: { ...prev[category], [key]: value }
    }))
  }

  const applyChanges = () => {
    Object.entries(localParams).forEach(([cat, params]) => {
      useOrbitalStore.getState().updateSpacecraftCategory(cat, params)
    })
    calculateBudgets()
  }

  const resetToDefault = () => {
    resetSpacecraft()
    setLocalParams(useOrbitalStore.getState().spacecraftParams)
  }

  return (
    <div className="h-full flex flex-col animate-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-4 panel-sm">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-space-100">Satellite Designer</h2>
          <span className="badge badge-info">Interactive 3D</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleGrid} className={clsx('btn-ghost', showGrid && 'bg-accent-500/20 text-accent-400')}>
            <Grid className="h-4 w-4 mr-1" /> Grid
          </button>
          <button onClick={toggleAxes} className={clsx('btn-ghost', showAxes && 'bg-accent-500/20 text-accent-400')}>
            <Axes className="h-4 w-4 mr-1" /> Axes
          </button>
          <button onClick={toggleWireframe} className={clsx('btn-ghost', wireframe && 'bg-accent-500/20 text-accent-400')}>
            <Settings className="h-4 w-4 mr-1" /> Wireframe
          </button>
          <button onClick={() => setCameraPosition({ x: 10, y: 8, z: 10 })} className="btn-ghost" title="Reset Camera">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={applyChanges} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Apply Changes
          </button>
          <button onClick={resetToDefault} className="btn-danger">
            <Trash2 className="h-4 w-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 3D Viewport */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: cameraPosition, fov: 50 }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x0a1e35, 1)
              gl.shadowMap.enabled = true
              gl.shadowMap.type = 1
            }}
            style={{ touchAction: 'none' }}
          >
            <color attach="background" args={['#0a1e35']} />

            {/* Lighting */}
            <ambientLight intensity={0.6} color="#64748b" />
            <directionalLight
              position={[20, 30, 20]}
              intensity={2}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-near={1}
              shadow-camera-far={100}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            <directionalLight position={[-10, -10, -10]} intensity={0.5} color="#38bdf8" />
            <hemisphereLight groundColor="#0f172a" skyColor="#38bdf8" intensity={0.3} />

            {/* Grid & Axes */}
            {showGrid && <GridHelper gridSize={20} divisions={20} colorCenterLine="#1e3a5f" colorGrid="#152a45" />}
            {showAxes && <AxisHelper size={5} />}

            {/* Earth representation */}
            <Earth />

            {/* Satellite */}
            <Satellite
              params={localParams}
              selectedComponent={selectedComponent}
              onSelect={setSelectedComponent}
              wireframe={wireframe}
            />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={100}
              target={new Vector3(0, 0, 0)}
            />
          </Canvas>

          {/* Viewport info overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-64">
            <div className="panel-sm text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-space-400">Altitude</span>
                <span className="font-mono text-space-100">{orbitalParams.altitude} km</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-space-400">Inclination</span>
                <span className="font-mono text-space-100">{orbitalParams.inclination}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Mass</span>
                <span className="font-mono text-space-100">{massBudget?.wetMass.toFixed(1) || 0} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-space-400">Power</span>
                <span className="font-mono text-space-100">{powerBudget?.generated.toFixed(0) || 0} W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parameter Panel */}
        <div className="w-80 lg:w-96 border-l border-space-800 bg-space-900/95 backdrop-blur-sm overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-space-100">Parameters</h3>
            <span className="badge badge-info">Live Update</span>
          </div>

          {Object.entries(localParams).map(([category, params]) => (
            <ParameterCategory
              key={category}
              category={category}
              params={params}
              expanded={expandedCategories[category]}
              onToggle={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}
              onChange={updateParam}
            />
          ))}

          {/* Add Instrument */}
          <div className="pt-4 border-t border-space-800">
            <button
              onClick={() => {
                const newInst = {
                  id: `inst-${Date.now()}`,
                  name: 'New Instrument',
                  mass: 10,
                  power: 15,
                  type: 'science'
                }
                setLocalParams(prev => ({
                  ...prev,
                  instruments: [...prev.instruments, newInst]
                }))
              }}
              className="btn-secondary w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Instrument
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Earth() {
  return (
    <group position={[0, 0, 0]}>
      <mesh receiveShadow>
        <sphereGeometry args={[6371, 64, 64]} />
        <meshStandardMaterial
          color="#1e3a5f"
          roughness={0.8}
          metalness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[6375, 60, 60]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.05}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

function Satellite({ params, selectedComponent, onSelect, wireframe }) {
  const { mainBody, solarPanels, antenna, instruments, propulsion, structure, thermal, avionics, power } = params

  const groupRef = useRef()
  const bounds = useRef(new Box3())

  return (
    <group ref={groupRef} onClick={(e) => { e.stopPropagation(); onSelect(null) }}>
      {/* Main Body */}
      <SelectableMesh
        name="mainBody"
        selected={selectedComponent === 'mainBody'}
        onSelect={onSelect}
        wireframe={wireframe}
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[mainBody.width, mainBody.height, mainBody.depth]} />
        <meshStandardMaterial
          color={componentColors.mainBody}
          roughness={0.7}
          metalness={0.3}
          wireframe={wireframe}
        />
      </SelectableMesh>

      {/* Solar Panels */}
      {solarPanels.deployed && solarPanels.count > 0 && Array.from({ length: solarPanels.count }).map((_, i) => {
        const side = i % 2 === 0 ? 1 : -1
        const offsetX = (mainBody.width / 2) + (solarPanels.width / 2) + 0.1
        return (
          <SelectableMesh
            key={`panel-${i}`}
            name="solarPanels"
            selected={selectedComponent === 'solarPanels'}
            onSelect={onSelect}
            wireframe={wireframe}
            position={[side * offsetX, 0, 0]}
            rotation={[0, 0, 0]}
            castShadow
            receiveShadow
          >
            <group>
              {/* Front (cells) */}
              <mesh position={[0, 0, solarPanels.height / 200 + 0.01]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[solarPanels.width, solarPanels.height / 100]} />
                <meshStandardMaterial color={componentColors.solarPanels} roughness={0.3} metalness={0.8} side={DoubleSide} wireframe={wireframe} />
              </mesh>
              {/* Back */}
              <mesh position={[0, 0, -solarPanels.height / 200 - 0.01]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[solarPanels.width, solarPanels.height / 100]} />
                <meshStandardMaterial color={0x1a3a5c} roughness={0.7} metalness={0.2} side={DoubleSide} wireframe={wireframe} />
              </mesh>
              {/* Edge detail */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[solarPanels.width, solarPanels.height / 100, 0.05]} />
                <meshStandardMaterial color={0x334155} roughness={0.5} metalness={0.4} wireframe={wireframe} />
              </mesh>
            </group>
          </SelectableMesh>
        )
      })}

      {/* Antenna */}
      <SelectableMesh
        name="antenna"
        selected={selectedComponent === 'antenna'}
        onSelect={onSelect}
        wireframe={wireframe}
        position={[0, mainBody.height / 2 + 0.5, mainBody.depth / 2 + 0.5]}
        castShadow
        receiveShadow
      >
        <group>
          {/* Dish */}
          <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[antenna.diameter / 2, 0, antenna.diameter / 4, 32, 1, true]} />
            <meshStandardMaterial color={componentColors.antenna} roughness={0.5} metalness={0.7} side={DoubleSide} wireframe={wireframe} />
          </mesh>
          {/* Feed arm */}
          <mesh position={[0, -antenna.diameter / 4 - 0.2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, antenna.diameter / 4 + 0.2, 8]} />
            <meshStandardMaterial color={0x475569} roughness={0.4} metalness={0.6} wireframe={wireframe} />
          </mesh>
          {/* Base mount */}
          <mesh position={[0, -antenna.diameter / 4 - 0.4, 0]}>
            <cylinderGeometry args={[0.2, 0.2, 0.4, 16]} />
            <meshStandardMaterial color={0x334155} roughness={0.5} metalness={0.5} wireframe={wireframe} />
          </mesh>
        </group>
      </SelectableMesh>

      {/* Instruments */}
      {instruments.map((inst, i) => {
        const angle = (i / Math.max(1, instruments.length)) * Math.PI * 2
        const radius = Math.max(mainBody.width, mainBody.depth) / 2 + 0.5
        return (
          <SelectableMesh
            key={inst.id}
            name={`instrument-${inst.id}`}
            selected={selectedComponent === `instrument-${inst.id}`}
            onSelect={onSelect}
            wireframe={wireframe}
            position={[Math.cos(angle) * radius, mainBody.height / 2 + 0.3, Math.sin(angle) * radius]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color={componentColors.instruments} roughness={0.5} metalness={0.4} wireframe={wireframe} />
            <boxGeometry args={[0.4, 0.4, 0.6]} />
          </SelectableMesh>
        )
      })}

      {/* Propulsion */}
      <SelectableMesh
        name="propulsion"
        selected={selectedComponent === 'propulsion'}
        onSelect={onSelect}
        wireframe={wireframe}
        position={[0, -mainBody.height / 2 - 0.5, 0]}
        castShadow
        receiveShadow
      >
        <group>
          {/* Main engine */}
          <mesh>
            <cylinderGeometry args={[0.4, 0.15, 0.8, 16]} />
            <meshStandardMaterial color={componentColors.propulsion} roughness={0.6} metalness={0.3} wireframe={wireframe} />
          </mesh>
          {/* Thrusters */}
          {Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / 4) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(angle) * 0.6, -0.5, Math.sin(angle) * 0.6]} rotation={[0, 0, angle + Math.PI / 2]}>
                <coneGeometry args={[0.15, 0.4, 8]} />
                <meshStandardMaterial color={0x991b1b} roughness={0.5} metalness={0.4} wireframe={wireframe} />
              </mesh>
            )
          })}
        </group>
      </SelectableMesh>

      {/* Structure struts */}
      {structure.mass > 0 && (
        <SelectableMesh
          name="structure"
          selected={selectedComponent === 'structure'}
          onSelect={onSelect}
          wireframe={wireframe}
          position={[0, 0, 0]}
        >
          <group>
            {Array.from({ length: 4 }).map((_, i) => {
              const angle = (i / 4) * Math.PI * 2
              const r = Math.max(mainBody.width, mainBody.depth) / 2
              return (
                <mesh key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} rotation={[0, 0, angle + Math.PI / 2]}>
                  <cylinderGeometry args={[0.05, 0.05, mainBody.height, 8]} />
                  <meshStandardMaterial color={componentColors.structure} roughness={0.6} metalness={0.2} wireframe={wireframe} />
                </mesh>
              )
            })}
          </group>
        </SelectableMesh>
      )}

      {/* Thermal radiators */}
      {thermal.mass > 0 && (
        <SelectableMesh
          name="thermal"
          selected={selectedComponent === 'thermal'}
          onSelect={onSelect}
          wireframe={wireframe}
          position={[-mainBody.width / 2 - 0.15, 0, 0]}
          castShadow
          receiveShadow
        >
          <group>
            <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[mainBody.height, mainBody.depth]} />
              <meshStandardMaterial color={componentColors.thermal} roughness={0.7} metalness={0.1} side={DoubleSide} wireframe={wireframe} />
            </mesh>
            <mesh position={[0.05, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[mainBody.height, mainBody.depth]} />
              <meshStandardMaterial color={componentColors.thermal} roughness={0.7} metalness={0.1} side={DoubleSide} wireframe={wireframe} />
            </mesh>
          </group>
        </SelectableMesh>
      )}

      {/* Avionics box */}
      {avionics.mass > 0 && (
        <SelectableMesh
          name="avionics"
          selected={selectedComponent === 'avionics'}
          onSelect={onSelect}
          wireframe={wireframe}
          position={[mainBody.width / 2 + 0.2, 0, 0]}
          castShadow
          receiveShadow
        >
          <mesh>
            <boxGeometry args={[0.4, 0.3, 0.3]} />
            <meshStandardMaterial color={0x3b82f6} roughness={0.5} metalness={0.4} wireframe={wireframe} />
          </mesh>
        </SelectableMesh>
      )}

      {/* Power/battery */}
      {power.mass > 0 && (
        <SelectableMesh
          name="power"
          selected={selectedComponent === 'power'}
          onSelect={onSelect}
          wireframe={wireframe}
          position={[0, -mainBody.height / 2 - 0.3, -mainBody.depth / 2 - 0.3]}
          castShadow
          receiveShadow
        >
          <mesh>
            <boxGeometry args={[0.5, 0.2, 0.5]} />
            <meshStandardMaterial color={0x22c55e} roughness={0.5} metalness={0.3} wireframe={wireframe} />
          </mesh>
        </SelectableMesh>
      )}
    </group>
  )
}

function SelectableMesh({ name, selected, onSelect, wireframe, children, ...props }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    onSelect(name)
  }

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      {...props}
    >
      {children}
      {selected && (
        <mesh geometry={meshRef.current?.geometry} material={materials.selected} />
      )}
      {hovered && !selected && (
        <mesh geometry={meshRef.current?.geometry} material={materials.wireframe} />
      )}
    </mesh>
  )
}

function ParameterCategory({ category, params, expanded, onToggle, onChange }) {
  const icons = {
    mainBody: LucideBox,
    solarPanels: Maximize,
    antenna: Settings,
    instruments: Sliders,
    propulsion: RotateCcw,
    structure: LucideBox,
    thermal: Sliders,
    avionics: LucideBox,
    power: Settings,
  }

  const Icon = icons[category] || LucideBox

  return (
    <div className="border border-space-700 rounded-xl overflow-hidden bg-space-800/50">
      <button onClick={onToggle} className="w-full p-3 flex items-center gap-2 hover:bg-space-700/50 transition-colors">
        <Icon className="h-5 w-5 text-accent-400" />
        <span className="font-medium text-space-100 capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
        <span className="ml-auto text-space-500">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="p-4 space-y-3 border-t border-space-700">
          {Object.entries(params).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="label text-xs capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
              {typeof value === 'boolean' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(category, key, e.target.checked)}
                    className="rounded border-space-600 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-space-300">{value ? 'Enabled' : 'Disabled'}</span>
                </label>
              ) : typeof value === 'number' ? (
                <input
                  type="number"
                  value={value}
                  onChange={(e) => onChange(category, key, Number(e.target.value))}
                  className="input-field text-sm"
                  step={key.includes('mass') || key.includes('power') || key.includes('thrust') || key.includes('isp') || key.includes('capacity') ? 1 : 0.01}
                  min={0}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(category, key, e.target.value)}
                  className="input-field text-sm"
                />
              )}
            </div>
          ))}
          {category === 'instruments' && Array.isArray(params) && params.map((inst, i) => (
            <div key={inst.id} className="p-3 rounded-lg bg-space-900/50 border border-space-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-space-100">{inst.name}</span>
                <button onClick={() => {
                  const newInstruments = [...params]
                  newInstruments.splice(i, 1)
                  onChange(category, 'list', newInstruments)
                }} className="text-danger-400 hover:text-danger-300">
                  <Minus className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="label text-xs">Mass (kg)</label>
                  <input type="number" value={inst.mass} onChange={(e) => {
                    const newInstruments = [...params]
                    newInstruments[i] = { ...newInstruments[i], mass: Number(e.target.value) }
                    onChange(category, 'list', newInstruments)
                  }} className="input-field text-sm" min={0} step={0.1} />
                </div>
                <div className="space-y-1">
                  <label className="label text-xs">Power (W)</label>
                  <input type="number" value={inst.power} onChange={(e) => {
                    const newInstruments = [...params]
                    newInstruments[i] = { ...newInstruments[i], power: Number(e.target.value) }
                    onChange(category, 'list', newInstruments)
                  }} className="input-field text-sm" min={0} step={1} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="label text-xs">Name</label>
                <input type="text" value={inst.name} onChange={(e) => {
                  const newInstruments = [...params]
                  newInstruments[i] = { ...newInstruments[i], name: e.target.value }
                  onChange(category, 'list', newInstruments)
                }} className="input-field text-sm" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export { SatelliteDesigner }// default export for lazy loading
export default SatelliteDesigner
