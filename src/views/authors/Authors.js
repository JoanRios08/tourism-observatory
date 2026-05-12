import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormFeedback,
  CFormInput,
  CFormLabel,
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
import authorsApi from '../../api/endpoints/authorsApi'
import { extractCollection, normalizeAuthor } from '../../utils/observatoryAdapters'

const initialForm = {
  id: null,
  name: '',
  bio: '',
  email: '',
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const getApiError = (error, fallback) => error?.response?.data?.error || error?.message || fallback

const validateAuthorFields = (form) => {
  const errors = {}
  const name = form.name.trim()
  const email = form.email.trim()

  if (!name) {
    errors.name = 'El nombre es obligatorio.'
  } else if (name.length > 100) {
    errors.name = 'El nombre no puede superar los 100 caracteres.'
  }

  if (email && !emailRegex.test(email)) {
    errors.email = 'Ingresa un email valido. Ejemplo: autor@dominio.com.'
  }

  return errors
}

const Authors = () => {
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadAuthors = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await authorsApi.getAuthors()
      const items = extractCollection(response.data, ['authors']).map(normalizeAuthor)
      setAuthors(items)
    } catch (fetchError) {
      console.error('Error loading authors', fetchError)
      setAuthors([])
      setError(getApiError(fetchError, 'No se pudieron cargar los autores.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAuthors()
  }, [loadAuthors])

  const filteredAuthors = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return authors

    return authors.filter((author) =>
      [author.name, author.bio, author.email].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(q),
      ),
    )
  }, [authors, search])

  const formErrors = useMemo(() => validateAuthorFields(form), [form])
  const canSave = Object.keys(formErrors).length === 0 && !saving
  const isEditing = Boolean(form.id)

  const openCreate = () => {
    setForm(initialForm)
    setShowForm(true)
  }

  const openEdit = (author) => {
    setForm({
      id: author.id,
      name: author.name || '',
      bio: author.bio || '',
      email: author.email || '',
    })
    setShowForm(true)
  }

  const saveAuthor = async () => {
    if (!canSave) return

    const payload = {
      name: form.name.trim(),
      bio: form.bio.trim() || null,
      email: form.email.trim() || null,
    }

    setSaving(true)
    try {
      if (isEditing) {
        await authorsApi.updateAuthor(form.id, payload)
      } else {
        await authorsApi.createAuthor(payload)
      }

      setShowForm(false)
      setForm(initialForm)
      await loadAuthors()
    } catch (saveError) {
      console.error('Error saving author', saveError)
      alert(getApiError(saveError, 'No se pudo guardar el autor.'))
    } finally {
      setSaving(false)
    }
  }

  const openDelete = (author) => {
    setDeleteTarget(author)
    setShowDelete(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return

    try {
      await authorsApi.deleteAuthor(deleteTarget.id)
      setAuthors((current) => current.filter((author) => author.id !== deleteTarget.id))
      setShowDelete(false)
      setDeleteTarget(null)
    } catch (deleteError) {
      console.error('Error deleting author', deleteError)
      alert(getApiError(deleteError, 'No se pudo eliminar el autor.'))
    }
  }

  return (
    <>
      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-end g-3">
            <CCol md={8}>
              <CFormLabel>Buscar</CFormLabel>
              <CInputGroup>
                <CFormInput
                  placeholder="Nombre, biografia o email"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <CButton color="secondary" onClick={() => setSearch('')}>
                  Limpiar
                </CButton>
              </CInputGroup>
            </CCol>
            <CCol md={4} className="d-flex justify-content-end">
              <CButton color="primary" onClick={openCreate}>
                Crear autor
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
                  <CTableHeaderCell>Biografia</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Documentos</CTableHeaderCell>
                  <CTableHeaderCell>Posts</CTableHeaderCell>
                  <CTableHeaderCell>Proyectos</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 150 }}>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredAuthors.map((author) => (
                  <CTableRow key={author.id}>
                    <CTableDataCell>{author.id}</CTableDataCell>
                    <CTableDataCell>{author.name}</CTableDataCell>
                    <CTableDataCell>{author.bio}</CTableDataCell>
                    <CTableDataCell>{author.email}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="info">{author.documents.length}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="success">{author.posts.length}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="primary">{author.projects.length}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="info"
                        className="me-2"
                        onClick={() => openEdit(author)}
                      >
                        Editar
                      </CButton>
                      <CButton size="sm" color="danger" onClick={() => openDelete(author)}>
                        Eliminar
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      <CModal visible={showForm} onClose={() => setShowForm(false)}>
        <CModalHeader>
          <CModalTitle>{isEditing ? 'Editar autor' : 'Crear autor'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              invalid={Boolean(formErrors.name)}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <CFormFeedback invalid>{formErrors.name}</CFormFeedback>
          </div>
          <div className="mb-3">
            <CFormLabel>Biografia</CFormLabel>
            <CFormTextarea
              rows={4}
              value={form.bio}
              onChange={(event) => setForm({ ...form, bio: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              invalid={Boolean(formErrors.email)}
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <CFormFeedback invalid>{formErrors.email}</CFormFeedback>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowForm(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={!canSave} onClick={saveAuthor}>
            {saving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showDelete} onClose={() => setShowDelete(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar autor</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {deleteTarget
            ? `Eliminar a ${deleteTarget.name || deleteTarget.email}?`
            : 'Eliminar autor?'}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowDelete(false)}>
            Cancelar
          </CButton>
          <CButton color="danger" onClick={confirmDelete}>
            Eliminar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Authors
