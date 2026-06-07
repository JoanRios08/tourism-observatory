export const extractCollection = (payload, keys = []) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  if (Array.isArray(payload.data)) return payload.data
  return []
}

export const formatDate = (value) => {
  if (!value) return ''

  try {
    return new Date(value).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch (error) {
    return String(value)
  }
}

export const toDateInputValue = (value) => {
  if (!value) return ''

  try {
    return new Date(value).toISOString().slice(0, 10)
  } catch (error) {
    return ''
  }
}

export const getUserDisplayName = (user) => {
  if (!user) return ''
  return (
    user.name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.fullName ||
    user.email ||
    ''
  )
}

export const normalizeUser = (user) => ({
  ...user,
  id: user.id ?? user.user_id ?? user.userId ?? null,
  dni: user.dni || user.cedula || '',
  displayName: getUserDisplayName(user),
  first_name: user.first_name || user.nombre || user.name || '',
  last_name: user.last_name || user.apellido || '',
  roleLabel:
    user.role_name ||
    user.rol ||
    user.role ||
    ({ 1: 'Administrador', 2: 'Coordinador', 3: 'Profesor' }[Number(user.role_id)] ?? 'Usuario'),
  createdLabel: formatDate(user.created_at || user.createdAt),
  updatedLabel: formatDate(user.updated_at || user.updatedAt),
})

export const normalizeAuthor = (author) => ({
  ...author,
  id: author.id ?? null,
  name: author.name || '',
  bio: author.bio || '',
  email: author.email || '',
  documents: Array.isArray(author.documents) ? author.documents : [],
  posts: Array.isArray(author.posts) ? author.posts : [],
  projects: Array.isArray(author.projects) ? author.projects : [],
  createdLabel: formatDate(author.created_at || author.createdAt),
  updatedLabel: formatDate(author.updated_at || author.updatedAt),
})

export const normalizeProject = (project) => ({
  ...project,
  id: project.id,
  name: project.name || project.title || '',
  authorName: project.author_name || project.userName || '',
  campus_id: project.campus_id ?? null,
  career_id: project.career_id ?? null,
  campus_career_id: project.campus_career_id ?? null,
  campusName: project.campus_name || project.campusName || '',
  careerName: project.career_name || project.careerName || '',
  status: project.status || 'active',
  startDate: toDateInputValue(project.start_date),
  endDate: toDateInputValue(project.end_date),
  createdLabel: formatDate(project.created_at || project.createdAt),
  updatedLabel: formatDate(project.updated_at || project.updatedAt),
})

export const normalizeDocument = (document, projectsById = new Map(), usersById = new Map()) => ({
  ...document,
  id: document.id,
  title: document.title || '',
  type: document.type || document.category || '',
  author_id: document.author_id ?? null,
  project_id: document.project_id ?? null,
  authorName: document.author_name || getUserDisplayName(usersById.get(document.author_id)) || '',
  projectName: projectsById.get(document.project_id)?.name || 'Sin proyecto',
  campus_id: document.campus_id ?? null,
  career_id: document.career_id ?? null,
  campus_career_id: document.campus_career_id ?? null,
  campusName: document.campus_name || document.campusName || '',
  careerName: document.career_name || document.careerName || '',
  createdLabel: formatDate(document.created_at || document.createdAt),
  updatedLabel: formatDate(document.updated_at || document.updatedAt),
  publishedLabel: formatDate(document.published_at || document.publishedAt),
})

export const normalizeCampus = (campus) => ({
  ...campus,
  id: campus.id ?? campus.campus_id ?? null,
  name: campus.name || campus.label || campus.title || campus.campus_name || '',
  state: campus.state || '',
  type: campus.campus_type || campus.type || campus.kind || campus.category || '',
})

export const normalizeCareer = (career) => ({
  ...career,
  id: career.id ?? career.career_id ?? null,
  name: career.name || career.label || career.title || career.career_name || '',
  acronym: career.acronym || career.code || '',
})

export const normalizeCampusCareer = (campusCareer) => ({
  ...campusCareer,
  id: campusCareer.id ?? campusCareer.campus_career_id ?? null,
  campus_id: campusCareer.campus_id ?? campusCareer.campusId ?? null,
  career_id: campusCareer.career_id ?? campusCareer.careerId ?? null,
})
