import { PUBLIC_SERVICES } from './data/siteData.js';

// In dev, Vite proxy forwards /api → http://localhost:4000, so use relative paths (empty base).
// In production, use VITE_API_URL if set, otherwise same-origin.
const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? '' : (typeof window !== 'undefined' ? window.location.origin : ''))

const TOKEN_KEY = 'realmedia_token'

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token)
    } else {
      sessionStorage.removeItem(TOKEN_KEY)
    }
    // Also remove legacy persistent localStorage token to prevent lingering logins
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore storage errors in restricted iframe/browser modes
  }
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

  // Auto-refresh on 401 ONLY if the tab currently had an active session token
  if (token && res.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login') && !path.includes('/auth/team/login')) {
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
    let msg = data.message || data.error || `Server error ${res.status}`
    if (res.status === 413) {
      msg = data.message || 'Video file is too large for direct server upload (HTTP 413). Please use a YouTube / Google Drive link, or increase client_max_body_size on your web server.'
    } else if (res.status === 401 && (msg.includes('Authorization') || msg.includes('token') || msg.includes('authenticated'))) {
      msg = 'Team authorization session expired. Please log in to Team Dashboard again.'
    }
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
  sendVerification: (payload) => request('/api/auth/send-verification', { method: 'POST', body: payload }),
  verifyOtp: (payload) => request('/api/auth/verify-otp', { method: 'POST', body: payload }),
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
  updateDeliveryLink: (projectId, deliveryLink) => request(`/api/projects/${projectId}/delivery-link`, { method: 'PATCH', body: { deliveryLink } }),
  uploadFiles: (projectId, formData) => request(`/api/projects/${projectId}/files`, { method: 'POST', body: formData }),
  getNotifications: () => request('/api/notifications'),
  markNotificationsRead: () => request('/api/notifications/read', { method: 'PATCH' }),
  getTestimonials: () => request('/api/testimonials'),
  verifyProjectForFeedback: (projectTitle) => request('/api/testimonials/verify', { method: 'POST', body: { projectTitle } }),
  submitTestimonial: (payload) => request('/api/testimonials', { method: 'POST', body: payload }),
  getMyTestimonials: () => request('/api/testimonials/me'),
  updateUserAvatar: (formData) => request('/api/user/avatar', { method: 'POST', body: formData }),
  getPaymentKey: () => request('/api/payment/key'),
  getLearnerCourses: () => request('/api/learner/courses'),
  createPaymentOrder: (payload) => request('/api/payment/create-order', { method: 'POST', body: payload }),
  verifyPayment: (payload) => request('/api/payment/verify', { method: 'POST', body: payload }),
  createPackageOrder: (payload) => request('/api/payment/create-package-order', { method: 'POST', body: payload }),
  verifyPackagePayment: (payload) => request('/api/payment/verify-package', { method: 'POST', body: payload }),
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
  getCloudinarySignature: (folder) => request(`/api/cloudinary/signature?folder=${encodeURIComponent(folder || 'courses/videos')}`),
  uploadDirectToCloudinary: (file, sigData, onProgress) => {
    const url = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`
    const fd = new FormData()
    fd.append('file', file)
    fd.append('api_key', sigData.apiKey)
    fd.append('timestamp', sigData.timestamp)
    fd.append('signature', sigData.signature)
    fd.append('folder', sigData.folder)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100)
            onProgress(percent)
          }
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText)
            let finalUrl = res.secure_url || res.url
            if (res.resource_type === 'video' && finalUrl.includes('/upload/')) {
              finalUrl = finalUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1280,c_limit/')
            }
            resolve({ url: finalUrl, publicId: res.public_id, resourceType: res.resource_type })
          } catch {
            reject(new Error('Failed to parse Cloudinary response.'))
          }
        } else {
          try {
            const errRes = JSON.parse(xhr.responseText)
            reject(new Error(errRes.error?.message || `Cloudinary upload failed (HTTP ${xhr.status})`))
          } catch {
            reject(new Error(`Cloudinary upload failed (HTTP ${xhr.status})`))
          }
        }
      }
      xhr.onerror = () => reject(new Error('Network error during direct video upload.'))
      xhr.send(fd)
    })
  },

  /**
   * Upload large files (up to 3GB) by slicing into 5MB chunks.
   * Completely bypasses Nginx/Cloudflare/Hostinger HTTP 413 "Request Entity Too Large" errors!
   */
  uploadFileInChunks: async (file, { folder = 'courses/videos', chunkSize = 5 * 1024 * 1024, onProgress } = {}) => {
    const totalSize = file.size
    const totalChunks = Math.ceil(totalSize / chunkSize)
    const uploadId = `up_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const token = getToken()

    let result = null

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, totalSize)
      const chunkBlob = file.slice(start, end)

      const fd = new FormData()
      fd.append('chunk', chunkBlob, file.name)
      fd.append('uploadId', uploadId)
      fd.append('chunkIndex', String(chunkIndex))
      fd.append('totalChunks', String(totalChunks))
      fd.append('filename', file.name)
      fd.append('folder', folder)

      let retries = 3
      let chunkSuccess = false
      let lastError = null

      while (retries > 0 && !chunkSuccess) {
        try {
          const headers = {}
          if (token) headers.Authorization = `Bearer ${token}`

          const res = await fetch(`${API_BASE}/api/upload/chunk`, {
            method: 'POST',
            headers,
            body: fd,
            credentials: 'include',
          })

          if (!res.ok) {
            let errorMsg = `Upload failed with status ${res.status}`
            try {
              const errJson = await res.json()
              errorMsg = errJson.message || errorMsg
            } catch {}
            throw new Error(errorMsg)
          }

          const data = await res.json()
          chunkSuccess = true

          const percent = Math.min(99, Math.round(((chunkIndex + 1) / totalChunks) * 100))
          if (onProgress) {
            onProgress(percent, chunkIndex + 1, totalChunks)
          }

          if (data.done) {
            result = data
            if (onProgress) onProgress(100, totalChunks, totalChunks)
          }
        } catch (err) {
          lastError = err
          retries--
          if (retries > 0) {
            await new Promise((r) => setTimeout(r, 1200))
          }
        }
      }

      if (!chunkSuccess) {
        throw new Error(`Failed to upload chunk ${chunkIndex + 1} of ${totalChunks}: ${lastError?.message || 'Network error'}`)
      }
    }

    if (!result?.url) {
      throw new Error('Video upload completed but no URL was returned by server.')
    }

    return result
  },

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

  // ── Skills Management (with localStorage mock fallback) ──
  getSkills: async () => {
    try {
      return await request('/api/skills');
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        let skills = JSON.parse(localStorage.getItem('mock_skills'));
        if (!skills) {
          skills = PUBLIC_SERVICES.map((s, i) => ({ ...s, id: `skill_${i}_${s.title.replace(/\s+/g, '_').toLowerCase()}`, startingPrice: s.startingPrice || 0, features: s.features || s.details || [], tiers: s.tiers || [], category: s.category || 'General', popular: s.popular || false }));
          localStorage.setItem('mock_skills', JSON.stringify(skills));
        }
        // Ensure all skills have ids
        let needsSave = false;
        skills = skills.map((s, i) => {
          if (!s.id) { needsSave = true; return { ...s, id: `skill_${i}_${Date.now()}` }; }
          return s;
        });
        if (needsSave) localStorage.setItem('mock_skills', JSON.stringify(skills));
        return { skills };
      }
      throw e;
    }
  },
  addSkill: async (payload) => {
    try {
      return await request('/api/skills', { method: 'POST', body: payload });
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        const skills = JSON.parse(localStorage.getItem('mock_skills')) || [...PUBLIC_SERVICES];
        const newSkill = { ...payload, id: `skill_${Date.now()}` };
        skills.push(newSkill);
        localStorage.setItem('mock_skills', JSON.stringify(skills));
        return { message: 'Skill added', skill: newSkill };
      }
      throw e;
    }
  },
  updateSkill: async (id, payload) => {
    try {
      return await request(`/api/skills/${id}`, { method: 'PUT', body: payload });
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        const skills = JSON.parse(localStorage.getItem('mock_skills')) || [...PUBLIC_SERVICES];
        const index = skills.findIndex(s => s.id === id || s.title === id); // match id or title
        if (index > -1) {
          skills[index] = { ...skills[index], ...payload, id: skills[index].id || id };
          localStorage.setItem('mock_skills', JSON.stringify(skills));
        }
        return { message: 'Skill updated' };
      }
      throw e;
    }
  },
  deleteSkill: async (id) => {
    try {
      return await request(`/api/skills/${id}`, { method: 'DELETE' });
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        let skills = JSON.parse(localStorage.getItem('mock_skills')) || [...PUBLIC_SERVICES];
        skills = skills.filter(s => s.id !== id && s.title !== id);
        localStorage.setItem('mock_skills', JSON.stringify(skills));
        return { message: 'Skill deleted' };
      }
      throw e;
    }
  },

  // ── Pricing CRUD (with localStorage mock fallback) ──
  getPricing: async () => {
    try {
      return await request('/api/pricing');
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        const pricing = JSON.parse(localStorage.getItem('mock_pricing')) || [];
        return { pricing };
      }
      throw e;
    }
  },
  createPricing: async (payload) => {
    try {
      return await request('/api/pricing', { method: 'POST', body: payload });
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        const pricing = JSON.parse(localStorage.getItem('mock_pricing')) || [];
        const newPlan = { ...payload, id: `price_${Date.now()}` };
        pricing.push(newPlan);
        localStorage.setItem('mock_pricing', JSON.stringify(pricing));
        return { message: 'Plan created', pricing: newPlan };
      }
      throw e;
    }
  },
  updatePricing: async (id, payload) => {
    try {
      return await request(`/api/pricing/${id}`, { method: 'PUT', body: payload });
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        const pricing = JSON.parse(localStorage.getItem('mock_pricing')) || [];
        const idx = pricing.findIndex(p => (p.id || p._id) === id);
        if (idx > -1) {
          pricing[idx] = { ...pricing[idx], ...payload };
          localStorage.setItem('mock_pricing', JSON.stringify(pricing));
        }
        return { message: 'Plan updated' };
      }
      throw e;
    }
  },
  deletePricing: async (id) => {
    try {
      return await request(`/api/pricing/${id}`, { method: 'DELETE' });
    } catch (e) {
      if (e.status === 404 || e.message?.includes('Cannot reach')) {
        let pricing = JSON.parse(localStorage.getItem('mock_pricing')) || [];
        pricing = pricing.filter(p => (p.id || p._id) !== id);
        localStorage.setItem('mock_pricing', JSON.stringify(pricing));
        return { message: 'Plan deleted' };
      }
      throw e;
    }
  },

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

  // ── Persona Mode Switch & WhatsApp Client Chat ──
  switchMode: (targetRole) => request('/api/auth/switch-mode', { method: 'POST', body: { targetRole } }),
  getClientChat: (userId) => request(`/api/client-chat${userId ? `?userId=${userId}` : ''}`),
  sendClientChatMessage: (payload) => request('/api/client-chat', { method: 'POST', body: payload }),
  uploadClientChatFile: (formData) => request('/api/client-chat/upload', { method: 'POST', body: formData }),
}

export function mediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return encodeURI(url)
  let cleanUrl = url
  if (cleanUrl.startsWith('/src/assets/')) {
    cleanUrl = cleanUrl.replace(/^\/src\/assets\//, '/assets/')
  }
  return `${API_BASE}${encodeURI(cleanUrl)}`
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
    const isVideo = /\.(mp4|webm|mov|mkv|m4v)/i.test(fullUrl) || fullUrl.includes('/video/upload/')
    const faststart = isVideo ? ',fl_faststart' : ''
    const transformStr = width ? `f_auto,q_${quality}${faststart},w_${width},c_limit` : `f_auto,q_${quality}${faststart}`
    return fullUrl.replace('/upload/', `/upload/${transformStr}/`)
  }
  return fullUrl
}
