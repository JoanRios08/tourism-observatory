import React, { useMemo, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody,
  CButton,
  CInputGroup,
  CFormInput,
  CFormSelect,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CCardImage,
} from '@coreui/react'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilCheck } from '@coreui/icons'

const Projects = () => {
  const usersList = ['María López', 'Carlos Ruiz', 'Ana Gómez']
  const initial = [
    { id: 'P-1001', user: 'María López', title: 'Mapa de Alojamientos', category: 'Infraestructura', createdAt: '2025-11-01', updatedAt: '2025-11-05' },
    { id: 'P-1002', user: 'Carlos Ruiz', title: 'Estadísticas Visitantes 2024', category: 'Investigación', createdAt: '2025-10-24', updatedAt: '2025-10-30' },
    { id: 'P-1003', user: 'Ana Gómez', title: 'Rutas de Senderismo', category: 'Turismo', createdAt: '2025-09-12', updatedAt: '2025-11-12' },
  ]

  const [projects, setProjects] = useState(initial)
  const [titleFilter, setTitleFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ title: '', description: '', category: '', status: 'Borrador', image: null, user: usersList[0] })

  // charts data
  const barData = {
    labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
    datasets: [
      { label: 'Proyectos subidos', backgroundColor: '#3e8ef7', data: [2, 5, 3, 4] },
    ],
  }

  const lineData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      { label: 'Proyectos esta semana', backgroundColor: 'rgba(62,142,247,0.2)', borderColor: '#3e8ef7', data: [0, 1, 2, 1, 3, 0, 2], fill: true },
    ],
  }

  const latestProject = projects[0]

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchTitle = titleFilter ? p.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
      const matchUser = userFilter ? p.user === userFilter : true
      const matchDate = dateFilter ? p.createdAt === dateFilter : true
      return matchTitle && matchUser && matchDate
    })
  }, [projects, titleFilter, userFilter, dateFilter])

  const handleCreate = () => setShowCreate(true)

  const handleSaveCreate = () => {
    if (!createForm.title) {
      alert('El título es requerido')
      return
    }
    const id = `P-${Math.floor(1000 + Math.random() * 9000)}`
    const now = new Date().toISOString().slice(0, 10)
    const newP = { id, user: createForm.user, title: createForm.title, category: createForm.category || 'General', createdAt: now, updatedAt: now }
    setProjects([newP, ...projects])
    setShowCreate(false)
    setCreateForm({ title: '', description: '', category: '', status: 'Borrador', image: null, user: usersList[0] })
  }

  const handleDelete = (p) => setProjects(projects.filter((x) => x.id !== p.id))
  const handleEdit = (p) => alert(`Editar proyecto ${p.title}`)
  const handleApprove = (p) => alert(`Aprobar proyecto ${p.title}`)

  return (
    <>
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardBody className="p-3">
              <CRow className="align-items-center">
                <CCol md={7} className="mb-3 mb-md-0">
                  <CCard className="h-100">
                    <CCardBody>
                      <h6 className="text-muted">Proyectos por semana</h6>
                      <CChartBar data={barData} />
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={5}>
                  <CCard className="mb-3">
                    <CCardBody>
                      <h6 className="text-muted">Actividad semanal</h6>
                      <CChartLine data={lineData} />
                    </CCardBody>
                  </CCard>
                  <CCard>
                    <CCardBody>
                      <h6 className="text-muted">Último proyecto agregado</h6>
                      <div style={{ fontWeight: 700, fontSize: 18 }}>{latestProject ? latestProject.title : 'Sin proyectos'}</div>
                      {latestProject && <div className="text-muted small">Creado: {latestProject.createdAt}</div>}
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <CRow className="align-items-center">
                <CCol md={8} className="d-flex gap-2 align-items-end">
                  <div style={{ width: '36%' }}>
                    <CFormLabel>Buscar por título</CFormLabel>
                    <CInputGroup>
                      <CFormInput placeholder="Título" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} />
                    </CInputGroup>
                  </div>
                  <div style={{ width: '28%' }}>
                    <CFormLabel>Usuario</CFormLabel>
                    <CFormSelect value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                      <option value="">Todos</option>
                      {usersList.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </CFormSelect>
                  </div>
                  <div style={{ width: '28%' }}>
                    <CFormLabel>Fecha (creado)</CFormLabel>
                    <CFormInput type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
                  </div>
                </CCol>
                <CCol md={4} className="d-flex justify-content-end">
                  <CButton color="primary" onClick={handleCreate}>
                    Crear nuevo proyecto
                  </CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Usuario</CTableHeaderCell>
                    <CTableHeaderCell>Título</CTableHeaderCell>
                    <CTableHeaderCell>Creado</CTableHeaderCell>
                    <CTableHeaderCell>Editado</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 140 }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filtered.map((p) => (
                    <CTableRow key={p.id} className="align-middle">
                      <CTableDataCell>{p.id}</CTableDataCell>
                      <CTableDataCell>{p.user}</CTableDataCell>
                      <CTableDataCell style={{ fontWeight: 700 }}>{p.title}</CTableDataCell>
                      <CTableDataCell>{p.createdAt}</CTableDataCell>
                      <CTableDataCell>{p.updatedAt}</CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" color="transparent" className="me-2" title="Editar" onClick={() => handleEdit(p)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton size="sm" color="transparent" className="me-2 text-danger" title="Eliminar" onClick={() => handleDelete(p)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                        <CButton size="sm" color="transparent" title="Aprobar" onClick={() => handleApprove(p)}>
                          <CIcon icon={cilCheck} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showCreate} onClose={() => setShowCreate(false)}>
        <CModalHeader>
          <CModalTitle>Crear proyecto</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={7}>
              <CForm>
                <div className="mb-3">
                  <CFormLabel>Título</CFormLabel>
                  <CFormInput value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
                </div>
                <div className="mb-3">
                  <CFormLabel>Descripción</CFormLabel>
                  <CFormTextarea rows={4} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
                </div>
                <div className="mb-3">
                  <CFormLabel>Categoría</CFormLabel>
                  <CFormInput value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })} />
                </div>
                <div className="mb-3">
                  <CFormLabel>Estado</CFormLabel>
                  <CFormSelect value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                    <option>Borrador</option>
                    <option>Publicado</option>
                  </CFormSelect>
                </div>
              </CForm>
            </CCol>
            <CCol md={5}>
              <CCard>
                <CCardHeader>Imágenes</CCardHeader>
                <CCardBody className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 220 }}>
                  <CCardImage src="/assets/images/avatars/1.jpg" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 6 }} />
                  <div className="mt-3 w-100">
                    <CFormLabel>Subir imágenes</CFormLabel>
                    <CFormInput type="file" onChange={(e) => setCreateForm({ ...createForm, image: e.target.files[0] })} />
                  </div>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCreate(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSaveCreate}>
            Crear
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Projects
