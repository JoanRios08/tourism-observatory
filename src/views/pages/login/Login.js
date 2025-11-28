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
import { isAuthenticated } from '../../../utils/auth'
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

  

  const validateEmail = (e) => {
    return /^\S+@\S+\.\S+$/.test(e)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!username.trim()) {
      setError('El usuario es obligatorio')
      return
    }
    if (!password || password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }
    
    const base = window.__API_BASE__ || 'http://localhost:3001'
    setLoading(true)
    fetch(`${base}/auth?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
      .then((res) => res.json())
      .then((data) => {
        
        console.debug('[Login] auth response:', data)
        setLoading(false)
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0]
          
          try {
            localStorage.setItem('token', entry.token || '')
            localStorage.setItem('userId', String(entry.userId || ''))
            localStorage.setItem('username', username)
            
            console.debug('[Login] stored token:', entry.token)
          } catch (err) {
            
          }
          setSuccess('Inicio de sesión correcto. Redirigiendo...')
          
          setTimeout(() => {
            try {
              
              console.debug('[Login] forcing hash -> #/dashboard and reload')
              window.location.hash = '#/dashboard'
              setTimeout(() => {
                try {
                  window.location.reload()
                } catch (e) {
                  
                  try {
                    navigate('/dashboard', { replace: true })
                  } catch (err) {
                    
                  }
                }
              }, 150)
            } catch (e) {
              
              try {
                navigate('/dashboard', { replace: true })
              } catch (err) {
                
              }
            }
          }, 200)
        } else {
          setError('Credenciales inválidas')
        }
      })
      .catch((err) => {
        setLoading(false)
        
        console.error('[Login] fetch error:', err)
        setError('Error de conexión al servidor')
      })
  }

  const handleRecover = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim()) {
      setError('Introduce tu correo electrónico')
      return
    }
    if (!validateEmail(email)) {
      setError('Introduce un correo válido')
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSuccess('Si el correo existe, recibirás instrucciones para recuperar tu contraseña')
      setTimeout(() => setFlipped(false), 1400)
    }, 900)
  }

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
