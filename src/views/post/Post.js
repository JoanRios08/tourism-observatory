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
import postsApi from '../../api/endpoints/postsApi'
import axiosClient from '../../api/axiosClient'

const Post = () => {
	console.log('🔍 postsApi importado:', postsApi)
	console.log('🔍 postsApi.getPosts existe?:', typeof postsApi?.getPosts)
	const [usersList, setUsersList] = useState([])
	const [categories, setCategories] = useState(['Noticias', 'Eventos', 'Anuncios'])
	const [posts, setPosts] = useState([])
	const [titleFilter, setTitleFilter] = useState('')
	const [userFilter, setUserFilter] = useState('')
	const [categoryFilter, setCategoryFilter] = useState('')
	const [showEdit, setShowEdit] = useState(false)
	const [editingPost, setEditingPost] = useState(null)
	const [editForm, setEditForm] = useState({ user: '', title: '', category: '', content: '' })
	const [showCreate, setShowCreate] = useState(false)
	const [createForm, setCreateForm] = useState({ user: '', title: '', category: '', content: '' })

	React.useEffect(() => {
	console.log('🚀 useEffect INICIO')
	
	const loadData = async () => {
		try {
			console.log('📞 Llamando a postsApi.getPosts...')
			const res = await postsApi.getPosts(true)
			console.log('📦 Respuesta completa:', res)
			
			// PARSEAR EL JSON SI ES STRING
			let data = res?.data
			if (typeof data === 'string') {
				console.log('⚠️ res.data es string, parseando JSON...')
				try {
					data = JSON.parse(data)
					console.log('✅ JSON parseado:', data)
				} catch (e) {
					console.error('❌ Error parseando JSON:', e)
					throw new Error('La respuesta no es JSON válido')
				}
			}
			
			// Ahora extraer los posts
			const arr = data?.posts || []
			console.log('📋 Array de posts:', arr)
			console.log('📋 Cantidad de posts:', arr.length)
			
			if (arr.length === 0) {
				console.warn('⚠️ El array está vacío!')
			}
			
			const normalized = arr.map((p) => ({
				id: p.id ?? p.ID ?? null,
				title: p.title ?? p.name ?? '',
				content: p.content ?? p.body ?? '',
				status: p.status ?? p.state ?? '',
				created_at: p.created_at ?? p.createdAt ?? '',
				updated_at: p.updated_at ?? p.updatedAt ?? '',
				user_id: p.user_id ?? p.userId ?? p.author_id ?? p.authorId ?? null,
				category_id: p.category_id ?? p.categoryId ?? p.category ?? null,
				author_id: p.author_id ?? p.authorId ?? p.user_id ?? null,
			}))
			
			console.log('✅ Posts normalizados:', normalized)
			setPosts(normalized)
			
		} catch (err) {
			console.error('❌ ERROR en loadData:', err)
			setPosts([])
		}
		
		// Load users (probablemente también necesita parseo)
		try {
			const res = await axiosClient.get('/users', { params: { t: Date.now() } })
			
			let data = res?.data
			if (typeof data === 'string') {
				data = JSON.parse(data)
			}
			
			const arr = data?.users || (Array.isArray(data) ? data : data?.data || [])
			
			const names = arr.reduce((acc, u) => {
				acc[u.id ?? u._id] = u.fullName || `${u.nombre || u.first_name || ''} ${u.apellido || u.last_name || ''}`.trim()
				return acc
			}, {})
			setUsersList(names)
		} catch (err) {
			console.error('❌ Error cargando users:', err)
			setUsersList({})
		}
	}
	
	loadData()
}, [])

	const filtered = useMemo(() => {
		return posts.filter((p) => {
			const matchTitle = titleFilter ? (p.title || '').toLowerCase().includes(titleFilter.toLowerCase()) : true
			const matchUser = userFilter ? String(p.user_id || p.author_id || '') === String(userFilter) : true
			const matchCategory = categoryFilter ? String(p.category_id || p.category || '') === String(categoryFilter) : true
			return matchTitle && matchUser && matchCategory
		})
	}, [posts, titleFilter, userFilter, categoryFilter])

	const formatDate = (d) => {
		if (!d) return ''
		try {
			return new Date(d).toLocaleString()
		} catch (e) {
			return String(d)
		}
	}

	const handleCreate = () => setShowCreate(true)

	const handleSaveCreate = () => {
		if (!createForm.title) {
			alert('El título es obligatorio')
			return
		}
		const payload = {
			title: createForm.title,
			content: createForm.content || '',
			status: 'pending_approval',
			user_id: createForm.user || null,
			category_id: createForm.category || null,
		}
		postsApi
			.createPost(payload)
			.then(() => {
				// CAMBIO AQUÍ: Usar .posts
				postsApi.getPosts(true).then((r) => {
					const raw = r?.data ?? r
					const arr = raw?.posts || (Array.isArray(raw) ? raw : raw?.data || [])
					const normalize = (p) => ({
						id: p.id ?? p.ID ?? null,
						title: p.title ?? p.name ?? '',
						content: p.content ?? p.body ?? '',
						status: p.status ?? p.state ?? '',
						created_at: p.created_at ?? p.createdAt ?? '',
						updated_at: p.updated_at ?? p.updatedAt ?? '',
						user_id: p.user_id ?? p.userId ?? p.author_id ?? p.authorId ?? null,
						category_id: p.category_id ?? p.categoryId ?? p.category ?? null,
						author_id: p.author_id ?? p.authorId ?? p.user_id ?? null,
					})
					setPosts(arr.map(normalize))
				})
			})
			.catch(() => alert('Error creando publicación'))
		setShowCreate(false)
		setCreateForm({ user: '', title: '', category: '', content: '' })
	}

	const handleDelete = async (post) => {
		if (!window.confirm(`¿Eliminar publicación "${post.title}"?`)) return
		
		try {
			await postsApi.deletePost(post.id)
			setPosts((prev) => prev.filter((p) => (p.id ?? p.ID) !== post.id))
		} catch (err) {
			console.error('Error eliminando post:', err)
			alert('Error eliminando publicación')
		}
	}

	const handleEdit = (post) => {
		setEditingPost(post)
		setEditForm({
			user: post.user_id || post.author_id || '',
			title: post.title || '',
			category: post.category_id || post.category || '',
			content: post.content || ''
		})
		setShowEdit(true)
	}
	const handleSaveEdit = async () => {
		if (!editForm.title) {
			alert('El título es obligatorio')
			return
		}
		
		try {
			const payload = {
				title: editForm.title,
				content: editForm.content || '',
				user_id: editForm.user || null,
				category_id: editForm.category || null,
				updated_at: new Date().toISOString()
			}
			
			await postsApi.updatePost(editingPost.id, payload)
			
			// Recargar posts
			const res = await postsApi.getPosts(true)
			let data = res?.data
			if (typeof data === 'string') {
				data = JSON.parse(data)
			}
			
			const arr = data?.posts || []
			const normalized = arr.map((p) => ({
				id: p.id ?? p.ID ?? null,
				title: p.title ?? p.name ?? '',
				content: p.content ?? p.body ?? '',
				status: p.status ?? p.state ?? '',
				created_at: p.created_at ?? p.createdAt ?? '',
				updated_at: p.updated_at ?? p.updatedAt ?? '',
				user_id: p.user_id ?? p.userId ?? p.author_id ?? p.authorId ?? null,
				category_id: p.category_id ?? p.categoryId ?? p.category ?? null,
				author_id: p.author_id ?? p.authorId ?? p.user_id ?? null,
			}))
			
			setPosts(normalized)
			setShowEdit(false)
			setEditingPost(null)
			
		} catch (err) {
			console.error('Error actualizando post:', err)
			alert('Error actualizando publicación')
		}
	}
	const handleApprove = async (post) => {
	try {
		const newStatus = post.status === 'approved' ? 'pending_approval' : 'approved'
		
		// Solo status
		const payload = { status: newStatus }
		
		console.log('📤 Enviando:', payload)
		
		const res = await postsApi.updatePost(post.id, payload)
		
		setPosts((prev) => 
			prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
		)
		
	} catch (err) {
		console.error('❌ Error completo:', err)
		console.error('❌ Response data:', err.response?.data)
		alert('Error cambiando estado: ' + (err.response?.data?.message || err.message))
	}
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
											{Array.isArray(usersList)
												? usersList.map((u) => (
													<option key={u.id || u} value={u.id ?? u}>
														{u.fullName ?? `${u.nombre || u.first_name || ''} ${u.apellido || u.last_name || ''}`.trim()}
													</option>
												))
												: Object.entries(usersList || {}).map(([id, name]) => (
													<option key={id} value={id}>
														{name}
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
										<CTableHeaderCell>Autor</CTableHeaderCell>
										<CTableHeaderCell>Título</CTableHeaderCell>
										<CTableHeaderCell>Contenido</CTableHeaderCell>
										<CTableHeaderCell>Estado</CTableHeaderCell>
										<CTableHeaderCell>Creado</CTableHeaderCell>
										<CTableHeaderCell>Editado</CTableHeaderCell>
										<CTableHeaderCell style={{ width: 140 }}>Acciones</CTableHeaderCell>
									</CTableRow>
								</CTableHead>
								<CTableBody>
									{filtered.map((p) => (
										<CTableRow key={p.id} className="align-middle">
											<CTableDataCell>{p.id}</CTableDataCell>
											<CTableDataCell>{usersList[p.user_id] || usersList[p.author_id] || p.user_id}</CTableDataCell>
											<CTableDataCell>
												<div style={{ fontWeight: 700 }}>{p.title}</div>
											</CTableDataCell>
											<CTableDataCell style={{ maxWidth: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.content}</CTableDataCell>
											<CTableDataCell>
												<CBadge color={p.status === 'approved' ? 'success' : p.status === 'pending_approval' ? 'warning' : 'secondary'}>
													{p.status}
												</CBadge>
											</CTableDataCell>
											<CTableDataCell>{formatDate(p.created_at || p.createdAt)}</CTableDataCell>
											<CTableDataCell>{formatDate(p.updated_at || p.updatedAt)}</CTableDataCell>
											<CTableDataCell>
												<CButton size="sm" color="transparent" className="me-2" title="Editar" onClick={() => handleEdit(p)}>
													<CIcon icon={cilPencil} />
												</CButton>
												<CButton size="sm" color="transparent" className="me-2 text-danger" title="Eliminar" onClick={() => handleDelete(p)}>
													<CIcon icon={cilTrash} />
												</CButton>
												<CButton 
	size="sm" 
	color={p.status === 'approved' ? 'success' : 'warning'} 
	title={p.status === 'approved' ? 'Marcar como pendiente' : 'Aprobar'} 
	onClick={() => handleApprove(p)}
>
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
								<option value="">Selecciona...</option>
								{Array.isArray(usersList)
									? usersList.map((u) => (
										<option key={u.id || u} value={u.id ?? u}>
											{u.fullName ?? `${u.nombre || u.first_name || ''} ${u.apellido || u.last_name || ''}`.trim()}
										</option>
									))
									: Object.entries(usersList || {}).map(([id, name]) => (
										<option key={id} value={id}>
											{name}
										</option>
									))}
							</CFormSelect>
						</div>

						<div className="mb-3">
							<CFormLabel>Contenido</CFormLabel>
							<CFormInput value={createForm.content} onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })} />
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
			<CModal visible={showEdit} onClose={() => setShowEdit(false)}>
				<CModalHeader>
					<CModalTitle>Editar publicación</CModalTitle>
				</CModalHeader>
				<CModalBody>
					<CForm>
						<div className="mb-3">
							<CFormLabel>Usuario</CFormLabel>
							<CFormSelect value={editForm.user} onChange={(e) => setEditForm({ ...editForm, user: e.target.value })}>
								<option value="">Selecciona...</option>
								{Object.entries(usersList || {}).map(([id, name]) => (
									<option key={id} value={id}>
										{name}
									</option>
								))}
							</CFormSelect>
						</div>

						<div className="mb-3">
							<CFormLabel>Título</CFormLabel>
							<CFormInput value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
						</div>

						<div className="mb-3">
							<CFormLabel>Contenido</CFormLabel>
							<CFormInput value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} />
						</div>

						<div className="mb-3">
							<CFormLabel>Categoría</CFormLabel>
							<CFormSelect value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
								<option value="">Selecciona...</option>
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
					<CButton color="secondary" onClick={() => setShowEdit(false)}>
						Cancelar
					</CButton>
					<CButton color="primary" onClick={handleSaveEdit}>
						Guardar cambios
					</CButton>
				</CModalFooter>
			</CModal>
		</>
	)
}

export default Post

