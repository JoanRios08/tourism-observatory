import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu, cilAccountLogout } from '@coreui/icons'
import { AppBreadcrumb } from './index'
import axiosClient from '../api/axiosClient'

const AppHeader = () => {
  const headerRef = useRef()
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const [userName, setUserName] = useState('Usuario')

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }

    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Obtener información del usuario actual
    const loadUser = async () => {
      try {
        const res = await axiosClient.get('/users')
        
        // Extraer datos manejando diferentes estructuras
        const data = res?.data
        const users = data?.users || (Array.isArray(data) ? data : [])
        
        if (users.length > 0) {
          const user = users[0]
          const fullName = user?.fullName || 
                          `${user?.first_name || user?.nombre || ''} ${user?.last_name || user?.apellido || ''}`.trim()
          setUserName(fullName || 'Usuario')
        }
      } catch (err) {
        console.error('Error cargando usuario:', err)
        setUserName('Usuario')
      }
    }

    loadUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    window.location.hash = '#/login'
    window.location.reload()
  }

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        
        {/* Lado izquierdo - Botón de cerrar sesión */}
        <CHeaderNav>
          <CButton 
            color="danger" 
            variant="ghost" 
            onClick={handleLogout}
            className="d-flex align-items-center"
          >
            <CIcon icon={cilAccountLogout} size="lg" className="me-2" />
            Cerrar sesión
          </CButton>
        </CHeaderNav>

        {/* Lado derecho - Nombre del usuario */}
        <CHeaderNav className="ms-auto">
          <div className="d-flex align-items-center px-3">
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>
              {userName}
            </span>
          </div>
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader