import axiosClient from '../axiosClient'

const postsApi = {
  getPosts: (noCache = false) =>
    axiosClient.get('/posts', { params: noCache ? { t: Date.now() } : {} }),
  getPostById: (id) => axiosClient.get(`/posts/${id}`),
  createPost: (data) => axiosClient.post('/posts', data),
  updatePost: (id, data) => axiosClient.put(`/posts/${id}`, data),
  deletePost: (id) => axiosClient.delete(`/posts/${id}`),
}

export default postsApi
