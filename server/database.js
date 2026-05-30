import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

const DEFAULT_DB_PATH = path.resolve(process.cwd(), 'data', 'real-media.sqlite')

export function createDatabase(dbPath = process.env.DATABASE_PATH || DEFAULT_DB_PATH) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  migrate(db)
  seedDefaultPortfolio(db)
  return makeRepository(db)
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL CHECK (role IN ('client', 'team')),
      name TEXT NOT NULL,
      email TEXT,
      password_hash TEXT,
      team_id TEXT,
      team_category TEXT,
      google_id TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(email, role),
      UNIQUE(team_id, role)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      service TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      answers_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      service_plan TEXT NOT NULL DEFAULT 'Custom',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      total_amount INTEGER NOT NULL DEFAULT 0,
      amount_paid INTEGER NOT NULL DEFAULT 0,
      project_state TEXT NOT NULL DEFAULT 'active',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT
    );

    CREATE TABLE IF NOT EXISTS project_files (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      filename TEXT NOT NULL,
      size INTEGER NOT NULL,
      mimetype TEXT NOT NULL,
      url TEXT NOT NULL,
      uploaded_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS project_messages (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      sender_id TEXT,
      sender_name TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      project_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS portfolio_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      service TEXT NOT NULL,
      description TEXT NOT NULL,
      client TEXT,
      outcome TEXT,
      media_url TEXT,
      media_type TEXT NOT NULL DEFAULT 'image',
      media_name TEXT,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      biz TEXT,
      quote TEXT NOT NULL,
      tag TEXT,
      result TEXT,
      initials TEXT,
      approved INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
    CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio_items(created_at);
    CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved, created_at);
  `)

  const testimonialCols = db.prepare('PRAGMA table_info(testimonials)').all().map((c) => c.name)
  if (!testimonialCols.includes('project_id')) {
    db.exec('ALTER TABLE testimonials ADD COLUMN project_id TEXT REFERENCES projects(id)')
  }

  const userCols = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name)
  if (!userCols.includes('team_category')) {
    db.exec('ALTER TABLE users ADD COLUMN team_category TEXT')
  }
  if (!userCols.includes('google_id')) {
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT')
  }
}

function seedDefaultPortfolio(db) {
  const count = db.prepare('SELECT COUNT(*) AS count FROM portfolio_items').get().count
  if (count > 0) return

  const createdAt = now()
  const insert = db.prepare(`
    INSERT INTO portfolio_items (
      id, title, service, description, client, outcome, media_url, media_type, media_name, created_by, created_at, updated_at
    ) VALUES (
      @id, @title, @service, @description, @client, @outcome, @mediaUrl, @mediaType, @mediaName, @createdBy, @createdAt, @updatedAt
    )
  `)

  const defaults = [
    {
      id: 'portfolio_batch_2',
      title: 'BATCH 2.0 – Cinematic Cut',
      service: 'Video Editing',
      description: 'Cinematic production with premium transitions and professional color grading.',
      client: 'Real Media',
      outcome: 'Viral reach across multiple platforms.',
      mediaUrl: '/src/assets/BATCH 2.0.mp4',
      mediaType: 'video',
      mediaName: 'BATCH 2.0.mp4',
    },
    {
      id: 'portfolio_game_change',
      title: 'Game Change – Official Music Video',
      service: 'Video Editing',
      description: 'Full music video production with cinematic visuals and professional editing.',
      client: 'Real Media Productions',
      outcome: 'Official release content delivered.',
      mediaUrl: '/src/assets/GAME CHANGE OFFICIAL SONG (MUSIC VIDEO).mp4',
      mediaType: 'video',
      mediaName: 'GAME CHANGE OFFICIAL SONG (MUSIC VIDEO).mp4',
    },
    {
      id: 'portfolio_mine_trailer',
      title: 'Mine – Official Trailer',
      service: 'Video Editing',
      description: 'High-impact trailer cut with dramatic pacing, SFX, and visual storytelling.',
      client: 'Real Media',
      outcome: 'Theatrical trailer quality achieved.',
      mediaUrl: '/src/assets/MINE OFFICIAI TRAILER .mp4',
      mediaType: 'video',
      mediaName: 'MINE OFFICIAI TRAILER .mp4',
    },
  ]

  const seed = db.transaction(() => {
    defaults.forEach((item) => insert.run({
      ...item,
      createdBy: null,
      createdAt,
      updatedAt: createdAt,
    }))
  })
  seed()
}

function makeRepository(db) {
  const statements = {
    userByEmail: db.prepare('SELECT * FROM users WHERE email = ? AND role = ?'),
    userByTeamId: db.prepare('SELECT * FROM users WHERE team_id = ? AND role = ?'),
    userById: db.prepare('SELECT * FROM users WHERE id = ?'),
    sessionByToken: db.prepare(`
      SELECT sessions.*, users.id AS user_id, users.role, users.name, users.email, users.password_hash, users.team_id, users.team_category, users.created_at AS user_created_at
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = ?
    `),
    allTeamUsers: db.prepare("SELECT * FROM users WHERE role = 'team'"),
    insertUser: db.prepare(`
      INSERT INTO users (id, role, name, email, password_hash, team_id, team_category, google_id, created_at)
      VALUES (@id, @role, @name, @email, @passwordHash, @teamId, @teamCategory, @googleId, @createdAt)
    `),
    insertSession: db.prepare('INSERT INTO sessions (id, token, user_id, created_at) VALUES (@id, @token, @userId, @createdAt)'),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token = ?'),
    insertNotification: db.prepare(`
      INSERT INTO notifications (id, user_id, project_id, title, message, read, created_at)
      VALUES (@id, @userId, @projectId, @title, @message, 0, @createdAt)
    `),
    notificationsForUser: db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'),
    markNotificationsRead: db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?'),
    portfolio: db.prepare('SELECT * FROM portfolio_items ORDER BY created_at DESC'),
    portfolioByService: db.prepare('SELECT * FROM portfolio_items WHERE service = ? ORDER BY created_at DESC'),
    portfolioById: db.prepare('SELECT * FROM portfolio_items WHERE id = ?'),
    insertPortfolio: db.prepare(`
      INSERT INTO portfolio_items (
        id, title, service, description, client, outcome, media_url, media_type, media_name, created_by, created_at, updated_at
      ) VALUES (
        @id, @title, @service, @description, @client, @outcome, @mediaUrl, @mediaType, @mediaName, @createdBy, @createdAt, @updatedAt
      )
    `),
    updatePortfolio: db.prepare(`
      UPDATE portfolio_items SET title=@title, service=@service, description=@description, client=@client, outcome=@outcome, updated_at=@updatedAt WHERE id=@id
    `),
    deletePortfolio: db.prepare('DELETE FROM portfolio_items WHERE id = ?'),
    // Testimonials
    approvedTestimonials: db.prepare('SELECT * FROM testimonials WHERE approved = 1 ORDER BY created_at DESC'),
    allTestimonials: db.prepare('SELECT * FROM testimonials ORDER BY created_at DESC'),
    insertTestimonial: db.prepare(`
      INSERT INTO testimonials (id, user_id, project_id, name, biz, quote, tag, result, initials, approved, created_at)
      VALUES (@id, @userId, @projectId, @name, @biz, @quote, @tag, @result, @initials, @approved, @createdAt)
    `),
    clientProjectByTitle: db.prepare(`
      SELECT projects.*, users.name AS client_name
      FROM projects
      JOIN users ON users.id = projects.client_id
      WHERE projects.client_id = ? AND LOWER(projects.title) = LOWER(?)
      LIMIT 1
    `),
    testimonialById: db.prepare('SELECT * FROM testimonials WHERE id = ?'),
    approveTestimonial: db.prepare('UPDATE testimonials SET approved = 1 WHERE id = ?'),
    deleteTestimonial: db.prepare('DELETE FROM testimonials WHERE id = ?'),
    clientProjects: db.prepare(`
      SELECT projects.*, users.name AS client_name
      FROM projects
      JOIN users ON users.id = projects.client_id
      WHERE projects.client_id = ?
      ORDER BY projects.updated_at DESC
    `),
    projectsByService: db.prepare(`
      SELECT projects.*, users.name AS client_name
      FROM projects
      JOIN users ON users.id = projects.client_id
      WHERE projects.service = ?
      ORDER BY projects.updated_at DESC
    `),
    allProjects: db.prepare(`
      SELECT projects.*, users.name AS client_name
      FROM projects
      JOIN users ON users.id = projects.client_id
      ORDER BY projects.updated_at DESC
    `),
    projectById: db.prepare(`
      SELECT projects.*, users.name AS client_name
      FROM projects
      JOIN users ON users.id = projects.client_id
      WHERE projects.id = ?
    `),
    insertProject: db.prepare(`
      INSERT INTO projects (id, client_id, service, title, description, answers_json, status, created_at, updated_at, service_plan, payment_status, total_amount, amount_paid, project_state, razorpay_order_id, razorpay_payment_id)
      VALUES (@id, @clientId, @service, @title, @description, @answersJson, @status, @createdAt, @updatedAt, @servicePlan, @paymentStatus, @totalAmount, @amountPaid, @projectState, @razorpayOrderId, @razorpayPaymentId)
    `),
    insertProjectFile: db.prepare(`
      INSERT INTO project_files (id, project_id, original_name, filename, size, mimetype, url, uploaded_at)
      VALUES (@id, @projectId, @originalName, @filename, @size, @mimetype, @url, @uploadedAt)
    `),
    projectFiles: db.prepare('SELECT * FROM project_files WHERE project_id = ? ORDER BY uploaded_at ASC'),
    insertMessage: db.prepare(`
      INSERT INTO project_messages (id, project_id, sender_id, sender_name, sender_role, text, created_at)
      VALUES (@id, @projectId, @senderId, @senderName, @senderRole, @text, @createdAt)
    `),
    projectMessages: db.prepare('SELECT * FROM project_messages WHERE project_id = ? ORDER BY created_at ASC'),
    updateProjectStatus: db.prepare('UPDATE projects SET status = ?, updated_at = ? WHERE id = ?'),
    touchProject: db.prepare('UPDATE projects SET updated_at = ? WHERE id = ?'),
    updateProjectPayment: db.prepare('UPDATE projects SET payment_status = ?, amount_paid = amount_paid + ?, razorpay_payment_id = ?, updated_at = ? WHERE id = ?'),
    updateProjectState: db.prepare('UPDATE projects SET project_state = ?, updated_at = ? WHERE id = ?'),
    setRazorpayOrderId: db.prepare('UPDATE projects SET razorpay_order_id = ?, updated_at = ? WHERE id = ?'),
    deleteAllProjectFiles: db.prepare('DELETE FROM project_files WHERE project_id = ?'),
  }

  function createSession(userId) {
    const session = {
      id: id('session'),
      token: crypto.randomBytes(32).toString('hex'),
      userId,
      createdAt: now(),
    }
    statements.insertSession.run(session)
    return session
  }

  function notify(userId, projectId, title, message) {
    statements.insertNotification.run({
      id: id('note'),
      userId,
      projectId: projectId || null,
      title,
      message,
      createdAt: now(),
    })
  }

  function hydrateProject(row) {
    if (!row) return null
    return {
      id: row.id,
      clientId: row.client_id,
      clientName: row.client_name,
      service: row.service,
      title: row.title,
      description: row.description,
      answers: JSON.parse(row.answers_json || '{}'),
      files: statements.projectFiles.all(row.id).map(fileRow),
      status: row.status,
      messages: statements.projectMessages.all(row.id).map(messageRow),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  return {
    db,
    // Users
    findClientByEmail: (email) => userRow(statements.userByEmail.get(email, 'client')),
    findTeamById: (teamId) => userRow(statements.userByTeamId.get(teamId, 'team')),
    findUserById: (userId) => userRow(statements.userById.get(userId)),
    findUserByToken: (token) => {
      const row = statements.sessionByToken.get(token)
      if (!row) return null
      return userRow({
        id: row.user_id,
        role: row.role,
        name: row.name,
        email: row.email,
        password_hash: row.password_hash,
        team_id: row.team_id,
        team_category: row.team_category,
        created_at: row.user_created_at,
      })
    },
    insertUser: (user) => {
      statements.insertUser.run(user)
      return user
    },
    createSession,
    deleteSession: (token) => statements.deleteSession.run(token),
    notify,
    teamUsers: () => statements.allTeamUsers.all().map(userRow),
    teamUsersByCategory: (category) => {
      const all = statements.allTeamUsers.all().map(userRow)
      if (!category || category === 'All') return all
      return all.filter(u => !u.teamCategory || u.teamCategory === category)
    },

    // Notifications
    notificationsForUser: (userId) => statements.notificationsForUser.all(userId).map(notificationRow),
    markNotificationsRead: (userId) => statements.markNotificationsRead.run(userId),

    // Portfolio
    portfolio: () => statements.portfolio.all().map(portfolioRow),
    portfolioByService: (service) => statements.portfolioByService.all(service).map(portfolioRow),
    portfolioById: (portfolioId) => portfolioRow(statements.portfolioById.get(portfolioId)),
    createPortfolio: (item) => {
      statements.insertPortfolio.run(item)
      return portfolioRow(statements.portfolioById.get(item.id))
    },
    updatePortfolio: (item) => {
      statements.updatePortfolio.run(item)
      return portfolioRow(statements.portfolioById.get(item.id))
    },
    deletePortfolio: (portfolioId) => statements.deletePortfolio.run(portfolioId),

    // Testimonials
    approvedTestimonials: () => statements.approvedTestimonials.all().map(testimonialRow),
    allTestimonials: () => statements.allTestimonials.all().map(testimonialRow),
    createTestimonial: (item) => {
      statements.insertTestimonial.run(item)
      return testimonialRow(statements.testimonialById.get(item.id))
    },
    findClientProjectByTitle: (clientId, title) => hydrateProject(statements.clientProjectByTitle.get(clientId, title.trim())),
    approveTestimonial: (testimonialId) => statements.approveTestimonial.run(testimonialId),
    deleteTestimonial: (testimonialId) => statements.deleteTestimonial.run(testimonialId),

    // Projects
    visibleProjects: (user) => {
      if (user.role === 'team') {
        // If team member has a category, filter by service
        if (user.teamCategory && user.teamCategory !== 'All') {
          return statements.projectsByService.all(user.teamCategory).map(hydrateProject)
        }
        return statements.allProjects.all().map(hydrateProject)
      }
      return statements.clientProjects.all(user.id).map(hydrateProject)
    },
    visibleProject: (user, projectId) => {
      const project = hydrateProject(statements.projectById.get(projectId))
      if (!project) return null
      if (user.role !== 'team' && project.clientId !== user.id) return null
      return project
    },
    createProject: db.transaction((project, files, initialMessage) => {
      statements.insertProject.run(project)
      files.forEach((file) => statements.insertProjectFile.run(file))
      statements.insertMessage.run(initialMessage)
      return hydrateProject(statements.projectById.get(project.id))
    }),
    addMessage: (projectId, message) => {
      const timestamp = now()
      statements.insertMessage.run({ ...message, projectId })
      statements.touchProject.run(timestamp, projectId)
      return hydrateProject(statements.projectById.get(projectId))
    },
    updateProjectStatus: (projectId, status) => {
      statements.updateProjectStatus.run(status, now(), projectId)
      return hydrateProject(statements.projectById.get(projectId))
    },
    addProjectFiles: (projectId, files) => {
      const addFiles = db.transaction(() => {
        files.forEach((file) => statements.insertProjectFile.run(file))
        statements.touchProject.run(now(), projectId)
      })
      addFiles()
      return hydrateProject(statements.projectById.get(projectId))
    },
    updateProjectPayment: (projectId, paymentStatus, amountToAdd, paymentId) => {
      statements.updateProjectPayment.run(paymentStatus, amountToAdd, paymentId, now(), projectId)
      return hydrateProject(statements.projectById.get(projectId))
    },
    setRazorpayOrderId: (projectId, orderId) => {
      statements.setRazorpayOrderId.run(orderId, now(), projectId)
      return hydrateProject(statements.projectById.get(projectId))
    },
    updateProjectState: (projectId, state) => {
      const t = db.transaction(() => {
        statements.updateProjectState.run(state, now(), projectId)
        if (state === 'stopped' || state === 'finished') {
          statements.deleteAllProjectFiles.run(projectId)
        }
      })
      t()
      return hydrateProject(statements.projectById.get(projectId))
    },
  }
}

export function id(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`
}

export function now() {
  return new Date().toISOString()
}

function userRow(row) {
  if (!row) return null
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    teamId: row.team_id,
    teamCategory: row.team_category || null,
    googleId: row.google_id || null,
    createdAt: row.created_at,
  }
}

function portfolioRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    service: row.service,
    description: row.description,
    client: row.client || '',
    outcome: row.outcome || '',
    mediaUrl: row.media_url || '',
    mediaType: row.media_type,
    mediaName: row.media_name || '',
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function testimonialRow(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id || null,
    projectId: row.project_id || null,
    name: row.name,
    biz: row.biz || '',
    quote: row.quote,
    tag: row.tag || '',
    result: row.result || '',
    initials: row.initials || row.name.slice(0, 2).toUpperCase(),
    approved: Boolean(row.approved),
    createdAt: row.created_at,
  }
}

function fileRow(row) {
  return {
    id: row.id,
    originalName: row.original_name,
    filename: row.filename,
    size: row.size,
    mimetype: row.mimetype,
    url: row.url,
    uploadedAt: row.uploaded_at,
  }
}

function messageRow(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    text: row.text,
    createdAt: row.created_at,
  }
}

function notificationRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id,
    title: row.title,
    message: row.message,
    read: Boolean(row.read),
    createdAt: row.created_at,
  }
}