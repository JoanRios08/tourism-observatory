import React, { useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons'
import academicApi from '../../api/endpoints/academicApi'
import { getCampusLabel, normalizeAcademicOptions } from '../../utils/academicOptions'

const initialCampusForm = {
  name: '',
  state: '',
  type: 'main_campus',
}

const initialCareerForm = {
  name: '',
  acronym: '',
}

const initialRelationForm = {
  campus_id: '',
  career_id: '',
}

const branchTypeLabel = {
  main_campus: 'Nucleo',
  extension: 'Extension',
}

const typeColor = {
  main_campus: 'primary',
  extension: 'info',
}

const Nucleos = () => {
  const [academicOptions, setAcademicOptions] = useState({
    campuses: [],
    careers: [],
    campusCareers: [],
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [campusModalVisible, setCampusModalVisible] = useState(false)
  const [careerModalVisible, setCareerModalVisible] = useState(false)
  const [relationModalVisible, setRelationModalVisible] = useState(false)
  const [editingCampusId, setEditingCampusId] = useState(null)
  const [editingCareerId, setEditingCareerId] = useState(null)
  const [editingRelationId, setEditingRelationId] = useState(null)
  const [campusForm, setCampusForm] = useState(initialCampusForm)
  const [careerForm, setCareerForm] = useState(initialCareerForm)
  const [relationForm, setRelationForm] = useState(initialRelationForm)

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await academicApi.getOptions()
      setAcademicOptions(normalizeAcademicOptions(response.data))
    } catch (fetchError) {
      console.error('Error loading academic options', fetchError)
      setAcademicOptions({ campuses: [], careers: [], campusCareers: [] })
      setError('No se pudieron cargar los nucleos, extensiones y carreras.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const campusesById = useMemo(
    () => new Map(academicOptions.campuses.map((campus) => [String(campus.id), campus])),
    [academicOptions.campuses],
  )

  const careersById = useMemo(
    () => new Map(academicOptions.careers.map((career) => [String(career.id), career])),
    [academicOptions.careers],
  )

  const relationRows = useMemo(
    () =>
      academicOptions.campusCareers.map((relation) => ({
        ...relation,
        campus: campusesById.get(String(relation.campus_id)),
        career: careersById.get(String(relation.career_id)),
      })),
    [academicOptions.campusCareers, campusesById, careersById],
  )

  const openCreateCampus = () => {
    setEditingCampusId(null)
    setCampusForm(initialCampusForm)
    setCampusModalVisible(true)
  }

  const openEditCampus = (campus) => {
    setEditingCampusId(campus.id)
    setCampusForm({
      name: campus.name || '',
      state: campus.state || '',
      type: campus.type || 'main_campus',
    })
    setCampusModalVisible(true)
  }

  const openCreateCareer = () => {
    setEditingCareerId(null)
    setCareerForm(initialCareerForm)
    setCareerModalVisible(true)
  }

  const openEditCareer = (career) => {
    setEditingCareerId(career.id)
    setCareerForm({
      name: career.name || '',
      acronym: career.acronym || '',
    })
    setCareerModalVisible(true)
  }

  const openCreateRelation = () => {
    setEditingRelationId(null)
    setRelationForm({
      campus_id: academicOptions.campuses[0]?.id ? String(academicOptions.campuses[0].id) : '',
      career_id: academicOptions.careers[0]?.id ? String(academicOptions.careers[0].id) : '',
    })
    setRelationModalVisible(true)
  }

  const openEditRelation = (relation) => {
    setEditingRelationId(relation.id)
    setRelationForm({
      campus_id: relation.campus_id ? String(relation.campus_id) : '',
      career_id: relation.career_id ? String(relation.career_id) : '',
    })
    setRelationModalVisible(true)
  }

  const closeCampusModal = () => {
    setCampusModalVisible(false)
    setEditingCampusId(null)
    setCampusForm(initialCampusForm)
  }

  const closeCareerModal = () => {
    setCareerModalVisible(false)
    setEditingCareerId(null)
    setCareerForm(initialCareerForm)
  }

  const closeRelationModal = () => {
    setRelationModalVisible(false)
    setEditingRelationId(null)
    setRelationForm(initialRelationForm)
  }

  const saveCampus = async () => {
    if (!campusForm.name.trim() || !campusForm.state.trim()) {
      alert('Nombre y estado son obligatorios.')
      return
    }

    const payload = {
      name: campusForm.name.trim(),
      state: campusForm.state.trim(),
      type: campusForm.type,
    }

    setSaving(true)
    try {
      if (editingCampusId) {
        await academicApi.updateCampus(editingCampusId, payload)
      } else {
        await academicApi.createCampus(payload)
      }
      closeCampusModal()
      await loadData()
    } catch (saveError) {
      console.error('Error saving campus', saveError)
      alert('No se pudo guardar el nucleo o extension.')
    } finally {
      setSaving(false)
    }
  }

  const saveCareer = async () => {
    if (!careerForm.name.trim() || !careerForm.acronym.trim()) {
      alert('Nombre y acronimo son obligatorios.')
      return
    }

    const payload = {
      name: careerForm.name.trim(),
      acronym: careerForm.acronym.trim(),
    }

    setSaving(true)
    try {
      if (editingCareerId) {
        await academicApi.updateCareer(editingCareerId, payload)
      } else {
        await academicApi.createCareer(payload)
      }
      closeCareerModal()
      await loadData()
    } catch (saveError) {
      console.error('Error saving career', saveError)
      alert('No se pudo guardar la carrera.')
    } finally {
      setSaving(false)
    }
  }

  const saveRelation = async () => {
    if (!relationForm.campus_id || !relationForm.career_id) {
      alert('Seleccione un nucleo y una carrera.')
      return
    }

    const duplicated = academicOptions.campusCareers.some((relation) => {
      const sameRelation = editingRelationId && String(relation.id) === String(editingRelationId)
      return (
        !sameRelation &&
        String(relation.campus_id) === relationForm.campus_id &&
        String(relation.career_id) === relationForm.career_id
      )
    })

    if (duplicated) {
      alert('Esa carrera ya esta asociada a ese nucleo o extension.')
      return
    }

    const payload = {
      campus_id: Number(relationForm.campus_id),
      career_id: Number(relationForm.career_id),
    }

    setSaving(true)
    try {
      if (editingRelationId) {
        await academicApi.updateCampusCareer(editingRelationId, payload)
      } else {
        await academicApi.createCampusCareer(payload)
      }
      closeRelationModal()
      await loadData()
    } catch (saveError) {
      console.error('Error saving campus career', saveError)
      alert('No se pudo guardar la asignacion.')
    } finally {
      setSaving(false)
    }
  }

  const removeCampus = async (campus) => {
    const hasRelations = academicOptions.campusCareers.some(
      (relation) => String(relation.campus_id) === String(campus.id),
    )

    if (hasRelations) {
      alert('Quite primero las carreras asociadas a este nucleo o extension.')
      return
    }

    if (!window.confirm(`Eliminar "${campus.name}"?`)) return

    try {
      await academicApi.deleteCampus(campus.id)
      await loadData()
    } catch (deleteError) {
      console.error('Error deleting campus', deleteError)
      alert('No se pudo eliminar el nucleo o extension.')
    }
  }

  const removeCareer = async (career) => {
    const hasRelations = academicOptions.campusCareers.some(
      (relation) => String(relation.career_id) === String(career.id),
    )

    if (hasRelations) {
      alert('Quite primero los nucleos o extensiones asociados a esta carrera.')
      return
    }

    if (!window.confirm(`Eliminar "${career.name}"?`)) return

    try {
      await academicApi.deleteCareer(career.id)
      await loadData()
    } catch (deleteError) {
      console.error('Error deleting career', deleteError)
      alert('No se pudo eliminar la carrera.')
    }
  }

  const removeRelation = async (relation) => {
    if (
      !window.confirm(
        `Quitar "${relation.career?.name || relation.career_id}" de "${relation.campus?.name || relation.campus_id}"?`,
      )
    ) {
      return
    }

    try {
      await academicApi.deleteCampusCareer(relation.id)
      await loadData()
    } catch (deleteError) {
      console.error('Error deleting campus career', deleteError)
      alert('No se pudo eliminar la asignacion.')
    }
  }

  return (
    <>
      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CRow className="mb-4">
        <CCol md={4}>
          <CCard className="h-100">
            <CCardBody>
              <div className="text-medium-emphasis mb-2">Nucleos y extensiones</div>
              <h3 className="mb-0">{academicOptions.campuses.length}</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="h-100">
            <CCardBody>
              <div className="text-medium-emphasis mb-2">Carreras</div>
              <h3 className="mb-0">{academicOptions.careers.length}</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <CCard className="h-100">
            <CCardBody>
              <div className="text-medium-emphasis mb-2">Asignaciones</div>
              <h3 className="mb-0">{academicOptions.campusCareers.length}</h3>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {loading ? (
        <div className="text-center py-5">
          <CSpinner />
        </div>
      ) : (
        <>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Nucleos y extensiones</strong>
              <CButton color="primary" size="sm" onClick={openCreateCampus}>
                <CIcon icon={cilPlus} className="me-2" />
                Agregar
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Estado</CTableHeaderCell>
                    <CTableHeaderCell>Tipo</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 120 }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {academicOptions.campuses.map((campus) => (
                    <CTableRow key={campus.id}>
                      <CTableDataCell>{campus.id}</CTableDataCell>
                      <CTableDataCell>{campus.name}</CTableDataCell>
                      <CTableDataCell>{campus.state}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={typeColor[campus.type] || 'secondary'}>
                          {branchTypeLabel[campus.type] || campus.type}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="transparent"
                          className="me-2"
                          title="Editar"
                          onClick={() => openEditCampus(campus)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          color="transparent"
                          className="text-danger"
                          title="Eliminar"
                          onClick={() => removeCampus(campus)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Carreras</strong>
              <CButton color="primary" size="sm" onClick={openCreateCareer}>
                <CIcon icon={cilPlus} className="me-2" />
                Agregar
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Nombre</CTableHeaderCell>
                    <CTableHeaderCell>Acronimo</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 120 }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {academicOptions.careers.map((career) => (
                    <CTableRow key={career.id}>
                      <CTableDataCell>{career.id}</CTableDataCell>
                      <CTableDataCell>{career.name}</CTableDataCell>
                      <CTableDataCell>{career.acronym}</CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="transparent"
                          className="me-2"
                          title="Editar"
                          onClick={() => openEditCareer(career)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          color="transparent"
                          className="text-danger"
                          title="Eliminar"
                          onClick={() => removeCareer(career)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>

          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Carreras por nucleo</strong>
              <CButton color="primary" size="sm" onClick={openCreateRelation}>
                <CIcon icon={cilPlus} className="me-2" />
                Agregar
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>ID</CTableHeaderCell>
                    <CTableHeaderCell>Nucleo / Extension</CTableHeaderCell>
                    <CTableHeaderCell>Carrera</CTableHeaderCell>
                    <CTableHeaderCell style={{ width: 120 }}>Acciones</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {relationRows.map((relation) => (
                    <CTableRow key={relation.id}>
                      <CTableDataCell>{relation.id}</CTableDataCell>
                      <CTableDataCell>
                        {relation.campus ? getCampusLabel(relation.campus) : relation.campus_id}
                      </CTableDataCell>
                      <CTableDataCell>
                        {relation.career
                          ? `${relation.career.name} (${relation.career.acronym})`
                          : relation.career_id}
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          size="sm"
                          color="transparent"
                          className="me-2"
                          title="Editar"
                          onClick={() => openEditRelation(relation)}
                        >
                          <CIcon icon={cilPencil} />
                        </CButton>
                        <CButton
                          size="sm"
                          color="transparent"
                          className="text-danger"
                          title="Eliminar"
                          onClick={() => removeRelation(relation)}
                        >
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </>
      )}

      <CModal visible={campusModalVisible} onClose={closeCampusModal}>
        <CModalHeader>
          <CModalTitle>{editingCampusId ? 'Editar nucleo' : 'Crear nucleo'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              value={campusForm.name}
              onChange={(event) => setCampusForm({ ...campusForm, name: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Estado</CFormLabel>
            <CFormInput
              value={campusForm.state}
              onChange={(event) => setCampusForm({ ...campusForm, state: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Tipo</CFormLabel>
            <CFormSelect
              value={campusForm.type}
              onChange={(event) => setCampusForm({ ...campusForm, type: event.target.value })}
            >
              <option value="main_campus">Nucleo principal</option>
              <option value="extension">Extension</option>
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeCampusModal}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={saveCampus}>
            {saving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={careerModalVisible} onClose={closeCareerModal}>
        <CModalHeader>
          <CModalTitle>{editingCareerId ? 'Editar carrera' : 'Crear carrera'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nombre</CFormLabel>
            <CFormInput
              value={careerForm.name}
              onChange={(event) => setCareerForm({ ...careerForm, name: event.target.value })}
            />
          </div>
          <div className="mb-3">
            <CFormLabel>Acronimo</CFormLabel>
            <CFormInput
              value={careerForm.acronym}
              onChange={(event) => setCareerForm({ ...careerForm, acronym: event.target.value })}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeCareerModal}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={saveCareer}>
            {saving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={relationModalVisible} onClose={closeRelationModal}>
        <CModalHeader>
          <CModalTitle>{editingRelationId ? 'Editar asignacion' : 'Asignar carrera'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel>Nucleo / Extension</CFormLabel>
            <CFormSelect
              value={relationForm.campus_id}
              onChange={(event) =>
                setRelationForm({ ...relationForm, campus_id: event.target.value })
              }
            >
              <option value="">Seleccione un nucleo o extension</option>
              {academicOptions.campuses.map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {getCampusLabel(campus)}
                </option>
              ))}
            </CFormSelect>
          </div>
          <div className="mb-3">
            <CFormLabel>Carrera</CFormLabel>
            <CFormSelect
              value={relationForm.career_id}
              onChange={(event) =>
                setRelationForm({ ...relationForm, career_id: event.target.value })
              }
            >
              <option value="">Seleccione una carrera</option>
              {academicOptions.careers.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.name} ({career.acronym})
                </option>
              ))}
            </CFormSelect>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeRelationModal}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={saveRelation}>
            {saving ? 'Guardando...' : 'Guardar'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Nucleos
