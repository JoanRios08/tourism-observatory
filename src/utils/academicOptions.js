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

export const getCampusLabel = (campus) => {
  if (!campus) return ''
  const typeLabel =
    campus.type === 'main_campus' ? 'Nucleo' : campus.type === 'extension' ? 'Extension' : ''
  return [campus.name, campus.state, typeLabel].filter(Boolean).join(' - ')
}

export const getAvailableCareers = (campusId, academicOptions) => {
  if (!campusId) return academicOptions.careers

  const careerIds = new Set(
    academicOptions.campusCareers
      .filter((item) => String(item.campus_id) === String(campusId))
      .map((item) => String(item.career_id)),
  )

  return academicOptions.careers.filter((career) => careerIds.has(String(career.id)))
}

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

export const resolveAcademicFields = (item, academicOptions) => {
  const relation =
    item.campus_career_id &&
    academicOptions.campusCareers.find((campusCareer) => {
      return String(campusCareer.id) === String(item.campus_career_id)
    })

  const campusId = item.campus_id ?? relation?.campus_id ?? null
  const careerId = item.career_id ?? relation?.career_id ?? null
  const campus = academicOptions.campuses.find((entry) => String(entry.id) === String(campusId))
  const career = academicOptions.careers.find((entry) => String(entry.id) === String(careerId))

  return {
    ...item,
    campus_id: campusId,
    career_id: careerId,
    campus_career_id: item.campus_career_id ?? relation?.id ?? null,
    campusName: item.campusName || item.campus_name || getCampusLabel(campus),
    careerName: item.careerName || item.career_name || career?.name || '',
  }
}
