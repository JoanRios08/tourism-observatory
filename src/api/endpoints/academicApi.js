import axiosClient from '../axiosClient'

const academicApi = {
  getOptions: () => axiosClient.get('/academic-options'),
}

export default academicApi
