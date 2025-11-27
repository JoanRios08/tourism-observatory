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
	// sample users and categories (could be fetched from API)
	const usersList = ['María López', 'Carlos Ruiz', 'Ana Gómez']
	const categories = ['Noticias', 'Eventos', 'Anuncios']

	const initialPosts = [
		{ id: 1, user: 'María López', title: 'Lanzamiento del Observatorio', category: 'Noticias', createdAt: '2025-10-01', updatedAt: '2025-10-05', approved: true },
		{ id: 2, user: 'Carlos Ruiz', title: 'Charla sobre turismo sostenible', category: 'Eventos', createdAt: '2025-11-02', updatedAt: '2025-11-03', approved: false },
		{ id: 3, user: 'Ana Gómez', title: 'Actualización de proyectos', category: 'Anuncios', createdAt: '2025-11-10', updatedAt: '2025-11-11', approved: false },
	]

	const [posts, setPosts] = useState(initialPosts)
	const [titleFilter, setTitleFilter] = useState('')
	const [userFilter, setUserFilter] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('')

	const [showCreate, setShowCreate] = useState(false)
	const [createForm, setCreateForm] = useState({ user: usersList[0], title: '', category: categories[0] })

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
		const nextId = posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1
		const now = new Date().toISOString().slice(0, 10)
		const newPost = { id: nextId, user: createForm.user, title: createForm.title, category: createForm.category, createdAt: now, updatedAt: now, approved: false }
		setPosts([newPost, ...posts])
		setShowCreate(false)
		setCreateForm({ user: usersList[0], title: '', category: categories[0] })
	}

	const handleDelete = (post) => {
		if (window.confirm(`¿Eliminar publicación "${post.title}"?`)) {
			setPosts(posts.filter((p) => p.id !== post.id))
		}
	}

	const handleEdit = (post) => {
		alert(`Editar publicación: ${post.title} (id: ${post.id})`)
	}

	const handleApprove = (post) => {
		setPosts(posts.map((p) => (p.id === post.id ? { ...p, approved: true, updatedAt: new Date().toISOString().slice(0, 10) } : p)))
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

			{/* Create modal */}
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

