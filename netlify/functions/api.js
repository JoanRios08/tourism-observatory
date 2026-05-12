const fs = require('fs')
const path = require('path')

const dbPaths = [
  path.join(process.cwd(), 'db.json'),
  path.join(__dirname, '..', '..', 'db.json'),
  path.join(__dirname, 'db.json'),
]
let dbCache

const readDb = () => {
  if (!dbCache) {
    const dbPath = dbPaths.find((candidate) => fs.existsSync(candidate))
    if (!dbPath) {
      throw new Error('db.json no fue incluido en el deploy')
    }
    dbCache = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
  }
  return dbCache
}

const getNextId = (items) =>
  String(items.reduce((max, item) => Math.max(max, Number.parseInt(item.id, 10) || 0), 0) + 1)

const normalizeUserRecord = (user) => ({
  ...user,
  first_name: user.first_name || user.nombre || user.name || '',
  last_name: user.last_name || user.apellido || '',
  dni: user.dni || user.cedula || '',
  role_id: user.role_id || user.roleId || 1,
  role_name: user.role_name || user.rol || user.role || 'Usuario',
  created_at: user.created_at || user.createdAt,
  updated_at: user.updated_at || user.updatedAt,
})

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  },
  body: body === null ? '' : JSON.stringify(body),
})

const getRoutePath = (event) => {
  const route = event.path.replace(/^\/\.netlify\/functions\/api/, '').replace(/^\/api/, '')
  return route || '/'
}

const getBody = (event) => {
  if (!event.body) return {}

  try {
    return JSON.parse(event.body)
  } catch (error) {
    return {}
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(204, null)
  }

  const db = readDb()
  const method = event.httpMethod
  const routePath = getRoutePath(event)
  const body = getBody(event)
  const segments = routePath.split('/').filter(Boolean)
  const collection = segments[0]
  const id = segments[1]

  if (method === 'POST' && routePath === '/login') {
    const email = body.email
    const password = body.password
    const authRecord = db.auth.find(
      (item) => {
        const user = db.users.find((userItem) => String(userItem.id) === String(item.userId))
        return (
          (item.email === email || user?.email === email) &&
          String(item.password) === String(password)
        )
      },
    )

    if (!authRecord) {
      return json(401, { message: 'Credenciales invalidas' })
    }

    const user = db.users.find((item) => String(item.id) === String(authRecord.userId))
    return json(200, {
      token: authRecord.token,
      user: user ? normalizeUserRecord(user) : { id: authRecord.userId, email },
    })
  }

  if (method === 'GET' && routePath === '/auth') {
    const { email, password } = event.queryStringParameters || {}
    const auth = db.auth.filter(
      (item) => {
        const user = db.users.find((userItem) => String(userItem.id) === String(item.userId))
        return (
          (!email || item.email === email || user?.email === email) &&
          (!password || String(item.password) === String(password))
        )
      },
    )
    return json(200, auth)
  }

  if (method === 'GET' && routePath === '/authors') {
    return json(200, { authors: db.users.map(normalizeUserRecord) })
  }

  if (collection === 'users') {
    if (method === 'GET' && !id) {
      return json(200, { users: db.users.map(normalizeUserRecord) })
    }

    if (method === 'GET' && id) {
      const user = db.users.find((item) => String(item.id) === String(id))
      return user
        ? json(200, { user: normalizeUserRecord(user) })
        : json(404, { message: 'Usuario no encontrado' })
    }

    if (method === 'POST') {
      const now = new Date().toISOString()
      const user = {
        id: getNextId(db.users),
        ...body,
        cedula: body.dni,
        nombre: body.first_name,
        apellido: body.last_name,
        createdAt: now,
        updatedAt: now,
      }

      db.users.push(user)
      return json(201, { user: normalizeUserRecord(user) })
    }

    if ((method === 'PUT' || method === 'PATCH') && id) {
      const index = db.users.findIndex((item) => String(item.id) === String(id))

      if (index === -1) {
        return json(404, { message: 'Usuario no encontrado' })
      }

      const user = {
        ...db.users[index],
        ...body,
        cedula: body.dni || db.users[index].cedula,
        nombre: body.first_name || db.users[index].nombre,
        apellido: body.last_name || db.users[index].apellido,
        updatedAt: new Date().toISOString(),
      }

      db.users[index] = user
      return json(200, { user: normalizeUserRecord(user) })
    }

    if (method === 'DELETE' && id) {
      const before = db.users.length
      db.users = db.users.filter((item) => String(item.id) !== String(id))
      return before === db.users.length
        ? json(404, { message: 'Usuario no encontrado' })
        : json(204, null)
    }
  }

  if (method === 'GET' && collection && db[collection]) {
    return json(200, { [collection]: db[collection] })
  }

  return json(404, { message: 'Recurso no encontrado' })
}
