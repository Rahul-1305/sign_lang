/**
 * Simple Express server for Sign-Language project
 * - MongoDB (mongoose)
 * - /api/signup, /api/login
 * - /api/predict (samples a fake prediction)
 * - /api/history (list, delete)
 *
 * Notes:
 * - Login issues a JWT but endpoints accept optional token. This keeps the frontend working
 *   (the frontend currently doesn't attach the token to requests).
 */

const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')

require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

const app = express()
const PORT = process.env.PORT || 8000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/signlang'
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

app.use(cors({ origin: process.env.FRONTEND_URL || true }))
app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

// --- Mongoose models
const { Schema } = mongoose

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
})

const HistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  text: { type: String, required: true },
  meta: { type: Schema.Types.Mixed },
  created_at: { type: Date, default: Date.now }
})

const User = mongoose.model('User', UserSchema)
const History = mongoose.model('History', HistorySchema)

// --- Helpers
async function connectDb() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error', err)
    process.exit(1)
  }
}

// optional auth middleware: if token present, verify and set req.user, otherwise continue
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'] || req.headers['Authorization']
  const token = header && header.split && header.split(' ')[0] === 'Bearer' ? header.split(' ')[1] : (req.body && req.body.token) || req.query.token || req.headers['x-access-token']
  if (!token) return next()
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.id }
  } catch (err) {
    // ignore token errors for optional auth
  }
  return next()
}

// small utility to generate JWT
function createTokenForUser(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
}

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const existing = await User.findOne({ email }).lean()
    if (existing) return res.status(409).json({ error: 'user already exists' })
    const hashed = await bcrypt.hash(password, 10)
    const user = new User({ email, password: hashed })
    await user.save()
    return res.status(201).json({ id: user._id, email: user.email })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'email and password required' })
  try {
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = createTokenForUser(user)
    return res.json({ token, user: { id: user._id, email: user.email } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// predict endpoint: accepts { image: dataUrl } and returns a fake prediction object.
// If a token is provided, req.user will be set and the prediction is associated to that user.
app.post('/api/predict', optionalAuth, async (req, res) => {
  const { image } = req.body || {}
  if (!image) return res.status(400).json({ error: 'image required' })
  try {
    // Try forwarding to Python prediction service
    const PREDICT_URL = process.env.PREDICT_URL || 'http://127.0.0.1:5001/predict'
    let result = null
    try {
      const resp = await fetch(PREDICT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      })
      if (resp.ok) {
        const json = await resp.json()
        if (!json.error) {
          result = { label: json.label, confidence: Number(json.confidence || 0) }
        } else {
          console.warn('Python service returned error', json)
        }
      } else {
        console.warn('Python service returned non-2xx', resp.status)
      }
    } catch (err) {
      console.warn('Could not contact python predict service:', err.message)
    }

    // Fallback to simple random prediction if python service unavailable or returned error
    if (!result) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      const label = letters[Math.floor(Math.random() * letters.length)]
      const confidence = Number((Math.random() * 0.5 + 0.5).toFixed(3))
      result = { label, confidence }
    }

    // save to history
    const hist = new History({ userId: req.user ? req.user.id : null, text: `${result.label}`, meta: { confidence: result.confidence } })
    await hist.save()

    return res.json(result)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

app.get('/api/history', optionalAuth, async (req, res) => {
  try {
    const filter = {}
    // if user present, return only their history; otherwise return all
    if (req.user && req.user.id) filter.userId = req.user.id
    const docs = await History.find(filter).sort({ created_at: -1 }).limit(500).lean()
    const payload = docs.map(d => ({ id: d._id.toString(), text: d.text, created_at: d.created_at, meta: d.meta }))
    return res.json(payload)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

app.delete('/api/history/:id', async (req, res) => {
  const { id } = req.params
  try {
    await History.deleteOne({ _id: id })
    return res.json({ ok: true })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Start server after DB connected
connectDb().then(() => {
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
})

// graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down')
  mongoose.disconnect().then(() => process.exit(0))
})
