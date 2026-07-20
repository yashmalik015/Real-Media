import { id, now } from './database.js'
import { courseToDb } from './database.js'

export function registerV2Routes(app, { repository, v2, upload, requireAuth, hashPassword, verifyPassword, createSessionResponse, uploadFile, TEAM_ACCESS_ID, TEAM_ACCESS_PASSWORD }) {

  // ── Learner auth ──
  app.post('/api/auth/learner', async (req, res) => {
    const { mode = 'login', name = '', email = '', password = '' } = req.body
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !password || (mode === 'register' && !name.trim())) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    let user = await repository.findUserByEmail(cleanEmail)
    if (user && user.role !== 'learner') {
      return res.status(409).json({ message: 'This email is registered under a different account type.' })
    }

    if (mode === 'register') {
      if (user) return res.status(409).json({ message: 'Account already exists. Please login.' })
      user = await repository.insertUser({
        id: id('learner'),
        role: 'learner',
        name: name.trim(),
        email: cleanEmail,
        passwordHash: hashPassword(password),
        teamId: null,
        teamCategory: null,
        googleId: null,
        createdAt: now(),
      })
      await v2.upsertLearnerProfile(user.id, { bio: '', skills: [] })
    } else if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Invalid login credentials.' })
    }

    res.json(await createSessionResponse(user))
  })

  app.post('/api/auth/learner/google', async (req, res) => {
    const { name = '', email = '', googleId = '' } = req.body
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !googleId.trim()) {
      return res.status(400).json({ message: 'Google account email is required.' })
    }

    let user = await repository.findUserByEmail(cleanEmail)
    if (user && user.role !== 'learner') {
      return res.status(409).json({ message: 'This email is registered under a different account type.' })
    }
    if (!user) {
      user = await repository.insertUser({
        id: id('learner'),
        role: 'learner',
        name: name.trim() || cleanEmail,
        email: cleanEmail,
        passwordHash: null,
        teamId: null,
        teamCategory: null,
        googleId: googleId.trim(),
        createdAt: now(),
      })
      await v2.upsertLearnerProfile(user.id, { bio: '', skills: [] })
    }

    res.json(await createSessionResponse(user))
  })

  app.post('/api/auth/team/login', async (req, res) => {
    try {
      console.log('[auth/team/login] incoming body:', JSON.stringify(req.body))
      const { teamId = '', password = '' } = req.body

      // Validate teamId format and value
      const teamIdOk = /^\d{10}$/.test(teamId) && teamId === TEAM_ACCESS_ID
      const passwordOk = password === TEAM_ACCESS_PASSWORD
      console.log(`[auth/team/login] teamId="${teamId}" teamIdOk=${teamIdOk} passwordOk=${passwordOk}`)

      if (!teamIdOk) {
        console.log('[auth/team/login] rejected: invalid team ID')
        return res.status(401).json({ success: false, message: 'Invalid Team ID. Must be exactly the 10-digit team ID.' })
      }
      if (!passwordOk) {
        console.log('[auth/team/login] rejected: wrong password')
        return res.status(401).json({ success: false, message: 'Invalid Team password.' })
      }

      // Look up or create the team user
      let user = await repository.findTeamUser(TEAM_ACCESS_ID)
      console.log('[auth/team/login] findTeamUser result:', user ? `found id=${user.id}` : 'not found — will create')

      if (!user) {
        user = await repository.ensureTeamUser({
          id: id('team'),
          role: 'team',
          name: 'Assets Weber Team',
          email: 'team@assetsweber.internal',
          passwordHash: hashPassword(TEAM_ACCESS_PASSWORD),
          teamId: TEAM_ACCESS_ID,
          teamCategory: null,
          googleId: null,
          createdAt: now(),
        })
        console.log('[auth/team/login] ensureTeamUser result:', user ? `created id=${user.id}` : 'FAILED to create')
      }

      if (!user) {
        console.error('[auth/team/login] ERROR: could not find or create team user')
        return res.status(500).json({ success: false, message: 'Team account could not be found or created.' })
      }

      const sessionResult = await createSessionResponse(user)
      console.log('[auth/team/login] session created, token length:', sessionResult.token?.length)
      res.json({ success: true, ...sessionResult })
    } catch (err) {
      console.error('[auth/team/login] EXCEPTION:', err.message, err.stack)
      res.status(500).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
      })
    }
  })


  app.post('/api/auth/logout', requireAuth, async (req, res) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (token) await repository.deleteSession(token)
    res.json({ ok: true })
  })

  // ── Settings ──
  app.get('/api/settings', async (_req, res) => {
    res.json({ settings: await v2.getSettings() })
  })

  app.put('/api/settings', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    res.json({ settings: await v2.updateSettings(req.body) })
  })

  // ── Inquiries (public submit, team manage) ──
  app.post('/api/inquiries', async (req, res) => {
    const inquiry = await v2.createInquiry(req.body)
    res.status(201).json({ inquiry })
  })

  app.get('/api/inquiries', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    res.json({ inquiries: await v2.allInquiries() })
  })

  app.patch('/api/inquiries/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const inquiry = await v2.updateInquiryStatus(req.params.id, req.body.status)
    res.json({ inquiry })
  })

  app.delete('/api/inquiries/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    await v2.deleteInquiry(req.params.id)
    res.json({ ok: true })
  })

  // ── Learner profile ──
  app.get('/api/learner/profile', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const [profile, projects, progress, courses] = await Promise.all([
      v2.getLearnerProfile(req.user.id),
      v2.learnerProjects(req.user.id),
      v2.getProgress(req.user.id),
      v2.getCourses({ published: true }),
    ])
    const completedCourses = progress.filter((p) => {
      const course = courses.find((c) => c.id === p.courseId)
      if (!course) return false
      const totalLessons = course.modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)
      return totalLessons > 0 && p.completedLessons.length >= totalLessons
    }).length
    res.json({
      user: { id: req.user.id, name: req.user.name, email: req.user.email },
      profile: profile || { photo: '', bio: '', skills: [], github: '', linkedin: '', portfolioLink: '', resumeUrl: '' },
      projects,
      progress,
      completedCourses,
    })
  })

  app.put('/api/learner/profile', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const profile = await v2.upsertLearnerProfile(req.user.id, req.body)
    res.json({ profile })
  })

  app.post('/api/learner/profile/photo', requireAuth, upload.single('photo'), async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    if (!req.file) return res.status(400).json({ message: 'Photo file required.' })
    const uploaded = await uploadFile(req.file, 'profiles')
    const profile = await v2.upsertLearnerProfile(req.user.id, { photo: uploaded.url })
    res.json({ profile })
  })

  app.post('/api/learner/profile/resume', requireAuth, upload.single('resume'), async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    if (!req.file) return res.status(400).json({ message: 'Resume file required.' })
    const uploaded = await uploadFile(req.file, 'resumes')
    const profile = await v2.upsertLearnerProfile(req.user.id, { resumeUrl: uploaded.url })
    res.json({ profile })
  })

  app.post('/api/learner/projects', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const project = await v2.createLearnerProject(req.user.id, req.body)
    res.status(201).json({ project })
  })

  app.post('/api/learner/projects/:id/image', requireAuth, upload.single('image'), async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    if (!req.file) return res.status(400).json({ message: 'Image required.' })
    const uploaded = await uploadFile(req.file, 'learner-projects')
    res.json({ imageUrl: uploaded.url })
  })

  app.delete('/api/learner/projects/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    await v2.deleteLearnerProject(req.user.id, req.params.id)
    res.json({ ok: true })
  })

  // ── Courses ──
  app.get('/api/courses', async (_req, res) => {
    res.json({ courses: await v2.getCourses({ published: true }) })
  })

  app.get('/api/courses/search', async (req, res) => {
    const q = req.query.q || ''
    res.json({ courses: await v2.searchCourses(q) })
  })

  app.get('/api/courses/all', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    res.json({ courses: await v2.getCourses() })
  })

  app.get('/api/courses/:id', async (req, res) => {
    const course = await v2.courseById(req.params.id)
    if (!course) return res.status(404).json({ message: 'Course not found.' })
    if (!course.published) {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
      if (!token) return res.status(404).json({ message: 'Course not found.' })
      const user = await repository.findUserByToken(token)
      if (!user || user.role !== 'team') return res.status(404).json({ message: 'Course not found.' })
    }
    await v2.incrementCourseViews(req.params.id)
    res.json({ course })
  })

  app.post('/api/courses', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const course = await v2.createCourse(req.body, req.user.id)
    res.status(201).json({ course })
  })

  app.put('/api/courses/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const course = await v2.updateCourse(req.params.id, courseToDb(req.body))
    if (!course) return res.status(404).json({ message: 'Course not found.' })
    res.json({ course })
  })

  app.delete('/api/courses/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    await v2.deleteCourse(req.params.id)
    res.json({ ok: true })
  })

  app.post('/api/courses/:id/thumbnail', requireAuth, upload.single('thumbnail'), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    if (!req.file) return res.status(400).json({ message: 'Thumbnail required.' })
    const uploaded = await uploadFile(req.file, 'courses/thumbnails')
    const course = await v2.updateCourse(req.params.id, { thumbnail: uploaded.url })
    res.json({ course, url: uploaded.url })
  })

  app.post('/api/courses/:courseId/lessons/:lessonId/video', requireAuth, upload.single('video'), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    if (!req.file) return res.status(400).json({ message: 'Video required.' })
    const uploaded = await uploadFile(req.file, 'courses/videos')
    const course = await v2.courseById(req.params.courseId)
    if (!course) return res.status(404).json({ message: 'Course not found.' })
    const modules = course.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) =>
        l.id === req.params.lessonId ? { ...l, videoUrl: uploaded.url, uploadedAt: now() } : l,
      ),
    }))
    const updated = await v2.updateCourse(req.params.courseId, { modules })
    res.json({ course: updated, url: uploaded.url })
  })

  app.post('/api/courses/:courseId/lessons/:lessonId/thumbnail', requireAuth, upload.single('thumbnail'), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    if (!req.file) return res.status(400).json({ message: 'Thumbnail required.' })
    const uploaded = await uploadFile(req.file, 'courses/thumbnails')
    const course = await v2.courseById(req.params.courseId)
    if (!course) return res.status(404).json({ message: 'Course not found.' })
    const modules = course.modules.map((m) => ({
      ...m,
      lessons: m.lessons.map((l) =>
        l.id === req.params.lessonId ? { ...l, thumbnail: uploaded.url } : l,
      ),
    }))
    const updated = await v2.updateCourse(req.params.courseId, { modules })
    res.json({ course: updated, url: uploaded.url })
  })

  // ── Learning progress ──
  app.post('/api/learning/progress', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const { courseId, lessonId } = req.body
    const progress = await v2.updateProgress(req.user.id, courseId, lessonId)
    res.json({ progress })
  })

  app.get('/api/learning/progress', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    res.json({ progress: await v2.getProgress(req.user.id) })
  })

  // ── Teachers ──
  app.get('/api/teachers', async (_req, res) => {
    const teachers = await v2.allTeachers()
    const courses = await v2.getCourses({ published: true })
    const enriched = teachers.map((t) => ({
      ...t,
      courses: courses.filter((c) => c.teacherId === t.id || c.teacherName === t.name),
      totalStudents: courses
        .filter((c) => c.teacherId === t.id)
        .reduce((sum, c) => sum + (c.views || 0), 0),
    }))
    res.json({ teachers: enriched })
  })

  app.get('/api/teachers/:id', async (req, res) => {
    const teacher = await v2.teacherById(req.params.id)
    if (!teacher) return res.status(404).json({ message: 'Teacher not found.' })
    const courses = (await v2.getCourses({ published: true })).filter((c) => c.teacherId === teacher.id)
    const packages = await v2.mentorshipPackages(teacher.id)
    res.json({ teacher: { ...teacher, courses, mentorshipPackages: packages } })
  })

  app.put('/api/teachers/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const teacher = await v2.upsertTeacher({ ...req.body, userId: req.user.id })
    res.json({ teacher })
  })

  app.post('/api/teachers/:id/photo', requireAuth, upload.single('photo'), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    if (!req.file) return res.status(400).json({ message: 'Photo required.' })
    const uploaded = await uploadFile(req.file, 'teachers')
    const teacher = await v2.upsertTeacher({ userId: req.user.id, photo: uploaded.url })
    res.json({ teacher })
  })

  // ── Subscriptions ──
  app.post('/api/subscriptions/:teacherId', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const result = await v2.subscribe(req.user.id, req.params.teacherId)
    res.json(result)
  })

  app.delete('/api/subscriptions/:teacherId', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const result = await v2.unsubscribe(req.user.id, req.params.teacherId)
    res.json(result)
  })

  app.get('/api/subscriptions/:teacherId/status', requireAuth, async (req, res) => {
    const subscribed = await v2.isSubscribed(req.user.id, req.params.teacherId)
    res.json({ subscribed })
  })

  // ── Comments ──
  app.get('/api/lessons/:lessonId/comments', async (req, res) => {
    const comments = await v2.commentsForLesson(req.params.lessonId)
    const withReplies = await Promise.all(
      comments.map(async (c) => ({
        ...c,
        replies: await v2.commentReplies(c.id),
      })),
    )
    res.json({ comments: withReplies })
  })

  app.post('/api/lessons/:lessonId/comments', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const comment = await v2.createComment({
      lessonId: req.params.lessonId,
      courseId: req.body.courseId,
      userId: req.user.id,
      userName: req.user.name,
      text: req.body.text,
      parentId: req.body.parentId || null,
    })
    res.status(201).json({ comment })
  })

  app.delete('/api/comments/:id', requireAuth, async (req, res) => {
    const ok = await v2.deleteComment(req.params.id, req.user.id)
    if (!ok) return res.status(403).json({ message: 'Cannot delete this comment.' })
    res.json({ ok: true })
  })

  app.post('/api/comments/:id/like', requireAuth, async (req, res) => {
    const comment = await v2.likeComment(req.params.id, req.user.id)
    res.json({ comment })
  })

  app.post('/api/lessons/:lessonId/like', requireAuth, async (req, res) => {
    const result = await v2.toggleLessonLike(req.user.id, req.params.lessonId)
    res.json(result)
  })

  app.get('/api/lessons/:lessonId/like', requireAuth, async (req, res) => {
    const liked = await v2.isLessonLiked(req.user.id, req.params.lessonId)
    res.json({ liked })
  })

  // ── Mentorship ──
  app.get('/api/teachers/:id/mentorship', async (req, res) => {
    res.json({ packages: await v2.mentorshipPackages(req.params.id) })
  })

  app.post('/api/teachers/:id/mentorship', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const pkg = await v2.createMentorshipPackage(req.params.id, req.body)
    res.status(201).json({ package: pkg })
  })

  app.delete('/api/mentorship/:packageId', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    await v2.deleteMentorshipPackage(req.params.packageId, req.body.teacherId)
    res.json({ ok: true })
  })

  app.post('/api/mentorship/book', requireAuth, async (req, res) => {
    if (req.user.role !== 'learner') return res.status(403).json({ message: 'Learner access required.' })
    const booking = await v2.createMentorshipBooking({
      packageId: req.body.packageId,
      teacherId: req.body.teacherId,
      learnerId: req.user.id,
      learnerName: req.user.name,
      learnerEmail: req.user.email,
      message: req.body.message,
      paymentStatus: req.body.paymentStatus || 'pending',
    })
    res.status(201).json({ booking })
  })

  // ── Extended portfolio ──
  app.put('/api/portfolio/:id', requireAuth, upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
    { name: 'video', maxCount: 1 },
  ]), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const existing = await repository.portfolioById(req.params.id)
    if (!existing) return res.status(404).json({ message: 'Portfolio item not found.' })

    const body = req.body
    const updates = {
      title: body.title ?? existing.title,
      service: body.service ?? existing.service,
      description: body.description ?? existing.description,
      client: body.client ?? existing.client,
      outcome: body.outcome ?? existing.outcome,
      category: body.category ?? existing.category ?? '',
      technologies: body.technologies ? JSON.parse(body.technologies) : existing.technologies,
      completionDate: body.completionDate ?? existing.completionDate ?? '',
      tags: body.tags ? JSON.parse(body.tags) : existing.tags,
      cta: body.cta ?? existing.cta ?? '',
      featured: body.featured === 'true' || body.featured === true,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : existing.sortOrder,
      updatedAt: now(),
    }

    if (req.files?.media?.[0]) {
      const up = await uploadFile(req.files.media[0], `portfolio/${updates.service || 'general'}`)
      updates.mediaUrl = up.url
      updates.mediaType = req.files.media[0].mimetype.startsWith('video/') ? 'video' : 'image'
      updates.mediaName = req.files.media[0].originalname
    }
    if (req.files?.thumbnail?.[0]) {
      const up = await uploadFile(req.files.thumbnail[0], 'portfolio/thumbnails')
      updates.thumbnail = up.url
    }
    if (req.files?.video?.[0]) {
      const up = await uploadFile(req.files.video[0], 'portfolio/videos')
      updates.videoUrl = up.url
    }
    if (req.files?.gallery) {
      const gallery = await Promise.all(
        req.files.gallery.map((f) => uploadFile(f, 'portfolio/gallery')),
      )
      updates.galleryImages = [...(existing.galleryImages || []), ...gallery.map((g) => g.url)]
    }

    await repository.updatePortfolioFull(req.params.id, updates)
    res.json({ portfolioItem: await repository.portfolioById(req.params.id) })
  })

  app.post('/api/portfolio/reorder', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const { order = [] } = req.body
    await Promise.all(order.map((itemId, index) =>
      repository.updatePortfolioFull(itemId, { sortOrder: index }),
    ))
    res.json({ portfolio: await repository.portfolio() })
  })

  app.post('/api/portfolio/full', requireAuth, upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gallery', maxCount: 10 },
    { name: 'video', maxCount: 1 },
  ]), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })

    const { title = '', service = '', description = '', client = '', outcome = '' } = req.body
    if (!title.trim() || !service.trim() || !description.trim()) {
      return res.status(400).json({ message: 'Title, service, and description are required.' })
    }

    const timestamp = now()
    const mediaFile = req.files?.media?.[0]
    const uploaded = mediaFile ? await uploadFile(mediaFile, `portfolio/${service.trim()}`) : null
    const thumbnailFile = req.files?.thumbnail?.[0]
    const thumbnailUp = thumbnailFile ? await uploadFile(thumbnailFile, 'portfolio/thumbnails') : null
    const videoFile = req.files?.video?.[0]
    const videoUp = videoFile ? await uploadFile(videoFile, 'portfolio/videos') : null
    const galleryUp = req.files?.gallery
      ? await Promise.all(req.files.gallery.map((f) => uploadFile(f, 'portfolio/gallery')))
      : []

    const portfolioItem = await repository.addPortfolioFull({
      id: id('portfolio'),
      title: title.trim(),
      service: service.trim(),
      description: description.trim(),
      client: client.trim(),
      outcome: outcome.trim(),
      category: req.body.category?.trim() || '',
      mediaUrl: uploaded?.url || '',
      mediaType: mediaFile?.mimetype.startsWith('video/') ? 'video' : 'image',
      mediaName: mediaFile?.originalname || '',
      thumbnail: thumbnailUp?.url || '',
      videoUrl: videoUp?.url || '',
      galleryImages: galleryUp.map((g) => g.url),
      technologies: req.body.technologies ? JSON.parse(req.body.technologies) : [],
      completionDate: req.body.completionDate || '',
      tags: req.body.tags ? JSON.parse(req.body.tags) : [],
      cta: req.body.cta || '',
      featured: req.body.featured === 'true',
      sortOrder: Date.now(),
      createdBy: req.user.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    })

    res.status(201).json({ portfolioItem })
  })

  // ── Testimonials (team CRUD) ──
  app.get('/api/testimonials/all', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    res.json({ testimonials: await repository.allTestimonials() })
  })

  app.post('/api/testimonials/manage', requireAuth, upload.single('photo'), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const photo = req.file ? (await uploadFile(req.file, 'testimonials')).url : req.body.image || ''
    const testimonial = await repository.createTestimonial({
      id: id('testimonial'),
      userId: req.user.id,
      projectId: null,
      name: req.body.name?.trim() || '',
      biz: req.body.company?.trim() || req.body.biz?.trim() || '',
      quote: req.body.review?.trim() || req.body.quote?.trim() || '',
      tag: req.body.service?.trim() || '',
      result: req.body.rating ? `${req.body.rating}★` : '',
      initials: (req.body.name || 'AW').slice(0, 2).toUpperCase(),
      photo,
      rating: Number(req.body.rating) || 5,
      approved: true,
      createdAt: now(),
    })
    res.status(201).json({ testimonial })
  })

  app.put('/api/testimonials/:id', requireAuth, upload.single('photo'), async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const photo = req.file ? (await uploadFile(req.file, 'testimonials')).url : undefined
    const testimonial = await repository.updateTestimonial(req.params.id, {
      name: req.body.name,
      biz: req.body.company || req.body.biz,
      quote: req.body.review || req.body.quote,
      tag: req.body.service,
      result: req.body.rating ? `${req.body.rating}★` : undefined,
      photo,
      rating: req.body.rating ? Number(req.body.rating) : undefined,
    })
    res.json({ testimonial })
  })

  app.delete('/api/testimonials/manage/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    await repository.deleteTestimonial(req.params.id)
    res.json({ ok: true })
  })

  // ── Pricing CRUD Routes ──
  app.get('/api/pricing', async (_req, res) => {
    try {
      res.json({ pricing: await repository.getPricing() })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  app.post('/api/pricing', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    try {
      const item = await repository.createPricing(req.body)
      res.status(201).json({ pricingItem: item })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  app.put('/api/pricing/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    try {
      const item = await repository.updatePricing(req.params.id, req.body)
      if (!item) return res.status(404).json({ message: 'Pricing not found.' })
      res.json({ pricingItem: item })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  app.delete('/api/pricing/:id', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    try {
      await repository.deletePricing(req.params.id)
      res.json({ ok: true })
    } catch (err) {
      res.status(500).json({ message: err.message })
    }
  })

  // ── Analytics ──
  app.get('/api/analytics', requireAuth, async (req, res) => {
    if (req.user.role !== 'team') return res.status(403).json({ message: 'Team access required.' })
    const [portfolio, courses, inquiries, testimonials, teachers] = await Promise.all([
      repository.portfolio(),
      v2.getCourses(),
      v2.allInquiries(),
      repository.allTestimonials(),
      v2.allTeachers(),
    ])
    res.json({
      analytics: {
        portfolioCount: portfolio.length,
        courseCount: courses.length,
        publishedCourses: courses.filter((c) => c.published).length,
        inquiryCount: inquiries.length,
        newInquiries: inquiries.filter((i) => i.status === 'New').length,
        testimonialCount: testimonials.length,
        teacherCount: teachers.length,
        totalCourseViews: courses.reduce((s, c) => s + (c.views || 0), 0),
      },
    })
  })
}
