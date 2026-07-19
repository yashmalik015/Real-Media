import crypto from 'node:crypto'
import { MongoClient, GridFSBucket } from 'mongodb'
import { createV2Collections } from './v2Repository.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yashmalik015_db_user:VPyE0KcI35EXtfH1@cluster0.dqhp8cg.mongodb.net/assetsweber?retryWrites=true&w=majority&appName=Cluster0'
const MONGODB_DB = process.env.MONGODB_DB || 'assetsweber'

export async function createDatabase() {
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
    retryWrites: true,
  })

  try {
    await client.connect()
  } catch (error) {
    console.error('MongoDB Connection Failed:')
    console.error(error)
    throw error
  }

  const db = client.db(MONGODB_DB)
  const bucket = new GridFSBucket(db, { bucketName: 'uploads' })

  const users = db.collection('users')
  const sessions = db.collection('sessions')
  const projects = db.collection('projects')
  const projectFiles = db.collection('project_files')
  const projectMessages = db.collection('project_messages')
  const notifications = db.collection('notifications')
  const portfolioItems = db.collection('portfolio_items')
  const testimonials = db.collection('testimonials')
  const teamChatMessages = db.collection('team_chat_messages')

  await Promise.all([
    users.createIndex({ email: 1, role: 1 }, { unique: true, sparse: true }),
    users.createIndex({ team_id: 1, role: 1 }, { unique: true, sparse: true }),
    sessions.createIndex({ token: 1 }, { unique: true }),
    projects.createIndex({ client_id: 1 }),
    projects.createIndex({ service: 1 }),
    projects.createIndex({ project_state: 1 }),
    projectFiles.createIndex({ project_id: 1 }),
    projectMessages.createIndex({ project_id: 1, created_at: 1 }),
    notifications.createIndex({ user_id: 1, created_at: -1 }),
    portfolioItems.createIndex({ service: 1 }),
    portfolioItems.createIndex({ created_at: -1 }),
    testimonials.createIndex({ approved: 1, created_at: -1 }),
    testimonials.createIndex({ project_id: 1 }),
    teamChatMessages.createIndex({ created_at: 1 }),
  ])

  await seedDefaultPortfolio(portfolioItems)

  const v2 = await createV2Collections(db)

  return {
    ...makeRepository(client, {
      users,
      sessions,
      projects,
      projectFiles,
      projectMessages,
      notifications,
      portfolioItems,
      testimonials,
      teamChatMessages,
    }),
    v2,
    db,
    bucket,
  }
}

export function id(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`
}

export function now() {
  return new Date().toISOString()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
}

async function seedDefaultPortfolio(portfolioItems) {
  const count = await portfolioItems.countDocuments()
  if (count > 0) return

  const createdAt = now()
  const defaults = [
    {
      id: 'portfolio_batch_2',
      _id: 'portfolio_batch_2',
      title: 'BATCH 2.0 – Cinematic Cut',
      service: 'Video Editing',
      description: 'Cinematic production with premium transitions and professional color grading.',
      client: 'Buildbig',
      outcome: 'Viral reach across multiple platforms.',
      media_url: '/assets/BATCH 2.0.mp4',
      media_type: 'video',
      media_name: 'BATCH 2.0.mp4',
      created_by: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: 'portfolio_game_change',
      _id: 'portfolio_game_change',
      title: 'Game Change – Official Music Video',
      service: 'Video Editing',
      description: 'Full music video production with cinematic visuals and professional editing.',
      client: 'Buildbig Productions',
      outcome: 'Official release content delivered.',
      media_url: '/assets/GAME CHANGE OFFICIAL SONG (MUSIC VIDEO).mp4',
      media_type: 'video',
      media_name: 'GAME CHANGE OFFICIAL SONG (MUSIC VIDEO).mp4',
      created_by: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
    {
      id: 'portfolio_mine_trailer',
      _id: 'portfolio_mine_trailer',
      title: 'Mine – Official Trailer',
      service: 'Video Editing',
      description: 'High-impact trailer cut with dramatic pacing, SFX, and visual storytelling.',
      client: 'Buildbig',
      outcome: 'Theatrical trailer quality achieved.',
      media_url: '/assets/MINE OFFICIAl TRAILER .mp4',
      media_type: 'video',
      media_name: 'MINE OFFICIAl TRAILER .mp4',
      created_by: null,
      created_at: createdAt,
      updated_at: createdAt,
    },
  ]

  await portfolioItems.insertMany(defaults)
}

function makeRepository(client, collections) {
  const {
    users,
    sessions,
    projects,
    projectFiles,
    projectMessages,
    notifications,
    portfolioItems,
    testimonials,
    teamChatMessages,
  } = collections

  async function hydrateProject(row) {
    if (!row) return null
    const [files, messages, clientUser] = await Promise.all([
      projectFiles.find({ project_id: row.id }).sort({ uploaded_at: 1 }).toArray(),
      projectMessages.find({ project_id: row.id }).sort({ created_at: 1 }).toArray(),
      users.findOne({ id: row.client_id }),
    ])

    return {
      id: row.id,
      clientId: row.client_id,
      clientName: clientUser?.name || '',
      service: row.service,
      title: row.title,
      description: row.description,
      answers: JSON.parse(row.answers_json || '{}'),
      files: files.map(fileRow),
      status: row.status,
      messages: messages.map(messageRow),
      servicePlan: row.service_plan,
      paymentStatus: row.payment_status,
      totalAmount: row.total_amount,
      amountPaid: row.amount_paid,
      projectState: row.project_state,
      razorpayOrderId: row.razorpay_order_id,
      razorpayPaymentId: row.razorpay_payment_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  return {
    client,
    findClientByEmail: async (email) => userRow(await users.findOne({ email, role: 'client' })),
    findUserByEmail: async (email) => userRow(await users.findOne({ email })),
    findTeamById: async (teamId) => userRow(await users.findOne({ team_id: teamId, role: 'team' })),
    findUserById: async (userId) => userRow(await users.findOne({ id: userId })),
    findUserByToken: async (token) => {
      const session = await sessions.findOne({ token })
      if (!session) return null
      return userRow(await users.findOne({ id: session.user_id }))
    },
    insertUser: async (user) => {
      const payload = { ...user, _id: user.id }
      await users.insertOne(payload)
      return userRow(payload)
    },
    createSession: async (userId) => {
      const session = {
        id: id('session'),
        _id: id('session'),
        token: crypto.randomBytes(32).toString('hex'),
        user_id: userId,
        created_at: now(),
      }
      await sessions.insertOne(session)
      return session
    },
    deleteSession: async (token) => {
      await sessions.deleteOne({ token })
    },
    notify: async (userId, projectId, title, message) => {
      const note = {
        id: id('note'),
        _id: id('note'),
        user_id: userId,
        project_id: projectId || null,
        title,
        message,
        read: false,
        created_at: now(),
      }
      await notifications.insertOne(note)
    },
    teamUsers: async () => (await users.find({ role: 'team' }).toArray()).map(userRow),
    teamUsersByCategory: async (category) => {
      const all = (await users.find({ role: 'team' }).toArray()).map(userRow)
      if (!category || category === 'All') return all
      return all.filter((u) => !u.teamCategory || u.teamCategory === category)
    },
    notificationsForUser: async (userId) => (await notifications.find({ user_id: userId }).sort({ created_at: -1 }).toArray()).map(notificationRow),
    markNotificationsRead: async (userId) => {
      await notifications.updateMany({ user_id: userId }, { $set: { read: true } })
    },
    portfolio: async () => (await portfolioItems.find().sort({ sort_order: 1, created_at: -1 }).toArray()).map(portfolioRow),
    portfolioByService: async (service) => (await portfolioItems.find({ service }).sort({ created_at: -1 }).toArray()).map(portfolioRow),
    portfolioById: async (portfolioId) => portfolioRow(await portfolioItems.findOne({ id: portfolioId })),
    createPortfolio: async (item) => {
      const payload = { ...item, _id: item.id }
      await portfolioItems.insertOne(payload)
      return portfolioRow(await portfolioItems.findOne({ id: item.id }))
    },
    updatePortfolio: async (item) => {
      await portfolioItems.updateOne({ id: item.id }, { $set: {
        title: item.title,
        service: item.service,
        description: item.description,
        client: item.client,
        outcome: item.outcome,
        updated_at: item.updatedAt || now(),
      } })
      return portfolioRow(await portfolioItems.findOne({ id: item.id }))
    },
    deletePortfolio: async (portfolioId) => {
      await portfolioItems.deleteOne({ id: portfolioId })
    },
    createPortfolioExtended: async (item) => {
      const payload = portfolioToDb(item)
      payload._id = payload.id
      await portfolioItems.insertOne(payload)
      return portfolioRow(await portfolioItems.findOne({ id: item.id }))
    },
    addPortfolioFull: async (item) => {
      const payload = portfolioToDb(item)
      payload._id = payload.id
      await portfolioItems.insertOne(payload)
      return portfolioRow(await portfolioItems.findOne({ id: item.id }))
    },
    updatePortfolioExtended: async (portfolioId, data) => {
      const set = portfolioToDb(data)
      delete set.id
      delete set._id
      set.updated_at = data.updatedAt || now()
      await portfolioItems.updateOne({ id: portfolioId }, { $set: set })
      return portfolioRow(await portfolioItems.findOne({ id: portfolioId }))
    },
    approvedTestimonials: async () => (await testimonials.find({ approved: true }).sort({ created_at: -1 }).toArray()).map(testimonialRow),
    allTestimonials: async () => (await testimonials.find().sort({ created_at: -1 }).toArray()).map(testimonialRow),
    createTestimonial: async (item) => {
      const payload = { ...item, _id: item.id }
      await testimonials.insertOne(payload)
      return testimonialRow(await testimonials.findOne({ id: item.id }))
    },
    findClientProjectByTitle: async (clientId, title) => {
      const project = await projects.findOne({
        client_id: clientId,
        title: { $regex: `^${escapeRegExp(title.trim())}$`, $options: 'i' },
      })
      return hydrateProject(project)
    },
    approveTestimonial: async (testimonialId) => {
      await testimonials.updateOne({ id: testimonialId }, { $set: { approved: true } })
    },
    deleteTestimonial: async (testimonialId) => {
      await testimonials.deleteOne({ id: testimonialId })
    },
    updateTestimonial: async (testimonialId, data) => {
      const set = {}
      if (data.name !== undefined) set.name = data.name
      if (data.biz !== undefined) set.biz = data.biz
      if (data.quote !== undefined) set.quote = data.quote
      if (data.tag !== undefined) set.tag = data.tag
      if (data.result !== undefined) set.result = data.result
      if (data.photo !== undefined) set.photo = data.photo
      if (data.rating !== undefined) set.rating = data.rating
      set.updated_at = now()
      await testimonials.updateOne({ id: testimonialId }, { $set: set })
      return testimonialRow(await testimonials.findOne({ id: testimonialId }))
    },
    visibleProjects: async (user) => {
      const query = { project_state: 'active' }
      if (user.role === 'team') {
        if (user.teamCategory && user.teamCategory !== 'All') {
          query.service = user.teamCategory
        }
      } else {
        query.client_id = user.id
      }
      const rows = await projects.find(query).sort({ updated_at: -1 }).toArray()
      return Promise.all(rows.map(hydrateProject))
    },
    visibleProject: async (user, projectId) => {
      const row = await projects.findOne({ id: projectId })
      if (!row) return null
      if (user.role !== 'team' && row.client_id !== user.id) return null
      return hydrateProject(row)
    },
    createProject: async (project, files, initialMessage) => {
      const payload = {
        ...project,
        _id: project.id,
        client_id: project.clientId,
        answers_json: project.answersJson,
        service_plan: project.servicePlan,
        payment_status: project.paymentStatus,
        total_amount: project.totalAmount,
        amount_paid: project.amountPaid,
        project_state: project.projectState,
        razorpay_order_id: project.razorpayOrderId,
        razorpay_payment_id: project.razorpayPaymentId,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
      }
      delete payload.clientId
      delete payload.answersJson
      delete payload.servicePlan
      delete payload.paymentStatus
      delete payload.totalAmount
      delete payload.amountPaid
      delete payload.projectState
      delete payload.razorpayOrderId
      delete payload.razorpayPaymentId
      delete payload.createdAt
      delete payload.updatedAt
      await projects.insertOne(payload)
      if (files.length > 0) {
        await projectFiles.insertMany(files.map((file) => ({ ...file, _id: file.id, project_id: file.projectId })))
      }
      await projectMessages.insertOne({ ...initialMessage, _id: initialMessage.id, project_id: initialMessage.projectId })
      return hydrateProject(await projects.findOne({ id: project.id }))
    },
    addMessage: async (projectId, message) => {
      await projectMessages.insertOne({ ...message, _id: message.id, project_id: projectId })
      await projects.updateOne({ id: projectId }, { $set: { updated_at: now() } })
      return hydrateProject(await projects.findOne({ id: projectId }))
    },
    updateProjectStatus: async (projectId, status) => {
      await projects.updateOne({ id: projectId }, { $set: { status, updated_at: now() } })
      return hydrateProject(await projects.findOne({ id: projectId }))
    },
    addProjectFiles: async (projectId, files) => {
      if (files.length > 0) {
        await projectFiles.insertMany(files.map((file) => ({ ...file, _id: file.id, project_id: projectId })))
      }
      await projects.updateOne({ id: projectId }, { $set: { updated_at: now() } })
      return hydrateProject(await projects.findOne({ id: projectId }))
    },
    updateProjectPayment: async (projectId, paymentStatus, amountToAdd, paymentId) => {
      await projects.updateOne(
        { id: projectId },
        { $inc: { amount_paid: amountToAdd }, $set: { payment_status: paymentStatus, razorpay_payment_id: paymentId, updated_at: now() } }
      )
      return hydrateProject(await projects.findOne({ id: projectId }))
    },
    setRazorpayOrderId: async (projectId, orderId) => {
      await projects.updateOne({ id: projectId }, { $set: { razorpay_order_id: orderId, updated_at: now() } })
      return hydrateProject(await projects.findOne({ id: projectId }))
    },
    updateProjectState: async (projectId, state) => {
      if (state === 'stopped' || state === 'finished') {
        await projectFiles.deleteMany({ project_id: projectId })
      }
      await projects.updateOne({ id: projectId }, { $set: { project_state: state, updated_at: now() } })
      return hydrateProject(await projects.findOne({ id: projectId }))
    },
    deleteProject: async (projectId) => {
      await Promise.all([
        projectFiles.deleteMany({ project_id: projectId }),
        projectMessages.deleteMany({ project_id: projectId }),
        projects.deleteOne({ id: projectId }),
      ])
    },
    teamChatMessages: async () => (await teamChatMessages.find().sort({ created_at: 1 }).toArray()).map(teamChatRow),
    addTeamChatMessage: async (msg) => {
      const payload = { ...msg, _id: msg.id }
      await teamChatMessages.insertOne(payload)
      return teamChatRow(await teamChatMessages.findOne({ id: msg.id }))
    },
  }
}

function userRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id || null,
    role: doc.role,
    name: doc.name,
    email: doc.email || null,
    passwordHash: doc.password_hash || doc.passwordHash || null,
    teamId: doc.team_id || doc.teamId || null,
    teamCategory: doc.team_category || doc.teamCategory || null,
    googleId: doc.google_id || doc.googleId || null,
    createdAt: doc.created_at || doc.createdAt || null,
  }
}

function portfolioToDb(item) {
  return {
    id: item.id,
    title: item.title,
    service: item.service,
    description: item.description,
    client: item.client || '',
    outcome: item.outcome || '',
    category: item.category || '',
    media_url: item.mediaUrl || item.media_url || '',
    media_type: item.mediaType || item.media_type || 'image',
    media_name: item.mediaName || item.media_name || '',
    thumbnail: item.thumbnail || '',
    gallery_images: item.galleryImages || item.gallery_images || [],
    video_url: item.videoUrl || item.video_url || '',
    technologies: item.technologies || [],
    completion_date: item.completionDate || item.completion_date || '',
    tags: item.tags || [],
    cta: item.cta || '',
    featured: Boolean(item.featured),
    sort_order: item.sortOrder ?? item.sort_order ?? 0,
    created_by: item.createdBy || item.created_by || null,
    created_at: item.createdAt || item.created_at || now(),
    updated_at: item.updatedAt || item.updated_at || now(),
  }
}

function portfolioRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id,
    title: doc.title,
    service: doc.service,
    description: doc.description,
    client: doc.client || '',
    outcome: doc.outcome || '',
    category: doc.category || '',
    mediaUrl: doc.media_url || doc.mediaUrl || '',
    mediaType: doc.media_type || doc.mediaType || 'image',
    mediaName: doc.media_name || doc.mediaName || '',
    thumbnail: doc.thumbnail || '',
    galleryImages: doc.gallery_images || doc.galleryImages || [],
    videoUrl: doc.video_url || doc.videoUrl || '',
    technologies: doc.technologies || [],
    completionDate: doc.completion_date || doc.completionDate || '',
    tags: doc.tags || [],
    cta: doc.cta || '',
    featured: Boolean(doc.featured),
    sortOrder: doc.sort_order ?? doc.sortOrder ?? 0,
    createdBy: doc.created_by || doc.createdBy || '',
    createdAt: doc.created_at || doc.createdAt || null,
    updatedAt: doc.updated_at || doc.updatedAt || null,
  }
}

function testimonialRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id,
    userId: doc.user_id || doc.userId || null,
    projectId: doc.project_id || doc.projectId || null,
    name: doc.name,
    biz: doc.biz || doc.company || '',
    company: doc.biz || doc.company || '',
    quote: doc.quote || doc.review || '',
    review: doc.quote || doc.review || '',
    tag: doc.tag || '',
    result: doc.result || '',
    rating: doc.rating || 5,
    photo: doc.photo || doc.image || '',
    image: doc.photo || doc.image || '',
    initials: doc.initials || (doc.name ? doc.name.slice(0, 2).toUpperCase() : ''),
    approved: Boolean(doc.approved),
    createdAt: doc.created_at || doc.createdAt || null,
  }
}

function fileRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id,
    projectId: doc.project_id || doc.projectId,
    originalName: doc.original_name || doc.originalName,
    filename: doc.filename,
    size: doc.size,
    mimetype: doc.mimetype,
    url: doc.url,
    uploadedAt: doc.uploaded_at || doc.uploadedAt || null,
  }
}

function messageRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id,
    projectId: doc.project_id || doc.projectId,
    senderId: doc.sender_id || doc.senderId || null,
    senderName: doc.sender_name || doc.senderName,
    senderRole: doc.sender_role || doc.senderRole,
    text: doc.text,
    createdAt: doc.created_at || doc.createdAt || null,
  }
}

function notificationRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id,
    userId: doc.user_id || doc.userId,
    projectId: doc.project_id || doc.projectId || null,
    title: doc.title,
    message: doc.message,
    read: Boolean(doc.read),
    createdAt: doc.created_at || doc.createdAt || null,
  }
}

function teamChatRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id,
    senderId: doc.sender_id || doc.senderId,
    senderName: doc.sender_name || doc.senderName,
    text: doc.text,
    fileUrl: doc.file_url || doc.fileUrl || null,
    fileName: doc.file_name || doc.fileName || null,
    createdAt: doc.created_at || doc.createdAt || null,
  }
}
