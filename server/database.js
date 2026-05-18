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
      updated_at TEXT NOT NULL
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

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
    CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
    CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio_items(created_at);
  `)
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
      id: 'portfolio_brand_identity',
      title: 'Premium Brand Identity',
      service: 'Branding',
      description: 'Visual branding and creative direction for a polished business presence.',
      client: 'Real Media Studio',
      outcome: 'Built a sharper launch identity and campaign-ready visuals.',
    },
    {
      id: 'portfolio_campaign_design',
      title: 'Creative Campaign Design',
      service: 'Marketing',
      description: 'Content visuals built for social media, ads, and brand recognition.',
      client: 'Growth Campaign',
      outcome: 'Created scroll-stopping campaign assets for multi-platform rollout.',
    },
    {
      id: 'portfolio_real_media_branding',
      title: 'Real Media Branding',
      service: 'Creative Direction',
      description: 'Logo system, digital brand presentation, and premium visual tone.',
      client: 'Real Media',
      outcome: 'A strong red-black brand system designed for global digital work.',
    },
  ]

  const seed = db.transaction(() => {
    defaults.forEach((item) => insert.run({
      ...item,
      mediaUrl: '',
      mediaType: 'image',
      mediaName: '',
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
      SELECT sessions.*, users.id AS user_id, users.role, users.name, users.email, users.password_hash, users.team_id, users.created_at AS user_created_at
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token = ?
    `),
    allTeamUsers: db.prepare("SELECT * FROM users WHERE role = 'team'"),
    insertUser: db.prepare(`
      INSERT INTO users (id, role, name, email, password_hash, team_id, created_at)
      VALUES (@id, @role, @name, @email, @passwordHash, @teamId, @createdAt)
    `),
    insertSession: db.prepare('INSERT INTO sessions (id, token, user_id, created_at) VALUES (@id, @token, @userId, @createdAt)'),
    insertNotification: db.prepare(`
      INSERT INTO notifications (id, user_id, project_id, title, message, read, created_at)
      VALUES (@id, @userId, @projectId, @title, @message, 0, @createdAt)
    `),
    notificationsForUser: db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'),
    markNotificationsRead: db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?'),
    portfolio: db.prepare('SELECT * FROM portfolio_items ORDER BY created_at DESC'),
    portfolioById: db.prepare('SELECT * FROM portfolio_items WHERE id = ?'),
    insertPortfolio: db.prepare(`
      INSERT INTO portfolio_items (
        id, title, service, description, client, outcome, media_url, media_type, media_name, created_by, created_at, updated_at
      ) VALUES (
        @id, @title, @service, @description, @client, @outcome, @mediaUrl, @mediaType, @mediaName, @createdBy, @createdAt, @updatedAt
      )
    `),
    deletePortfolio: db.prepare('DELETE FROM portfolio_items WHERE id = ?'),
    clientProjects: db.prepare(`
      SELECT projects.*, users.name AS client_name
      FROM projects
      JOIN users ON users.id = projects.client_id
      WHERE projects.client_id = ?
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
      INSERT INTO projects (id, client_id, service, title, description, answers_json, status, created_at, updated_at)
      VALUES (@id, @clientId, @service, @title, @description, @answersJson, @status, @createdAt, @updatedAt)
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
  }

  function insertUser(user) {
    statements.insertUser.run(user)
    return user
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
        created_at: row.user_created_at,
      })
    },
    insertUser,
    createSession,
    notify,
    teamUsers: () => statements.allTeamUsers.all().map(userRow),
    notificationsForUser: (userId) => statements.notificationsForUser.all(userId).map(notificationRow),
    markNotificationsRead: (userId) => statements.markNotificationsRead.run(userId),
    portfolio: () => statements.portfolio.all().map(portfolioRow),
    portfolioById: (portfolioId) => portfolioRow(statements.portfolioById.get(portfolioId)),
    createPortfolio: (item) => {
      statements.insertPortfolio.run(item)
      return portfolioRow(statements.portfolioById.get(item.id))
    },
    deletePortfolio: (portfolioId) => statements.deletePortfolio.run(portfolioId),
    visibleProjects: (user) => {
      const rows = user.role === 'team' ? statements.allProjects.all() : statements.clientProjects.all(user.id)
      return rows.map(hydrateProject)
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
