import axiosClient from '../axiosClient'

const authApi = {
  login: async (credentials) => {
    const { data } = await axiosClient.post('/login', credentials)
    const token = data.data.token
    localStorage.setItem('authToken', token)
    localStorage.setItem('userInfo', JSON.stringify(data.data))
  },
  recoverPassword: async (emailData) => {
    const { data } = await axiosClient.post('/auth/recover_password', emailData)
    return data
  },
}

export default authApi