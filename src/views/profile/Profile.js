import React, { useState, useEffect } from 'react'
import {
    CRow, CCol, CCard, CCardBody, CCardHeader, CImage, CButton,
    CBadge, CModal, CModalHeader, CModalTitle, CModalBody,
    CModalFooter, CForm, CFormLabel, CFormInput, CSpinner
} from '@coreui/react'
import { getUserInfoFromToken } from '../../utils/auth'
import userApi from '../../api/endpoints/usersApi'

const Profile = () => {
    const [loading, setLoading] = useState(true)
    const [showEdit, setShowEdit] = useState(false)
    const [userData, setUserData] = useState(null)
    const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '', email: '' })

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const info = getUserInfoFromToken()
                const userId = info?.id || localStorage.getItem('userId')

                if (userId) {
                    const response = await userApi.getUserById(userId)
                    
                    // Extraemos los datos: Axios suele envolverlos en response.data
                    // Si tu api ya devuelve el objeto directo, d será la respuesta.
                    const d = response.data?.user || response.data || response

                    // MAPEADO CORREGIDO según el JSON de tu Backend
                    const cleanedData = {
                        cedula: d.dni || 'No disponible',
                        nombre: d.first_name || 'Usuario',
                        apellido: d.last_name || '',
                        rol: d.role_name || 'Usuario', // Corregido de rol_name a role_name
                        telefono: d.phone || 'No registrado',
                        email: d.email || 'Sin correo',
                        createdAt: d.created_at || new Date().toISOString(),
                        updatedAt: d.updated_at || '',
                        // Si profile_image_url es solo "pedro.jpg", cámbialo por la URL de tu servidor
                        avatar: d.profile_image_url 
                            ? `http://tu-servidor.com/uploads/${d.profile_image_url}` 
                            : 'https://ui-avatars.com/api/?name=' + (d.first_name || 'User')
                    }

                    setUserData(cleanedData)
                    setForm({
                        nombre: cleanedData.nombre,
                        apellido: cleanedData.apellido,
                        telefono: cleanedData.telefono,
                        email: cleanedData.email
                    })
                }
            } catch (error) {
                console.error("Error crítico al cargar perfil:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    if (loading) return <div className="text-center p-5"><CSpinner color="primary" /></div>
    if (!userData) return <div className="text-center p-5">No se pudo cargar la información del usuario.</div>

    return (
        <CRow>
            <CCol xs={12}>
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
                                            {new Date(userData.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-right">
                                    <div className="info">
                                        <h2>
                                            {userData.nombre} {userData.apellido} 
                                            <CBadge color="light" className="ms-2 text-dark">{userData.rol}</CBadge>
                                        </h2>
                                        <div className="mt-4">
                                            <p className="mb-2"><strong>DNI:</strong> {userData.cedula}</p>
                                            <p className="mb-2"><strong>Teléfono:</strong> {userData.telefono}</p>
                                            <p className="mb-2"><strong>Email:</strong> {userData.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-end mt-3">
                                        <CButton className="btn-edit" onClick={() => setShowEdit(true)}>Editar</CButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>

            <CModal visible={showEdit} onClose={() => setShowEdit(false)} alignment="center">
                <CModalHeader><CModalTitle>Editar perfil</CModalTitle></CModalHeader>
                <CModalBody>
                    <CForm>
                        <div className="mb-3">
                            <CFormLabel>Nombre</CFormLabel>
                            <CFormInput value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Apellido</CFormLabel>
                            <CFormInput value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Teléfono</CFormLabel>
                            <CFormInput value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} />
                        </div>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setShowEdit(false)}>Cerrar</CButton>
                    <CButton color="primary" onClick={() => { setUserData({...userData, ...form}); setShowEdit(false); }}>Actualizar Vista</CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default Profile