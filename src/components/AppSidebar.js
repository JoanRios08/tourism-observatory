import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

// Importación de tu logo
import observatorioLogo from 'src/assets/images/observatorio.jpg'

import navigation from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

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
          backgroundColor: '#fff', // Fondo blanco para que el JPG no desentone
          display: 'flex',         // Activamos Flexbox
          justifyContent: 'center', // Centrado horizontal
          alignItems: 'center',     // Centrado vertical
          padding: '15px 0',       // Espacio arriba y abajo
          borderBottom: '1px solid #ebedef' 
        }}
      >
        {/* LOGO MODO NORMAL (Más grande) */}
        <img 
          src={observatorioLogo} 
          alt="Logo Observatorio" 
          className="sidebar-brand-full" 
          style={{ 
            height: '100px',        // Aumentado de 45px a 60px
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
        <AppSidebarNav items={navigation} />
      </CSidebarNav>

      <CSidebarToggler
        className="d-none d-lg-flex"
        onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
      />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)