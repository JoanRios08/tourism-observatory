import axios from 'axios'
import { getToken, logout } from './auth'

const baseURL = (import.meta?.env?.VITE_API_BASE) || window.__API_BASE__ || 'http://localhost:3001'

const api = axios.create({
  baseURL,
})

api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error && error.response && error.response.status === 401) {
      try {
        logout()
      } catch (e) {
        // ignore
      }
      try {
        window.location.hash = '#/login'
        window.location.reload()
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error)
  },
)

export default api
