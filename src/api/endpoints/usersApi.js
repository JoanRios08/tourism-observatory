import axiosClient from '../axiosClient'

const userApi = {
  getUsers: () => axiosClient.get('/users'),
  getUserById: (id) => axiosClient.get(`/users/${id}`),
  createUser: (data) => axiosClient.post('/users', data),
  updateUser: (id, data) => axiosClient.put(`/users/${id}`, data),
  deleteUser: (id) => axiosClient.delete(`/users/${id}`),
  getLeaders: () => axiosClient.get('/users/leaders'),
}

export default userApi