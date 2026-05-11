import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CButton, CContainer, CHeader, CHeaderNav, CHeaderToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilAccountLogout, cilMenu } from '@coreui/icons'
import { AppBreadcrumb } from './index'
import userApi from '../api/endpoints/usersApi'
import { getUserInfoFromToken } from '../utils/auth'

const getDisplayName = (user) => {
  if (!user) return ''
  return (
    user.name ||
    user.fullName ||
    [user.first_name || user.nombre, user.last_name || user.apellido].filter(Boolean).join(' ') ||
    user.email ||
    ''
  )
}

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
    const loadUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
      const tokenUser = getUserInfoFromToken()
      const userId = storedUser?.id || tokenUser?.id || localStorage.getItem('userId')

      try {
        if (!userId) {
          setUserName(getDisplayName(storedUser || tokenUser) || 'Usuario')
          return
        }

        const response = await userApi.getUserById(userId)
        const user = response.data?.user || response.data || storedUser || tokenUser
        setUserName(getDisplayName(user) || 'Usuario')
      } catch (err) {
        console.error('Error cargando usuario:', err)
        setUserName(getDisplayName(storedUser || tokenUser) || 'Usuario')
      }
    }

    loadUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userInfo')
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

        <CHeaderNav>
          <CButton
            color="danger"
            variant="ghost"
            onClick={handleLogout}
            className="d-flex align-items-center"
          >
            <CIcon icon={cilAccountLogout} size="lg" className="me-2" />
            Cerrar sesion
          </CButton>
        </CHeaderNav>

        <CHeaderNav className="ms-auto">
          <div className="d-flex align-items-center px-3">
            <span style={{ fontWeight: 600, fontSize: '1rem' }}>{userName}</span>
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
