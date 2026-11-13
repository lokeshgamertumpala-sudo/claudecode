import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex')

const b64url = (input) => Buffer.from(input).toString('base64url')

export const signToken = (payload, expiresIn = '7d') => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const expires = expiresIn === 'never' ? undefined : now + parseExpiry(expiresIn)
  const body = { ...payload, iat: now, ...(expires && { exp: expires }) }
  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(body))}`
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url')
  return `${data}.${signature}`
}

export const verifyToken = (token) => {
  const parts = String(token).split('.')
  if (parts.length !== 3) throw new Error('Malformed token')
  const [header, body, signature] = parts
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url')
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Invalid signature')
  }
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString())
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired')
  }
  return payload
}

function parseExpiry(exp) {
  const match = /^(\d+)([smhd])$/.exec(exp)
  if (!match) return 3600
  const value = Number(match[1])
  const unit = match[2]
  const factors = { s: 1, m: 60, h: 3600, d: 86400 }
  return value * factors[unit]
}

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing bearer token',
      requestId: req.requestId
    })
  }
  try {
    req.user = verifyToken(token)
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
      requestId: req.requestId
    })
  }
}

export const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    try {
      req.user = verifyToken(token)
    } catch {
      req.user = undefined
    }
  }
  next()
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' })
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden', message: 'Insufficient privileges' })
  }
  next()
}
