import {
  extractCollection,
  normalizeCampus,
  normalizeCampusCareer,
  normalizeCareer,
} from './observatoryAdapters'

export const initialAcademicFields = {
  campus_id: '',
  career_id: '',
  campus_career_id: '',
}

export const normalizeAcademicOptions = (payload) => ({
  campuses: extractCollection(payload, ['campuses'])
    .map(normalizeCampus)
    .filter((item) => item.id),
  careers: extractCollection(payload, ['careers'])
    .map(normalizeCareer)
    .filter((item) => item.id),
  campusCareers: extractCollection(payload, ['campusCareers', 'campus_careers'])
    .map(normalizeCampusCareer)
    .filter((item) => item.campus_id && item.career_id),
})

export const getAcademicPayload = (form, campusCareers = []) => {
  const campusId = form.campus_id ? Number(form.campus_id) : undefined
  const careerId = form.career_id ? Number(form.career_id) : undefined
  const relation = campusCareers.find(
    (item) => Number(item.campus_id) === campusId && Number(item.career_id) === careerId,
  )

  return {
    campus_id: campusId,
    career_id: careerId,
    campus_career_id: relation?.id ? Number(relation.id) : undefined,
  }
}

export const getAcademicSearchText = (item) =>
  [item.campusName, item.campus_name, item.careerName, item.career_name].filter(Boolean).join(' ')
