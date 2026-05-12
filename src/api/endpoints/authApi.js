import axiosClient from '../axiosClient'
import { saveAuthData } from '../../utils/auth'

const buildLoginPayload = (credentials) => ({
  ...credentials,
  username: credentials.username || credentials.email,
  email: credentials.email || credentials.username,
})

const buildDemoLoginResponse = (authRecord) => ({
  token: authRecord.token,
  user: {
    id: authRecord.userId || authRecord.user_id || authRecord.id,
    username: authRecord.username,
  },
})

const saveLoginResponse = (data, username) => {
  const resp = data || {}
  saveAuthData(resp, username)

  const userInfo = resp.user || resp.data?.user || resp.data || null
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  return data
}

const authApi = {
  login: async (credentials) => {
    const payload = buildLoginPayload(credentials)

    try {
      const { data } = await axiosClient.post('/login', payload)
      return saveLoginResponse(data, payload.username)
    } catch (err) {
      if (err?.response?.status === 404) {
        const { data } = await axiosClient.get('/auth', {
          params: {
            username: payload.username,
            password: payload.password,
          },
        })
        const authRecord = Array.isArray(data) ? data[0] : data?.auth?.[0] || data

        if (authRecord?.token) {
          return saveLoginResponse(buildDemoLoginResponse(authRecord), payload.username)
        }
      }

      console.error('[authApi.login] request failed:', err)
      console.error('Response data:', err?.response?.data)
      console.error('Response status:', err?.response?.status)
      throw err
    }
  },
  recoverPassword: async (emailData) => {
    return {
      ok: false,
      unsupported: true,
      email: emailData?.email,
      message: 'El backend actual no expone recuperacion de contrasena.',
    }
  },
}

export default authApi
