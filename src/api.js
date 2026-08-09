// In dev, Vite proxy forwards /api → http://localhost:4000, so use relative paths (empty base).
// In production, use VITE_API_URL if set, otherwise same-origin.
const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? '' : (typeof window !== 'undefined' ? window.location.origin : ''))

const TOKEN_KEY = 'realmedia_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let body = options.body
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, body, credentials: 'include' })
  } catch {
    throw new Error('Cannot reach the server. Start the backend with: npm run dev:full')
  }

  // Auto-refresh on 401 (access token expired)
  if (res.status === 401 && getToken() && !path.includes('/auth/refresh')) {
    try {
      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json()
        const newToken = refreshData.accessToken || refreshData.token
        if (newToken) {
          setToken(newToken)
          // Retry original request with new token
          headers.Authorization = `Bearer ${newToken}`
          res = await fetch(`${API_BASE}${path}`, { ...options, headers, body, credentials: 'include' })
        }
      } else {
        // Refresh failed — clear session
        setToken(null)
      }
    } catch {
      setToken(null)
    }
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 502 || res.status === 503) {
      throw new Error(data.message || 'Backend server is not running. Start it with: npm run dev:full')
    }
    const msg = data.message || data.error || `Server error ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  health: () => request('/api/health'),
  loginLearner: (payload) => request('/api/auth/learner', { method: 'POST', body: payload }),
  loginGoogleLearner: (payload) => request('/api/auth/google', { method: 'POST', body: typeof payload === 'string' ? { idToken: payload } : payload }),
  loginTeamV2: (payload) => request('/api/auth/team/login', { method: 'POST', body: payload }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/me'),
  getPortfolio: () => request('/api/portfolio/public'),
  addPortfolio: (formData) => request('/api/portfolio', { method: 'POST', body: formData }),
  addPortfolioFull: (formData) => request('/api/portfolio/full', { method: 'POST', body: formData }),
  deletePortfolio: (id) => request(`/api/portfolio/${id}`, { method: 'DELETE' }),
  getProjects: () => request('/api/projects'),
  getProject: (id) => request(`/api/projects/${id}`),
  createProject: (formData) => request('/api/projects', { method: 'POST', body: formData }),
  sendMessage: (projectId, text) => request(`/api/projects/${projectId}/messages`, { method: 'POST', body: { text } }),
  updateStatus: (projectId, status) => request(`/api/projects/${projectId}/status`, { method: 'PATCH', body: { status } }),
  uploadFiles: (projectId, formData) => request(`/api/projects/${projectId}/files`, { method: 'POST', body: formData }),
  getNotifications: () => request('/api/notifications'),
  markNotificationsRead: () => request('/api/notifications/read', { method: 'PATCH' }),
  getTestimonials: () => request('/api/testimonials'),
  verifyProjectForFeedback: (projectTitle) => request('/api/testimonials/verify', { method: 'POST', body: { projectTitle } }),
  submitTestimonial: (payload) => request('/api/testimonials', { method: 'POST', body: payload }),
  getPaymentKey: () => request('/api/payment/key'),
  createPaymentOrder: (payload) => request('/api/payment/create-order', { method: 'POST', body: payload }),
  verifyPayment: (payload) => request('/api/payment/verify', { method: 'POST', body: payload }),
  stopProject: (projectId) => request(`/api/projects/${projectId}/stop`, { method: 'POST' }),
  finishProject: (projectId) => request(`/api/projects/${projectId}/finish`, { method: 'POST' }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),
  getTeamChatMessages: () => request('/api/team-chat'),
  sendTeamChatMessage: (text) => request('/api/team-chat', { method: 'POST', body: { text } }),
  uploadTeamChatFiles: (formData) => request('/api/team-chat/files', { method: 'POST', body: formData }),

  // ── Missing V2 and Admin Methods ──
  submitInquiry: (payload) => request('/api/inquiries', { method: 'POST', body: payload }),
  getInquiries: () => request('/api/inquiries'),
  updateInquiry: (id, status) => request(`/api/inquiries/${id}`, { method: 'PATCH', body: { status } }),
  deleteInquiry: (id) => request(`/api/inquiries/${id}`, { method: 'DELETE' }),

  getLearnerProfile: () => request('/api/learner/profile'),
  updateLearnerProfile: (payload) => request('/api/learner/profile', { method: 'PUT', body: payload }),
  uploadProfilePhoto: (formData) => request('/api/learner/profile/photo', { method: 'POST', body: formData }),
  uploadResume: (formData) => request('/api/learner/profile/resume', { method: 'POST', body: formData }),

  getCourses: () => request('/api/courses'),
  searchCourses: (q) => request(`/api/courses/search?q=${encodeURIComponent(q)}`),
  getAllCourses: () => request('/api/courses/all'),
  getCourse: (id) => request(`/api/courses/${id}`),
  createCourse: (payload) => request('/api/courses', { method: 'POST', body: payload }),
  updateCourse: (id, payload) => request(`/api/courses/${id}`, { method: 'PUT', body: payload }),
  deleteCourse: (id) => request(`/api/courses/${id}`, { method: 'DELETE' }),
  uploadCourseThumbnail: (id, formData) => request(`/api/courses/${id}/thumbnail`, { method: 'POST', body: formData }),
  uploadLessonVideo: (courseId, lessonId, formData) => request(`/api/courses/${courseId}/lessons/${lessonId}/video`, { method: 'POST', body: formData }),
  uploadLessonThumbnail: (courseId, lessonId, formData) => request(`/api/courses/${courseId}/lessons/${lessonId}/thumbnail`, { method: 'POST', body: formData }),

  getSettings: () => request('/api/settings'),
  updateSettings: (payload) => request('/api/settings', { method: 'PUT', body: payload }),

  getLessonComments: (lessonId) => request(`/api/lessons/${lessonId}/comments`),
  addComment: (lessonId, text, courseId) => request(`/api/lessons/${lessonId}/comments`, { method: 'POST', body: { text, courseId } }),
  deleteComment: (id) => request(`/api/comments/${id}`, { method: 'DELETE' }),
  likeComment: (id) => request(`/api/comments/${id}/like`, { method: 'POST' }),

  trackProgress: (courseId, lessonId) => request('/api/learning/progress', { method: 'POST', body: { courseId, lessonId } }),
  getProgress: () => request('/api/learning/progress'),

  getLessonLiked: (lessonId) => request(`/api/lessons/${lessonId}/like`),
  likeLesson: (lessonId) => request(`/api/lessons/${lessonId}/like`, { method: 'POST' }),

  getAnalytics: () => request('/api/analytics'),

  getPublicPortfolio: () => request('/api/portfolio/public'),
  getAllTestimonials: () => request('/api/testimonials/all'),
  addTestimonialManage: (formData) => request('/api/testimonials/manage', { method: 'POST', body: formData }),
  updateTestimonial: (id, formData) => request(`/api/testimonials/${id}`, { method: 'PUT', body: formData }),
  deleteTestimonialManage: (id) => request(`/api/testimonials/manage/${id}`, { method: 'DELETE' }),

  // ── Pricing CRUD ──
  getPricing: () => request('/api/pricing'),
  createPricing: (payload) => request('/api/pricing', { method: 'POST', body: payload }),
  updatePricing: (id, payload) => request(`/api/pricing/${id}`, { method: 'PUT', body: payload }),
  deletePricing: (id) => request(`/api/pricing/${id}`, { method: 'DELETE' }),

  // ── Media Library ──
  getMedia: () => request('/api/media'),
  uploadMedia: (formData) => request('/api/media', { method: 'POST', body: formData }),
  deleteMedia: (id) => request(`/api/media/${id}`, { method: 'DELETE' }),

  // ── Activities ──
  getActivities: () => request('/api/activities'),
  logActivity: (action, details) => request('/api/activities', { method: 'POST', body: { action, details } }),

  // ── Global Search & Bulk Actions ──
  globalSearch: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),
  bulkDelete: (collection, ids) => request('/api/bulk/delete', { method: 'POST', body: { collection, ids } }),
  bulkPublish: (collection, ids, published) => request('/api/bulk/publish', { method: 'POST', body: { collection, ids, published } }),
  updatePortfolio: (id, formData) => request(`/api/portfolio/${id}`, { method: 'PUT', body: formData }),
}

export function mediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  let cleanUrl = url
  if (cleanUrl.startsWith('/src/assets/')) {
    cleanUrl = cleanUrl.replace(/^\/src\/assets\//, '/assets/')
  }
  if (cleanUrl.startsWith('/uploads')) return `${API_BASE}${cleanUrl}`
  return `${API_BASE}${cleanUrl}`
}

/**
 * Generates an optimized media URL for Cloudinary assets (automatically applies compression q_auto, f_auto, and resolution scaling),
 * or returns standard mediaUrl for local storage assets.
 */
export function optimizedMediaUrl(url, { width = 1280, quality = 'auto' } = {}) {
  if (!url) return ''
  const fullUrl = mediaUrl(url)
  if (fullUrl.includes('res.cloudinary.com') && fullUrl.includes('/upload/')) {
    // Prevent duplicating transformations if already transformed
    if (fullUrl.includes('/q_auto') || fullUrl.includes('/f_auto')) {
      return fullUrl
    }
    const transformStr = width ? `f_auto,q_${quality},w_${width},c_limit` : `f_auto,q_${quality}`
    return fullUrl.replace('/upload/', `/upload/${transformStr}/`)
  }
  return fullUrl
}
