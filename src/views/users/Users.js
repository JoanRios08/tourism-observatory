import React, { useEffect, useMemo, useState } from 'react'
import userApi from '../../api/endpoints/usersApi'
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
import { extractCollection, normalizeUser } from '../../utils/observatoryAdapters'

const initialCreateForm = {
  first_name: '',
  last_name: '',
  dni: '',
  email: '',
  password: '',
  role_id: 1,
}

const initialEditForm = {
  id: null,
  first_name: '',
  last_name: '',
  dni: '',
  email: '',
  role_id: 1,
}

const roleColor = (roleLabel) => {
  const role = String(roleLabel || '').toLowerCase()
  if (role.includes('admin')) return 'primary'
  if (role.includes('coord')) return 'success'
  if (role.includes('prof')) return 'info'
  return 'secondary'
}

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [createForm, setCreateForm] = useState(initialCreateForm)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const loadUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await userApi.getUsers()
      const items = extractCollection(response.data, ['users']).map(normalizeUser)
      setUsers(items)
    } catch (fetchError) {
      console.error('Error loading users', fetchError)
      setUsers([])
      setError('No se pudieron cargar los usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users

    return users.filter((user) => {
      return [user.displayName, user.dni, user.email, user.roleLabel].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(q),
      )
    })
  }, [search, users])

  const openCreate = () => {
    setCreateForm(initialCreateForm)
    setShowCreate(true)
  }

  const openEdit = (user) => {
    setEditForm({
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      dni: user.dni || '',
      email: user.email || '',
      role_id: user.role_id || 1,
    })
    setShowEdit(true)
  }

  const handleSaveCreate = async () => {
    if (!createForm.first_name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      alert('Nombre, email y contraseña son obligatorios.')
      return
    }

    try {
      await userApi.createUser({
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
        dni: createForm.dni.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role_id: Number(createForm.role_id),
      })
      setShowCreate(false)
      setCreateForm(initialCreateForm)
      await loadUsers()
    } catch (saveError) {
      console.error('Error creating user', saveError)
      alert('No se pudo crear el usuario.')
    }
  }

  const handleSaveEdit = async () => {
    if (!editForm.id || !editForm.first_name.trim() || !editForm.email.trim()) {
      alert('Nombre e email son obligatorios.')
      return
    }

    try {
      await userApi.updateUser(editForm.id, {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        dni: editForm.dni.trim(),
        email: editForm.email.trim(),
        role_id: Number(editForm.role_id),
      })
      setShowEdit(false)
      setEditForm(initialEditForm)
      await loadUsers()
    } catch (saveError) {
      console.error('Error updating user', saveError)
      alert('No se pudo actualizar el usuario.')
    }
  }

  const openDelete = (user) => {
    setDeleteTarget(user)
    setShowDelete(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return

    try {
      await userApi.deleteUser(deleteTarget.id)
      setUsers((current) => current.filter((user) => user.id !== deleteTarget.id))
      setShowDelete(false)
      setDeleteTarget(null)
    } catch (deleteError) {
      console.error('Error deleting user', deleteError)
      alert('No se pudo eliminar el usuario.')
    }
  }

  return (
    <>
      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-center g-3">
            <CCol md={8}>
              <CFormLabel>Buscar</CFormLabel>
              <CInputGroup>
                <CFormInput
                  placeholder="Cédula, nombre, email o rol"
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
                Crear usuario
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
                  <CTableHeaderCell>Cédula</CTableHeaderCell>
                  <CTableHeaderCell>Nombre</CTableHeaderCell>
                  <CTableHeaderCell>Apellido</CTableHeaderCell>
                  <CTableHeaderCell>Email</CTableHeaderCell>
                  <CTableHeaderCell>Rol</CTableHeaderCell>
                  <CTableHeaderCell>Creado</CTableHeaderCell>
                  <CTableHeaderCell>Actualizado</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: 150 }}>Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredUsers.map((user) => (
                  <CTableRow key={user.id}>
                    <CTableDataCell>{user.dni || user.id}</CTableDataCell>
                    <CTableDataCell>{user.first_name}</CTableDataCell>
                    <CTableDataCell>{user.last_name}</CTableDataCell>
                    <CTableDataCell>{user.email}</CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={roleColor(user.roleLabel)}>{user.roleLabel}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{user.createdLabel}</CTableDataCell>
                    <CTableDataCell>{user.updatedLabel}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="info"
                        className="me-2"
                        onClick={() => openEdit(user)}
                      >
                        Editar
                      </CButton>
                      <CButton size="sm" color="danger" onClick={() => openDelete(user)}>
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

      <CModal visible={showCreate} onClose={() => setShowCreate(false)}>
        <CModalHeader>
          <CModalTitle>Crear usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              value={createForm.first_name}
              onChange={(event) => setCreateForm({ ...createForm, first_name: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Apellido</CFormLabel>
            <CFormInput
              value={createForm.last_name}
              onChange={(event) => setCreateForm({ ...createForm, last_name: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Cédula</CFormLabel>
            <CFormInput
              value={createForm.dni}
              onChange={(event) => setCreateForm({ ...createForm, dni: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Contraseña</CFormLabel>
            <CFormInput
              type="password"
              value={createForm.password}
              onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Rol</CFormLabel>
            <CFormSelect
              value={createForm.role_id}
              onChange={(event) =>
                setCreateForm({ ...createForm, role_id: Number(event.target.value) })
              }
            >
              <option value={1}>Administrador</option>
              <option value={2}>Coordinador</option>
              <option value={3}>Profesor</option>
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCreate(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSaveCreate}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showEdit} onClose={() => setShowEdit(false)}>
        <CModalHeader>
          <CModalTitle>Editar usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              value={editForm.first_name}
              onChange={(event) => setEditForm({ ...editForm, first_name: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Apellido</CFormLabel>
            <CFormInput
              value={editForm.last_name}
              onChange={(event) => setEditForm({ ...editForm, last_name: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Cédula</CFormLabel>
            <CFormInput
              value={editForm.dni}
              onChange={(event) => setEditForm({ ...editForm, dni: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              value={editForm.email}
              onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Rol</CFormLabel>
            <CFormSelect
              value={editForm.role_id}
              onChange={(event) =>
                setEditForm({ ...editForm, role_id: Number(event.target.value) })
              }
            >
              <option value={1}>Administrador</option>
              <option value={2}>Coordinador</option>
              <option value={3}>Profesor</option>
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowEdit(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSaveEdit}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showDelete} onClose={() => setShowDelete(false)}>
        <CModalHeader>
          <CModalTitle>Eliminar usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {deleteTarget
            ? `¿Eliminar a ${deleteTarget.displayName || deleteTarget.email}?`
            : '¿Eliminar usuario?'}
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

export default Users
