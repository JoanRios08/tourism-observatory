import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import academicApi from '../../api/endpoints/academicApi'
import authorsApi from '../../api/endpoints/authorsApi'
import projectsApi from '../../api/endpoints/projectsApi'
import {
  getAvailableCareers,
  getAcademicPayload,
  getAcademicSearchText,
  initialAcademicFields,
  normalizeAcademicOptions,
  resolveAcademicFields,
} from '../../utils/academicOptions'
import { extractCollection, formatDate, normalizeProject } from '../../utils/observatoryAdapters'

const initialForm = {
  name: '',
  description: '',
  status: 'active',
  start_date: '',
  end_date: '',
  author_id: '',
  ...initialAcademicFields,
}

const statusColor = {
  active: 'success',
  completed: 'primary',
  suspended: 'warning',
}

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [authors, setAuthors] = useState([])
  const [academicOptions, setAcademicOptions] = useState({
    campuses: [],
    careers: [],
    campusCareers: [],
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [campusFilter, setCampusFilter] = useState('')
  const [careerFilter, setCareerFilter] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [projectsResponse, authorsResponse, academicResponse] = await Promise.all([
        projectsApi.getProjects(),
        authorsApi.getAuthors(),
        academicApi.getOptions().catch(() => ({ data: {} })),
      ])

      const authorItems = extractCollection(authorsResponse.data, ['authors'])
      const authorNameById = new Map(authorItems.map((author) => [author.id, author.name || '']))

      const normalizedAcademicOptions = normalizeAcademicOptions(academicResponse.data)
      const projectItems = extractCollection(projectsResponse.data, ['projects']).map((project) =>
        resolveAcademicFields(
          normalizeProject({
            ...project,
            author_name: project.author_name || authorNameById.get(project.author_id) || '',
          }),
          normalizedAcademicOptions,
        ),
      )

      setAuthors(authorItems)
      setProjects(projectItems)
      setAcademicOptions(normalizedAcademicOptions)
    } catch (fetchError) {
      console.error('Error loading projects', fetchError)
      setProjects([])
      setAuthors([])
      setError('No se pudieron cargar los proyectos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        project.name.toLowerCase().includes(q) ||
        project.authorName.toLowerCase().includes(q) ||
        getAcademicSearchText(project).toLowerCase().includes(q)
      const matchesStatus = !statusFilter || project.status === statusFilter
      const matchesAuthor = !authorFilter || String(project.author_id) === authorFilter
      const matchesCampus = !campusFilter || String(project.campus_id) === campusFilter
      const matchesCareer = !careerFilter || String(project.career_id) === careerFilter
      return matchesSearch && matchesStatus && matchesAuthor && matchesCampus && matchesCareer
    })
  }, [authorFilter, campusFilter, careerFilter, projects, search, statusFilter])

  const latestProject = projects[0]

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...initialForm, author_id: authors[0]?.id ? String(authors[0].id) : '' })
    setModalVisible(true)
  }

  const openEdit = (project) => {
    setEditingId(project.id)
    setForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'active',
      start_date: project.startDate || '',
      end_date: project.endDate || '',
      author_id: project.author_id ? String(project.author_id) : '',
      campus_id: project.campus_id ? String(project.campus_id) : '',
      career_id: project.career_id ? String(project.career_id) : '',
      campus_career_id: project.campus_career_id ? String(project.campus_career_id) : '',
    })
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setEditingId(null)
    setForm(initialForm)
  }

  const careerOptions = getAvailableCareers(form.campus_id, academicOptions)

  const updateCampus = (campusId) => {
    const availableCareers = getAvailableCareers(campusId, academicOptions)
    const careerStillAvailable = availableCareers.some(
      (career) => String(career.id) === String(form.career_id),
    )

    setForm({
      ...form,
      campus_id: campusId,
      career_id: careerStillAvailable ? form.career_id : '',
      campus_career_id: '',
    })
  }

  const saveProject = async () => {
    if (!form.name.trim() || !form.author_id) {
      alert('Nombre y autor son obligatorios.')
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      status: form.status,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      author_id: Number(form.author_id),
      ...getAcademicPayload(form, academicOptions.campusCareers),
    }

    setSaving(true)
    try {
      if (editingId) {
        await projectsApi.updateProject(editingId, payload)
      } else {
        await projectsApi.createProject(payload)
      }
      closeModal()
      await loadData()
    } catch (saveError) {
      console.error('Error saving project', saveError)
      alert('No se pudo guardar el proyecto.')
    } finally {
      setSaving(false)
    }
  }

  const removeProject = async (project) => {
    if (!window.confirm(`Eliminar proyecto "${project.name}"?`)) return

    try {
      await projectsApi.deleteProject(project.id)
      setProjects((current) => current.filter((item) => item.id !== project.id))
    } catch (deleteError) {
      console.error('Error deleting project', deleteError)
      alert('No se pudo eliminar el proyecto.')
    }
  }

  return (
    <>
      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CRow className="mb-4">
        <CCol xl={8}>
          <CCard className="h-100">
            <CCardBody>
              <div className="text-medium-emphasis mb-2">Resumen de proyectos</div>
              <h3 className="mb-2">{projects.length} proyectos cargados</h3>
              <p className="mb-0 text-body-secondary">
                Esta vista ahora trabaja con `name`, `author_id`, `status`, `start_date` y
                `end_date`, que son los campos que valida el backend.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard className="h-100">
            <CCardBody>
              <div className="text-medium-emphasis mb-2">Último proyecto</div>
              <h5 className="mb-1">{latestProject?.name || 'Sin proyectos'}</h5>
              <div className="small text-body-secondary">
                {latestProject
                  ? `${latestProject.authorName || 'Sin autor'} • ${formatDate(latestProject.created_at)}`
                  : 'Aún no hay registros'}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-end g-3">
            <CCol md={3}>
              <CFormLabel>Buscar</CFormLabel>
              <CInputGroup>
                <CFormInput
                  placeholder="Nombre, autor, núcleo o carrera"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol md={2}>
              <CFormLabel>Estado</CFormLabel>
              <CFormSelect
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Todos</option>
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="suspended">Suspendido</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormLabel>Autor</CFormLabel>
              <CFormSelect
                value={authorFilter}
                onChange={(event) => setAuthorFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel>Núcleo / Extensión</CFormLabel>
              <CFormSelect
                value={campusFilter}
                onChange={(event) => setCampusFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {academicOptions.campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2}>
              <CFormLabel>Carrera</CFormLabel>
              <CFormSelect
                value={careerFilter}
                onChange={(event) => setCareerFilter(event.target.value)}
              >
                <option value="">Todas</option>
                {academicOptions.careers.map((career) => (
                  <option key={career.id} value={career.id}>
                    {career.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={12} className="d-flex justify-content-end">
              <CButton color="primary" onClick={openCreate}>
                Crear proyecto
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner />
            </div>
          ) : (
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>ID</CTableHeaderCell>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Autor</CTableHeaderCell>
                  <CTableHeaderCell>Núcleo / Extensión</CTableHeaderCell>
                  <CTableHeaderCell>Carrera</CTableHeaderCell>
                  <CTableHeaderCell>Estado</CTableHeaderCell>
                  <CTableHeaderCell>Inicio</CTableHeaderCell>
                  <CTableHeaderCell>Fin</CTableHeaderCell>
                  <CTableHeaderCell>Actualizado</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 120 }}>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredProjects.map((project) => (
                  <CTableRow key={project.id}>
                    <CTableDataCell>{project.id}</CTableDataCell>
                    <CTableDataCell>{project.name}</CTableDataCell>
                    <CTableDataCell>{project.authorName || 'Sin autor'}</CTableDataCell>
                    <CTableDataCell>{project.campusName || 'Sin asignar'}</CTableDataCell>
                    <CTableDataCell>{project.careerName || 'Sin asignar'}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={statusColor[project.status] || 'secondary'}>
                        {project.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{formatDate(project.start_date)}</CTableDataCell>
                    <CTableDataCell>{formatDate(project.end_date)}</CTableDataCell>
                    <CTableDataCell>{project.updatedLabel}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="transparent"
                        className="me-2"
                        onClick={() => openEdit(project)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        size="sm"
                        color="transparent"
                        className="text-danger"
                        onClick={() => removeProject(project)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={modalVisible} onClose={closeModal}>
        <CModalHeader>
          <CModalTitle>{editingId ? 'Editar proyecto' : 'Crear proyecto'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Descripción</CFormLabel>
            <CFormTextarea
              rows={4}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Autor</CFormLabel>
            <CFormSelect
              value={form.author_id}
              onChange={(event) => setForm({ ...form, author_id: event.target.value })}
            >
              <option value="">Seleccione un autor</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Estado</CFormLabel>
            <CFormSelect
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value="active">Activo</option>
              <option value="completed">Completado</option>
              <option value="suspended">Suspendido</option>
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Núcleo / Extensión</CFormLabel>
            <CFormSelect
              value={form.campus_id}
              onChange={(event) => updateCampus(event.target.value)}
            >
              <option value="">Seleccione núcleo o extensión</option>
              {academicOptions.campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Carrera</CFormLabel>
            <CFormSelect
              value={form.career_id}
              onChange={(event) =>
                setForm({ ...form, career_id: event.target.value, campus_career_id: '' })
              }
            >
              <option value="">Seleccione una carrera</option>
              {careerOptions.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.name}
                </option>
              ))}
            </CFormSelect>
          </div>
          <CRow>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Fecha de inicio</CFormLabel>
                <CFormInput
                  type="date"
                  value={form.start_date}
                  onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                />
              </div>
            </CCol>
            <CCol md={6}>
              <div className="mb-3">
                <CFormLabel>Fecha de fin</CFormLabel>
                <CFormInput
                  type="date"
                  value={form.end_date}
                  onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                />
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={saveProject}>
            {saving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Projects
