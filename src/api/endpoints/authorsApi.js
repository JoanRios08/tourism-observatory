import axiosClient from '../axiosClient'

const authorsApi = {
  getAuthors: () => axiosClient.get('/authors'),
  getAuthorById: (id) => axiosClient.get(`/authors/${id}`),
  createAuthor: (data) => axiosClient.post('/authors', data),
  updateAuthor: (id, data) => axiosClient.put(`/authors/${id}`, data),
  deleteAuthor: (id) => axiosClient.delete(`/authors/${id}`),
}

export default authorsApi
