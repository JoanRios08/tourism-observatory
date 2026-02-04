import React, { useMemo, useState } from 'react'
import {
	CRow,
	CCol,
	CCard,
	CCardHeader,
	CCardBody,
	CInputGroup,
	CFormInput,
	CFormSelect,
	CButton,
	CTable,
	CTableHead,
	CTableBody,
	CTableRow,
	CTableHeaderCell,
	CTableDataCell,
	CBadge,
	CModal,
	CModalHeader,
	CModalTitle,
	CModalBody,
	CModalFooter,
	CForm,
	CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilCheck } from '@coreui/icons'

const Post = () => {
	
	const [usersList, setUsersList] = useState([])
	const [categories, setCategories] = useState(['Noticias', 'Eventos', 'Anuncios'])
	const [posts, setPosts] = useState([])
	const [titleFilter, setTitleFilter] = useState('')
	const [userFilter, setUserFilter] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('')

	const [showCreate, setShowCreate] = useState(false)
	const [createForm, setCreateForm] = useState({ user: '', title: '', category: '' })

	const base = (import.meta?.env?.VITE_API_BASE) || window.__API_BASE__ || 'http://localhost:3001'

	React.useEffect(() => {
		fetch(`${base}/posts?_sort=createdAt&_order=desc`)
			.then((r) => r.json())
			.then(setPosts)
			.catch(() => setPosts([]))
		fetch(`${base}/users`)
			.then((r) => r.json())
			.then((data) => setUsersList(data.map((u) => u.fullName || `${u.nombre} ${u.apellido}`)))
			.catch(() => setUsersList([]))
	}, [])

	const filtered = useMemo(() => {
		return posts.filter((p) => {
			const matchTitle = titleFilter ? p.title.toLowerCase().includes(titleFilter.toLowerCase()) : true
			const matchUser = userFilter ? p.user === userFilter : true
			const matchCategory = categoryFilter ? p.category === categoryFilter : true
			return matchTitle && matchUser && matchCategory
		})
	}, [posts, titleFilter, userFilter, categoryFilter])

	const handleCreate = () => setShowCreate(true)

	const handleSaveCreate = () => {
		if (!createForm.title) {
			alert('El título es obligatorio')
			return
		}
		const now = new Date().toISOString().slice(0, 10)
		const newPost = { userName: createForm.user, title: createForm.title, category: createForm.category, createdAt: now, updatedAt: now, approved: false }
		fetch(`${base}/posts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPost) })
			.then((r) => r.json())
			.then(() => fetch(`${base}/posts?_sort=createdAt&_order=desc`).then((r) => r.json()).then(setPosts))
			.catch(() => alert('Error creando publicación'))
		setShowCreate(false)
		setCreateForm({ user: usersList[0] || '', title: '', category: categories[0] })
	}

	const handleDelete = (post) => {
		if (!window.confirm(`¿Eliminar publicación "${post.title}"?`)) return
		fetch(`${base}/posts/${post.id}`, { method: 'DELETE' })
			.then(() => setPosts((prev) => prev.filter((p) => p.id !== post.id)))
			.catch(() => alert('Error eliminando'))
	}

	const handleEdit = (post) => {
		alert(`Editar publicación: ${post.title} (id: ${post.id})`)
	}

	const handleApprove = (post) => {
		fetch(`${base}/posts/${post.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved: true, updatedAt: new Date().toISOString().slice(0, 10) }) })
			.then((r) => r.json())
			.then((updated) => setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p))))
			.catch(() => alert('Error aprobando'))
	}

	return (
		<>
			<CRow className="mb-4">
				<CCol xs={12}>
					<CCard>
						<CCardHeader>
							<CRow className="align-items-center">
								<CCol md={8} className="d-flex gap-2 align-items-center">
									<div style={{ width: '40%' }}>
										<CFormLabel>Filtrar por título</CFormLabel>
										<CInputGroup>
											<CFormInput placeholder="Título" value={titleFilter} onChange={(e) => setTitleFilter(e.target.value)} />
										</CInputGroup>
									</div>
									<div style={{ width: '28%' }}>
										<CFormLabel>Filtrar por usuario</CFormLabel>
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
										<CFormLabel>Filtrar por categoría</CFormLabel>
										<CFormSelect value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
											<option value="">Todas</option>
											{categories.map((c) => (
												<option key={c} value={c}>
													{c}
												</option>
											))}
										</CFormSelect>
									</div>
								</CCol>
								<CCol md={4} className="d-flex justify-content-end">
									<CButton color="primary" onClick={handleCreate}>
										Crear publicación
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
										<CTableHeaderCell>Editado</CTableHeaderCell>
										<CTableHeaderCell style={{ width: 140 }}>Acciones</CTableHeaderCell>
									</CTableRow>
								</CTableHead>
								<CTableBody>
									{filtered.map((p) => (
										<CTableRow key={p.id} className="align-middle">
											<CTableDataCell>{p.id}</CTableDataCell>
											<CTableDataCell>{p.user}</CTableDataCell>
											<CTableDataCell>
												<div style={{ fontWeight: 700 }}>{p.title}</div>
											</CTableDataCell>
											<CTableDataCell>
												<CBadge color="secondary">{p.category}</CBadge>
											</CTableDataCell>
											<CTableDataCell>{p.createdAt}</CTableDataCell>
											<CTableDataCell>{p.updatedAt}</CTableDataCell>
											<CTableDataCell>
												<CButton size="sm" color="transparent" className="me-2" title="Editar" onClick={() => handleEdit(p)}>
													<CIcon icon={cilPencil} />
												</CButton>
												<CButton size="sm" color="transparent" className="me-2 text-danger" title="Eliminar" onClick={() => handleDelete(p)}>
													<CIcon icon={cilTrash} />
												</CButton>
												<CButton size="sm" color={p.approved ? 'success' : 'transparent'} title="Aprobar" onClick={() => handleApprove(p)}>
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
					<CModalTitle>Crear publicación</CModalTitle>
				</CModalHeader>
				<CModalBody>
					<CForm>
						<div className="mb-3">
							<CFormLabel>Usuario</CFormLabel>
							<CFormSelect value={createForm.user} onChange={(e) => setCreateForm({ ...createForm, user: e.target.value })}>
								{usersList.map((u) => (
									<option key={u} value={u}>
										{u}
									</option>
								))}
							</CFormSelect>
						</div>
						<div className="mb-3">
							<CFormLabel>Título</CFormLabel>
							<CFormInput value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
						</div>
						<div className="mb-3">
							<CFormLabel>Categoría</CFormLabel>
							<CFormSelect value={createForm.category} onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}>
								{categories.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</CFormSelect>
						</div>
					</CForm>
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

export default Post

