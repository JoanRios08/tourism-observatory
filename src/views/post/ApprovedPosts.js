import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CAlert,
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CRow,
  CSpinner,
} from '@coreui/react'
import authorsApi from '../../api/endpoints/authorsApi'
import postsApi from '../../api/endpoints/postsApi'
import { extractCollection, formatDate } from '../../utils/observatoryAdapters'

const getCollection = (payload, keys) => {
  const data = typeof payload === 'string' ? JSON.parse(payload) : payload
  return extractCollection(data, keys)
}

const normalizePostStatus = (post) => {
  if (post.status === 'published') return 'approved'
  if (post.status) return post.status
  if (post.approved === true) return 'approved'
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
  author_id: post.author_id ?? post.authorId ?? post.user_id ?? post.userId ?? null,
  user_id: post.user_id ?? post.userId ?? post.author_id ?? post.authorId ?? null,
  category_id: post.category_id ?? post.categoryId ?? null,
  categoryName: post.category_name ?? post.categoryName ?? post.category ?? '',
})

const ApprovedPosts = () => {
  const [posts, setPosts] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [postsResponse, authorsResponse] = await Promise.all([
        postsApi.getPosts(true),
        authorsApi.getAuthors(),
      ])

      const approvedPosts = getCollection(postsResponse.data, ['posts'])
        .map(normalizePost)
        .filter((post) => post.status === 'approved')

      setPosts(approvedPosts)
      setAuthors(getCollection(authorsResponse.data, ['authors']))
    } catch (loadError) {
      console.error('Error cargando publicaciones aprobadas', loadError)
      setPosts([])
      setAuthors([])
      setError('No se pudieron cargar las publicaciones aprobadas.')
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

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase()

    return posts.filter((post) => {
      const authorName = authorNameById.get(String(post.author_id || post.user_id)) || ''
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        authorName.toLowerCase().includes(query)
      const matchesAuthor = !authorFilter || String(post.author_id || post.user_id) === authorFilter

      return matchesSearch && matchesAuthor
    })
  }, [authorFilter, authorNameById, posts, search])

  return (
    <>
      {error ? <CAlert color="warning">{error}</CAlert> : null}

      <CCard className="mb-4">
        <CCardHeader>
          <CRow className="align-items-end g-3">
            <CCol md={6}>
              <CFormLabel>Buscar</CFormLabel>
              <CInputGroup>
                <CFormInput
                  placeholder="Titulo, autor o contenido"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol md={4}>
              <CFormLabel>Autor</CFormLabel>
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
            <CCol md={2}>
              <CBadge color="success" className="px-3 py-2">
                {filteredPosts.length} aprobadas
              </CBadge>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div className="text-center py-5">
              <CSpinner />
            </div>
          ) : (
            <CRow className="g-3">
              {filteredPosts.map((post) => (
                <CCol md={6} xl={4} key={post.id}>
                  <div className="h-100 border rounded p-3">
                    <div className="d-flex justify-content-between gap-3 mb-2">
                      <strong>{post.title}</strong>
                      <CBadge color="success">Aprobada</CBadge>
                    </div>
                    <div className="small text-body-secondary mb-3">
                      {authorNameById.get(String(post.author_id || post.user_id)) || 'Sin autor'} -{' '}
                      {formatDate(post.updated_at || post.created_at)}
                    </div>
                    <p className="mb-0">{post.content}</p>
                  </div>
                </CCol>
              ))}

              {!filteredPosts.length ? (
                <CCol xs={12}>
                  <div className="text-center text-body-secondary py-5">
                    No hay publicaciones aprobadas para mostrar.
                  </div>
                </CCol>
              ) : null}
            </CRow>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default ApprovedPosts
