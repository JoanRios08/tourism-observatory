import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
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
import documentsApi from '../../api/endpoints/documentsApi'
import projectsApi from '../../api/endpoints/projectsApi'
import userApi from '../../api/endpoints/usersApi'
import {
  extractCollection,
  getUserDisplayName,
  normalizeDocument,
  normalizeProject,
  normalizeUser,
} from '../../utils/observatoryAdapters'

const initialForm = {
  title: '',
  description: '',
  type: '',
  file_url: '',
  author_id: '',
  project_id: '',
  published_at: '',
}

const Documents = () => {
  const [documents, setDocuments] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [documentsResponse, projectsResponse, usersResponse] = await Promise.all([
        documentsApi.getDocuments(true),
        projectsApi.getProjects(),
        userApi.getUsers(),
      ])

      const userItems = extractCollection(usersResponse.data, ['users']).map(normalizeUser)
      const projectItems = extractCollection(projectsResponse.data, ['projects']).map(
        normalizeProject,
      )
      const projectsById = new Map(projectItems.map((project) => [project.id, project]))
      const usersById = new Map(userItems.map((user) => [user.id, user]))

      const documentItems = extractCollection(documentsResponse.data, ['documents']).map(
        (document) => normalizeDocument(document, projectsById, usersById),
      )

      setUsers(userItems)
      setProjects(projectItems)
      setDocuments(documentItems)
    } catch (fetchError) {
      console.error('Error loading documents', fetchError)
      setUsers([])
      setProjects([])
      setDocuments([])
      setError('No se pudieron cargar los documentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        !q ||
        document.title.toLowerCase().includes(q) ||
        document.authorName.toLowerCase().includes(q) ||
        document.projectName.toLowerCase().includes(q)
      const matchesType = !typeFilter || document.type === typeFilter
      const matchesAuthor = !authorFilter || String(document.author_id) === authorFilter
      return matchesSearch && matchesType && matchesAuthor
    })
  }, [authorFilter, documents, search, typeFilter])

  const typeOptions = [...new Set(documents.map((document) => document.type).filter(Boolean))]
  const latestDocument = documents[0]

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...initialForm, author_id: users[0]?.id ? String(users[0].id) : '' })
    setModalVisible(true)
  }

  const openEdit = (document) => {
    setEditingId(document.id)
    setForm({
      title: document.title || '',
      description: document.description || '',
      type: document.type || '',
      file_url: document.file_url || '',
      author_id: document.author_id ? String(document.author_id) : '',
      project_id: document.project_id ? String(document.project_id) : '',
      published_at: document.published_at
        ? new Date(document.published_at).toISOString().slice(0, 10)
        : '',
    })
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setEditingId(null)
    setForm(initialForm)
  }

  const saveDocument = async () => {
    if (!form.title.trim() || !form.type.trim() || !form.author_id) {
      alert('Título, tipo y autor son obligatorios.')
      return
    }

    if (!editingId && !form.file_url.trim()) {
      alert('El backend requiere una URL de archivo para crear documentos.')
      return
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type.trim(),
      author_id: Number(form.author_id),
      project_id: form.project_id ? Number(form.project_id) : undefined,
      published_at: form.published_at || undefined,
      ...(form.file_url.trim() ? { file_url: form.file_url.trim() } : {}),
    }

    setSaving(true)
    try {
      if (editingId) {
        await documentsApi.updateDocument(editingId, payload)
      } else {
        await documentsApi.createDocument(payload)
      }
      closeModal()
      await loadData()
    } catch (saveError) {
      console.error('Error saving document', saveError)
      alert('No se pudo guardar el documento.')
    } finally {
      setSaving(false)
    }
  }

  const removeDocument = async (document) => {
    if (!window.confirm(`Eliminar documento "${document.title}"?`)) return

    try {
      await documentsApi.deleteDocument(document.id)
      setDocuments((current) => current.filter((item) => item.id !== document.id))
    } catch (deleteError) {
      console.error('Error deleting document', deleteError)
      alert('No se pudo eliminar el documento.')
    }
  }

  return (
    <>
      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CRow className="mb-4">
        <CCol xl={8}>
          <CCard className="h-100">
            <CCardBody>
              <div className="text-medium-emphasis mb-2">Resumen de documentos</div>
              <h3 className="mb-2">{documents.length} documentos cargados</h3>
              <p className="mb-0 text-body-secondary">
                La creación y edición ahora usa `type`, `file_url`, `author_id`, `project_id` y
                `published_at`, igual que el backend.
              </p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard className="h-100">
            <CCardBody>
              <div className="text-medium-emphasis mb-2">Último documento</div>
              <h5 className="mb-1">{latestDocument?.title || 'Sin documentos'}</h5>
              <div className="small text-body-secondary">
                {latestDocument
                  ? `${latestDocument.authorName || 'Sin autor'} • ${latestDocument.createdLabel}`
                  : 'Aún no hay registros'}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-end g-3">
            <CCol md={4}>
              <CFormLabel>Buscar</CFormLabel>
              <CInputGroup>
                <CFormInput
                  placeholder="Título, autor o proyecto"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol md={3}>
              <CFormLabel>Tipo</CFormLabel>
              <CFormSelect
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormLabel>Autor</CFormLabel>
              <CFormSelect
                value={authorFilter}
                onChange={(event) => setAuthorFilter(event.target.value)}
              >
                <option value="">Todos</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {getUserDisplayName(user)}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={2} className="d-flex justify-content-end">
              <CButton color="primary" onClick={openCreate}>
                Crear documento
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
                  <CTableHeaderCell>Título</CTableHeaderCell>
                  <CTableHeaderCell>Tipo</CTableHeaderCell>
                  <CTableHeaderCell>Autor</CTableHeaderCell>
                  <CTableHeaderCell>Proyecto</CTableHeaderCell>
                  <CTableHeaderCell>Publicado</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 120 }}>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredDocuments.map((document) => (
                  <CTableRow key={document.id}>
                    <CTableDataCell>{document.id}</CTableDataCell>
                    <CTableDataCell>{document.title}</CTableDataCell>
                    <CTableDataCell>{document.type}</CTableDataCell>
                    <CTableDataCell>{document.authorName || 'Sin autor'}</CTableDataCell>
                    <CTableDataCell>{document.projectName}</CTableDataCell>
                    <CTableDataCell>
                      {document.publishedLabel || document.createdLabel}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="transparent"
                        className="me-2"
                        onClick={() => openEdit(document)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        size="sm"
                        color="transparent"
                        className="text-danger"
                        onClick={() => removeDocument(document)}
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
          <CModalTitle>{editingId ? 'Editar documento' : 'Crear documento'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Título</CFormLabel>
            <CFormInput
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
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
            <CFormLabel>Tipo</CFormLabel>
            <CFormInput
              value={form.type}
              onChange={(event) => setForm({ ...form, type: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>URL del archivo</CFormLabel>
            <CFormInput
              placeholder="https://..."
              value={form.file_url}
              onChange={(event) => setForm({ ...form, file_url: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Autor</CFormLabel>
            <CFormSelect
              value={form.author_id}
              onChange={(event) => setForm({ ...form, author_id: event.target.value })}
            >
              <option value="">Seleccione un autor</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {getUserDisplayName(user)}
                </option>
              ))}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Proyecto</CFormLabel>
            <CFormSelect
              value={form.project_id}
              onChange={(event) => setForm({ ...form, project_id: event.target.value })}
            >
              <option value="">Sin proyecto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Fecha de publicación</CFormLabel>
            <CFormInput
              type="date"
              value={form.published_at}
              onChange={(event) => setForm({ ...form, published_at: event.target.value })}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeModal}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={saveDocument}>
            {saving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Documents
