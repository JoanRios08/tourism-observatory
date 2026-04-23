import axiosClient from '../axiosClient'

const authorsApi = {
  getAuthors: () => axiosClient.get('/authors'),
  getAuthorById: (id) => axiosClient.get(`/authors/${id}`),
}

export default authorsApi
