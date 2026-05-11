import axios from 'axios'

const envBase = import.meta?.env?.VITE_API_BASE ?? window.__API_BASE__ ?? ''
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const baseURL = isLocalhost ? '' : envBase

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    } else {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error),
)

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('authToken')
      } catch (e) {
        // ignore
      }
      try {
        window.location.hash = '#/login'
        window.location.reload()
      } catch (e) {
        try {
          window.location.href = '/login'
        } catch (e2) {
          // ignore
        }
      }
    }
    return Promise.reject(error)
  },
)

export default axiosClient
