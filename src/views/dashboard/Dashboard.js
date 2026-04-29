import React, { useEffect, useState } from 'react'
import axiosClient from '../../api/axiosClient'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCarousel,
  CCarouselCaption,
  CCarouselItem,
  CCol,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsF,
} from '@coreui/react'
import { CChartBar, CChartDoughnut } from '@coreui/react-chartjs'
import { extractCollection, formatDate } from '../../utils/observatoryAdapters'

const emptySummary = {
  stats: {
    totalDocuments: 0,
    totalProjects: 0,
    totalUsers: 0,
  },
  recentActivity: {
    lastProjects: [],
    lastDocuments: [],
    lastLogins: [],
  },
  charts: {
    barChart: [],
    donutChart: [],
  },
}

const getMonthKey = (value) => {
  if (!value) return 'Sin fecha'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'

  return date.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'short',
  })
}

const buildFallbackSummary = ({ users = [], projects = [], documents = [] }) => {
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
  )
  const getDocumentDate = (document) => new Date(document.published_at || document.created_at || 0)
  const getUserDate = (user) => new Date(user.last_login || user.created_at || 0)
  const sortedDocuments = [...documents].sort((a, b) => getDocumentDate(b) - getDocumentDate(a))
  const sortedUsers = [...users].sort((a, b) => getUserDate(b) - getUserDate(a))

  const projectsByMonth = sortedProjects.reduce((acc, project) => {
    const month = getMonthKey(project.created_at)
    acc.set(month, (acc.get(month) || 0) + 1)
    return acc
  }, new Map())

  const documentsByType = documents.reduce((acc, document) => {
    const type = document.type || document.category || 'Sin tipo'
    acc.set(type, (acc.get(type) || 0) + 1)
    return acc
  }, new Map())

  return {
    stats: {
      totalDocuments: documents.length,
      totalProjects: projects.length,
      totalUsers: users.length,
    },
    recentActivity: {
      lastProjects: sortedProjects.slice(0, 5),
      lastDocuments: sortedDocuments.slice(0, 5),
      lastLogins: sortedUsers.slice(0, 5),
    },
    charts: {
      barChart: [...projectsByMonth.entries()].map(([month, total]) => ({ month, total })),
      donutChart: [...documentsByType.entries()].map(([label, value]) => ({ label, value })),
    },
  }
}

const loadFallbackSummary = async () => {
  const [usersResponse, projectsResponse, documentsResponse] = await Promise.all([
    axiosClient.get('/users'),
    axiosClient.get('/projects'),
    axiosClient.get('/documents'),
  ])

  return buildFallbackSummary({
    users: extractCollection(usersResponse.data, ['users']),
    projects: extractCollection(projectsResponse.data, ['projects']),
    documents: extractCollection(documentsResponse.data, ['documents']),
  })
}

const Dashboard = () => {
  const [summary, setSummary] = useState(emptySummary)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await axiosClient.get('/dashboard/summary')
        setSummary(data || emptySummary)
      } catch (fetchError) {
        console.error('Dashboard fetch error', fetchError)
        try {
          setSummary(await loadFallbackSummary())
          setError('El resumen consolidado no está disponible; se muestran datos básicos.')
        } catch (fallbackError) {
          console.error('Dashboard fallback error', fallbackError)
          setSummary(emptySummary)
          setError('No se pudo cargar el resumen del dashboard.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadSummary()
  }, [])

  const stats = summary.stats || emptySummary.stats
  const recentActivity = summary.recentActivity || emptySummary.recentActivity
  const charts = summary.charts || emptySummary.charts

  const donutChart = charts.donutChart || []
  const barChart = charts.barChart || []

  const donutData = {
    labels: donutChart.map((item) => item.label || 'Sin tipo'),
    datasets: [
      {
        data: donutChart.map((item) => Number(item.value) || 0),
        backgroundColor: ['#1f4b99', '#ff7a00', '#0d9488', '#b45309', '#475569', '#dc2626'],
      },
    ],
  }

  const barData = {
    labels: barChart.map((item) => item.month || ''),
    datasets: [
      {
        label: 'Proyectos por mes',
        backgroundColor: '#1f4b99',
        data: barChart.map((item) => Number(item.total) || 0),
      },
    ],
  }

  return (
    <>
      <CCard className="mb-4">
        <CCardBody className="p-0">
          <CCarousel controls indicators>
            <CCarouselItem>
              <div className="d-block w-100 quick-slide slide-1" style={{ minHeight: 180 }} />
              <CCarouselCaption className="text-start d-none d-md-block py-4 px-5">
                <h4>El dashboard ahora usa el resumen consolidado del backend</h4>
                <p className="text-body-secondary">
                  Las métricas, actividad reciente y gráficos salen de `/dashboard/summary`.
                </p>
                <CButton color="primary" href="#/projects">
                  Ir a proyectos
                </CButton>
              </CCarouselCaption>
            </CCarouselItem>
            <CCarouselItem>
              <div className="d-block w-100 quick-slide slide-2" style={{ minHeight: 180 }} />
              <CCarouselCaption className="text-start d-none d-md-block py-4 px-5">
                <h4>Documentos y autores alineados con la API real</h4>
                <p className="text-body-secondary">
                  La vista usa `type`, `author_id`, `project_id` y las fechas tal como las entrega
                  el backend.
                </p>
                <CButton color="info" href="#/documents">
                  Ir a documentos
                </CButton>
              </CCarouselCaption>
            </CCarouselItem>
            <CCarouselItem>
              <div className="d-block w-100 quick-slide slide-3" style={{ minHeight: 180 }} />
              <CCarouselCaption className="text-start d-none d-md-block py-4 px-5">
                <h4>Usuarios y proyectos con formularios compatibles</h4>
                <p className="text-body-secondary">
                  Se removieron supuestos de mock y ahora el frontend envía los campos que el
                  backend valida.
                </p>
                <CButton color="success" href="#/users">
                  Ir a usuarios
                </CButton>
              </CCarouselCaption>
            </CCarouselItem>
          </CCarousel>
        </CCardBody>
      </CCard>

      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CRow className="mb-4">
        <CCol sm={4}>
          <CWidgetStatsF title="Usuarios" value={String(stats.totalUsers || 0)} />
        </CCol>
        <CCol sm={4}>
          <CWidgetStatsF title="Proyectos" value={String(stats.totalProjects || 0)} />
        </CCol>
        <CCol sm={4}>
          <CWidgetStatsF title="Documentos" value={String(stats.totalDocuments || 0)} />
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader>Resumen rápido</CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner />
            </div>
          ) : (
            <CRow>
              <CCol md={6} className="mb-4 mb-md-0">
                <div style={{ maxWidth: 360, margin: '0 auto' }}>
                  <CChartDoughnut data={donutData} />
                </div>
              </CCol>
              <CCol md={6}>
                <div style={{ height: 320 }}>
                  <CChartBar data={barData} options={{ maintainAspectRatio: false }} />
                </div>
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>Últimos proyectos</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Autor</CTableHeaderCell>
                <CTableHeaderCell>Estado</CTableHeaderCell>
                <CTableHeaderCell>Creado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {recentActivity.lastProjects.map((project) => (
                <CTableRow key={project.id}>
                  <CTableDataCell>{project.id}</CTableDataCell>
                  <CTableDataCell>{project.name}</CTableDataCell>
                  <CTableDataCell>{project.author_name || 'Sin autor'}</CTableDataCell>
                  <CTableDataCell>{project.status || 'active'}</CTableDataCell>
                  <CTableDataCell>{formatDate(project.created_at)}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>Últimos documentos</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Título</CTableHeaderCell>
                <CTableHeaderCell>Tipo</CTableHeaderCell>
                <CTableHeaderCell>Autor</CTableHeaderCell>
                <CTableHeaderCell>Publicado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {recentActivity.lastDocuments.map((document) => (
                <CTableRow key={document.id}>
                  <CTableDataCell>{document.id}</CTableDataCell>
                  <CTableDataCell>{document.title}</CTableDataCell>
                  <CTableDataCell>{document.type}</CTableDataCell>
                  <CTableDataCell>{document.author_name || 'Sin autor'}</CTableDataCell>
                  <CTableDataCell>
                    {formatDate(document.published_at || document.created_at)}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>

      <CCard className="mb-4">
        <CCardHeader>Últimos usuarios</CCardHeader>
        <CCardBody>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Email</CTableHeaderCell>
                <CTableHeaderCell>Rol</CTableHeaderCell>
                <CTableHeaderCell>Registrado</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {recentActivity.lastLogins.map((user) => (
                <CTableRow key={user.id}>
                  <CTableDataCell>{user.id}</CTableDataCell>
                  <CTableDataCell>
                    {user.name || [user.first_name, user.last_name].filter(Boolean).join(' ')}
                  </CTableDataCell>
                  <CTableDataCell>{user.email}</CTableDataCell>
                  <CTableDataCell>{user.role_name || 'Usuario'}</CTableDataCell>
                  <CTableDataCell>{formatDate(user.created_at)}</CTableDataCell>
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
