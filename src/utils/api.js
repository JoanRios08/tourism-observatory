import axios from 'axios'
import { getToken, logout } from './auth'

const envBase = import.meta?.env?.VITE_API_BASE ?? window.__API_BASE__ ?? ''
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const baseURL = isLocalhost ? '' : envBase

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
