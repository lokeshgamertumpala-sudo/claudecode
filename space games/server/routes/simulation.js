import express from 'express'

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'simulation', timestamp: new Date().toISOString() })
})

router.post('/run', (req, res) => {
  const { spacecraft, trajectory, environment } = req.body

  if (!spacecraft || !trajectory) {
    return res.status(400).json({
      error: 'Spacecraft and trajectory parameters required',
      requestId: req.requestId
    })
  }

  const { dryMass, propellantMass, engineIsp, engineCount, thrustPerEngine } = spacecraft
  const { deltaVBudget, margin } = trajectory

  if (dryMass === undefined || propellantMass === undefined || engineIsp === undefined ||
      engineCount === undefined || thrustPerEngine === undefined) {
    return res.status(400).json({
      error: 'Missing required spacecraft fields',
      required: ['dryMass', 'propellantMass', 'engineIsp', 'engineCount', 'thrustPerEngine'],
      requestId: req.requestId
    })
  }

  const totalMass = dryMass + propellantMass
  const totalThrust = engineCount * thrustPerEngine
  const g0 = 9.81
  const twr = totalThrust * 1000 / (totalMass * g0)
  const deltaV = engineIsp * g0 * Math.log(totalMass / dryMass)
  const burnTime = (propellantMass * engineIsp * g0) / totalThrust
  const payloadFraction = dryMass / totalMass
  const costEstimate = (dryMass * 25000 + propellantMass * 5000) / 1e9
  const deltaVMargin = deltaVBudget > 0 ? ((deltaV - deltaVBudget) / deltaVBudget * 100) : 0

  const results = {
    totalMass,
    totalThrust,
    twr: Math.max(0, twr),
    deltaV: Math.max(0, deltaV),
    burnTime: Math.max(0, burnTime),
    payloadFraction: Math.max(0, Math.min(1, payloadFraction)),
    costEstimate: Math.max(0, costEstimate),
    deltaVMargin,
    commsMargin: spacecraft.commsPower > 100 ? 'Adequate' : 'Marginal',
    feasibility: deltaV >= deltaVBudget * (1 - margin) ? 'Feasible' : 'Infeasible',
    warnings: []
  }

  if (twr < 1.2) results.warnings.push('Low thrust-to-weight ratio for launch')
  if (results.deltaVMargin < -5) results.warnings.push('Insufficient delta-V margin')
  if (dryMass > propellantMass) results.warnings.push('Dry mass exceeds propellant mass')

  res.json(results)
})

router.get('/presets', (req, res) => {
  const presets = {
    'trans-lunar': {
      name: 'Trans-Lunar Injection',
      spacecraft: { dryMass: 8000, propellantMass: 3000, engineIsp: 450, engineCount: 1, thrustPerEngine: 450 },
      trajectory: { deltaVBudget: 3.2, margin: 0.15, transferType: 'Hohmann' },
    },
    'deep-space-low-thrust': {
      name: 'Deep Space Low-Thrust',
      spacecraft: { dryMass: 3000, propellantMass: 1500, engineIsp: 3000, engineCount: 4, thrustPerEngine: 0.5 },
      trajectory: { deltaVBudget: 4.2, margin: 0.2, transferType: 'Low-thrust' },
    },
    'lunar-crew': {
      name: 'Lunar Crewed Mission',
      spacecraft: { dryMass: 25000, propellantMass: 20000, engineIsp: 450, engineCount: 1, thrustPerEngine: 1100 },
      trajectory: { deltaVBudget: 4.1, margin: 0.1, transferType: 'Hohmann' },
    },
    'jupiter-probe': {
      name: 'Jupiter Orbiter',
      spacecraft: { dryMass: 1500, propellantMass: 3000, engineIsp: 320, engineCount: 1, thrustPerEngine: 450 },
      trajectory: { deltaVBudget: 9.5, margin: 0.2, transferType: 'Gravity Assist' },
    },
  }
  res.json(presets)
})

export default router