import axiosClient from '../axiosClient'
import { saveAuthData } from '../../utils/auth'

const authApi = {
  login: async (credentials) => {
    try {
      // ensure backend gets `email` when UI provides `username`
      const payload = {
        ...credentials,
        email: credentials.email || credentials.username,
      }
      const { data } = await axiosClient.post('/login', payload)
      // Support different backend shapes: { token, user } or { data: { token, ... } }
      const resp = data || {}
      // Save token using helper which understands multiple token keys
      saveAuthData(resp)
      // Persist user info if provided
      const userInfo = resp.user || resp.data || null
      if (userInfo) localStorage.setItem('userInfo', JSON.stringify(userInfo))
      return data
    } catch (err) {
      console.error('[authApi.login] request failed:', err)
      console.error('Response data:', err?.response?.data)
      console.error('Response status:', err?.response?.status)
      throw err
    }
  },
  recoverPassword: async (emailData) => {
    const { data } = await axiosClient.post('/auth/recover_password', emailData)
    return data
  },
}

export default authApi