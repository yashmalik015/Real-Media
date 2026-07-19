import crypto from 'node:crypto'
import { id, now } from './database.js'

export async function createV2Collections(db) {
  const collections = {
    learnerProfiles: db.collection('learner_profiles'),
    courses: db.collection('courses'),
    teachers: db.collection('teachers'),
    comments: db.collection('comments'),
    subscriptions: db.collection('subscriptions'),
    mentorshipPackages: db.collection('mentorship_packages'),
    mentorshipBookings: db.collection('mentorship_bookings'),
    inquiries: db.collection('inquiries'),
    siteSettings: db.collection('site_settings'),
    learnerProjects: db.collection('learner_projects'),
    learningProgress: db.collection('learning_progress'),
    lessonLikes: db.collection('lesson_likes'),
  }

  await Promise.all([
    collections.learnerProfiles.createIndex({ user_id: 1 }, { unique: true }),
    collections.courses.createIndex({ published: 1, created_at: -1 }),
    collections.courses.createIndex({ category: 1 }),
    collections.teachers.createIndex({ user_id: 1 }, { unique: true, sparse: true }),
    collections.comments.createIndex({ lesson_id: 1, created_at: -1 }),
    collections.subscriptions.createIndex({ learner_id: 1, teacher_id: 1 }, { unique: true }),
    collections.mentorshipPackages.createIndex({ teacher_id: 1 }),
    collections.mentorshipBookings.createIndex({ teacher_id: 1, created_at: -1 }),
    collections.inquiries.createIndex({ status: 1, created_at: -1 }),
    collections.learnerProjects.createIndex({ user_id: 1 }),
    collections.learningProgress.createIndex({ user_id: 1, course_id: 1 }, { unique: true }),
    collections.lessonLikes.createIndex({ user_id: 1, lesson_id: 1 }, { unique: true }),
  ])

  await seedDefaultSettings(collections.siteSettings)

  return makeV2Repository(collections)
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

function makeV2Repository(collections) {
  const {
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
  } = collections

  return {
    // ── Settings ──
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

    // ── Learner profiles ──
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

    // ── Learner projects ──
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

    // ── Learning progress ──
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

    // ── Courses ──
    allCourses: async () => (await courses.find().sort({ sort_order: 1, created_at: -1 }).toArray()).map(courseRow),
    publishedCourses: async () =>
      (await courses.find({ published: true }).sort({ sort_order: 1, created_at: -1 }).toArray()).map(courseRow),
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

    // ── Teachers ──
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

    // ── Subscriptions ──
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

    // ── Comments ──
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

    // ── Lesson likes ──
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

    // ── Mentorship ──
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

    // ── Inquiries ──
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
