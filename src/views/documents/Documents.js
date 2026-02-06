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
import documentsApi from '../../api/endpoints/documentsApi'

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


  const documentsThisWeek = documents.filter((d) => d.created_at && d.created_at.startsWith(new Date().getFullYear().toString())).length

React.useEffect(() => {
  const load = async () => {
    try {
      const docsRes = await documentsApi.getDocuments(true)
      console.log('📦 Respuesta completa:', docsRes)
      
      // axios devuelve los datos en docsRes.data
      const rawData = docsRes.data
      console.log('📋 Raw data:', rawData)
      
      // El backend devuelve { ok: true, documents: [...] }
      const arr = rawData?.documents || []
      console.log('✅ Array final:', arr)
      
      const normalized = arr.map((p) => {
        const createdAt = p.created_at || p.createdAt || ''
        const updatedAt = p.updated_at || p.updatedAt || ''
        const authorName = p.author_name || p.authorName || ''
        const category = p.type || p.category || ''
        
        return {
          id: p.id,
          title: p.title || p.name || '',
          description: p.description || p.desc || '',
          category,
          published_at: p.published_at || p.publishedAt || '',
          file_url: p.file_url || p.fileUrl || p.file || '',
          author_id: p.author_id ?? p.authorId ?? p.user_id ?? null,
          project_id: p.project_id ?? p.projectId ?? null,
          location_id: p.location_id ?? p.locationId ?? null,
          created_at: createdAt,
          updated_at: updatedAt,
          createdAt,
          updatedAt,
          author_name: authorName,
          userName: authorName,
          user: authorName,
          approved: p.approved || false
        }
      })
      
      console.log('🎯 Documentos normalizados:', normalized)
      setDocuments(normalized)
    } catch (e) {
      console.error('❌ Error loading documents:', e)
      setDocuments([])
    }

    // ... resto del código
  }
  load()
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
  setForm({ 
    title: doc.title, 
    description: doc.description || '', 
    category: doc.category || '', 
    file: null, 
    user: doc.user || doc.userName || doc.author_name,
    projectId: doc.project_id || '' // ⚠️ FALTABA ESTO
  })
  setShowCreate(true)
}

const save = async () => {
  if (!form.title) {
    alert('El título es requerido')
    return
  }
  
  try {
    if (editing) {
      // Editar documento existente
      const updated = { 
        title: form.title, 
        description: form.description, 
        category: form.category, 
        project_id: form.projectId || null, 
        author_name: form.user,
        type: form.category || 'General'
      }
      
      await documentsApi.updateDocument(editing.id, updated)
    } else {
      // Crear nuevo documento
      const now = new Date().toISOString()
      const newDoc = { 
        project_id: form.projectId || null, 
        title: form.title, 
        author_name: form.user, 
        type: form.category || 'General', 
        description: form.description || '', 
        file_url: '', 
        created_at: now, 
        updated_at: now 
      }
      
      await documentsApi.createDocument(newDoc)
    }
    
    // Recargar documentos
    const res = await documentsApi.getDocuments(true)
    const arr = res.data?.documents || []
    const normalized = arr.map((p) => ({
      id: p.id,
      title: p.title || '',
      description: p.description || '',
      category: p.type || p.category || '',
      createdAt: p.created_at || p.createdAt || '',
      updatedAt: p.updated_at || p.updatedAt || '',
      userName: p.author_name || p.authorName || '',
      user: p.author_name || p.authorName || '',
      approved: p.approved || false,
      author_id: p.author_id,
      project_id: p.project_id,
    }))
    setDocuments(normalized)
    setShowCreate(false)
    
  } catch (err) {
    console.error('Error guardando:', err)
    alert(`Error ${editing ? 'actualizando' : 'creando'} documento: ${err.message}`)
  }
}

  const remove = (d) => {
    if (!window.confirm(`Eliminar documento ${d.title}?`)) return
    documentsApi
      .deleteDocument(d.id)
      .then(() => setDocuments((prev) => prev.filter((x) => x.id !== d.id)))
      .catch(() => alert('Error eliminando'))
  }
  const approve = (d) => {
    documentsApi
      .updateDocument(d.id, { approved: !d.approved })
      .then((res) => {
        const updated = res?.data ?? res
        setDocuments((prev) => prev.map((x) => (x.id === (updated.id ?? updated.ID) ? updated : x)))
      })
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
