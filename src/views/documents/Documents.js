import React, { useMemo, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CCarousel,
  CCarouselItem,
  CCarouselCaption,
  CButton,
  CInputGroup,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormTextarea,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilCheck } from '@coreui/icons'

const Documents = () => {
  const [documents, setDocuments] = useState([])
  const [titleFilter, setTitleFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [usersList, setUsersList] = useState([])
  const [projectsList, setProjectsList] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', category: '', file: null, user: '', projectId: '' })

  const lastDocument = documents.length ? documents[0] : null

  
  const documentsThisWeek = documents.filter((d) => d.createdAt && d.createdAt.startsWith('2025-11')).length

  const base = (import.meta?.env?.VITE_API_BASE) || window.__API_BASE__ || 'http://localhost:3001'

  
  React.useEffect(() => {
    fetch(`${base}/documents?_sort=createdAt&_order=desc`)
      .then((r) => r.json())
      .then(setDocuments)
      .catch(() => setDocuments([]))
    fetch(`${base}/users`)
      .then((r) => r.json())
      .then((data) => setUsersList(data.map((u) => u.fullName || `${u.nombre} ${u.apellido}`)))
      .catch(() => setUsersList([]))
    fetch(`${base}/projects`)
      .then((r) => r.json())
      .then(setProjectsList)
      .catch(() => setProjectsList([]))
  }, [])

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchTitle = titleFilter ? d.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
      const matchUser = userFilter ? d.user === userFilter : true
      const matchDate = dateFilter ? d.createdAt === dateFilter : true
      return matchTitle && matchUser && matchDate
    })
  }, [documents, titleFilter, userFilter, dateFilter])

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', category: '', file: null, user: usersList[0] || '', projectId: projectsList[0]?.id || '' })
    setShowCreate(true)
  }

  const openEdit = (doc) => {
    setEditing(doc)
    setForm({ title: doc.title, description: doc.description || '', category: doc.category || '', file: null, user: doc.user })
    setShowCreate(true)
  }

  const save = () => {
    if (!form.title) {
      alert('El título es requerido')
      return
    }
    if (editing) {
      const updated = { ...editing, title: form.title, description: form.description, category: form.category, projectId: form.projectId, userName: form.user, updatedAt: new Date().toISOString().slice(0, 10) }
      fetch(`${base}/documents/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) })
        .then((r) => r.json())
        .then(() => fetch(`${base}/documents?_sort=createdAt&_order=desc`).then((r) => r.json()).then(setDocuments))
        .catch((e) => alert('Error actualizando documento'))
    } else {
      const now = new Date().toISOString().slice(0, 10)
      const newDoc = { projectId: form.projectId || null, title: form.title, userName: form.user, userId: null, category: form.category || 'General', description: form.description || '', fileName: form.file?.name || '', fileUrl: '', approved: false, createdAt: now, updatedAt: now }
      fetch(`${base}/documents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDoc) })
        .then((r) => r.json())
        .then(() => fetch(`${base}/documents?_sort=createdAt&_order=desc`).then((r) => r.json()).then(setDocuments))
        .catch(() => alert('Error creando documento'))
    }
    setShowCreate(false)
  }

  const remove = (d) => {
    if (!window.confirm(`Eliminar documento ${d.title}?`)) return
    fetch(`${base}/documents/${d.id}`, { method: 'DELETE' })
      .then(() => setDocuments((prev) => prev.filter((x) => x.id !== d.id)))
      .catch(() => alert('Error eliminando'))
  }
  const approve = (d) => {
    fetch(`${base}/documents/${d.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: !d.approved }) })
      .then((r) => r.json())
      .then((updated) => setDocuments((prev) => prev.map((x) => (x.id === updated.id ? updated : x))))
      .catch(() => alert('Error actualizando estado'))
  }

  return (
    <>
      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardBody className="p-3">
              <CCarousel controls indicators>
                <CCarouselItem>
                  <div className="d-flex w-100 align-items-center justify-content-center" style={{ minHeight: 160 }}>
                    <div style={{ textAlign: 'center' }}>
                      <h5 className="mb-1">Último documento subido</h5>
                          <div style={{ fontWeight: 700 }}>{lastDocument ? lastDocument.title : 'Sin documentos'}</div>
                          {lastDocument && <div className="text-muted small">Subido por {lastDocument.userName || lastDocument.user} • {lastDocument.createdAt}</div>}
                    </div>
                  </div>
                </CCarouselItem>
                <CCarouselItem>
                  <div className="d-flex w-100 align-items-center justify-content-center" style={{ minHeight: 160 }}>
                    <div style={{ textAlign: 'center' }}>
                        <h5 className="mb-1">Documentos esta semana</h5>
                        <div style={{ fontWeight: 700, fontSize: 24 }}>{documentsThisWeek}</div>
                        <div className="text-muted small">Total subidos en la semana</div>
                      </div>
                  </div>
                </CCarouselItem>
              </CCarousel>
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
                  <CButton color="primary" onClick={openCreate}>
                    Subir nuevo documento
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
                    <CTableHeaderCell>Categoría</CTableHeaderCell>
                    <CTableHeaderCell>Creado</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 160 }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {filtered.map((d) => (
                    <CTableRow key={d.id} className="align-middle">
                      <CTableDataCell>{d.id}</CTableDataCell>
                      <CTableDataCell>{d.userName || d.user}</CTableDataCell>
                      <CTableDataCell style={{ fontWeight: 700 }}>{d.title}</CTableDataCell>
                      <CTableDataCell>{d.category}</CTableDataCell>
                      <CTableDataCell>{d.createdAt}</CTableDataCell>
                      <CTableDataCell>
                        <CButton size="sm" color="transparent" className="me-2" title="Editar" onClick={() => openEdit(d)}>
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton size="sm" color={d.approved ? 'success' : 'transparent'} className="me-2" title="Aprobar" onClick={() => approve(d)}>
                          <CIcon icon={cilCheck} />
                        </CButton>
                        <CButton size="sm" color="transparent" className="text-danger" title="Eliminar" onClick={() => remove(d)}>
                          <CIcon icon={cilTrash} />
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
          <CModalTitle>{editing ? 'Editar documento' : 'Subir nuevo documento'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow>
            <CCol md={12}>
              <div className="mb-3">
                <CFormLabel>Título</CFormLabel>
                <CFormInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="mb-3">
                <CFormLabel>Descripción</CFormLabel>
                <CFormTextarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="mb-3">
                <CFormLabel>Categoría</CFormLabel>
                <CFormInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div className="mb-3">
                <CFormLabel>Archivo</CFormLabel>
                <CFormInput type="file" onChange={(e) => setForm({ ...form, file: e.target.files && e.target.files[0] })} />
              </div>
              <div className="mb-3">
                <CFormLabel>Proyecto (opcional)</CFormLabel>
                <CFormSelect value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                  <option value="">Ninguno</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </CFormSelect>
              </div>
              <div className="mb-3">
                <CFormLabel>Usuario</CFormLabel>
                <CFormSelect value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })}>
                  {usersList.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </CFormSelect>
              </div>
            </CCol>
          </CRow>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowCreate(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={save}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Documents
