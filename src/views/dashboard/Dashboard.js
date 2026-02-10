import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CCarousel,
  CCarouselItem,
  CCarouselCaption,
  CButton,
} from '@coreui/react'
import { CChartDoughnut, CChartBar } from '@coreui/react-chartjs'


const Dashboard = () => {
  const [projects, setProjects] = useState([])
  const [documents, setDocuments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [pRes, dRes, uRes] = await Promise.all([
          axiosClient.get('/projects'),
          axiosClient.get('/documents'),
          axiosClient.get('/users'),
        ])
        const pData = pRes?.data ?? pRes
        const dData = dRes?.data ?? dRes
        const uData = uRes?.data ?? uRes
        setProjects(Array.isArray(pData) ? pData : (pData?.data ?? []))
        setDocuments(Array.isArray(dData) ? dData : (dData?.data ?? []))
        setUsers(Array.isArray(uData) ? uData : (uData?.data ?? []))
      } catch (err) {
        console.error('Dashboard fetch error', err)
        setProjects([])
        setDocuments([])
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const monthsEsp = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const getLastNMonths = (n = 6) => {
    const result = []
    const now = new Date()
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      result.push({ month: d.getMonth(), year: d.getFullYear(), label: monthsEsp[d.getMonth()] })
    }
    return result
  }

  const last6 = getLastNMonths(6)

  const barCounts = last6.map((m) => projects.filter((p) => {
    const createdAt = p.created_at || p.createdAt
    if (!createdAt) return false
    const d = new Date(createdAt)
    return d.getMonth() === m.month && d.getFullYear() === m.year
  }).length)

  const barData = {
    labels: last6.map((m) => m.label),
    datasets: [
      {
        label: 'Proyectos por mes',
        backgroundColor: '#3e8ef7',
        data: barCounts,
      },
    ],
  }

  const categoryCounts = projects.reduce((acc, p) => {
    const cat = p.category || 'Sin categoría'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  const donutData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: ['#3e8ef7', '#7c3aed', '#ffb020', '#06b6d4', '#f97316', '#10b981'],
        hoverBackgroundColor: ['#2f6fe0', '#6a2bd6', '#e6a200', '#05a0b0', '#c85a08', '#0e9b6f'],
      },
    ],
  }

  const latestProjects = projects.slice(0, 3).map((p) => ({
    id: p.id,
    name: p.title || p.name,
    owner: p.userName || p.user_name || p.author_name || '',
    date: p.created_at || p.createdAt,
    status: p.status || 'Publicado'
  }))

  const latestDocuments = documents.slice(0, 3).map((d) => {
    const project = projects.find((pr) => pr.id === (d.project_id || d.projectId))
    const fileName = d.file_name || d.fileName || d.file_url || ''
    const type = fileName ? fileName.split('.').pop().toUpperCase() : 'FILE'
    return {
      id: d.id,
      title: d.title,
      type,
      project: project ? (project.title || project.name) : (d.project_id || d.projectId || 'N/A'),
      date: d.created_at || d.createdAt
    }
  })

  const latestUsers = users.slice(0, 3).map((u) => ({
    id: u.id,
    name: u.fullName || `${u.first_name || u.nombre || ''} ${u.last_name || u.apellido || ''}`.trim(),
    email: u.email,
    role: u.rol || u.role || u.role_name || 'Usuario',
    date: u.created_at || u.createdAt
  }))

  return (
    <>
      <CCard className="mb-4">
        <CCardBody className="p-0">
          <CCarousel controls indicators>
            <CCarouselItem>
              <div className="d-block w-100 quick-slide slide-1" style={{ minHeight: 160 }} />
              <CCarouselCaption className="text-start d-none d-md-block py-4 px-5">
                <h4>Sube y comparte una nueva línea de proyecto aquí</h4>
                <p className="text-body-secondary">Comparte tus iniciativas con la comunidad del observatorio.</p>
                <CButton color="primary" href="#/projects">Ver proyectos</CButton>
              </CCarouselCaption>
            </CCarouselItem>
            <CCarouselItem>
              <div className="d-block w-100 quick-slide slide-2" style={{ minHeight: 160 }} />
              <CCarouselCaption className="text-start d-none d-md-block py-4 px-5">
                <h4>Respalda tus documentos aquí</h4>
                <p className="text-body-secondary">Carga y guarda informes, manuales y recursos importantes.</p>
                <CButton color="info" href="#/documents">Ver documentos</CButton>
              </CCarouselCaption>
            </CCarouselItem>
            <CCarouselItem>
              <div className="d-block w-100 quick-slide slide-3" style={{ minHeight: 160 }} />
              <CCarouselCaption className="text-start d-none d-md-block py-4 px-5">
                <h4>Crea usuarios y expande la comunidad</h4>
                <p className="text-body-secondary">Invita colaboradores, asigna roles y amplía el equipo.</p>
                <CButton color="success" href="#/users">Ver usuarios</CButton>
              </CCarouselCaption>
            </CCarouselItem>
          </CCarousel>
        </CCardBody>
      </CCard>
     
      <CCard className="mb-4">
        <CCardHeader>Resumen rápido</CCardHeader>
        <CCardBody>
          <CCarousel>
            <CCarouselItem>
              <CRow>
                <CCol md={6} className="d-flex align-items-center justify-content-center">
                  <div style={{ width: '320px' }}>
                    <CChartDoughnut data={donutData} />
                  </div>
                </CCol>
                <CCol md={6} className="d-flex align-items-center justify-content-center">
                  <div style={{ width: '100%' }}>
                    <CChartBar data={barData} options={{ maintainAspectRatio: false }} style={{ height: '320px' }} />
                  </div>
                </CCol>
              </CRow>
            </CCarouselItem>
          </CCarousel>
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>Últimos proyectos subidos</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Propietario</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {latestProjects.map((p) => (
                <CTableRow key={p.id}>
                  <CTableDataCell>{p.id}</CTableDataCell>
                  <CTableDataCell>{p.name}</CTableDataCell>
                  <CTableDataCell>{p.owner}</CTableDataCell>
                  <CTableDataCell>{p.date}</CTableDataCell>
                  <CTableDataCell>{p.status}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>Últimos documentos agregados</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Título</CTableHeaderCell>
                <CTableHeaderCell>Tipo</CTableHeaderCell>
                <CTableHeaderCell>Proyecto</CTableHeaderCell>
                <CTableHeaderCell>Fecha</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {latestDocuments.map((d) => (
                <CTableRow key={d.id}>
                  <CTableDataCell>{d.id}</CTableDataCell>
                  <CTableDataCell>{d.title}</CTableDataCell>
                  <CTableDataCell>{d.type}</CTableDataCell>
                  <CTableDataCell>{d.project}</CTableDataCell>
                  <CTableDataCell>{d.date}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>Últimos usuarios registrados</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Rol</CTableHeaderCell>
                <CTableHeaderCell>Fecha registro</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {latestUsers.map((u) => (
                <CTableRow key={u.id}>
                  <CTableDataCell>{u.id}</CTableDataCell>
                  <CTableDataCell>{u.name}</CTableDataCell>
                  <CTableDataCell>{u.email}</CTableDataCell>
                  <CTableDataCell>{u.role}</CTableDataCell>
                  <CTableDataCell>{u.date}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </>
  )
}

export default Dashboard