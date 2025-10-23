import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach token from localStorage (saved by AuthContext) to every request if present
client.interceptors.request.use(config => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
}, err => Promise.reject(err))

export const authApi = {
  login: (data) => client.post('/api/login', data),
  signup: (data) => client.post('/api/signup', data)
}

export const predictApi = {
  predict: (payload) => {
    const PREDICT_URL = import.meta.env.VITE_PREDICT_URL
    if (PREDICT_URL) {
      // call prediction service directly
      return axios.post(PREDICT_URL.replace(/\/$/, '') + '/predict', payload, { timeout: 30000 })
    }
    // default: call backend proxy
    return client.post('/api/predict', payload)
  }
}

export const historyApi = {
  list: () => client.get('/api/history'),
  delete: (id) => client.delete(`/api/history/${id}`)
}

export default client
