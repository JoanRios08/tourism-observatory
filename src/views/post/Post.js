import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CInputGroup,
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
import { cilCheck, cilPencil, cilTrash } from '@coreui/icons'
import authorsApi from '../../api/endpoints/authorsApi'
import postsApi from '../../api/endpoints/postsApi'
import { extractCollection, formatDate } from '../../utils/observatoryAdapters'

const initialForm = { author_id: '', title: '', category_id: '', content: '' }

const statusColor = {
  published: 'success',
  pending_approval: 'warning',
  draft: 'secondary',
}

const fallbackCategories = [
  { id: 1, name: 'Categoría 1' },
  { id: 2, name: 'Categoría 2' },
  { id: 3, name: 'Categoría 3' },
  { id: 4, name: 'Categoría 4' },
  { id: 5, name: 'Categoría 5' },
  { id: 6, name: 'Categoría 6' },
  { id: 7, name: 'Categoría 7' },
  { id: 8, name: 'Categoría 8' },
]

const normalizePostStatus = (post) => {
  if (post.status) return post.status
  if (post.approved === true) return 'published'
  if (post.approved === false) return 'pending_approval'
  return ''
}

const normalizePost = (post) => ({
  ...post,
  id: post.id ?? post.ID ?? null,
  title: post.title ?? post.name ?? '',
  content: post.content ?? post.body ?? '',
  status: normalizePostStatus(post),
  created_at: post.created_at ?? post.createdAt ?? '',
  updated_at: post.updated_at ?? post.updatedAt ?? '',
  user_id: post.user_id ?? post.userId ?? post.author_id ?? post.authorId ?? null,
  category_id: post.category_id ?? post.categoryId ?? null,
  categoryName: post.category_name ?? post.categoryName ?? post.category ?? '',
  author_id: post.author_id ?? post.authorId ?? post.user_id ?? post.userId ?? null,
})

const getCollection = (payload, keys) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload
  return extractCollection(data, keys)
}

const toNumberOrUndefined = (value) => {
  if (value === '' || value === null || value === undefined) return undefined
  const numberValue = Number(value)
  return Number.isNaN(numberValue) ? undefined : numberValue
}

const getPostPayload = (form, status = 'pending_approval') => {
  const authorId = toNumberOrUndefined(form.author_id)
  const categoryId = toNumberOrUndefined(form.category_id)

  return {
    title: form.title.trim(),
    content: form.content.trim(),
    status,
    user_id: authorId,
    author_id: authorId,
    category_id: categoryId,
  }
}

const isPublished = (post) => normalizePostStatus(post) === 'published'

const getNextPostStatus = (post) => (isPublished(post) ? 'pending_approval' : 'published')

const Post = () => {
  const [authors, setAuthors] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [titleFilter, setTitleFilter] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editForm, setEditForm] = useState(initialForm)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState(initialForm)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [postsResponse, authorsResponse] = await Promise.all([
        postsApi.getPosts(true),
        authorsApi.getAuthors(),
      ])

      setPosts(getCollection(postsResponse.data, ['posts']).map(normalizePost))
      setAuthors(getCollection(authorsResponse.data, ['authors']))
    } catch (loadError) {
      console.error('Error cargando publicaciones', loadError)
      setPosts([])
      setAuthors([])
      setError('No se pudieron cargar las publicaciones.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const authorNameById = useMemo(
    () => new Map(authors.map((author) => [String(author.id), author.name || author.email || ''])),
    [authors],
  )

  const categoryOptions = useMemo(() => {
    const categoriesById = new Map(fallbackCategories.map((category) => [category.id, category]))

    posts.forEach((post) => {
      if (!post.category_id) return
      categoriesById.set(Number(post.category_id), {
        id: Number(post.category_id),
        name: post.categoryName || `Categoría ${post.category_id}`,
      })
    })

    return [...categoriesById.values()].sort((a, b) => a.id - b.id)
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const query = titleFilter.trim().toLowerCase()
      const matchesTitle = !query || post.title.toLowerCase().includes(query)
      const matchesAuthor = !authorFilter || String(post.author_id || post.user_id) === authorFilter
      const matchesCategory = !categoryFilter || String(post.category_id) === categoryFilter
      return matchesTitle && matchesAuthor && matchesCategory
    })
  }, [posts, titleFilter, authorFilter, categoryFilter])

  const openCreate = () => {
    setCreateForm({
      ...initialForm,
      author_id: authors[0]?.id ? String(authors[0].id) : '',
      category_id: categoryOptions[0]?.id ? String(categoryOptions[0].id) : '',
    })
    setShowCreate(true)
  }

  const openEdit = (post) => {
    setEditingPost(post)
    setEditForm({
      author_id: post.author_id || post.user_id ? String(post.author_id || post.user_id) : '',
      title: post.title || '',
      category_id: post.category_id ? String(post.category_id) : '',
      content: post.content || '',
    })
    setShowEdit(true)
  }

  const closeCreate = () => {
    setShowCreate(false)
    setCreateForm(initialForm)
  }

  const closeEdit = () => {
    setShowEdit(false)
    setEditingPost(null)
    setEditForm(initialForm)
  }

  const saveCreate = async () => {
    if (!createForm.title.trim() || !createForm.author_id || !createForm.category_id) {
      alert('Título, autor y categoría son obligatorios.')
      return
    }

    setSaving(true)
    try {
      await postsApi.createPost(getPostPayload(createForm))
      closeCreate()
      await loadData()
    } catch (createError) {
      console.error('Error creando publicación', createError)
      alert(
        'Error creando publicación: ' +
          (createError.response?.data?.error ||
            createError.response?.data?.message ||
            createError.message),
      )
    } finally {
      setSaving(false)
    }
  }

  const saveEdit = async () => {
    if (!editForm.title.trim() || !editForm.author_id || !editForm.category_id) {
      alert('Título, autor y categoría son obligatorios.')
      return
    }

    setSaving(true)
    try {
      await postsApi.updatePost(
        editingPost.id,
        getPostPayload(editForm, editingPost.status || 'pending_approval'),
      )
      closeEdit()
      await loadData()
    } catch (updateError) {
      console.error('Error actualizando publicación', updateError)
      alert(
        'Error actualizando publicación: ' +
          (updateError.response?.data?.error ||
            updateError.response?.data?.message ||
            updateError.message),
      )
    } finally {
      setSaving(false)
    }
  }

  const deletePost = async (post) => {
    if (!window.confirm(`¿Eliminar publicación "${post.title}"?`)) return

    try {
      await postsApi.deletePost(post.id)
      setPosts((current) => current.filter((item) => item.id !== post.id))
    } catch (deleteError) {
      console.error('Error eliminando publicación', deleteError)
      alert(
        'Error eliminando publicación: ' +
          (deleteError.response?.data?.error ||
            deleteError.response?.data?.message ||
            deleteError.message),
      )
    }
  }

  const toggleStatus = async (post) => {
    const newStatus = getNextPostStatus(post)

    try {
      await postsApi.updatePost(
        post.id,
        getPostPayload(
          {
            author_id: post.author_id || post.user_id,
            title: post.title,
            category_id: post.category_id,
            content: post.content,
          },
          newStatus,
        ),
      )

      setPosts((current) =>
        current.map((item) =>
          item.id === post.id
            ? { ...item, status: newStatus, updated_at: new Date().toISOString() }
            : item,
        ),
      )
    } catch (statusError) {
      console.error('Error cambiando estado', statusError)
      alert(
        'Error cambiando estado: ' +
          (statusError.response?.data?.error ||
            statusError.response?.data?.message ||
            statusError.message),
      )
    }
  }

  return (
    <>
      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CRow className="mb-4">
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <CRow className="align-items-end g-3">
                <CCol md={4}>
                  <CFormLabel>Filtrar por título</CFormLabel>
                  <CInputGroup>
                    <CFormInput
                      placeholder="Título"
                      value={titleFilter}
                      onChange={(event) => setTitleFilter(event.target.value)}
                    />
                  </CInputGroup>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Filtrar por autor</CFormLabel>
                  <CFormSelect
                    value={authorFilter}
                    onChange={(event) => setAuthorFilter(event.target.value)}
                  >
                    <option value="">Todos</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name || author.email}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={3}>
                  <CFormLabel>Filtrar por categoría</CFormLabel>
                  <CFormSelect
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    <option value="">Todas</option>
                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
                <CCol md={2} className="d-flex justify-content-end">
                  <CButton color="primary" onClick={openCreate}>
                    Crear publicación
                  </CButton>
                </CCol>
              </CRow>
            </CCardHeader>
            <CCardBody>
              {loading ? (
                <div className="text-center py-5">
                  <CSpinner />
                </div>
              ) : (
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
                    {filtered.map((post) => (
                      <CTableRow key={post.id} className="align-middle">
                        <CTableDataCell>{post.id}</CTableDataCell>
                        <CTableDataCell>
                          {authorNameById.get(String(post.author_id || post.user_id)) ||
                            post.author_id ||
                            post.user_id}
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong>{post.title}</strong>
                        </CTableDataCell>
                        <CTableDataCell
                          style={{
                            maxWidth: 400,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {post.content}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={statusColor[post.status] || 'secondary'}>
                            {post.status}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>{formatDate(post.created_at)}</CTableDataCell>
                        <CTableDataCell>{formatDate(post.updated_at)}</CTableDataCell>
                        <CTableDataCell>
                          <CButton
                            size="sm"
                            color="transparent"
                            className="me-2"
                            title="Editar"
                            onClick={() => openEdit(post)}
                          >
                            <CIcon icon={cilPencil} />
                          </CButton>
                          <CButton
                            size="sm"
                            color="transparent"
                            className="me-2 text-danger"
                            title="Eliminar"
                            onClick={() => deletePost(post)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                          <CButton
                            size="sm"
                            color={isPublished(post) ? 'success' : 'warning'}
                            title={isPublished(post) ? 'Marcar como pendiente' : 'Publicar'}
                            onClick={() => toggleStatus(post)}
                          >
                            <CIcon icon={cilCheck} />
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showCreate} onClose={closeCreate}>
        <CModalHeader>
          <CModalTitle>Crear publicación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <PostForm
              form={createForm}
              setForm={setCreateForm}
              authors={authors}
              categories={categoryOptions}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeCreate}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={saveCreate}>
            {saving ? 'Guardando...' : 'Crear'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={showEdit} onClose={closeEdit}>
        <CModalHeader>
          <CModalTitle>Editar publicación</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <PostForm
              form={editForm}
              setForm={setEditForm}
              authors={authors}
              categories={categoryOptions}
            />
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={closeEdit}>
            Cancelar
          </CButton>
          <CButton color="primary" disabled={saving} onClick={saveEdit}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

const PostForm = ({ form, setForm, authors, categories }) => (
  <>
    <div className="mb-3">
      <CFormLabel>Autor</CFormLabel>
      <CFormSelect
        value={form.author_id}
        onChange={(event) => setForm({ ...form, author_id: event.target.value })}
      >
        <option value="">Seleccione un autor</option>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>
            {author.name || author.email}
          </option>
        ))}
      </CFormSelect>
    </div>

    <div className="mb-3">
      <CFormLabel>Título</CFormLabel>
      <CFormInput
        value={form.title}
        onChange={(event) => setForm({ ...form, title: event.target.value })}
      />
    </div>

    <div className="mb-3">
      <CFormLabel>Contenido</CFormLabel>
      <CFormTextarea
        rows={4}
        value={form.content}
        onChange={(event) => setForm({ ...form, content: event.target.value })}
      />
    </div>

    <div className="mb-3">
      <CFormLabel>Categoría</CFormLabel>
      <CFormSelect
        value={form.category_id}
        onChange={(event) => setForm({ ...form, category_id: event.target.value })}
      >
        <option value="">Seleccione una categoría</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </CFormSelect>
    </div>
  </>
)

export default Post
