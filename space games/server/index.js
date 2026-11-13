import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import missionsRouter from './routes/missions.js'
import simulationRouter from './routes/simulation.js'
import aiRouter from './routes/ai.js'
import authRouter from './routes/auth.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'

// Security middleware
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: NODE_ENV === 'production',
  hsts: NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}))

// Logging
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
  skip: (req) => req.path === '/api/health'
}))

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip
})

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/api/', apiLimiter)
app.use('/api/ai', strictLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || (NODE_ENV === 'production' ? false : '*'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Request validation middleware
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID()
  req.startTime = Date.now()
  next()
})

// API versioning
const API_VERSION = 'v1'
const apiRouter = express.Router()

// Detailed health check
apiRouter.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: NODE_ENV,
    node: process.version,
    platform: process.platform
  }

  try {
    // Add database connectivity check if using DB
    // await db.ping()
    health.checks = {
      memory: health.memory.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'degraded',
      uptime: health.uptime > 0 ? 'healthy' : 'unhealthy'
    }
    res.json(health)
  } catch (error) {
    health.status = 'degraded'
    health.checks = { database: 'unhealthy' }
    res.status(503).json(health)
  }
})

// Routes with versioning
apiRouter.use('/missions', missionsRouter)
apiRouter.use('/simulation', simulationRouter)
apiRouter.use('/ai', aiRouter)
apiRouter.use('/auth', authRouter)

app.use(`/api/${API_VERSION}`, apiRouter)

// Legacy routes without version (for backward compatibility)
app.use('/api/missions', missionsRouter)
app.use('/api/simulation', simulationRouter)
app.use('/api/ai', aiRouter)
app.use('/api/auth', authRouter)

// Simple health check (legacy)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' })
})

// Static files - serve from dist
app.use(express.static(join(__dirname, '../dist')))

// SPA fallback - only for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      error: 'API endpoint not found',
      path: req.path,
      method: req.method,
      requestId: req.requestId
    })
  }
  res.sendFile(join(__dirname, '../dist/index.html'))
})

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.requestId} ${req.method} ${req.path}:`, err)

  const isDev = NODE_ENV !== 'production'

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.details || err.message,
      requestId: req.requestId
    })
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
      requestId: req.requestId
    })
  }

  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: 'Not Found',
      requestId: req.requestId
    })
  }

  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: isDev ? err.message : 'An unexpected error occurred',
    requestId: req.requestId,
    ...(isDev && { stack: err.stack })
  })
})

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method,
    requestId: req.requestId
  })
})

// Graceful shutdown
let server

const shutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`)

  if (server) {
    server.close(() => {
      console.log('HTTP server closed.')
      process.exit(0)
    })

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  } else {
    process.exit(0)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  shutdown('UNCAUGHT_EXCEPTION')
})

server = app.listen(PORT, () => {
  console.log(`🚀 ORBITFORGE AI Server running on http://localhost:${PORT}`)
  console.log(`📡 API v${API_VERSION} available at http://localhost:${PORT}/api/${API_VERSION}`)
  console.log(`🔧 Environment: ${NODE_ENV}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/${API_VERSION}/health`)
})

export default app