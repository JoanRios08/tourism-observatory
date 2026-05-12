import axiosClient from '../axiosClient'
import { saveAuthData } from '../../utils/auth'

const buildLoginPayload = (credentials) => ({
  email: credentials.email,
  password: credentials.password,
})

const isHtmlResponse = (data) => typeof data === 'string' && data.trim().startsWith('<!DOCTYPE html')

const buildDemoLoginResponse = (authRecord) => ({
  token: authRecord.token,
  user: {
    id: authRecord.userId || authRecord.user_id || authRecord.id,
    email: authRecord.email,
  },
})

const saveLoginResponse = (data, email) => {
  const resp = data || {}
  const saved = saveAuthData(resp, email)

  const userInfo = resp.user || resp.data?.user || resp.data || null
  if (userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('user', JSON.stringify(userInfo))
  }

  const userId = resp.userId || userInfo?.id || resp.data?.userId
  const roleId = resp.roleId || userInfo?.role_id || resp.data?.roleId
  const roleName = resp.roleName || userInfo?.role_name || resp.data?.roleName

  if (userId) localStorage.setItem('userId', String(userId))
  if (roleId) localStorage.setItem('roleId', String(roleId))
  if (roleName) localStorage.setItem('roleName', roleName)

  if (!saved) {
    throw new Error('La respuesta del backend no incluye token de autenticacion.')
  }

  return data
}

const authApi = {
  login: async (credentials) => {
    const payload = buildLoginPayload(credentials)

    try {
      const { data } = await axiosClient.post('/login', payload)
      return saveLoginResponse(data, payload.email)
    } catch (err) {
      if (isHtmlResponse(err?.response?.data)) {
        throw new Error(
          'El login esta respondiendo HTML del frontend. Revisa VITE_API_BASE: debe apuntar al backend, no al puerto de Vite.',
        )
      }

      if (err?.response?.status === 404) {
        const { data } = await axiosClient.get('/auth', {
          params: {
            email: payload.email,
            password: payload.password,
          },
        })
        const authRecord = Array.isArray(data) ? data[0] : data?.auth?.[0] || data

        if (authRecord?.token) {
          return saveLoginResponse(buildDemoLoginResponse(authRecord), payload.email)
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
