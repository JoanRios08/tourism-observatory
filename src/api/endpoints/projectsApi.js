import axiosClient from '../axiosClient'

const projectsApi = {
  getProjects: () => axiosClient.get('/projects'),
  getProjectById: (id) => axiosClient.get(`/projects/${id}`),
  createProject: (data) => axiosClient.post('/projects', data),
  updateProject: (id, data) => axiosClient.put(`/projects/${id}`, data),
  deleteProject: (id) => axiosClient.delete(`/projects/${id}`),
}

export default projectsApi
