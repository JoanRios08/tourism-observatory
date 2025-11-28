export function getToken() {
  try {
    return localStorage.getItem('token') || ''
  } catch (err) {
    return ''
  }
}

export function getUserId() {
  try {
    return localStorage.getItem('userId') || ''
  } catch (err) {
    return ''
  }
}

export function getUsername() {
  try {
    return localStorage.getItem('username') || ''
  } catch (err) {
    return ''
  }
}

export function isAuthenticated() {
  const t = getToken()
  return !!t && t.length > 0
}

export function logout() {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
  } catch (err) {
    
  }
}

export default {
  getToken,
  getUserId,
  getUsername,
  isAuthenticated,
  logout,
}
