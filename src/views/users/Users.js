import React, { useMemo, useState } from 'react'
import {
	CRow,
	CCol,
	CCard,
	CCardHeader,
	CCardBody,
	CInputGroup,
	CFormInput,
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
	CFormSelect,
} from '@coreui/react'

const Users = () => {
	const [search, setSearch] = useState('')

	
	const initialUsers = [
		{
			id: 1,
			cedula: 'V-12345678',
			nombre: 'María',
			apellido: 'López',
			rol: 'Administrador',
			createdAt: '2025-10-01',
			updatedAt: '2025-11-02',
		},
		{
			id: 2,
			cedula: 'V-87654321',
			nombre: 'Carlos',
			apellido: 'Ruiz',
			rol: 'Coordinador',
			createdAt: '2025-09-12',
			updatedAt: '2025-10-20',
		},
		{
			id: 3,
			cedula: 'E-11223344',
			nombre: 'Ana',
			apellido: 'Gómez',
			rol: 'Profesor',
			createdAt: '2025-11-05',
			updatedAt: '2025-11-06',
		},
	]

	const [users, setUsers] = useState([])
	const [showCreate, setShowCreate] = useState(false)
	const [createForm, setCreateForm] = useState({ cedula: '', nombre: '', apellido: '', rol: 'Profesor' })
	const base = window.__API_BASE__ || 'http://localhost:3001'

	React.useEffect(() => {
		fetch(`${base}/users?_sort=createdAt&_order=desc`)
			.then((r) => r.json())
			.then(setUsers)
			.catch(() => setUsers([]))
	}, [])

	const filtered = useMemo(() => {
		if (!search) return users
		const q = search.toLowerCase()
		return users.filter((u) => {
			return (
				(u.cedula || '').toLowerCase().includes(q) ||
				(`${u.nombre} ${u.apellido}`.toLowerCase().includes(q) || u.rol.toLowerCase().includes(q))
			)
		})
	}, [search, users])

	const handleCreate = () => {
		setShowCreate(true)
	}

	const handleSaveCreate = () => {
		
		if (!createForm.cedula || !createForm.nombre) {
			alert('Por favor rellena Cédula y Nombre')
			return
		}
		const now = new Date().toISOString().slice(0, 10)
		const newUser = {
			cedula: createForm.cedula,
			nombre: createForm.nombre,
			apellido: createForm.apellido,
			fullName: `${createForm.nombre} ${createForm.apellido}`,
			rol: createForm.rol,
			createdAt: now,
			updatedAt: now,
		}
		fetch(`${base}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) })
			.then((r) => r.json())
			.then((created) => setUsers((prev) => [created, ...prev]))
			.catch(() => alert('Error creando usuario'))
		setShowCreate(false)
		setCreateForm({ cedula: '', nombre: '', apellido: '', rol: 'Viewer' })
	}

	const handleEdit = (user) => {
		alert(`Editar usuario ${user.nombre} ${user.apellido} (id: ${user.id})`)
	}

	const handleDelete = (user) => {
		if (!window.confirm(`¿Eliminar usuario ${user.nombre} ${user.apellido}?`)) return
		fetch(`${base}/users/${user.id}`, { method: 'DELETE' })
			.then(() => setUsers((prev) => prev.filter((u) => u.id !== user.id)))
			.catch(() => alert('Error eliminando usuario'))
	}

	return (
		<>
			<CRow className="mb-4">
				<CCol xs={12}>
					<CCard>
						<CCardHeader>
							<CRow className="align-items-center">
								<CCol md={8} className="d-flex justify-content-center">
									<div style={{ width: '100%', maxWidth: 720 }}>
										<CInputGroup>
											<CFormInput
												placeholder="Buscar por c.i, nombre o rol..."
												value={search}
												onChange={(e) => setSearch(e.target.value)}
											/>
											<CButton color="secondary" onClick={() => setSearch('')}>Limpiar</CButton>
										</CInputGroup>
									</div>
								</CCol>
								<CCol md={4} className="d-flex justify-content-end">
									<CButton color="primary" onClick={handleCreate}>Crear nuevo usuario</CButton>
								</CCol>
							</CRow>
						</CCardHeader>
						<CCardBody>
							<CTable hover responsive>
								<CTableHead>
									<CTableRow>
										<CTableHeaderCell scope="col">Cédula</CTableHeaderCell>
										<CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
										<CTableHeaderCell scope="col">Apellido</CTableHeaderCell>
										<CTableHeaderCell scope="col">Rol</CTableHeaderCell>
										<CTableHeaderCell scope="col">Creado</CTableHeaderCell>
										<CTableHeaderCell scope="col">Editado</CTableHeaderCell>
										<CTableHeaderCell scope="col" style={{ width: 160 }}>Acciones</CTableHeaderCell>
									</CTableRow>
								</CTableHead>
								<CTableBody>
									{filtered.map((u) => (
										<CTableRow key={u.id}>
											<CTableDataCell>{u.cedula}</CTableDataCell>
											<CTableDataCell>{u.nombre}</CTableDataCell>
											<CTableDataCell>{u.apellido}</CTableDataCell>
											<CTableDataCell>
												<CBadge color={u.rol === 'Administrador' ? 'primary' : u.rol === 'Coordinador' ? 'info' : 'secondary'}>
													{u.rol}
												</CBadge>
											</CTableDataCell>
											<CTableDataCell>{u.createdAt}</CTableDataCell>
											<CTableDataCell>{u.updatedAt}</CTableDataCell>
											<CTableDataCell>
												<CButton size="sm" color="info" className="me-2" onClick={() => handleEdit(u)}>
													Editar
												</CButton>
												<CButton size="sm" color="danger" onClick={() => handleDelete(u)}>
													Eliminar
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
						<CModalTitle>Crear nuevo usuario</CModalTitle>
					</CModalHeader>
					<CModalBody>
						<CForm>
							<div className="mb-3">
								<CFormLabel>Cédula</CFormLabel>
								<CFormInput value={createForm.cedula} onChange={(e) => setCreateForm({ ...createForm, cedula: e.target.value })} />
							</div>
							<div className="mb-3">
								<CFormLabel>Nombre</CFormLabel>
								<CFormInput value={createForm.nombre} onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })} />
							</div>
							<div className="mb-3">
								<CFormLabel>Apellido</CFormLabel>
								<CFormInput value={createForm.apellido} onChange={(e) => setCreateForm({ ...createForm, apellido: e.target.value })} />
							</div>
							<div className="mb-3">
								<CFormLabel>Rol</CFormLabel>
                                						<CFormSelect value={createForm.rol} onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value })}>
                                							<option>Administrador</option>
                                							<option>Coordinador</option>
                                							<option>Profesor</option>
                                						</CFormSelect>
							</div>
						</CForm>
					</CModalBody>
					<CModalFooter>
						<CButton color="secondary" onClick={() => setShowCreate(false)}>Cancelar</CButton>
						<CButton color="primary" onClick={handleSaveCreate}>Crear</CButton>
					</CModalFooter>
				</CModal>
		</>
	)
}

export default Users

