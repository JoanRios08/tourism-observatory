import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

// Importación de tu logo
import observatorioLogo from 'src/assets/images/logo.png'


import navigation from '../_nav'
import auth from '../utils/auth'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  // Obtener roleId del token
  let roleId = null
  try {
    const userInfo = auth.getUserInfoFromToken && auth.getUserInfoFromToken()
    roleId = userInfo?.role_id || userInfo?.roleId || null
    if (typeof roleId === 'string') roleId = parseInt(roleId)
  } catch {}

  // Filtrar navegación según roleId
  let filteredNav = navigation
  if (roleId === 3) {
    // Solo mostrar estos módulos para profesor
    const allowed = [
      'Dashboard',
      'Perfil',
      'Publicaciones',
      'Proyectos',
      'Documentos',
      'Autores',
    ]
    filteredNav = navigation.filter((item) => allowed.includes(item.name))
  }

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarBrand 
        className="d-none d-md-flex" 
        to="/" 
        style={{ 
          textDecoration: 'none', 
          backgroundColor: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '15px 0',
          borderBottom: '1px solid #ebedef' 
        }}
      >
        {/* LOGO MODO NORMAL (Más grande) */}
        <img 
          src={observatorioLogo} 
          alt="Logo Observatorio" 
          className="sidebar-brand-full" 
          style={{ 
            height: '100px',
            width: 'auto',
            display: 'block'
          }} 
        />
        {/* LOGO MODO NARROW (Cuando se encoge la barra) */}
        <img 
          src={observatorioLogo} 
          alt="Logo" 
          className="sidebar-brand-narrow" 
          style={{ 
            height: '35px', 
            width: 'auto' 
          }} 
        />
      </CSidebarBrand>

      <CSidebarNav>
        <AppSidebarNav items={filteredNav} />
      </CSidebarNav>

      <CSidebarToggler
        className="d-none d-lg-flex"
        onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
      />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)