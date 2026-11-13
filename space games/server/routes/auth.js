import express from 'express'
import { signToken } from '../middleware/auth.js'

const router = express.Router()

// Dev/demo accounts - replace with a real user store in production
const users = [
  { id: 'u1', username: 'director', password: 'orbitforge', role: 'admin' },
  { id: 'u2', username: 'engineer', password: 'engineer', role: 'engineer' },
]

router.post('/token', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'username and password are required',
      requestId: req.requestId
    })
  }

  const user = users.find(u => u.username === username && u.password === password)
  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid credentials',
      requestId: req.requestId
    })
  }

  const token = signToken({ sub: user.id, username: user.username, role: user.role }, '7d')

  res.json({
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: 604800,
    user: { id: user.id, username: user.username, role: user.role }
  })
})

export default router
