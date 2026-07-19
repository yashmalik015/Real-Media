const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:4000' : (typeof window !== 'undefined' ? window.location.origin : ''))

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
    res = await fetch(`${API_BASE}${path}`, { ...options, headers, body })
  } catch {
    throw new Error('Cannot reach the server. Start the backend with: npm run dev:full')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 502 || res.status === 503) {
      throw new Error('Backend server is not running. Start it with: npm run dev:full')
    }
    throw new Error(data.message || 'Request failed.')
  }
  return data
}

export const api = {
  health: () => request('/api/health'),
  loginLearner: (payload) => request('/api/auth/learner', { method: 'POST', body: payload }),
  loginGoogleLearner: (payload) => request('/api/auth/learner/google', { method: 'POST', body: payload }),
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
}

export function mediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/src/')) {
    return typeof window !== 'undefined' ? `${window.location.origin}${url}` : url
  }
  if (url.startsWith('/uploads')) return `${API_BASE}${url}`
  return `${API_BASE}${url}`
}
