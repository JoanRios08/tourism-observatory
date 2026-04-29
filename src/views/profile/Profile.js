import React, { useCallback, useEffect, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CImage,
  CInputGroup,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLowVision, cilViewColumn } from '@coreui/icons'
import { getUserInfoFromToken } from '../../utils/auth'
import userApi from '../../api/endpoints/usersApi'

const initialForm = {
  id: null,
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: '',
  role_id: 1,
}

const normalizeProfile = (user) => {
  const firstName = user.first_name || user.nombre || user.name || 'Usuario'
  const lastName = user.last_name || user.apellido || ''
  const avatarName = [firstName, lastName].filter(Boolean).join(' ') || 'User'

  return {
    ...user,
    id: user.id ?? user.user_id ?? user.userId ?? null,
    dni: user.dni || user.cedula || 'No disponible',
    first_name: firstName,
    last_name: lastName,
    role_id: user.role_id || user.roleId || 1,
    roleLabel: user.role_name || user.rol_name || user.rol || user.role || 'Usuario',
    phone: user.phone || user.telefono || '',
    email: user.email || 'Sin correo',
    created_at: user.created_at || user.createdAt || new Date().toISOString(),
    updated_at: user.updated_at || user.updatedAt || '',
    avatar: user.profile_image_url
      ? `http://tu-servidor.com/uploads/${user.profile_image_url}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(avatarName)}`,
  }
}

const Profile = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userData, setUserData] = useState(null)
  const [form, setForm] = useState(initialForm)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const info = getUserInfoFromToken()
      const userId = info?.id || localStorage.getItem('userId')

      if (!userId) {
        setUserData(null)
        setError('No se encontro el usuario autenticado.')
        return
      }

      const response = await userApi.getUserById(userId)
      const data = response.data?.user || response.data || response
      const profile = normalizeProfile({
        ...data,
        id: data.id ?? data.user_id ?? data.userId ?? userId,
        role_id: data.role_id || data.roleId || info?.role_id,
        rol_name: data.rol_name || info?.rol_name,
      })

      setUserData(profile)
      setForm({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        password: '',
        confirm_password: '',
        role_id: profile.role_id,
      })
    } catch (loadError) {
      console.error('Error cargando perfil', loadError)
      setUserData(null)
      setError('No se pudo cargar la informacion del usuario.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const openEdit = () => {
    if (!userData) return

    setForm({
      id: userData.id,
      first_name: userData.first_name || '',
      last_name: userData.last_name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      password: '',
      confirm_password: '',
      role_id: userData.role_id || 1,
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
    setShowEdit(true)
  }

  const closeEdit = () => {
    setShowEdit(false)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleSaveEdit = async () => {
    if (!form.id || !form.first_name.trim() || !form.email.trim()) {
      alert('Nombre e email son obligatorios.')
      return
    }

    if (form.password || form.confirm_password) {
      if (!form.password.trim() || !form.confirm_password.trim()) {
        alert('Si vas a cambiar la contrasena, debes completar ambos campos.')
        return
      }

      if (form.password !== form.confirm_password) {
        alert('La contrasena y su confirmacion deben coincidir.')
        return
      }
    }

    setSaving(true)
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role_id: Number(form.role_id || userData?.role_id || 1),
      }

      if (form.password.trim()) {
        payload.password = form.password
      }

      await userApi.updateUser(form.id, payload)
      closeEdit()
      await loadProfile()
    } catch (saveError) {
      console.error('Error actualizando perfil', saveError)
      alert('No se pudo actualizar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center p-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center p-5">
        {error || 'No se pudo cargar la informacion del usuario.'}
      </div>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        {error ? <CAlert color="warning">{error}</CAlert> : null}

        <CCard className="mb-4">
          <CCardHeader>Perfil de usuario</CCardHeader>
          <CCardBody>
            <div className="profile-card" style={{ maxWidth: 980, margin: '0 auto' }}>
              <style>{`
                .profile-card { border-radius:12px; overflow:hidden; border: 1px solid #ebedef; }
                .profile-card .profile-split { display:flex; flex-direction:row; }
                .profile-card .profile-left { flex:0 0 320px; background:#fff; padding:24px; display:flex; flex-direction:column; align-items:center; }
                .profile-card .profile-right { flex:1; padding:24px; background: linear-gradient(120deg, #3e8ef7, #7c3aed); color:#fff; display:flex; flex-direction:column; justify-content:space-between; }
                .profile-card .avatar { width:160px; height:160px; border-radius:50%; object-fit:cover; border:6px solid #fff; }
                .profile-card .dates { margin-top:18px; text-align:center; color:#444; }
                .profile-card .info h2 { margin:0; font-size:26px; }
                .profile-card .btn-edit { background:#fff; color:#222; font-weight:700; border:none; padding:10px 20px; border-radius:6px; }
                @media (max-width: 768px) { .profile-card .profile-split { flex-direction:column; } }
              `}</style>
              <div className="profile-split">
                <div className="profile-left">
                  <CImage src={userData.avatar} className="avatar" />
                  <div className="dates">
                    <small className="text-muted">MIEMBRO DESDE</small>
                    <div className="fw-bold mb-2">
                      {new Date(userData.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="profile-right">
                  <div className="info">
                    <h2>
                      {userData.first_name} {userData.last_name}
                      <CBadge color="light" className="ms-2 text-dark">
                        {userData.roleLabel}
                      </CBadge>
                    </h2>
                    <div className="mt-4">
                      <p className="mb-2">
                        <strong>DNI:</strong> {userData.dni}
                      </p>
                      <p className="mb-2">
                        <strong>Telefono:</strong> {userData.phone || 'No registrado'}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong> {userData.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-end mt-3">
                    <CButton className="btn-edit" onClick={openEdit}>
                      Editar
                    </CButton>
                  </div>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <CModal visible={showEdit} onClose={closeEdit} alignment="center">
        <CModalHeader>
          <CModalTitle>Editar perfil</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <div className="mb-3">
              <CFormLabel>Nombre</CFormLabel>
              <CFormInput
                value={form.first_name}
                onChange={(event) => setForm({ ...form, first_name: event.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Apellido</CFormLabel>
              <CFormInput
                value={form.last_name}
                onChange={(event) => setForm({ ...form, last_name: event.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Email</CFormLabel>
              <CFormInput
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Telefono</CFormLabel>
              <CFormInput
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </div>
            <div className="mb-3">
              <CFormLabel>Nueva contrasena</CFormLabel>
              <CInputGroup>
                <CFormInput
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="Deja este campo vacio si no deseas cambiarla"
                />
                <CButton
                  type="button"
                  color="light"
                  variant="ghost"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <CIcon icon={showPassword ? cilLowVision : cilViewColumn} />
                </CButton>
              </CInputGroup>
            </div>
            <div className="mb-3">
              <CFormLabel>Confirmar nueva contrasena</CFormLabel>
              <CInputGroup>
                <CFormInput
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirm_password}
                  onChange={(event) =>
                    setForm({ ...form, confirm_password: event.target.value })
                  }
                  placeholder="Repite la nueva contrasena"
                />
                <CButton
                  type="button"
                  color="light"
                  variant="ghost"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  <CIcon icon={showConfirmPassword ? cilLowVision : cilViewColumn} />
                </CButton>
              </CInputGroup>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeEdit}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={handleSaveEdit}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default Profile
