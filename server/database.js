import crypto from 'node:crypto'
import { MongoClient } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://yashmalik015_db_user:TIHJvglnODWAHuah@cluster0.dqhp8cg.mongodb.net/assetsweber?retryWrites=true&w=majority&appName=Cluster0'
const MONGODB_DB = process.env.MONGODB_DB || 'assetsweber'

export async function createDatabase() {
  let activeUri = MONGODB_URI
  try {
    const testClient = new MongoClient(activeUri, { serverSelectionTimeoutMS: 3000 })
    await testClient.connect()
    await testClient.close()
  } catch (err) {
    console.warn(`Original MongoDB connection failed (${err.message}), falling back to mongodb-memory-server for local dev...`)
    const mongod = await MongoMemoryServer.create()
    activeUri = mongod.getUri()
  }

  const client = new MongoClient(activeUri)
  await client.connect()
  const db = client.db(MONGODB_DB)

  // V1 Collections
  const users = db.collection('users')
  const sessions = db.collection('sessions')
  const projects = db.collection('projects')
  const projectFiles = db.collection('project_files')
  const projectMessages = db.collection('project_messages')
  const notifications = db.collection('notifications')
  const portfolioItems = db.collection('portfolio_items')
  const testimonials = db.collection('testimonials')
  const teamChatMessages = db.collection('team_chat_messages')

  // V2 Collections
  const learnerProfiles = db.collection('learner_profiles')
  const courses = db.collection('courses')
  const teachers = db.collection('teachers')
  const comments = db.collection('comments')
  const subscriptions = db.collection('subscriptions')
  const mentorshipPackages = db.collection('mentorship_packages')
  const mentorshipBookings = db.collection('mentorship_bookings')
  const inquiries = db.collection('inquiries')
  const siteSettings = db.collection('site_settings')
  const learnerProjects = db.collection('learner_projects')
  const learningProgress = db.collection('learning_progress')
  const lessonLikes = db.collection('lesson_likes')

  // New Pricing Collection
  const pricing = db.collection('pricing')

  // New Media & Activities Collections
  const media = db.collection('media')
  const activities = db.collection('activities')

  // Automatic migration for outdated team_id_1_role_1 index & data backfill
  try {
    const existingIndexes = await users.indexes()
    const teamIdx = existingIndexes.find((i) => i.name === 'team_id_1_role_1')
    if (teamIdx && (!teamIdx.partialFilterExpression || teamIdx.sparse)) {
      console.log('[MongoDB Migration] Dropping outdated sparse index team_id_1_role_1...')
      await users.dropIndex('team_id_1_role_1')
      console.log('[MongoDB Migration] Outdated index dropped.')
    }
  } catch (_err) {
    // Ignore if collection doesn't exist yet
  }

  try {
    await users.updateMany(
      { teamId: { $exists: true, $ne: null }, $or: [{ team_id: { $exists: false } }, { team_id: null }] },
      [{ $set: { team_id: '$teamId' } }]
    )
  } catch (_err) {
    // Ignore if update fails
  }

  await Promise.all([
    // V1 Indexes
    users.createIndex({ email: 1, role: 1 }, { unique: true, sparse: true }),
    users.createIndex({ team_id: 1, role: 1 }, { unique: true, partialFilterExpression: { team_id: { $type: 'string' } } }),
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

    // V2 Indexes
    learnerProfiles.createIndex({ user_id: 1 }, { unique: true }),
    courses.createIndex({ published: 1, created_at: -1 }),
    courses.createIndex({ category: 1 }),
    teachers.createIndex({ user_id: 1 }, { unique: true, sparse: true }),
    comments.createIndex({ lesson_id: 1, created_at: -1 }),
    subscriptions.createIndex({ learner_id: 1, teacher_id: 1 }, { unique: true }),
    mentorshipPackages.createIndex({ teacher_id: 1 }),
    mentorshipBookings.createIndex({ teacher_id: 1, created_at: -1 }),
    inquiries.createIndex({ status: 1, created_at: -1 }),
    learnerProjects.createIndex({ user_id: 1 }),
    learningProgress.createIndex({ user_id: 1, course_id: 1 }, { unique: true }),
    lessonLikes.createIndex({ user_id: 1, lesson_id: 1 }, { unique: true }),

    // Pricing Index
    pricing.createIndex({ category: 1 }),
  ])

  await seedDefaultSettings(siteSettings)

  const repo = makeRepository(client, {
    users,
    sessions,
    projects,
    projectFiles,
    projectMessages,
    notifications,
    portfolioItems,
    testimonials,
    teamChatMessages,
    learnerProfiles,
    courses,
    teachers,
    comments,
    subscriptions,
    mentorshipPackages,
    mentorshipBookings,
    inquiries,
    siteSettings,
    learnerProjects,
    learningProgress,
    lessonLikes,
    pricing,
  })

  return {
    ...repo,
    v2: repo,
    db,
    bucket: null,
  }
}

export function id(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`
}

export function now() {
  return new Date().toISOString()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

async function seedDefaultSettings(siteSettings) {
  const existing = await siteSettings.findOne({ id: 'default' })
  if (existing) return
  await siteSettings.insertOne({
    id: 'default',
    _id: 'default',
    whatsapp_number: '+919416085060',
    booking_url: 'https://calendly.com/',
    contact_email: 'assetwebermail@gmail.com',
    updated_at: now(),
  })
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
    learnerProfiles,
    courses,
    teachers,
    comments,
    subscriptions,
    mentorshipPackages,
    mentorshipBookings,
    inquiries,
    siteSettings,
    learnerProjects,
    learningProgress,
    lessonLikes,
    pricing,
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

    // ── Users & Authentication ──
    findClientByEmail: async (email) => userRow(await users.findOne({ email: email.trim().toLowerCase(), role: 'client' })),
    findUserByEmail: async (email) => userRow(await users.findOne({ email: email.trim().toLowerCase() })),
    findTeamById: async (teamId) => {
      const doc = await users.findOne({
        role: 'team',
        $or: [{ team_id: teamId }, { teamId: teamId }],
      })
      return userRow(doc)
    },
    findTeamUser: async (teamId) => {
      const doc = await users.findOne({
        role: 'team',
        $or: [
          { team_id: teamId },
          { teamId: teamId },
          { email: 'team@assetsweber.internal' },
        ],
      })
      return userRow(doc)
    },
    findUserById: async (userId) => userRow(await users.findOne({ id: userId })),
    findUserByToken: async (token) => {
      const session = await sessions.findOne({ token })
      if (!session) return null
      return userRow(await users.findOne({ id: session.user_id }))
    },
    insertUser: async (user) => {
      const email = user.email ? user.email.trim().toLowerCase() : null
      const payload = {
        ...user,
        _id: user.id,
        email,
        team_id: user.teamId ?? user.team_id ?? null,
        team_category: user.teamCategory ?? user.team_category ?? null,
        password_hash: user.passwordHash ?? user.password_hash ?? null,
        google_id: user.googleId ?? user.google_id ?? null,
        created_at: user.createdAt ?? user.created_at ?? now(),
      }
      await users.insertOne(payload)
      return userRow(payload)
    },
    updateUserGoogle: async (userId, googleId, avatar) => {
      const set = { google_id: googleId }
      if (avatar) set.avatar = avatar
      await users.updateOne({ id: userId }, { $set: set })
      return userRow(await users.findOne({ id: userId }))
    },
    ensureTeamUser: async (defaults) => {
      const teamId = defaults.teamId ?? defaults.team_id
      const email = defaults.email?.trim().toLowerCase()
      const teamQuery = {
        role: 'team',
        $or: [
          ...(teamId ? [{ team_id: teamId }, { teamId: teamId }] : []),
          ...(email ? [{ email }] : []),
        ],
      }
      let existing = await users.findOne(teamQuery)
      if (existing) return userRow(existing)
      try {
        const payload = {
          ...defaults,
          _id: defaults.id,
          email,
          team_id: teamId ?? null,
          team_category: defaults.teamCategory ?? defaults.team_category ?? null,
          password_hash: defaults.passwordHash ?? defaults.password_hash ?? null,
          google_id: defaults.googleId ?? defaults.google_id ?? null,
          created_at: defaults.createdAt ?? defaults.created_at ?? now(),
        }
        await users.insertOne(payload)
        return userRow(payload)
      } catch (err) {
        if (err.code !== 11000) throw err
        existing = await users.findOne(teamQuery)
        if (existing) return userRow(existing)
        throw err
      }
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

    // ── V1 Portfolio ──
    // One public source ordered by publication time, newest first.
    portfolio: async () => (await portfolioItems.find().sort({ created_at: -1 }).toArray()).map(portfolioRow),
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

    // ── V2 Portfolio Consolidation ──
    addPortfolioFull: async (item) => {
      const payload = portfolioToDb(item)
      payload._id = payload.id
      await portfolioItems.insertOne(payload)
      return portfolioRow(await portfolioItems.findOne({ id: item.id }))
    },
    createPortfolioFull: async (item) => {
      const payload = portfolioToDb(item)
      payload._id = payload.id
      await portfolioItems.insertOne(payload)
      return portfolioRow(await portfolioItems.findOne({ id: item.id }))
    },
    updatePortfolioFull: async (portfolioId, data) => {
      const set = portfolioToDb(data)
      delete set.id
      delete set._id
      set.updated_at = data.updatedAt || now()
      await portfolioItems.updateOne({ id: portfolioId }, { $set: set })
      return portfolioRow(await portfolioItems.findOne({ id: portfolioId }))
    },
    deletePortfolioFull: async (portfolioId) => {
      await portfolioItems.deleteOne({ id: portfolioId })
    },
    createPortfolioExtended: async (item) => {
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

    // ── Testimonials ──
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

    // ── Projects ──
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

    // ── Team Chat ──
    teamChatMessages: async () => (await teamChatMessages.find().sort({ created_at: 1 }).toArray()).map(teamChatRow),
    addTeamChatMessage: async (msg) => {
      const payload = { ...msg, _id: msg.id }
      await teamChatMessages.insertOne(payload)
      return teamChatRow(await teamChatMessages.findOne({ id: msg.id }))
    },

    // ── Settings (V2) ──
    getSettings: async () => {
      const doc = await siteSettings.findOne({ id: 'default' })
      return settingsRow(doc)
    },
    updateSettings: async (data) => {
      const payload = {
        whatsapp_number: data.whatsappNumber || data.whatsapp_number,
        booking_url: data.bookingUrl || data.booking_url,
        contact_email: data.contactEmail || data.contact_email,
        updated_at: now(),
      }
      await siteSettings.updateOne({ id: 'default' }, { $set: payload }, { upsert: true })
      return settingsRow(await siteSettings.findOne({ id: 'default' }))
    },

    // ── Learner Profiles (V2) ──
    getLearnerProfile: async (userId) => profileRow(await learnerProfiles.findOne({ user_id: userId })),
    upsertLearnerProfile: async (userId, data) => {
      const existing = await learnerProfiles.findOne({ user_id: userId })
      const payload = {
        user_id: userId,
        photo: data.photo ?? existing?.photo ?? '',
        bio: data.bio ?? existing?.bio ?? '',
        skills: data.skills ?? existing?.skills ?? [],
        github: data.github ?? existing?.github ?? '',
        linkedin: data.linkedin ?? existing?.linkedin ?? '',
        portfolio_link: data.portfolioLink ?? data.portfolio_link ?? existing?.portfolio_link ?? '',
        resume_url: data.resumeUrl ?? data.resume_url ?? existing?.resume_url ?? '',
        updated_at: now(),
      }
      if (existing) {
        await learnerProfiles.updateOne({ user_id: userId }, { $set: payload })
      } else {
        await learnerProfiles.insertOne({ id: id('profile'), _id: id('profile'), ...payload, created_at: now() })
      }
      return profileRow(await learnerProfiles.findOne({ user_id: userId }))
    },

    // ── Learner Projects (V2) ──
    learnerProjects: async (userId) =>
      (await learnerProjects.find({ user_id: userId }).sort({ created_at: -1 }).toArray()).map(learnerProjectRow),
    createLearnerProject: async (userId, data) => {
      const item = {
        id: id('lproj'),
        _id: id('lproj'),
        user_id: userId,
        title: data.title?.trim() || '',
        description: data.description?.trim() || '',
        link: data.link?.trim() || '',
        image_url: data.imageUrl || data.image_url || '',
        technologies: data.technologies || [],
        created_at: now(),
      }
      await learnerProjects.insertOne(item)
      return learnerProjectRow(item)
    },
    deleteLearnerProject: async (userId, projectId) => {
      await learnerProjects.deleteOne({ id: projectId, user_id: userId })
    },

    // ── Learning Progress (V2) ──
    getProgress: async (userId) =>
      (await learningProgress.find({ user_id: userId }).toArray()).map(progressRow),
    updateProgress: async (userId, courseId, lessonId) => {
      const existing = await learningProgress.findOne({ user_id: userId, course_id: courseId })
      const completed = existing ? [...new Set([...(existing.completed_lessons || []), lessonId])] : [lessonId]
      const lastLesson = lessonId
      const payload = {
        user_id: userId,
        course_id: courseId,
        completed_lessons: completed,
        last_lesson_id: lastLesson,
        updated_at: now(),
      }
      if (existing) {
        await learningProgress.updateOne({ user_id: userId, course_id: courseId }, { $set: payload })
      } else {
        await learningProgress.insertOne({ id: id('prog'), _id: id('prog'), ...payload, created_at: now() })
      }
      return progressRow(await learningProgress.findOne({ user_id: userId, course_id: courseId }))
    },

    // ── Courses (V2 & Required Names) ──
    getCourses: async (query = {}) => {
      return (await courses.find(query).sort({ sort_order: 1, created_at: -1 }).toArray()).map(courseRow)
    },
    publishedCourses: async () =>
      (await courses.find({ published: true }).sort({ sort_order: 1, created_at: -1 }).toArray()).map(courseRow),
    allCourses: async () =>
      (await courses.find().sort({ sort_order: 1, created_at: -1 }).toArray()).map(courseRow),
    courseById: async (courseId) => courseRow(await courses.findOne({ id: courseId })),
    createCourse: async (data, userId) => {
      const item = {
        id: id('course'),
        _id: id('course'),
        title: data.title?.trim() || '',
        category: data.category?.trim() || 'General',
        description: data.description?.trim() || '',
        tags: data.tags || [],
        thumbnail: data.thumbnail || '',
        banner: data.banner || '',
        teacher_id: data.teacherId || data.teacher_id || userId,
        teacher_name: data.teacherName || data.teacher_name || '',
        published: Boolean(data.published),
        views: 0,
        modules: data.modules || [],
        sort_order: data.sortOrder ?? data.sort_order ?? Date.now(),
        created_at: now(),
        updated_at: now(),
      }
      await courses.insertOne(item)
      return courseRow(item)
    },
    updateCourse: async (courseId, data) => {
      const existing = await courses.findOne({ id: courseId })
      if (!existing) return null
      const payload = {
        title: data.title ?? existing.title,
        category: data.category ?? existing.category,
        description: data.description ?? existing.description,
        tags: data.tags ?? existing.tags,
        thumbnail: data.thumbnail ?? existing.thumbnail,
        banner: data.banner ?? existing.banner,
        teacher_id: data.teacherId ?? data.teacher_id ?? existing.teacher_id,
        teacher_name: data.teacherName ?? data.teacher_name ?? existing.teacher_name,
        published: data.published !== undefined ? Boolean(data.published) : existing.published,
        modules: data.modules ?? existing.modules,
        sort_order: data.sortOrder ?? data.sort_order ?? existing.sort_order,
        updated_at: now(),
      }
      await courses.updateOne({ id: courseId }, { $set: payload })
      return courseRow(await courses.findOne({ id: courseId }))
    },
    deleteCourse: async (courseId) => {
      await courses.deleteOne({ id: courseId })
    },
    incrementCourseViews: async (courseId) => {
      await courses.updateOne({ id: courseId }, { $inc: { views: 1 } })
    },
    searchCourses: async (query) => {
      const q = query.trim().toLowerCase()
      if (!q) return (await courses.find({ published: true }).sort({ created_at: -1 }).toArray()).map(courseRow)
      const all = await courses.find({ published: true }).toArray()
      const scored = all.map((c) => {
        let score = 0
        const title = (c.title || '').toLowerCase()
        const desc = (c.description || '').toLowerCase()
        const cat = (c.category || '').toLowerCase()
        const teacher = (c.teacher_name || '').toLowerCase()
        const tags = (c.tags || []).join(' ').toLowerCase()
        const moduleText = (c.modules || [])
          .flatMap((m) => [m.title, ...(m.lessons || []).map((l) => l.title)])
          .join(' ')
          .toLowerCase()
        if (title === q) score += 100
        else if (title.startsWith(q)) score += 80
        else if (title.includes(q)) score += 60
        if (teacher.includes(q)) score += 40
        if (cat.includes(q)) score += 35
        if (tags.includes(q)) score += 30
        if (desc.includes(q)) score += 20
        if (moduleText.includes(q)) score += 15
        return { c, score }
      })
      return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).map((s) => courseRow(s.c))
    },

    // ── Teachers (V2) ──
    allTeachers: async () => (await teachers.find().sort({ created_at: -1 }).toArray()).map(teacherRow),
    teacherById: async (teacherId) => teacherRow(await teachers.findOne({ id: teacherId })),
    teacherByUserId: async (userId) => teacherRow(await teachers.findOne({ user_id: userId })),
    upsertTeacher: async (data) => {
      const existing = data.userId ? await teachers.findOne({ user_id: data.userId }) : null
      const payload = {
        user_id: data.userId || data.user_id || existing?.user_id || null,
        name: data.name?.trim() || existing?.name || '',
        photo: data.photo ?? existing?.photo ?? '',
        bio: data.bio ?? existing?.bio ?? '',
        skills: data.skills ?? existing?.skills ?? [],
        experience: data.experience ?? existing?.experience ?? '',
        social_links: data.socialLinks ?? data.social_links ?? existing?.social_links ?? {},
        updated_at: now(),
      }
      if (existing) {
        await teachers.updateOne({ id: existing.id }, { $set: payload })
        return teacherRow(await teachers.findOne({ id: existing.id }))
      }
      const item = { id: id('teacher'), _id: id('teacher'), ...payload, subscribers: 0, created_at: now() }
      await teachers.insertOne(item)
      return teacherRow(item)
    },

    // ── Subscriptions (V2) ──
    isSubscribed: async (learnerId, teacherId) => {
      const sub = await subscriptions.findOne({ learner_id: learnerId, teacher_id: teacherId })
      return Boolean(sub)
    },
    subscribe: async (learnerId, teacherId) => {
      const existing = await subscriptions.findOne({ learner_id: learnerId, teacher_id: teacherId })
      if (existing) return { subscribed: true }
      await subscriptions.insertOne({
        id: id('sub'),
        _id: id('sub'),
        learner_id: learnerId,
        teacher_id: teacherId,
        created_at: now(),
      })
      await teachers.updateOne({ id: teacherId }, { $inc: { subscribers: 1 } })
      return { subscribed: true }
    },
    unsubscribe: async (learnerId, teacherId) => {
      const result = await subscriptions.deleteOne({ learner_id: learnerId, teacher_id: teacherId })
      if (result.deletedCount) await teachers.updateOne({ id: teacherId }, { $inc: { subscribers: -1 } })
      return { subscribed: false }
    },
    subscriberCount: async (teacherId) => {
      const t = await teachers.findOne({ id: teacherId })
      return t?.subscribers || 0
    },

    // ── Comments (V2) ──
    commentsForLesson: async (lessonId) =>
      (await comments.find({ lesson_id: lessonId, parent_id: null }).sort({ created_at: -1 }).toArray()).map((c) =>
        commentRow(c),
      ),
    commentReplies: async (parentId) =>
      (await comments.find({ parent_id: parentId }).sort({ created_at: 1 }).toArray()).map(commentRow),
    createComment: async (data) => {
      const item = {
        id: id('comment'),
        _id: id('comment'),
        lesson_id: data.lessonId,
        course_id: data.courseId,
        user_id: data.userId,
        user_name: data.userName,
        text: data.text?.trim() || '',
        parent_id: data.parentId || null,
        likes: 0,
        liked_by: [],
        created_at: now(),
      }
      await comments.insertOne(item)
      return commentRow(item)
    },
    deleteComment: async (commentId, userId) => {
      const c = await comments.findOne({ id: commentId })
      if (!c || c.user_id !== userId) return false
      await comments.deleteMany({ $or: [{ id: commentId }, { parent_id: commentId }] })
      return true
    },
    likeComment: async (commentId, userId) => {
      const c = await comments.findOne({ id: commentId })
      if (!c) return null
      const liked = (c.liked_by || []).includes(userId)
      if (liked) {
        await comments.updateOne(
          { id: commentId },
          { $pull: { liked_by: userId }, $inc: { likes: -1 } },
        )
      } else {
        await comments.updateOne(
          { id: commentId },
          { $addToSet: { liked_by: userId }, $inc: { likes: 1 } },
        )
      }
      return commentRow(await comments.findOne({ id: commentId }))
    },

    // ── Lesson Likes (V2) ──
    toggleLessonLike: async (userId, lessonId) => {
      const existing = await lessonLikes.findOne({ user_id: userId, lesson_id: lessonId })
      if (existing) {
        await lessonLikes.deleteOne({ user_id: userId, lesson_id: lessonId })
        return { liked: false }
      }
      await lessonLikes.insertOne({ id: id('like'), _id: id('like'), user_id: userId, lesson_id: lessonId, created_at: now() })
      return { liked: true }
    },
    isLessonLiked: async (userId, lessonId) => Boolean(await lessonLikes.findOne({ user_id: userId, lesson_id: lessonId })),

    // ── Mentorship (V2) ──
    mentorshipPackages: async (teacherId) =>
      (await mentorshipPackages.find({ teacher_id: teacherId }).sort({ price: 1 }).toArray()).map(mentorshipPackageRow),
    createMentorshipPackage: async (teacherId, data) => {
      const item = {
        id: id('mpkg'),
        _id: id('mpkg'),
        teacher_id: teacherId,
        title: data.title?.trim() || '',
        duration: data.duration?.trim() || '',
        price: Number(data.price) || 0,
        description: data.description?.trim() || '',
        features: data.features || [],
        created_at: now(),
      }
      await mentorshipPackages.insertOne(item)
      return mentorshipPackageRow(item)
    },
    deleteMentorshipPackage: async (packageId, teacherId) => {
      await mentorshipPackages.deleteOne({ id: packageId, teacher_id: teacherId })
    },
    createMentorshipBooking: async (data) => {
      const item = {
        id: id('book'),
        _id: id('book'),
        package_id: data.packageId,
        teacher_id: data.teacherId,
        learner_id: data.learnerId,
        learner_name: data.learnerName,
        learner_email: data.learnerEmail,
        message: data.message?.trim() || '',
        status: 'pending',
        payment_status: data.paymentStatus || 'pending',
        created_at: now(),
      }
      await mentorshipBookings.insertOne(item)
      return mentorshipBookingRow(item)
    },
    mentorshipBookingsForTeacher: async (teacherId) =>
      (await mentorshipBookings.find({ teacher_id: teacherId }).sort({ created_at: -1 }).toArray()).map(mentorshipBookingRow),

    // ── Inquiries (V2) ──
    allInquiries: async () => (await inquiries.find().sort({ created_at: -1 }).toArray()).map(inquiryRow),
    createInquiry: async (data) => {
      const item = {
        id: id('inq'),
        _id: id('inq'),
        name: data.name?.trim() || '',
        email: data.email?.trim() || '',
        phone: data.phone?.trim() || '',
        company: data.company?.trim() || '',
        service: data.service?.trim() || '',
        budget: data.budget?.trim() || '',
        description: data.description?.trim() || '',
        status: 'New',
        created_at: now(),
      }
      await inquiries.insertOne(item)
      return inquiryRow(item)
    },
    updateInquiryStatus: async (inquiryId, status) => {
      await inquiries.updateOne({ id: inquiryId }, { $set: { status, updated_at: now() } })
      return inquiryRow(await inquiries.findOne({ id: inquiryId }))
    },
    deleteInquiry: async (inquiryId) => {
      await inquiries.deleteOne({ id: inquiryId })
    },

    // ── Pricing CRUD ──
    getPricing: async (query = {}) => {
      return (await pricing.find(query).toArray()).map(pricingRow)
    },
    createPricing: async (data) => {
      const item = {
        id: id('price'),
        _id: id('price'),
        category: data.category || '',
        name: data.name || '',
        plan: data.plan || '',
        price: data.price || '',
        period: data.period || null,
        badge: data.badge || null,
        desc: data.desc || '',
        features: data.features || [],
        cta: data.cta || '',
        best: data.best || null,
        starting: Boolean(data.starting),
        created_at: now(),
        updated_at: now(),
      }
      await pricing.insertOne(item)
      return pricingRow(item)
    },
    updatePricing: async (pricingId, data) => {
      const existing = await pricing.findOne({ id: pricingId })
      if (!existing) return null
      const payload = {
        category: data.category ?? existing.category,
        name: data.name ?? existing.name,
        plan: data.plan ?? existing.plan,
        price: data.price ?? existing.price,
        period: data.period !== undefined ? data.period : existing.period,
        badge: data.badge !== undefined ? data.badge : existing.badge,
        desc: data.desc ?? existing.desc,
        features: data.features ?? existing.features,
        cta: data.cta ?? existing.cta,
        best: data.best !== undefined ? data.best : existing.best,
        starting: data.starting !== undefined ? Boolean(data.starting) : existing.starting,
        updated_at: now(),
      }
      await pricing.updateOne({ id: pricingId }, { $set: payload })
      return pricingRow(await pricing.findOne({ id: pricingId }))
    },
    deletePricing: async (pricingId) => {
      await pricing.deleteOne({ id: pricingId })
      return true
    },

    // ── Media Library ──
    getMedia: async () => {
      return (await media.find({}).sort({ created_at: -1 }).toArray()).map(m => ({
        id: m.id || m._id,
        name: m.name,
        url: m.url,
        type: m.type || 'image',
        size: m.size || '0 KB',
        folder: m.folder || 'General',
        usedBy: m.used_by || 'Unassigned',
        createdAt: m.created_at
      }))
    },
    createMedia: async (data) => {
      const item = {
        id: id('med'),
        _id: id('med'),
        name: data.name,
        url: data.url,
        type: data.type || 'image',
        size: data.size || '0 KB',
        folder: data.folder || 'General',
        used_by: data.usedBy || 'General',
        created_at: now()
      }
      await media.insertOne(item)
      return item
    },
    deleteMedia: async (mediaId) => {
      await media.deleteOne({ id: mediaId })
      return true
    },

    // ── Activity Log ──
    getActivities: async () => {
      return await activities.find({}).sort({ created_at: -1 }).limit(20).toArray()
    },
    logActivity: async (action, details) => {
      const item = {
        id: id('act'),
        _id: id('act'),
        action,
        details,
        created_at: now()
      }
      await activities.insertOne(item)
      return item
    },

    // ── Global Search ──
    globalSearch: async (queryStr) => {
      if (!queryStr || !queryStr.trim()) return []
      const regex = new RegExp(queryStr.trim(), 'i')
      const [ports, crs, tests, inqs] = await Promise.all([
        portfolioItems.find({ $or: [{ title: regex }, { service: regex }, { client: regex }, { description: regex }] }).limit(5).toArray(),
        courses.find({ $or: [{ title: regex }, { category: regex }, { description: regex }] }).limit(5).toArray(),
        testimonials.find({ $or: [{ name: regex }, { biz: regex }, { quote: regex }] }).limit(5).toArray(),
        inquiries.find({ $or: [{ name: regex }, { company: regex }, { service: regex }, { email: regex }] }).limit(5).toArray()
      ])
      return [
        ...ports.map(p => ({ type: 'Portfolio', id: p.id, title: p.title, subtitle: p.service })),
        ...crs.map(c => ({ type: 'Course', id: c.id, title: c.title, subtitle: c.category })),
        ...tests.map(t => ({ type: 'Testimonial', id: t.id, title: t.name, subtitle: t.biz || t.company })),
        ...inqs.map(i => ({ type: 'Request', id: i.id, title: i.name, subtitle: `${i.service} - ${i.company}` }))
      ]
    },

    // ── Bulk Actions ──
    bulkDelete: async (colName, idsArr) => {
      if (!Array.isArray(idsArr) || idsArr.length === 0) return true
      if (colName === 'portfolio') await portfolioItems.deleteMany({ id: { $in: idsArr } })
      else if (colName === 'courses') await courses.deleteMany({ id: { $in: idsArr } })
      else if (colName === 'testimonials') await testimonials.deleteMany({ id: { $in: idsArr } })
      else if (colName === 'inquiries') await inquiries.deleteMany({ id: { $in: idsArr } })
      else if (colName === 'media') await media.deleteMany({ id: { $in: idsArr } })
      return true
    },
    bulkPublish: async (colName, idsArr, published) => {
      if (!Array.isArray(idsArr) || idsArr.length === 0) return true
      if (colName === 'courses') await courses.updateMany({ id: { $in: idsArr } }, { $set: { published: Boolean(published), updated_at: now() } })
      return true
    }
  }
}

// ── Model Row Converters & Mappers ──

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
    media_public_id: item.mediaPublicId || item.media_public_id || item.publicId || item.public_id || '',
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
    mediaPublicId: doc.media_public_id || doc.mediaPublicId || doc.public_id || '',
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

function settingsRow(doc) {
  if (!doc) return { whatsappNumber: '+919416085060', bookingUrl: 'https://calendly.com/', contactEmail: 'assetwebermail@gmail.com' }
  return {
    whatsappNumber: doc.whatsapp_number || doc.whatsappNumber || '',
    bookingUrl: doc.booking_url || doc.bookingUrl || '',
    contactEmail: doc.contact_email || doc.contactEmail || '',
  }
}

function profileRow(doc) {
  if (!doc) return null
  return {
    userId: doc.user_id,
    photo: doc.photo || '',
    bio: doc.bio || '',
    skills: doc.skills || [],
    github: doc.github || '',
    linkedin: doc.linkedin || '',
    portfolioLink: doc.portfolio_link || '',
    resumeUrl: doc.resume_url || '',
  }
}

function learnerProjectRow(doc) {
  if (!doc) return null
  return {
    id: doc.id,
    title: doc.title,
    description: doc.description,
    link: doc.link,
    imageUrl: doc.image_url || '',
    technologies: doc.technologies || [],
    createdAt: doc.created_at,
  }
}

function progressRow(doc) {
  if (!doc) return null
  return {
    courseId: doc.course_id,
    completedLessons: doc.completed_lessons || [],
    lastLessonId: doc.last_lesson_id || null,
    updatedAt: doc.updated_at,
  }
}

function courseRow(doc) {
  if (!doc) return null
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    description: doc.description,
    tags: doc.tags || [],
    thumbnail: doc.thumbnail || '',
    banner: doc.banner || '',
    teacherId: doc.teacher_id || '',
    teacherName: doc.teacher_name || '',
    published: Boolean(doc.published),
    views: doc.views || 0,
    modules: (doc.modules || []).map((m) => ({
      id: m.id,
      title: m.title,
      lessons: (m.lessons || []).map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description || '',
        videoUrl: l.video_url || l.videoUrl || '',
        thumbnail: l.thumbnail || '',
        duration: l.duration || '',
        driveLink: l.drive_link || l.driveLink || '',
        resources: l.resources || '',
        notes: l.notes || '',
        tags: l.tags || [],
        views: l.views || 0,
        uploadedAt: l.uploaded_at || l.uploadedAt || '',
      })),
    })),
    sortOrder: doc.sort_order ?? 0,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at,
  }
}

function courseToDb(data) {
  return {
    ...data,
    modules: (data.modules || []).map((m) => ({
      id: m.id,
      title: m.title,
      lessons: (m.lessons || []).map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description || '',
        video_url: l.videoUrl || l.video_url || '',
        thumbnail: l.thumbnail || '',
        duration: l.duration || '',
        drive_link: l.driveLink || l.drive_link || '',
        resources: l.resources || '',
        notes: l.notes || '',
        tags: l.tags || [],
        views: l.views || 0,
        uploaded_at: l.uploadedAt || l.uploaded_at || now(),
      })),
    })),
  }
}

export { courseToDb }

function teacherRow(doc) {
  if (!doc) return null
  return {
    id: doc.id,
    userId: doc.user_id || null,
    name: doc.name,
    photo: doc.photo || '',
    bio: doc.bio || '',
    skills: doc.skills || [],
    experience: doc.experience || '',
    socialLinks: doc.social_links || {},
    subscribers: doc.subscribers || 0,
    createdAt: doc.created_at,
  }
}

function commentRow(doc) {
  if (!doc) return null
  return {
    id: doc.id,
    lessonId: doc.lesson_id,
    courseId: doc.course_id,
    userId: doc.user_id,
    userName: doc.user_name,
    text: doc.text,
    parentId: doc.parent_id,
    likes: doc.likes || 0,
    likedBy: doc.liked_by || [],
    createdAt: doc.created_at,
  }
}

function mentorshipPackageRow(doc) {
  if (!doc) return null
  return {
    id: doc.id,
    teacherId: doc.teacher_id,
    title: doc.title,
    duration: doc.duration,
    price: doc.price,
    description: doc.description,
    features: doc.features || [],
  }
}

function mentorshipBookingRow(doc) {
  if (!doc) return null
  return {
    id: doc.id,
    packageId: doc.package_id,
    teacherId: doc.teacher_id,
    learnerId: doc.learner_id,
    learnerName: doc.learner_name,
    learnerEmail: doc.learner_email,
    message: doc.message,
    status: doc.status,
    paymentStatus: doc.payment_status,
    createdAt: doc.created_at,
  }
}

function inquiryRow(doc) {
  if (!doc) return null
  return {
    id: doc.id,
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    company: doc.company,
    service: doc.service,
    budget: doc.budget,
    description: doc.description,
    status: doc.status,
    createdAt: doc.created_at,
  }
}

function pricingRow(doc) {
  if (!doc) return null
  return {
    id: doc.id || doc._id,
    category: doc.category || '',
    name: doc.name || '',
    plan: doc.plan || '',
    price: doc.price || '',
    period: doc.period || null,
    badge: doc.badge || null,
    desc: doc.desc || '',
    features: doc.features || [],
    cta: doc.cta || '',
    best: doc.best || null,
    starting: Boolean(doc.starting),
    createdAt: doc.created_at || null,
    updatedAt: doc.updated_at || null,
  }
}
