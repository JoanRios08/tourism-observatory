import React, { useEffect, useState } from 'react'
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
import { getToken, getUserInfoFromToken, isAuthenticated } from '../../../utils/auth'
import authApi from '../../../api/endpoints/authApi.js'
import CIcon from '@coreui/icons-react'
import {
  cilEnvelopeClosed,
  cilLockLocked,
  cilLowVision,
  cilUser,
  cilViewColumn,
} from '@coreui/icons'

const Login = () => {
  const [flipped, setFlipped] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const validateEmail = (value) => /^\S+@\S+\.\S+$/.test(value)

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim()) return setError('El usuario es obligatorio')
    if (!password || password.length < 4) {
      return setError('La contraseña debe tener al menos 4 caracteres')
    }

    setLoading(true)

    try {
      const response = await authApi.login({ username: username.trim(), password })
      const token = getToken()

      if (!token) {
        setError('No se recibió token de autenticación')
        return
      }

      const userData = response?.user || response?.data?.user || response?.data || null
      const decodedUser = getUserInfoFromToken()
      const resolvedUserId = userData?.id || decodedUser?.id || null

      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData))
      }

      localStorage.setItem('authToken', token)

      if (resolvedUserId) {
        localStorage.setItem('userId', String(resolvedUserId))
      } else {
        localStorage.removeItem('userId')
      }

      setSuccess('Inicio de sesión correcto. Redirigiendo...')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('[Login] auth error:', err)
      console.error('Response data:', err?.response?.data)
      console.error('Response status:', err?.response?.status)
      const resp = err?.response?.data
      const serverErr = resp?.error || resp?.message || err?.message || 'Error de autenticación'
      let detailsText = ''

      if (resp?.details && Array.isArray(resp.details)) {
        detailsText = resp.details
          .map((detail) => {
            if (!detail) return ''
            const path = detail.path ? `${detail.path}: ` : ''
            const message =
              detail.message || (typeof detail === 'string' ? detail : JSON.stringify(detail))
            return `${path}${message}`
          })
          .filter(Boolean)
          .join(' - ')
      }

      const message = detailsText ? `${serverErr} - ${detailsText}` : serverErr
      setError(message)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleRecover = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) return setError('Introduce tu correo electrónico')
    if (!validateEmail(email)) return setError('Introduce un correo válido')

    setLoading(true)

    try {
      const response = await authApi.recoverPassword({ email: email.trim() })
      const message =
        response?.message ||
        'Si el correo existe, recibirás instrucciones para recuperar tu contraseña'
      setSuccess(message)
      setTimeout(() => setFlipped(false), 1200)
    } catch (err) {
      console.error('[Recover] error:', err)
      const message = err?.response?.data?.message || 'Error al enviar el correo de recuperación'
      setError(message)
      setTimeout(() => setError(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  return (
    <div className="login-wrapper">
      <div className="login-background">
        <div className="login-shape shape-1"></div>
        <div className="login-shape shape-2"></div>
        <div className="login-shape shape-3"></div>
      </div>

      <CContainer>
        <CRow className="justify-content-center align-items-center min-vh-100">
          <CCol md={8} lg={6} xl={5}>
            <div className="login-header text-center mb-4">
              <div className="login-logo-container">
                <div className="login-logo-circle">
                  <CIcon icon={cilLockLocked} size="xxl" />
                </div>
              </div>
              <h2 className="login-welcome-text mt-3">Bienvenido</h2>
            </div>

            <div className="flip-container">
              <div className={`flip-card ${flipped ? 'flipped' : ''}`}>
                <CCard className="login-card flip-card-front">
                  <CCardBody className="p-5">
                    <CForm onSubmit={handleLogin}>
                      {error && (
                        <CAlert color="danger" className="login-alert fade-in">
                          <i className="bi bi-exclamation-circle me-2"></i>
                          {error}
                        </CAlert>
                      )}
                      {success && (
                        <CAlert color="success" className="login-alert fade-in">
                          <i className="bi bi-check-circle me-2"></i>
                          {success}
                        </CAlert>
                      )}

                      <div className="mb-4">
                        <h3 className="login-card-title">Iniciar sesión</h3>
                        <p className="login-card-subtitle">Accede a tu cuenta para continuar</p>
                      </div>

                      <CInputGroup className="login-input-group mb-4">
                        <CInputGroupText className="login-input-icon">
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          className="login-input"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          placeholder="Usuario"
                          autoComplete="username"
                        />
                      </CInputGroup>

                      <CInputGroup className="login-input-group mb-4">
                        <CInputGroupText className="login-input-icon">
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          className="login-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Contraseña"
                          autoComplete="current-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                        />
                        <CButton
                          type="button"
                          color="light"
                          variant="ghost"
                          className="login-input-icon"
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          <CIcon icon={showPassword ? cilLowVision : cilViewColumn} />
                        </CButton>
                      </CInputGroup>

                      <CButton
                        color="primary"
                        className="login-submit-btn w-100 mb-3"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Cargando...
                          </>
                        ) : (
                          'Entrar'
                        )}
                      </CButton>

                      <div className="text-center">
                        <CButton
                          color="link"
                          className="login-link-btn"
                          onClick={() => setFlipped(true)}
                        >
                          ¿Olvidaste tu contraseña?
                        </CButton>
                      </div>
                    </CForm>
                  </CCardBody>
                </CCard>

                <CCard className="login-card flip-card-back">
                  <CCardBody className="p-5">
                    <CForm onSubmit={handleRecover}>
                      {error && (
                        <CAlert color="danger" className="login-alert fade-in">
                          <i className="bi bi-exclamation-circle me-2"></i>
                          {error}
                        </CAlert>
                      )}
                      {success && (
                        <CAlert color="success" className="login-alert fade-in">
                          <i className="bi bi-check-circle me-2"></i>
                          {success}
                        </CAlert>
                      )}

                      <div className="mb-4">
                        <h3 className="login-card-title">Recuperar contraseña</h3>
                        <p className="login-card-subtitle">
                          Introduce tu correo para recuperar el acceso
                        </p>
                      </div>

                      <CInputGroup className="login-input-group mb-4">
                        <CInputGroupText className="login-input-icon">
                          <CIcon icon={cilEnvelopeClosed} />
                        </CInputGroupText>
                        <CFormInput
                          className="login-input"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          type="email"
                          placeholder="Correo electrónico"
                        />
                      </CInputGroup>

                      <CButton
                        color="primary"
                        className="login-submit-btn w-100 mb-3"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Enviando...
                          </>
                        ) : (
                          'Enviar'
                        )}
                      </CButton>

                      <div className="text-center">
                        <CButton
                          color="link"
                          className="login-link-btn"
                          onClick={() => setFlipped(false)}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Volver al inicio de sesión
                        </CButton>
                      </div>
                    </CForm>
                  </CCardBody>
                </CCard>
              </div>
            </div>

            <div className="login-footer text-center mt-4">
              <p className="login-footer-text">
                © 2026 Observatorio UNEFA. Todos los derechos reservados.
              </p>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
