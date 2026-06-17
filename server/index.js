import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import Razorpay from 'razorpay'
import { createDatabase, id, now } from './database.js'
import { uploadFile, uploadsDirectory } from './fileStorage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const PORT = Number(process.env.API_PORT || 4000)
const TEAM_ACCESS_ID = process.env.TEAM_ACCESS_ID || '1234567890'
const MAX_UPLOAD_GB = Number(process.env.MAX_UPLOAD_GB || 3)
const CORS_ORIGIN = process.env.CORS_ORIGIN

const razorpay = process.env.RAZORPAY_KEY_ID ? new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
}) : null;

const repository = createDatabase()
const app = express()

app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({
  origin: CORS_ORIGIN ? CORS_ORIGIN.split(',').map((origin) => origin.trim()) : true,
  credentials: true,
}))
app.use(express.json({ limit: '2mb' }))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
}))
app.use('/uploads', express.static(uploadsDirectory()))

const distDir = path.join(rootDir, 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next()
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_GB * 1024 * 1024 * 1024 },
})

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  if (!stored) return false
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

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ message: 'Missing auth token.' })

  const user = repository.findUserByToken(token)
  if (!user) return res.status(401).json({ message: 'Invalid session.' })

  req.user = user
  next()
}

function createSessionResponse(user) {
  const session = repository.createSession(user.id)
  return { token: session.token, user: publicUser(user) }
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
    'VFX': [
      'What type of VFX do you need: compositing, CGI, motion tracking, or full scene build?',
      'What is the source footage format and resolution?',
      'Do you have reference films, shots, or mood boards for the look you want?',
      'How many shots or scenes need VFX work?',
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

function notifyTeam(project, clientName) {
  repository.teamUsers().forEach((teamUser) => {
    repository.notify(teamUser.id, project.id, 'New client project', `${clientName} submitted ${project.title}.`)
  })
}

async function filePayload(file, projectId) {
  const uploaded = await uploadFile(file, `projects/${projectId}`)
  return {
    id: id('file'),
    projectId,
    originalName: file.originalname,
    filename: uploaded.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: uploaded.url,
    uploadedAt: now(),
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    database: 'sqlite',
    uploadLimitGb: MAX_UPLOAD_GB,
    teamAccessIdLength: TEAM_ACCESS_ID.length,
  })
})

app.post('/api/auth/client', (req, res) => {
  const { mode = 'login', name = '', email = '', password = '' } = req.body
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !password || (mode === 'register' && !name.trim())) {
    return res.status(400).json({ message: 'Name, email, and password are required.' })
  }

  let user = repository.findClientByEmail(cleanEmail)
  if (mode === 'register') {
    if (user) return res.status(409).json({ message: 'Client account already exists. Please login.' })
    user = repository.insertUser({
      id: id('user'),
      role: 'client',
      name: name.trim(),
      email: cleanEmail,
      passwordHash: hashPassword(password),
      teamId: null,
      teamCategory: null,
      googleId: null,
      createdAt: now(),
    })
  } else if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid client login.' })
  }

  res.json(createSessionResponse(user))
})

app.post('/api/auth/google', (req, res) => {
  const { name = '', email = '', googleId = '' } = req.body
  const cleanEmail = email.trim().toLowerCase()
  if (!cleanEmail || !googleId.trim()) {
    return res.status(400).json({ message: 'Google account email is required.' })
  }

  let user = repository.findClientByEmail(cleanEmail)
  if (!user) {
    user = repository.insertUser({
      id: id('user'),
      role: 'client',
      name: name.trim() || cleanEmail,
      email: cleanEmail,
      passwordHash: null,
      teamId: null,
      teamCategory: null,
      googleId: googleId.trim(),
      createdAt: now(),
    })
  }

  res.json(createSessionResponse(user))
})

app.post('/api/auth/team', (req, res) => {
  const { teamId = '', name = 'Buildbig Team' } = req.body
  if (!/^\d{10}$/.test(teamId) || teamId !== TEAM_ACCESS_ID) {
    return res.status(401).json({ message: 'Enter a valid 10 digit team ID.' })
  }

  let user = repository.findTeamById(TEAM_ACCESS_ID)
  if (!user) {
    user = repository.insertUser({
      id: id('team'),
      role: 'team',
      name: name.trim() || 'Buildbig Team',
      email: null,
      passwordHash: null,
      teamId: TEAM_ACCESS_ID,
      teamCategory: null,
      googleId: null,
      createdAt: now(),
    })
  }

  res.json(createSessionResponse(user))
})

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) })
})

app.get('/api/questions/:service', requireAuth, (req, res) => {
  res.json({ questions: serviceQuestions(req.params.service) })
})

app.get('/api/portfolio', requireAuth, (_req, res) => {
  res.json({ portfolio: repository.portfolio() })
})

app.get('/api/portfolio/public', (_req, res) => {
  res.json({ portfolio: repository.portfolio() })
})

app.post('/api/portfolio', requireAuth, upload.single('media'), async (req, res) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ message: 'Only team members can add portfolio work.' })
  }

  const { title = '', service = '', description = '', client = '', outcome = '' } = req.body
  if (!title.trim() || !service.trim() || !description.trim()) {
    return res.status(400).json({ message: 'Project name, service, and description are required.' })
  }

  const timestamp = now()
  const uploaded = req.file ? await uploadFile(req.file, `portfolio/${service.trim() || 'general'}`) : null
  const portfolioItem = repository.createPortfolio({
    id: id('portfolio'),
    title: title.trim(),
    service: service.trim(),
    description: description.trim(),
    client: client.trim(),
    outcome: outcome.trim(),
    mediaUrl: uploaded?.url || '',
    mediaType: req.file?.mimetype.startsWith('video/') ? 'video' : 'image',
    mediaName: req.file?.originalname || '',
    createdBy: req.user.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  })

  res.status(201).json({ portfolioItem })
})

app.delete('/api/portfolio/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ message: 'Only team members can delete portfolio work.' })
  }

  const portfolioItem = repository.portfolioById(req.params.id)
  if (!portfolioItem) return res.status(404).json({ message: 'Portfolio item not found.' })

  repository.deletePortfolio(req.params.id)
  res.json({ ok: true, deletedId: req.params.id })
})

app.post('/api/projects', requireAuth, upload.array('files', 20), async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Only clients can start projects.' })
  }

  const { service, title, description, answers = '{}', servicePlan = 'Custom', totalAmount = 0 } = req.body
  if (!service || !title || !description) {
    return res.status(400).json({ message: 'Service, title, and project description are required.' })
  }

  let parsedAnswers
  try {
    parsedAnswers = JSON.parse(answers || '{}')
  } catch {
    return res.status(400).json({ message: 'Project answers must be valid JSON.' })
  }

  const timestamp = now()
  const projectId = id('project')
  const amountNum = Number(totalAmount) || 0
  
  const project = repository.createProject(
    {
      id: projectId,
      clientId: req.user.id,
      service,
      title,
      description,
      answersJson: JSON.stringify(parsedAnswers),
      status: amountNum > 0 ? 'Pending Payment' : 'New brief submitted',
      createdAt: timestamp,
      updatedAt: timestamp,
      servicePlan,
      paymentStatus: amountNum > 0 ? 'pending' : 'fully_paid',
      totalAmount: amountNum,
      amountPaid: 0,
      projectState: 'active',
      razorpayOrderId: null,
      razorpayPaymentId: null
    },
    await Promise.all((req.files || []).map((file) => filePayload(file, projectId))),
    {
      id: id('msg'),
      projectId,
      senderId: 'system',
      senderName: 'Buildbig',
      senderRole: 'system',
      text: amountNum > 0 ? 'Project brief received. Please complete the payment to begin.' : 'Project brief received. A project handler will review it and continue here.',
      createdAt: timestamp,
    },
  )

  if (amountNum === 0) {
    repository.notify(req.user.id, project.id, 'Project submitted', `${project.title} was sent to the Buildbig team.`)
    notifyTeam(project, req.user.name)
  }

  res.status(201).json({ project })
})

app.get('/api/projects', requireAuth, (req, res) => {
  res.json({ projects: repository.visibleProjects(req.user) })
})

app.get('/api/projects/:id', requireAuth, (req, res) => {
  const project = repository.visibleProject(req.user, req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  res.json({ project })
})

app.post('/api/projects/:id/messages', requireAuth, (req, res) => {
  const { text = '' } = req.body
  if (!text.trim()) return res.status(400).json({ message: 'Message is required.' })

  const existingProject = repository.visibleProject(req.user, req.params.id)
  if (!existingProject) return res.status(404).json({ message: 'Project not found.' })

  const project = repository.addMessage(req.params.id, {
    id: id('msg'),
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role,
    text: text.trim(),
    createdAt: now(),
  })

  if (req.user.role === 'client') {
    repository.teamUsers().forEach((teamUser) => {
      repository.notify(teamUser.id, project.id, 'Client message', `${req.user.name}: ${text.trim()}`)
    })
  } else {
    repository.notify(project.clientId, project.id, 'Handler message', `${req.user.name}: ${text.trim()}`)
  }

  res.status(201).json({ message: project.messages.at(-1), project })
})

app.patch('/api/projects/:id/status', requireAuth, (req, res) => {
  if (req.user.role !== 'team') return res.status(403).json({ message: 'Only team can update status.' })
  const { status = '' } = req.body
  if (!status.trim()) return res.status(400).json({ message: 'Status is required.' })

  const existingProject = repository.visibleProject(req.user, req.params.id)
  if (!existingProject) return res.status(404).json({ message: 'Project not found.' })

  const project = repository.updateProjectStatus(req.params.id, status.trim())
  repository.notify(project.clientId, project.id, 'Project status updated', `${project.title}: ${project.status}`)
  res.json({ project })
})

app.post('/api/projects/:id/stop', requireAuth, (req, res) => {
  const project = repository.visibleProject(req.user, req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  if (project.projectState !== 'active') return res.status(400).json({ message: 'Project is already stopped or finished.' })

  const updatedProject = repository.updateProjectState(req.params.id, 'stopped')
  repository.addMessage(req.params.id, {
    id: id('msg'),
    senderId: 'system',
    senderName: 'Buildbig',
    senderRole: 'system',
    text: `Project has been stopped by ${req.user.name}. All project files have been securely deleted.`,
    createdAt: now(),
  })
  res.json({ project: updatedProject })
})

app.post('/api/projects/:id/finish', requireAuth, (req, res) => {
  if (req.user.role !== 'team') return res.status(403).json({ message: 'Only team can finish projects.' })
  const project = repository.visibleProject(req.user, req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  if (project.projectState !== 'active') return res.status(400).json({ message: 'Project is already stopped or finished.' })

  const updatedProject = repository.updateProjectState(req.params.id, 'finished')
  repository.addMessage(req.params.id, {
    id: id('msg'),
    senderId: 'system',
    senderName: 'Buildbig',
    senderRole: 'system',
    text: `Project has been marked as finished by ${req.user.name}. All working files have been securely deleted.`,
    createdAt: now(),
  })
  res.json({ project: updatedProject })
})

app.delete('/api/projects/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'team') return res.status(403).json({ message: 'Only team can delete projects.' })
  const project = repository.visibleProject(req.user, req.params.id)
  if (!project) return res.status(404).json({ message: 'Project not found.' })

  repository.deleteProject(req.params.id)
  res.json({ ok: true, deletedId: req.params.id })
})

app.get('/api/payment/key', requireAuth, (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || null })
})

app.post('/api/payment/create-order', requireAuth, async (req, res) => {
  const { projectId, amount } = req.body
  const project = repository.visibleProject(req.user, projectId)
  if (!project) return res.status(404).json({ message: 'Project not found.' })
  
  if (!razorpay) {
    // Mock Razorpay response
    const mockOrderId = `order_mock_${Date.now()}`
    repository.setRazorpayOrderId(projectId, mockOrderId)
    return res.json({ id: mockOrderId, amount: amount * 100, currency: 'INR' })
  }

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${projectId}`,
    })
    repository.setRazorpayOrderId(projectId, order.id)
    res.json(order)
  } catch {
    res.status(500).json({ message: 'Failed to create payment order.' })
  }
})

app.post('/api/payment/verify', requireAuth, (req, res) => {
  const { projectId, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body
  const project = repository.visibleProject(req.user, projectId)
  if (!project) return res.status(404).json({ message: 'Project not found.' })

  if (razorpay) {
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest('hex')
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature.' })
    }
  }

  const newAmountPaid = project.amountPaid + amount
  const newStatus = newAmountPaid >= project.totalAmount ? 'fully_paid' : 'half_paid'
  
  const updatedProject = repository.updateProjectPayment(projectId, newStatus, amount, razorpay_payment_id || `mock_pay_${Date.now()}`)
  repository.updateProjectStatus(projectId, 'Payment Received - Active')
  
  repository.addMessage(projectId, {
    id: id('msg'),
    senderId: 'system',
    senderName: 'Buildbig',
    senderRole: 'system',
    text: `Payment of ₹${amount} received. The project is now active.`,
    createdAt: now(),
  })
  
  repository.notify(req.user.id, projectId, 'Payment Successful', `Payment of ₹${amount} for ${project.title} was successful.`)
  notifyTeam(updatedProject, req.user.name)

  res.json({ success: true, project: updatedProject })
})

app.post('/api/projects/:id/files', requireAuth, upload.array('files', 20), async (req, res) => {
  const existingProject = repository.visibleProject(req.user, req.params.id)
  if (!existingProject) return res.status(404).json({ message: 'Project not found.' })

  const files = await Promise.all((req.files || []).map((file) => filePayload(file, req.params.id)))
  const project = repository.addProjectFiles(req.params.id, files)
  repository.notify(project.clientId, project.id, 'Footage uploaded', `${files.length} file(s) were added to ${project.title}.`)

  res.status(201).json({ files: project.files, project })
})

app.get('/api/notifications', requireAuth, (req, res) => {
  res.json({ notifications: repository.notificationsForUser(req.user.id) })
})

app.patch('/api/notifications/read', requireAuth, (req, res) => {
  repository.markNotificationsRead(req.user.id)
  res.json({ ok: true })
})

app.get('/api/testimonials', (_req, res) => {
  res.json({ testimonials: repository.approvedTestimonials() })
})

app.post('/api/testimonials/verify', requireAuth, (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Only clients can submit project feedback.' })
  }
  const { projectTitle = '' } = req.body
  if (!projectTitle.trim()) {
    return res.status(400).json({ message: 'Project name is required.' })
  }
  const project = repository.findClientProjectByTitle(req.user.id, projectTitle.trim())
  if (!project) {
    return res.status(404).json({ message: 'No matching project found. Enter the exact project title from your workspace.' })
  }
  res.json({ ok: true, project: { id: project.id, title: project.title, service: project.service } })
})

app.post('/api/testimonials', requireAuth, (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ message: 'Only clients can submit feedback.' })
  }
  const { projectTitle = '', name = '', biz = '', quote = '', tag = '', result = '' } = req.body
  if (!projectTitle.trim() || !name.trim() || !quote.trim()) {
    return res.status(400).json({ message: 'Project name, your name, and feedback are required.' })
  }
  const project = repository.findClientProjectByTitle(req.user.id, projectTitle.trim())
  if (!project) {
    return res.status(404).json({ message: 'No matching project found. Enter the exact project title from your workspace.' })
  }
  const initials = name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const testimonial = repository.createTestimonial({
    id: id('testi'),
    userId: req.user.id,
    projectId: project.id,
    name: name.trim(),
    biz: biz.trim(),
    quote: quote.trim(),
    tag: tag.trim() || project.service,
    result: result.trim(),
    initials,
    approved: 1,
    createdAt: now(),
  })
  res.status(201).json({ testimonial })
})

app.get('/api/team-chat', requireAuth, (req, res) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ message: 'Only team members can access team chat.' })
  }
  res.json({ messages: repository.teamChatMessages() })
})

app.post('/api/team-chat', requireAuth, (req, res) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ message: 'Only team members can post in team chat.' })
  }
  const { text = '' } = req.body
  if (!text.trim()) {
    return res.status(400).json({ message: 'Message text is required.' })
  }
  const message = repository.addTeamChatMessage({
    id: id('tmsg'),
    senderId: req.user.id,
    senderName: req.user.name,
    text: text.trim(),
    fileUrl: null,
    fileName: null,
    createdAt: now(),
  })
  res.status(201).json({ message })
})

app.post('/api/team-chat/files', requireAuth, upload.array('files', 10), async (req, res) => {
  if (req.user.role !== 'team') {
    return res.status(403).json({ message: 'Only team members can upload files.' })
  }
  const files = await Promise.all((req.files || []).map(async (file) => {
    const uploaded = await uploadFile(file, `team-chat/${req.user.id}`)
    return repository.addTeamChatMessage({
      id: id('tmsg'),
      senderId: req.user.id,
      senderName: req.user.name,
      text: '',
      fileUrl: uploaded.url,
      fileName: file.originalname,
      createdAt: now(),
    })
  }))
  res.status(201).json({ messages: files })
})

app.use((err, _req, res, next) => {
  void next
  console.error(err)
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message })
  }
  res.status(500).json({ message: 'Internal server error.' })
})

const server = app.listen(PORT, () => {
  console.log(`Buildbig backend running on http://localhost:${PORT}`)
  console.log(`SQLite database: ${process.env.DATABASE_PATH || path.resolve(rootDir, 'data', 'real-media.sqlite')}`)
  console.log(`Team login ID: ${TEAM_ACCESS_ID}`)
})

server.ref()
setInterval(() => {}, 1 << 30)
