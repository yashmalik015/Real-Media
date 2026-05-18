import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import multer from 'multer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const dataDir = path.join(rootDir, 'data')
const uploadsDir = path.join(rootDir, 'uploads')
const dbPath = path.join(dataDir, 'real-media-db.json')
const PORT = Number(process.env.API_PORT || 4000)
const TEAM_ACCESS_ID = process.env.TEAM_ACCESS_ID || '1234567890'

const app = express()

await fs.mkdir(dataDir, { recursive: true })
await fs.mkdir(uploadsDir, { recursive: true })

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadsDir))

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(uploadsDir, { recursive: true })
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^\w.\-() ]+/g, '_')
    cb(null, `${Date.now()}-${crypto.randomBytes(5).toString('hex')}-${safeName}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 * 1024 },
})

const defaultDb = {
  users: [],
  sessions: [],
  projects: [],
  portfolio: [],
  notifications: [],
}

async function readDb() {
  try {
    return { ...defaultDb, ...JSON.parse(await fs.readFile(dbPath, 'utf8')) }
  } catch {
    await writeDb(defaultDb)
    return structuredClone(defaultDb)
  }
}

async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2))
}

function id(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const check = crypto.scryptSync(password, salt, 64)
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), check)
}

function publicUser(user) {
  if (!user) return null
  const rest = { ...user }
  delete rest.passwordHash
  return rest
}

function now() {
  return new Date().toISOString()
}

async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ message: 'Missing auth token.' })

  const db = await readDb()
  const session = db.sessions.find((item) => item.token === token)
  if (!session) return res.status(401).json({ message: 'Invalid session.' })

  const user = db.users.find((item) => item.id === session.userId)
  if (!user) return res.status(401).json({ message: 'User not found.' })

  req.db = db
  req.session = session
  req.user = user
  next()
}

function createSession(db, user) {
  const session = {
    id: id('session'),
    token: crypto.randomBytes(32).toString('hex'),
    userId: user.id,
    createdAt: now(),
  }
  db.sessions.push(session)
  return session
}

function notify(db, userId, projectId, title, message) {
  db.notifications.unshift({
    id: id('note'),
    userId,
    projectId,
    title,
    message,
    read: false,
    createdAt: now(),
  })
}

function serviceQuestions(service) {
  const base = [
    'What is the main goal of this project?',
    'Who is the target audience?',
    'What deadline or launch date should we plan around?',
    'What budget range should the team keep in mind?',
    'Do you have references, examples, competitors, or a style direction?',
  ]

  const byService = {
    'Video Editing': [
      'Which platform is this for: YouTube, Instagram, ads, or something else?',
      'What final duration and format do you need?',
      'What editing style should we follow: cinematic, fast reels, documentary, gaming, corporate, or music video?',
      'Do you need subtitles, voiceover, sound design, motion graphics, thumbnails, or color grading?',
    ],
    'Web Development': [
      'What pages do you need on the website?',
      'Do you need payments, bookings, forms, admin panel, or user login?',
      'Do you already have brand assets, domain, hosting, and copy?',
      'Which websites do you like visually or functionally?',
    ],
    'App Development': [
      'Should this be Android, iOS, or both?',
      'What are the must-have screens and user roles?',
      'Do you need payments, maps, chat, notifications, or admin controls?',
      'Do you have an existing API/backend or should we build it?',
    ],
    'Software Development': [
      'Which business process should this software automate?',
      'Who will use it and what permissions do they need?',
      'What data needs to be imported, exported, or reported?',
      'Do you need dashboards, invoices, CRM, inventory, or workflow approvals?',
    ],
    'Game Development': [
      'What genre, platform, and core gameplay loop do you want?',
      'Should it be 2D, 3D, single-player, multiplayer, or online?',
      'What art style and reference games should guide the experience?',
      'Do you need monetization, levels, leaderboard, or player accounts?',
    ],
    Marketing: [
      'Which platform should we focus on first?',
      'What product, offer, or funnel are we promoting?',
      'What audience, location, and budget should the campaign target?',
      'Do you need content creation, ad creatives, copywriting, or analytics reporting?',
    ],
  }

  return [...base, ...(byService[service] || [])]
}

function visibleProjects(db, user) {
  if (user.role === 'team') return db.projects
  return db.projects.filter((project) => project.clientId === user.id)
}

function defaultPortfolio() {
  return [
    {
      id: 'portfolio_brand_identity',
      title: 'Premium Brand Identity',
      service: 'Branding',
      description: 'Visual branding and creative direction for a polished business presence.',
      client: 'Real Media Studio',
      outcome: 'Built a sharper launch identity and campaign-ready visuals.',
      mediaUrl: '',
      mediaType: 'image',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'portfolio_campaign_design',
      title: 'Creative Campaign Design',
      service: 'Marketing',
      description: 'Content visuals built for social media, ads, and brand recognition.',
      client: 'Growth Campaign',
      outcome: 'Created scroll-stopping campaign assets for multi-platform rollout.',
      mediaUrl: '',
      mediaType: 'image',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: 'portfolio_real_media_branding',
      title: 'Real Media Branding',
      service: 'Creative Direction',
      description: 'Logo system, digital brand presentation, and premium visual tone.',
      client: 'Real Media',
      outcome: 'A strong red-black brand system designed for global digital work.',
      mediaUrl: '',
      mediaType: 'image',
      createdAt: now(),
      updatedAt: now(),
    },
  ]
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, teamAccessIdLength: TEAM_ACCESS_ID.length })
})

app.post('/api/auth/client', async (req, res) => {
  const { mode = 'login', name = '', email = '', password = '' } = req.body
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !password || (mode === 'register' && !name.trim())) {
    return res.status(400).json({ message: 'Name, email, and password are required.' })
  }

  const db = await readDb()
  let user = db.users.find((item) => item.email === cleanEmail && item.role === 'client')

  if (mode === 'register') {
    if (user) return res.status(409).json({ message: 'Client account already exists. Please login.' })
    user = {
      id: id('user'),
      role: 'client',
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      createdAt: now(),
    }
    db.users.push(user)
  } else if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid client login.' })
  }

  const session = createSession(db, user)
  await writeDb(db)
  res.json({ token: session.token, user: publicUser(user) })
})

app.post('/api/auth/team', async (req, res) => {
  const { teamId = '', name = 'Real Media Team' } = req.body
  if (!/^\d{10}$/.test(teamId) || teamId !== TEAM_ACCESS_ID) {
    return res.status(401).json({ message: 'Enter a valid 10 digit team ID.' })
  }

  const db = await readDb()
  let user = db.users.find((item) => item.role === 'team' && item.teamId === TEAM_ACCESS_ID)
  if (!user) {
    user = {
      id: id('team'),
      role: 'team',
      name: name.trim() || 'Real Media Team',
      teamId: TEAM_ACCESS_ID,
      createdAt: now(),
    }
    db.users.push(user)
  }

  const session = createSession(db, user)
  await writeDb(db)
  res.json({ token: session.token, user: publicUser(user) })
})

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

app.get('/api/questions/:service', requireAuth, (req, res) => {
  res.json({ questions: serviceQuestions(req.params.service) })
})

app.get('/api/portfolio', requireAuth, async (_req, res) => {
  const db = await readDb()
  if (!db.portfolio.length) {
    db.portfolio = defaultPortfolio()
    await writeDb(db)
  }
  res.json({ portfolio: db.portfolio })
})

app.post('/api/portfolio', requireAuth, upload.single('media'), async (req, res) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ message: 'Only team members can add portfolio work.' })
  }

  const { title = '', service = '', description = '', client = '', outcome = '' } = req.body
  if (!title.trim() || !service.trim() || !description.trim()) {
    return res.status(400).json({ message: 'Project name, service, and description are required.' })
  }

  const db = await readDb()
  const media = req.file ? {
    mediaUrl: `/uploads/${req.file.filename}`,
    mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
    mediaName: req.file.originalname,
  } : {
    mediaUrl: '',
    mediaType: 'image',
    mediaName: '',
  }

  const portfolioItem = {
    id: id('portfolio'),
    title: title.trim(),
    service: service.trim(),
    description: description.trim(),
    client: client.trim(),
    outcome: outcome.trim(),
    ...media,
    createdBy: req.user.id,
    createdAt: now(),
    updatedAt: now(),
  }

  db.portfolio.unshift(portfolioItem)
  await writeDb(db)
  res.status(201).json({ portfolioItem })
})

app.delete('/api/portfolio/:id', requireAuth, async (req, res) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ message: 'Only team members can delete portfolio work.' })
  }

  const db = await readDb()
  const portfolioItem = db.portfolio.find((item) => item.id === req.params.id)
  if (!portfolioItem) return res.status(404).json({ message: 'Portfolio item not found.' })

  db.portfolio = db.portfolio.filter((item) => item.id !== req.params.id)
  await writeDb(db)
  res.json({ ok: true, deletedId: req.params.id })
})

app.post('/api/projects', requireAuth, upload.array('files', 20), async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Only clients can start projects.' })
  }

  const { service, title, description, answers = '{}' } = req.body
  if (!service || !title || !description) {
    return res.status(400).json({ message: 'Service, title, and project description are required.' })
  }

  const db = await readDb()
  const files = (req.files || []).map((file) => ({
    id: id('file'),
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${file.filename}`,
    uploadedAt: now(),
  }))

  const project = {
    id: id('project'),
    clientId: req.user.id,
    clientName: req.user.name,
    service,
    title,
    description,
    answers: JSON.parse(answers || '{}'),
    files,
    status: 'New brief submitted',
    messages: [
      {
        id: id('msg'),
        senderId: 'system',
        senderName: 'Real Media',
        senderRole: 'system',
        text: 'Project brief received. A project handler will review it and continue here.',
        createdAt: now(),
      },
    ],
    createdAt: now(),
    updatedAt: now(),
  }

  db.projects.unshift(project)
  notify(db, req.user.id, project.id, 'Project submitted', `${project.title} was sent to the Real Media team.`)
  db.users.filter((user) => user.role === 'team').forEach((teamUser) => {
    notify(db, teamUser.id, project.id, 'New client project', `${req.user.name} submitted ${project.title}.`)
  })

  await writeDb(db)
  res.status(201).json({ project })
})

app.get('/api/projects', requireAuth, (req, res) => {
  res.json({ projects: visibleProjects(req.db, req.user) })
})

app.get('/api/projects/:id', requireAuth, (req, res) => {
  const project = visibleProjects(req.db, req.user).find((item) => item.id === req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  res.json({ project })
})

app.post('/api/projects/:id/messages', requireAuth, async (req, res) => {
  const { text = '' } = req.body
  if (!text.trim()) return res.status(400).json({ message: 'Message is required.' })

  const db = await readDb()
  const project = visibleProjects(db, req.user).find((item) => item.id === req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })

  const message = {
    id: id('msg'),
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role,
    text: text.trim(),
    createdAt: now(),
  }
  project.messages.push(message)
  project.updatedAt = now()

  if (req.user.role === 'client') {
    db.users.filter((user) => user.role === 'team').forEach((teamUser) => {
      notify(db, teamUser.id, project.id, 'Client message', `${req.user.name}: ${message.text}`)
    })
  } else {
    notify(db, project.clientId, project.id, 'Handler message', `${req.user.name}: ${message.text}`)
  }

  await writeDb(db)
  res.status(201).json({ message, project })
})

app.patch('/api/projects/:id/status', requireAuth, async (req, res) => {
  if (req.user.role !== 'team') return res.status(403).json({ message: 'Only team can update status.' })
  const { status = '' } = req.body
  if (!status.trim()) return res.status(400).json({ message: 'Status is required.' })

  const db = await readDb()
  const project = db.projects.find((item) => item.id === req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })

  project.status = status.trim()
  project.updatedAt = now()
  notify(db, project.clientId, project.id, 'Project status updated', `${project.title}: ${project.status}`)
  await writeDb(db)
  res.json({ project })
})

app.post('/api/projects/:id/files', requireAuth, upload.array('files', 20), async (req, res) => {
  const db = await readDb()
  const project = visibleProjects(db, req.user).find((item) => item.id === req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })

  const files = (req.files || []).map((file) => ({
    id: id('file'),
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: `/uploads/${file.filename}`,
    uploadedAt: now(),
  }))
  project.files.push(...files)
  project.updatedAt = now()
  notify(db, project.clientId, project.id, 'Footage uploaded', `${files.length} file(s) were added to ${project.title}.`)

  await writeDb(db)
  res.status(201).json({ files, project })
})

app.get('/api/notifications', requireAuth, (req, res) => {
  const notifications = req.db.notifications.filter((item) => item.userId === req.user.id)
  res.json({ notifications })
})

app.patch('/api/notifications/read', requireAuth, async (req, res) => {
  const db = await readDb()
  db.notifications.forEach((item) => {
    if (item.userId === req.user.id) item.read = true
  })
  await writeDb(db)
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Real Media backend running on http://localhost:${PORT}`)
  console.log(`Team login ID: ${TEAM_ACCESS_ID}`)
})
