import axiosClient from '../axiosClient'

// Use relative paths so the Vite dev server proxy can forward requests and avoid CORS in development.
const postsApi = {
  // use /api prefix so Vite dev server proxy (vite.config.mjs) forwards to backend and avoids CORS
  // pass `noCache=true` to add a cache-busting query param when needed
  getPosts: (noCache = false) => axiosClient.get('/posts', { params: noCache ? { t: Date.now() } : {} }),
  getPostById: (id) => axiosClient.get(`/posts/${id}`),
  createPost: (data) => axiosClient.post('/posts', data),
  updatePost: (id, data) => axiosClient.put(`/posts/${id}`, data),
  deletePost: (id) => axiosClient.delete(`/posts/${id}`),
}

export default postsApi