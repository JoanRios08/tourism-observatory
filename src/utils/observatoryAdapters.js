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
  roleLabel: user.role_name || user.rol || user.role || 'Usuario',
  createdLabel: formatDate(user.created_at || user.createdAt),
  updatedLabel: formatDate(user.updated_at || user.updatedAt),
})

export const normalizeProject = (project) => ({
  ...project,
  id: project.id,
  name: project.name || project.title || '',
  authorName: project.author_name || project.userName || '',
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
  createdLabel: formatDate(document.created_at || document.createdAt),
  updatedLabel: formatDate(document.updated_at || document.updatedAt),
  publishedLabel: formatDate(document.published_at || document.publishedAt),
})
