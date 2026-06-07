import axiosClient from '../axiosClient'

const getCollection = (payload, key) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.[key])) return payload[key]
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const getCampusCareers = () =>
  axiosClient.get('/campus-careers').catch(() => axiosClient.get('/campus_careers'))

const academicApi = {
  getOptions: () =>
    axiosClient.get('/academic-options').catch(async () => {
      const [campusesResponse, careersResponse, campusCareersResponse] = await Promise.all([
        axiosClient.get('/campuses'),
        axiosClient.get('/careers'),
        getCampusCareers(),
      ])

      return {
        data: {
          campuses: getCollection(campusesResponse.data, 'campuses'),
          careers: getCollection(careersResponse.data, 'careers'),
          campus_careers: getCollection(campusCareersResponse.data, 'campus_careers'),
        },
      }
    }),
  getCampuses: () => axiosClient.get('/campuses'),
  createCampus: (data) => axiosClient.post('/campuses', data),
  updateCampus: (id, data) => axiosClient.put(`/campuses/${id}`, data),
  deleteCampus: (id) => axiosClient.delete(`/campuses/${id}`),
  getCareers: () => axiosClient.get('/careers'),
  createCareer: (data) => axiosClient.post('/careers', data),
  updateCareer: (id, data) => axiosClient.put(`/careers/${id}`, data),
  deleteCareer: (id) => axiosClient.delete(`/careers/${id}`),
  getCampusCareers,
  createCampusCareer: (data) =>
    axiosClient
      .post('/campus-careers', data)
      .catch(() => axiosClient.post('/campus_careers', data)),
  updateCampusCareer: (id, data) =>
    axiosClient
      .put(`/campus-careers/${id}`, data)
      .catch(() => axiosClient.put(`/campus_careers/${id}`, data)),
  deleteCampusCareer: (id) =>
    axiosClient
      .delete(`/campus-careers/${id}`)
      .catch(() => axiosClient.delete(`/campus_careers/${id}`)),
}

export default academicApi
