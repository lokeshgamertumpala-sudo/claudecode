import {
  Image,
  Upload,
  CheckCircle2,
  XCircle,
  Brain,
  ScanLine,
  ChevronRight,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react'
import { useOrbitalStore } from '../stores/orbitalStore'
import { clsx } from 'clsx'
import React, { useState } from 'react'

const componentTypes = [
  { id: 'mainBody', name: 'Main Body', icon: '📦', color: 'text-blue-400' },
  { id: 'solarPanels', name: 'Solar Panels', icon: '☀️', color: 'text-yellow-400' },
  { id: 'antenna', name: 'Antenna/Dish', icon: '📡', color: 'text-green-400' },
  { id: 'instruments', name: 'Instruments', icon: '🔬', color: 'text-purple-400' },
  { id: 'propulsion', name: 'Propulsion', icon: '🚀', color: 'text-orange-400' },
  { id: 'thermal', name: 'Thermal', icon: '🌡️', color: 'text-red-400' },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024

export function SketchAnalyzer() {
  const {
    sketchFile,
    sketchAnalysis,
    setSketchFile,
    setSketchAnalysis,
    confirmSketch,
    clearSketch,
    spacecraftParams,
    updateSpacecraftCategory,
    loadSampleSpacecraft,
    apiKey,
    setLoading,
    addNotification,
  } = useOrbitalStore()

  const [dragActive, setDragActive] = useState(false)
  const [analysisStep, setAnalysisStep] = useState('upload')
  const [confirmedDimensions, setConfirmedDimensions] = useState({})

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      addNotification({ type: 'error', message: 'Only image files are allowed (PNG, JPG, WEBP)' })
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      addNotification({ type: 'error', message: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 10 MB.` })
      return false
    }
    return true
  }

  const analyzeSketch = async (file) => {
    setAnalysisStep('analyzing')
    setLoading('sketch', true)

    try {
      const analysis = await callVisionAPI(file)
      setSketchAnalysis(analysis)
      setAnalysisStep('review')
      addNotification({ type: 'success', message: 'Sketch analyzed successfully' })
    } catch (error) {
      addNotification({ type: 'error', message: `Analysis failed: ${error.message}` })
      setAnalysisStep('upload')
    } finally {
      setLoading('sketch', false)
    }
  }

  const callVisionAPI = async (file) => {
    const formData = new FormData()
    formData.append('sketch', file)

    const response = await fetch('/api/analyze-sketch', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `API error ${response.status}`)
    }

    return response.json()
  }

  const confirmAndApply = () => {
    const merged = { ...spacecraftParams }
    Object.entries(confirmedDimensions).forEach(([category, dims]) => {
      if (!dims) return
      merged[category] = { ...merged[category], ...dims }
    })

    const instrumentData = confirmedDimensions.instruments?.instruments
    if (Array.isArray(instrumentData)) {
      merged.instruments = instrumentData.map((inst, i) => ({
        id: `inst-${Date.now()}-${i}`,
        ...inst,
      }))
    }

    Object.entries(merged).forEach(([cat, params]) => {
      updateSpacecraftCategory(cat, params)
    })

    confirmSketch()
    setAnalysisStep('complete')
    addNotification({ type: 'success', message: 'Confirmed dimensions applied to spacecraft design' })
  }

  const loadSample = (sample) => {
    loadSampleSpacecraft(sample)
    clearSketch()
    setAnalysisStep('complete')
    addNotification({ type: 'info', message: `Loaded sample spacecraft: ${sample}` })
  }

  if (analysisStep === 'upload') {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in">
        <div>
          <h1 className="text-3xl font-bold text-space-100">Sketch Analyzer</h1>
          <p className="text-space-400 mt-1">Upload a 2D spacecraft sketch for AI component detection and dimension extraction</p>
        </div>

        <div className="panel">
          <div
            className={clsx(
              'relative border-2 border-dashed rounded-xl p-8 text-center transition-all',
              dragActive ? 'border-accent-500 bg-accent-500/5' : 'border-space-700 hover:border-accent-500'
            )}
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
            onDragOver={(e) => e.preventDefault() }
            onDrop={(e) => {
              e.preventDefault()
              setDragActive(false)
              const file = e.dataTransfer.files?.[0]
              if (file && validateFile(file)) {
                setSketchFile(file)
                analyzeSketch(file)
              }
            }}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && validateFile(file)) {
                  setSketchFile(file)
                  analyzeSketch(file)
                }
                e.target.value = ''
              }}
              className="hidden"
              id="sketch-upload"
            />
            <div className="flex flex-col items-center gap-4">
              <div className={clsx('p-4 rounded-xl', dragActive ? 'bg-accent-500/20' : 'bg-space-800/50')}>
                <Upload className={clsx('h-12 w-12', dragActive ? 'text-accent-400' : 'text-space-500')} />
              </div>
              <div>
                <p className="text-lg font-medium text-space-100">Drag & drop your spacecraft sketch here</p>
                <p className="text-space-400 mt-1">or click to browse</p>
                <p className="text-xs text-space-500 mt-2">PNG, JPG, WEBP · Max 10 MB</p>
              </div>
              <label htmlFor="sketch-upload" className="btn-primary cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </label>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {['cubesat', 'smallsat', 'default'].map((sample) => (
              <button key={sample} onClick={() => loadSample(sample)} className="btn-secondary capitalize">
                Load {sample} Sample
              </button>
            ))}
          </div>

          {!apiKey && (
            <div className="mt-4 p-3 rounded-lg bg-warning-500/10 border border-warning-500/20 flex items-start gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-warning-400" />
              <span className="text-space-300">
                No API key configured — sketch analysis runs in clearly-labeled development mock mode.
                Set a key in <a href="/settings" className="text-accent-400 hover:underline">Settings</a> for live NVIDIA Kimi 3.1 Pro vision analysis.
              </span>
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="section-title mb-4">
            <Info className="h-5 w-5 text-accent-400" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-space-800/50">
              <h3 className="font-medium text-space-100 mb-2 flex items-center gap-2">
                <ScanLine className="h-4 w-4 text-accent-400" />1. Upload
              </h3>
              <p className="text-space-400">Upload a 2D drawing, diagram, or photo of your spacecraft concept</p>
            </div>
            <div className="p-4 rounded-lg bg-space-800/50">
              <h3 className="font-medium text-space-100 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent-400" />2. AI Analysis
              </h3>
              <p className="text-space-400">The vision model identifies components and marks every dimension by source</p>
            </div>
            <div className="p-4 rounded-lg bg-space-800/50">
              <h3 className="font-medium text-space-100 mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent-400" />3. Review & Confirm
              </h3>
              <p className="text-space-400">You verify or correct each dimension before it becomes a 3D parameter</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (analysisStep === 'analyzing') {
    return (
      <div className="max-w-2xl mx-auto text-center animate-in">
        <div className="panel">
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="h-20 w-20 rounded-full border-4 border-space-700 border-t-accent-500 animate-spin" />
            <div>
              <h2 className="text-xl font-semibold text-space-100">Analyzing Sketch...</h2>
              <p className="text-space-400 mt-2">
                {apiKey ? 'NVIDIA Kimi 3.1 Pro is identifying spacecraft components' : 'Mock analysis mode (no API key)'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (analysisStep === 'review' && sketchAnalysis) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-space-100">Review Analysis</h1>
            <p className="text-space-400 mt-1">Verify and correct detected dimensions before applying them</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setAnalysisStep('upload')} className="btn-secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-analyze
            </button>
            <button
              onClick={confirmAndApply}
              className="btn-primary"
              disabled={Object.keys(confirmedDimensions).length === 0}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm & Apply
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="panel">
            <h2 className="section-title mb-4">
              <Image className="h-5 w-5 text-accent-400" />
              Original Sketch
            </h2>
            {sketchFile && (
              <div className="relative aspect-video rounded-lg bg-space-800 overflow-hidden">
                <img src={URL.createObjectURL(sketchFile)} alt="Uploaded spacecraft sketch" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          <div className="panel">
            <h2 className="section-title mb-4">
              <Brain className="h-5 w-5 text-accent-400" />
              AI Detection Results
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {sketchAnalysis.components.map((comp, idx) => (
                <ComponentReviewCard
                  key={idx}
                  component={comp}
                  confirmedDimensions={confirmedDimensions}
                  onConfirm={(dims) => setConfirmedDimensions(prev => ({ ...prev, [comp.type]: dims }))}
                  onSkip={() => setConfirmedDimensions(prev => ({ ...prev, [comp.type]: null }))}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title mb-4">Confirmed Dimensions Summary</h2>
          {Object.keys(confirmedDimensions).filter(k => confirmedDimensions[k]).length === 0 ? (
            <p className="text-space-500 text-sm">No components confirmed yet. Confirm at least one component to apply dimensions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(confirmedDimensions).filter(([, v]) => v).map(([type, dims]) => (
                <div key={type} className="p-4 rounded-lg bg-space-800/50 border border-space-700">
                  <h4 className="font-medium text-space-100 capitalize mb-2">{type.replace(/([A-Z])/g, ' $1')}</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(dims).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-space-400">{k}</span>
                        <span className="font-mono text-space-100">{String(v)}{typeof v === 'number' ? (k.includes('mass') ? ' kg' : k.includes('power') ? ' W' : ' m') : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (analysisStep === 'complete') {
    return (
      <div className="max-w-2xl mx-auto text-center animate-in">
        <div className="panel">
          <div className="flex flex-col items-center gap-6 py-12">
            <div className="h-20 w-20 rounded-full bg-success-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-success-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-space-100">Analysis Complete</h2>
              <p className="text-space-400 mt-2">Dimensions have been applied to your spacecraft design</p>
            </div>
            <div className="flex gap-3">
              <a href="/satellite" className="btn-primary">
                <ChevronRight className="h-4 w-4 mr-2" />
                Go to Satellite Designer
              </a>
              <button onClick={() => { clearSketch(); setAnalysisStep('upload') }} className="btn-secondary">
                Analyze Another
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

function ComponentReviewCard({ component, confirmedDimensions, onConfirm, onSkip }) {
  const [expanded, setExpanded] = useState(true)
  const dims = confirmedDimensions[component.type] || component.dimensions
  const source = confirmedDimensions[component.type] ? 'confirmed' : component.source

  const sourceBadge = {
    detected: <span className="badge badge-info">Detected from label</span>,
    inferred: <span className="badge badge-warning">Inferred from geometry</span>,
    estimated: <span className="badge badge-warning">AI estimate</span>,
    unknown: <span className="badge badge-info">Unknown</span>,
    confirmed: <span className="badge badge-success">User confirmed</span>,
  }[source] || <span className="badge badge-info">Unknown</span>

  return (
    <div className="border border-space-700 rounded-xl overflow-hidden bg-space-800/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-space-700/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{componentTypes.find(c => c.id === component.type)?.icon || '📦'}</span>
          <div>
            <h3 className="font-semibold text-space-100">{component.name}</h3>
            <p className="text-sm text-space-400">{component.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sourceBadge}
          <ChevronRight className={clsx('h-5 w-5 text-space-500 transition-transform flex-shrink-0', expanded && 'rotate-90')} />
        </div>
      </button>

      {expanded && (
        <div className="p-4 border-t border-space-700 bg-space-900/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {Object.entries(dims).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <label className="label text-xs">{key}</label>
                <input
                  type="number"
                  value={typeof value === 'number' ? value : 0}
                  onChange={(e) => {
                    const newDims = { ...dims, [key]: Number(e.target.value) }
                    onConfirm(newDims)
                  }}
                  className="input-field text-sm"
                  step="0.01"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-3 border-t border-space-700">
            <button onClick={() => onConfirm(dims)} className="btn-primary flex-1">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm Dimensions
            </button>
            <button onClick={onSkip} className="btn-secondary flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Skip Component
            </button>
          </div>

          {component.notes && (
            <div className="mt-3 p-3 rounded-lg bg-warning-500/10 border border-warning-500/20 text-sm text-warning-400 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{component.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SKETCH_ANALYSIS_PROMPT = `You are an aerospace engineering AI analyzing a 2D spacecraft sketch. Identify all visible spacecraft components and extract dimensions.

For each component, provide:
1. Component type: mainBody, solarPanels, antenna, instruments, propulsion, thermal, structure, avionics, power
2. Name and description
3. Dimensions with source: "detected" (from written labels/text in the image), "inferred" (from geometry/proportions relative to known parts), "estimated" (best guess with no evidence)
4. Mass and power estimates where applicable
5. Notes on uncertainty

Return ONLY JSON in this exact shape:
{
  "components": [
    {
      "type": "mainBody",
      "name": "Main Satellite Body",
      "description": "Primary spacecraft bus structure",
      "dimensions": { "width": 2.0, "height": 1.5, "depth": 2.0, "mass": 500 },
      "source": "inferred",
      "notes": "No scale reference visible, estimated from typical proportions"
    }
  ]
}

Never invent exact dimensions from the image alone. Mark uncertain dimensions as "estimated" and state why.`

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function parseAIResponse(content, fileName) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed.components)) return parsed
      throw new Error('Response missing components array')
    }
    throw new Error('No JSON found in AI response')
  } catch {
    return generateMockAnalysis(fileName)
  }
}

function generateMockAnalysis(fileName) {
  return {
    components: [
      {
        type: 'mainBody',
        name: 'Main Satellite Body',
        description: 'Primary spacecraft bus structure',
        dimensions: { width: 2.0, height: 1.5, depth: 2.0, mass: 500 },
        source: 'inferred',
        notes: 'Mock analysis — no scale reference visible, estimated from typical proportions',
      },
      {
        type: 'solarPanels',
        name: 'Solar Array Wings',
        description: 'Deployable photovoltaic arrays',
        dimensions: { count: 2, width: 4.0, height: 2.0, mass: 50, efficiency: 0.28 },
        source: 'estimated',
        notes: 'Mock analysis — panel count unclear, assuming standard 2-wing configuration',
      },
      {
        type: 'antenna',
        name: 'High-Gain Antenna',
        description: 'Parabolic communication dish',
        dimensions: { diameter: 1.5, mass: 25 },
        source: 'detected',
        notes: 'Mock analysis — diameter label "1.5m" assumed present in sketch',
      },
      {
        type: 'instruments',
        name: 'Science Instruments',
        description: 'Payload instruments',
        dimensions: {
          instruments: [
            { name: 'Multispectral Imager', mass: 45, power: 35 },
            { name: 'Spectrometer', mass: 30, power: 25 },
          ],
        },
        source: 'estimated',
        notes: 'Mock analysis — instrument labels partially visible, mass/power estimated from typical values',
      },
      {
        type: 'propulsion',
        name: 'Propulsion Module',
        description: 'Chemical propulsion system',
        dimensions: { type: 'chemical', mass: 120, thrust: 450, isp: 320 },
        source: 'inferred',
        notes: 'Mock analysis — thruster nozzles visible, type assumed chemical',
      },
    ],
  }
}

export default SketchAnalyzer