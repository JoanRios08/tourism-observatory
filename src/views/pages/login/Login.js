import React, { useState, useEffect } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, getToken } from '../../../utils/auth'
import authApi from '../../../api/endpoints/authApi.js'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Login = () => {
  const [flipped, setFlipped] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  

  const validateEmail = (e) => /^\S+@\S+\.\S+$/.test(e)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim()) return setError('El usuario es obligatorio')
    if (!password || password.length < 4) return setError('La contraseña debe tener al menos 4 caracteres')

    setLoading(true)
    try {
      // 1. Guardamos la respuesta del login en una constante
      const response = await authApi.login({ username, password })
      
      const token = getToken()
      if (token) {
        // 2. GUARDAR DATOS DEL USUARIO EN LOCALSTORAGE
        // Dependiendo de cómo responda tu API, el usuario suele venir en response.user o response.data.user
        const userData = response.user || response.data?.user;
        
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData))
        }

        setSuccess('Inicio de sesión correcto. Redirigiendo...')
        
        // Un pequeño delay para que el usuario vea el mensaje de éxito antes del reload
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
          window.location.reload()
        }, 500)

      } else {
        setError('No se recibió token de autenticación')
      }
    } catch (err) {
      
    } finally {
      setLoading(false)
    }
  }

  const handleRecover = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) return setError('Introduce tu correo electrónico')
    if (!validateEmail(email)) return setError('Introduce un correo válido')

    setLoading(true)
    try {
      const res = await authApi.recoverPassword({ email: email.trim() })
      const msg = res?.message || 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña'
      setSuccess(msg)
      setTimeout(() => setFlipped(false), 1200)
    } catch (err) {
      console.error('[Recover] error:', err)
      const message = err?.response?.data?.message || 'Error al enviar el correo de recuperación'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center login-animated">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <div className="flip-container">
              <div className={`flip-card ${flipped ? 'flipped' : ''}`}>
                {/* Front Card */}
                <CCard className="p-4 login-card flip-card-front">
                  <CCardBody>
                    <CForm onSubmit={handleLogin}>
                      {error && <CAlert color="danger">{error}</CAlert>}
                      {success && <CAlert color="success">{success}</CAlert>}
                      <h1>Iniciar sesión</h1>
                      <p className="text-body-secondary">Accede a tu cuenta</p>
                        <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput value={username} onChange={(ev) => setUsername(ev.target.value)} placeholder="Usuario" autoComplete="username" />
                      </CInputGroup>
                        <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Contraseña"
                          autoComplete="current-password"
                          value={password}
                          onChange={(ev) => setPassword(ev.target.value)}
                        />
                      </CInputGroup>
                      <CRow>
                        <CCol xs={6}>
                          <CButton color="primary" className="px-4" type="submit" disabled={loading}>
                            {loading ? 'Cargando...' : 'Entrar'}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-right">
                          <CButton
                            color="link"
                            className="px-0"
                            onClick={() => setFlipped(true)}
                          >
                            Recuperar contraseña
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>

                {/* Back Card */}
                <CCard className="p-4 login-card flip-card-back">
                  <CCardBody>
                    <CForm onSubmit={handleRecover}>
                      {error && <CAlert color="danger">{error}</CAlert>}
                      {success && <CAlert color="success">{success}</CAlert>}
                      <h1>Recuperar contraseña</h1>
                      <p className="text-body-secondary">Introduce tu correo para recuperar la contraseña</p>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>@</CInputGroupText>
                        <CFormInput value={email} onChange={(ev) => setEmail(ev.target.value)} type="email" placeholder="Correo electrónico" />
                      </CInputGroup>
                      <CRow>
                        <CCol xs={6}>
                          <CButton color="primary" className="px-4" type="submit" disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar'}
                          </CButton>
                        </CCol>
                        <CCol xs={6} className="text-right">
                          <CButton color="link" className="px-0" onClick={() => setFlipped(false)}>
                            Volver
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
