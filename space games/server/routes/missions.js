import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { authenticate, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

let missions = [
  {
    id: '1',
    name: 'Mars Sample Return',
    destination: 'Mars',
    launchDate: '2028-07-15',
    status: 'planning',
    deltaV: 6.2,
    payloadMass: 1200,
    cost: 4.2,
    duration: 980,
    description: 'Retrieve samples collected by Perseverance rover',
    stages: [
      { name: 'Earth Departure', deltaV: 3.6, mass: 800 },
      { name: 'Mars Orbit Insertion', deltaV: 1.4, mass: 300 },
      { name: 'Descent & Ascent', deltaV: 1.2, mass: 100 },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Europa Clipper',
    destination: 'Jupiter',
    launchDate: '2024-10-10',
    status: 'active',
    deltaV: 8.9,
    payloadMass: 2500,
    cost: 5.0,
    duration: 2100,
    description: 'Investigate Europa habitability',
    stages: [
      { name: 'Earth Departure', deltaV: 6.2, mass: 1800 },
      { name: 'Jupiter Orbit Insertion', deltaV: 2.7, mass: 700 },
    ],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '3',
    name: 'Artemis III',
    destination: 'Moon',
    launchDate: '2025-09-01',
    status: 'planning',
    deltaV: 4.1,
    payloadMass: 45000,
    cost: 7.5,
    duration: 30,
    description: 'Return humans to lunar surface',
    stages: [
      { name: 'TLI', deltaV: 3.2, mass: 30000 },
      { name: 'LOI', deltaV: 0.9, mass: 15000 },
    ],
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
  },
]

const validateMission = (req, res, next) => {
  const { name, destination, launchDate, status, deltaV, payloadMass, cost, duration, stages } = req.body
  const errors = []

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.push('Name must be at least 3 characters')
  }
  if (!destination || typeof destination !== 'string') {
    errors.push('Destination is required')
  }
  if (launchDate && isNaN(Date.parse(launchDate))) {
    errors.push('Invalid launch date format')
  }
  if (status && !['planning', 'active', 'completed', 'cancelled'].includes(status)) {
    errors.push('Invalid status')
  }
  if (deltaV !== undefined && (typeof deltaV !== 'number' || deltaV < 0)) {
    errors.push('Delta-V must be a positive number')
  }
  if (payloadMass !== undefined && (typeof payloadMass !== 'number' || payloadMass < 0)) {
    errors.push('Payload mass must be a positive number')
  }
  if (cost !== undefined && (typeof cost !== 'number' || cost < 0)) {
    errors.push('Cost must be a positive number')
  }
  if (duration !== undefined && (typeof duration !== 'number' || duration < 0)) {
    errors.push('Duration must be a positive number')
  }
  if (stages && !Array.isArray(stages)) {
    errors.push('Stages must be an array')
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation Error',
      details: errors,
      requestId: req.requestId
    })
  }
  next()
}

// GET /api/v1/missions - with pagination and filters
router.get('/', optionalAuth, (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    destination,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query

  let filtered = [...missions]

  if (status) {
    filtered = filtered.filter(m => m.status === status)
  }
  if (destination) {
    filtered = filtered.filter(m => m.destination.toLowerCase().includes(destination.toLowerCase()))
  }
  if (search) {
    const s = search.toLowerCase()
    filtered = filtered.filter(m =>
      m.name.toLowerCase().includes(s) ||
      m.description?.toLowerCase().includes(s)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]
    const order = sortOrder === 'asc' ? 1 : -1
    if (aVal < bVal) return -1 * order
    if (aVal > bVal) return 1 * order
    return 0
  })

  // Pagination
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
  const start = (pageNum - 1) * limitNum
  const paginated = filtered.slice(start, start + limitNum)

  res.json({
    data: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum)
    }
  })
})

// GET /api/v1/missions/:id
router.get('/:id', optionalAuth, (req, res) => {
  const mission = missions.find(m => m.id === req.params.id)
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found', requestId: req.requestId })
  }
  res.json(mission)
})

// POST /api/v1/missions
router.post('/', authenticate, validateMission, (req, res) => {
  const { name, destination, launchDate, status, deltaV, payloadMass, cost, duration, description, stages } = req.body

  const mission = {
    id: uuidv4(),
    name: name.trim(),
    destination,
    launchDate: launchDate || null,
    status: status || 'planning',
    deltaV: deltaV || 0,
    payloadMass: payloadMass || 0,
    cost: cost || 0,
    duration: duration || 0,
    description: description || '',
    stages: stages || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.user?.sub || 'anonymous'
  }

  missions.push(mission)
  res.status(201).json(mission)
})

// PUT /api/v1/missions/:id
router.put('/:id', authenticate, validateMission, (req, res) => {
  const index = missions.findIndex(m => m.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Mission not found', requestId: req.requestId })
  }

  const { name, destination, launchDate, status, deltaV, payloadMass, cost, duration, description, stages } = req.body

  missions[index] = {
    ...missions[index],
    name: name.trim(),
    destination,
    launchDate: launchDate || null,
    status: status || missions[index].status,
    deltaV: deltaV ?? missions[index].deltaV,
    payloadMass: payloadMass ?? missions[index].payloadMass,
    cost: cost ?? missions[index].cost,
    duration: duration ?? missions[index].duration,
    description: description ?? missions[index].description,
    stages: stages ?? missions[index].stages,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user?.sub || 'anonymous'
  }

  res.json(missions[index])
})

// PATCH /api/v1/missions/:id (partial update)
router.patch('/:id', authenticate, (req, res) => {
  const index = missions.findIndex(m => m.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Mission not found', requestId: req.requestId })
  }

  const allowedFields = ['name', 'destination', 'launchDate', 'status', 'deltaV', 'payloadMass', 'cost', 'duration', 'description', 'stages']
  const updates = {}

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field]
    }
  }

  if (updates.name && typeof updates.name === 'string' && updates.name.trim().length < 3) {
    return res.status(400).json({ error: 'Name must be at least 3 characters', requestId: req.requestId })
  }
  if (updates.status && !['planning', 'active', 'completed', 'cancelled'].includes(updates.status)) {
    return res.status(400).json({ error: 'Invalid status', requestId: req.requestId })
  }

  missions[index] = {
    ...missions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    updatedBy: req.user?.sub || 'anonymous'
  }

  res.json(missions[index])
})

// DELETE /api/v1/missions/:id
router.delete('/:id', authenticate, (req, res) => {
  const index = missions.findIndex(m => m.id === req.params.id)
  if (index === -1) {
    return res.status(404).json({ error: 'Mission not found', requestId: req.requestId })
  }

  missions.splice(index, 1)
  res.status(204).send()
})

// POST /api/v1/missions/:id/duplicate
router.post('/:id/duplicate', authenticate, (req, res) => {
  const mission = missions.find(m => m.id === req.params.id)
  if (!mission) {
    return res.status(404).json({ error: 'Mission not found', requestId: req.requestId })
  }

  const duplicated = {
    ...mission,
    id: uuidv4(),
    name: `${mission.name} (Copy)`,
    status: 'planning',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.user?.sub || 'anonymous'
  }

  missions.push(duplicated)
  res.status(201).json(duplicated)
})

// GET /api/v1/missions/stats/summary
router.get('/stats/summary', optionalAuth, (req, res) => {
  const total = missions.length
  const byStatus = missions.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1
    return acc
  }, {})
  const byDestination = missions.reduce((acc, m) => {
    acc[m.destination] = (acc[m.destination] || 0) + 1
    return acc
  }, {})
  const totalCost = missions.reduce((sum, m) => sum + (m.cost || 0), 0)
  const totalDeltaV = missions.reduce((sum, m) => sum + (m.deltaV || 0), 0)

  res.json({
    total,
    byStatus,
    byDestination,
    totalCost: Number(totalCost.toFixed(2)),
    avgDeltaV: Number((totalDeltaV / total || 0).toFixed(2))
  })
})

export default router