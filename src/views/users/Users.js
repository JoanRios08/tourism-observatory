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
  CFormFeedback,
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
import CIcon from '@coreui/icons-react'
import { cilLowVision, cilViewColumn } from '@coreui/icons'

const initialCreateForm = {
  first_name: '',
  last_name: '',
  dni_type: 'V',
  dni: '',
  email: '',
  password: '',
  confirm_password: '',
  role_id: 1,
}

const initialEditForm = {
  id: null,
  first_name: '',
  last_name: '',
  dni: '',
  email: '',
  password: '',
  confirm_password: '',
  role_id: 1,
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const alphanumericRegex = /^[a-zA-Z0-9]+$/

const getCreateDniValue = (form) => {
  const dni = form.dni.trim()
  return dni ? `${form.dni_type}-${dni}` : ''
}

const roleColor = (roleLabel) => {
  const role = String(roleLabel || '').toLowerCase()
  if (role.includes('admin')) return 'primary'
  if (role.includes('coord')) return 'success'
  if (role.includes('prof')) return 'info'
  return 'secondary'
}

const validateCreateUserFields = (form) => {
  const errors = {}
  const firstName = form.first_name.trim()
  const lastName = form.last_name.trim()
  const dni = form.dni.trim()
  const email = form.email.trim()
  const password = form.password

  if (!firstName) {
    errors.first_name = 'El nombre es obligatorio.'
  }

  if ((firstName + lastName).length > 40) {
    errors.first_name = 'La suma del nombre y apellido no puede superar los 40 caracteres.'
    errors.last_name = 'La suma del nombre y apellido no puede superar los 40 caracteres.'
  }

  if (dni.startsWith('0')) {
    errors.dni = 'La cédula de identidad no puede comenzar con el número 0.'
  }

  if (!email) {
    errors.email = 'El email es obligatorio.'
  } else if (!emailRegex.test(email)) {
    errors.email = 'Ingresa un email válido. Ejemplo: usuario@dominio.com.'
  }

  if (!password.trim()) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (password.length < 6 || !alphanumericRegex.test(password)) {
    errors.password =
      'La contraseña debe tener al menos 6 caracteres y contener solo letras y números.'
  }

  if (!form.confirm_password.trim()) {
    errors.confirm_password = 'Confirma la contraseña.'
  } else if (form.password !== form.confirm_password) {
    errors.confirm_password = 'La contraseña y su confirmación deben coincidir.'
  }

  return errors
}

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false)
  const [showEditPassword, setShowEditPassword] = useState(false)
  const [showEditConfirmPassword, setShowEditConfirmPassword] = useState(false)
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

  const createErrors = useMemo(() => validateCreateUserFields(createForm), [createForm])
  const canCreateUser = Object.keys(createErrors).length === 0

  const openCreate = () => {
    setCreateForm(initialCreateForm)
    setShowCreatePassword(false)
    setShowCreateConfirmPassword(false)
    setShowCreate(true)
  }

  const openEdit = (user) => {
    setEditForm({
      id: user.id,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      dni: user.dni || '',
      email: user.email || '',
      password: '',
      confirm_password: '',
      role_id: user.role_id || 1,
    })
    setShowEditPassword(false)
    setShowEditConfirmPassword(false)
    setShowEdit(true)
  }

  const handleSaveCreate = async () => {
    if (!canCreateUser) {
      return
    }

    try {
      await userApi.createUser({
        first_name: createForm.first_name.trim(),
        last_name: createForm.last_name.trim(),
        dni: getCreateDniValue(createForm),
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

    if (editForm.password || editForm.confirm_password) {
      if (!editForm.password.trim() || !editForm.confirm_password.trim()) {
        alert('Si vas a cambiar la contraseña, debes completar ambos campos.')
        return
      }

      if (editForm.password !== editForm.confirm_password) {
        alert('La contraseña y su confirmación deben coincidir.')
        return
      }
    }

    try {
      const payload = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
        role_id: Number(editForm.role_id),
      }

      if (editForm.password.trim()) {
        payload.password = editForm.password
      }

      await userApi.updateUser(editForm.id, payload)
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
              invalid={Boolean(createErrors.first_name)}
              value={createForm.first_name}
              onChange={(event) => setCreateForm({ ...createForm, first_name: event.target.value })}
            />
            <CFormFeedback invalid>{createErrors.first_name}</CFormFeedback>
          </div>
          <div className="mb-3">
            <CFormLabel>Apellido</CFormLabel>
            <CFormInput
              invalid={Boolean(createErrors.last_name)}
              value={createForm.last_name}
              onChange={(event) => setCreateForm({ ...createForm, last_name: event.target.value })}
            />
            <CFormFeedback invalid>{createErrors.last_name}</CFormFeedback>
          </div>
          <div className="mb-3">
            <CFormLabel>Cédula</CFormLabel>
            <CInputGroup className="has-validation">
              <CFormSelect
                value={createForm.dni_type}
                onChange={(event) => setCreateForm({ ...createForm, dni_type: event.target.value })}
                style={{ maxWidth: 88 }}
              >
                <option value="V">V</option>
                <option value="E">E</option>
                <option value="J">J</option>
              </CFormSelect>
              <CFormInput
                invalid={Boolean(createErrors.dni)}
                value={createForm.dni}
                onChange={(event) => setCreateForm({ ...createForm, dni: event.target.value })}
              />
              <CFormFeedback invalid>{createErrors.dni}</CFormFeedback>
            </CInputGroup>
          </div>
          <div className="mb-3">
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              invalid={Boolean(createErrors.email)}
              type="email"
              value={createForm.email}
              onChange={(event) => setCreateForm({ ...createForm, email: event.target.value })}
            />
            <CFormFeedback invalid>{createErrors.email}</CFormFeedback>
          </div>
          <div className="mb-3">
            <CFormLabel>Contraseña</CFormLabel>
            <CInputGroup className="has-validation">
              <CFormInput
                invalid={Boolean(createErrors.password)}
                type={showCreatePassword ? 'text' : 'password'}
                value={createForm.password}
                onChange={(event) => setCreateForm({ ...createForm, password: event.target.value })}
              />
              <CButton
                type="button"
                color="light"
                variant="ghost"
                onClick={() => setShowCreatePassword((current) => !current)}
              >
                <CIcon icon={showCreatePassword ? cilLowVision : cilViewColumn} />
              </CButton>
              <CFormFeedback invalid>{createErrors.password}</CFormFeedback>
            </CInputGroup>
          </div>
          <div className="mb-3">
            <CFormLabel>Confirmar contraseña</CFormLabel>
            <CInputGroup className="has-validation">
              <CFormInput
                invalid={Boolean(createErrors.confirm_password)}
                type={showCreateConfirmPassword ? 'text' : 'password'}
                value={createForm.confirm_password}
                onChange={(event) =>
                  setCreateForm({ ...createForm, confirm_password: event.target.value })
                }
              />
              <CButton
                type="button"
                color="light"
                variant="ghost"
                onClick={() => setShowCreateConfirmPassword((current) => !current)}
              >
                <CIcon icon={showCreateConfirmPassword ? cilLowVision : cilViewColumn} />
              </CButton>
              <CFormFeedback invalid>{createErrors.confirm_password}</CFormFeedback>
            </CInputGroup>
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
          <CButton color="primary" disabled={!canCreateUser} onClick={handleSaveCreate}>
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
            <CFormLabel>Email</CFormLabel>
            <CFormInput
              type="email"
              value={editForm.email}
              onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Nueva contraseña</CFormLabel>
            <CInputGroup>
              <CFormInput
                type={showEditPassword ? 'text' : 'password'}
                value={editForm.password}
                onChange={(event) => setEditForm({ ...editForm, password: event.target.value })}
                placeholder="Deja este campo vacío si no deseas cambiarla"
              />
              <CButton
                type="button"
                color="light"
                variant="ghost"
                onClick={() => setShowEditPassword((current) => !current)}
              >
                <CIcon icon={showEditPassword ? cilLowVision : cilViewColumn} />
              </CButton>
            </CInputGroup>
          </div>
          <div className="mb-3">
            <CFormLabel>Confirmar nueva contraseña</CFormLabel>
            <CInputGroup>
              <CFormInput
                type={showEditConfirmPassword ? 'text' : 'password'}
                value={editForm.confirm_password}
                onChange={(event) =>
                  setEditForm({ ...editForm, confirm_password: event.target.value })
                }
                placeholder="Repite la nueva contraseña"
              />
              <CButton
                type="button"
                color="light"
                variant="ghost"
                onClick={() => setShowEditConfirmPassword((current) => !current)}
              >
                <CIcon icon={showEditConfirmPassword ? cilLowVision : cilViewColumn} />
              </CButton>
            </CInputGroup>
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
