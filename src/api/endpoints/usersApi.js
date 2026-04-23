import axiosClient from '../axiosClient'

const userApi = {
  getUsers: () => axiosClient.get('/users'),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  createUser: (data) => axiosClient.post('/users', data),

  updateUser: (id, data) =>
    axiosClient.put(`/users/${id}`, data).catch((err) => {
      if (err?.response?.status === 404) {
        return axiosClient.patch(`/users/${id}`, data)
      }
      return Promise.reject(err)
    }),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
  getLeaders: () => axiosClient.get('/users/leaders'),
}

export default userApi
