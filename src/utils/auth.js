import { jwtDecode } from 'jwt-decode'

const AUTH_TOKEN_KEY = 'authToken'
const AUTH_EMAIL_KEY = 'authEmail'

export const getToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const saveAuthData = (data, email) => {
  if (!data) return false
  let token = null
  if (typeof data === 'string') token = data
  else
    token =
      data.token ||
      data.access_token ||
      data.authToken ||
      data.jwt ||
      (data.data && (data.data.token || data.data.access_token))
  if (!token) return false
  localStorage.setItem(AUTH_TOKEN_KEY, token)
  if (email) localStorage.setItem(AUTH_EMAIL_KEY, email)
  return true
}

export const isAuthenticated = () => !!getToken()

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_EMAIL_KEY)
  localStorage.removeItem('authUsername')
}

export const getUserInfoFromToken = () => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) return null
    const decoded = jwtDecode(token)
    return {
      id: decoded.id || null,
      email: decoded.email || null,
      community_id: decoded.community_id || null,
      role_id: decoded.role_id || null,
      role_name: decoded.role_name || decoded.rol_name || null,
    }
  } catch {
    return null
  }
}

const auth = { getToken, saveAuthData, isAuthenticated, logout, getUserInfoFromToken }

export default auth
