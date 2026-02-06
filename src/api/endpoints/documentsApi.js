import axiosClient from '../axiosClient'

// Wrapper for /documents endpoints. Uses relative paths so Vite dev proxy forwards requests.
const documentsApi = {
  getDocuments: (noCache = false) => axiosClient.get('/documents', { params: noCache ? { t: Date.now() } : {} }),
  getDocumentById: (id) => axiosClient.get(`/documents/${id}`),
  createDocument: (data) => axiosClient.post('/documents', data),
  updateDocument: (id, data) => axiosClient.put(`/documents/${id}`, data), // Cambiar patch por put
  deleteDocument: (id) => axiosClient.delete(`/documents/${id}`),
}

export default documentsApi
