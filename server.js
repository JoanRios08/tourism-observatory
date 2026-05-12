const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const port = process.env.PORT || 4000
const dbPath = path.join(__dirname, 'db.json')

app.use(cors())
app.use(express.json())

const readDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'))

const writeDb = (data) => {
  fs.writeFileSync(dbPath, `${JSON.stringify(data, null, 2)}\n`)
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

app.post('/login', (req, res) => {
  const db = readDb()
  const email = req.body.email
  const password = req.body.password
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
    return res.status(401).json({ message: 'Credenciales invalidas' })
  }

  const user = db.users.find((item) => String(item.id) === String(authRecord.userId))
  return res.json({
    token: authRecord.token,
    user: user ? normalizeUserRecord(user) : { id: authRecord.userId, email },
  })
})

app.get('/auth', (req, res) => {
  const db = readDb()
  const { email, password } = req.query
  const auth = db.auth.filter(
    (item) => {
      const user = db.users.find((userItem) => String(userItem.id) === String(item.userId))
      return (
        (!email || item.email === email || user?.email === email) &&
        (!password || String(item.password) === String(password))
      )
    },
  )
  res.json(auth)
})

app.get('/users', (req, res) => {
  const db = readDb()
  res.json({ users: db.users.map(normalizeUserRecord) })
})

app.get('/users/:id', (req, res) => {
  const db = readDb()
  const user = db.users.find((item) => String(item.id) === String(req.params.id))

  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  return res.json({ user: normalizeUserRecord(user) })
})

app.post('/users', (req, res) => {
  const db = readDb()
  const now = new Date().toISOString()
  const user = {
    id: getNextId(db.users),
    ...req.body,
    cedula: req.body.dni,
    nombre: req.body.first_name,
    apellido: req.body.last_name,
    createdAt: now,
    updatedAt: now,
  }

  db.users.push(user)
  writeDb(db)
  res.status(201).json({ user: normalizeUserRecord(user) })
})

app.put('/users/:id', (req, res) => {
  const db = readDb()
  const index = db.users.findIndex((item) => String(item.id) === String(req.params.id))

  if (index === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  const user = {
    ...db.users[index],
    ...req.body,
    cedula: req.body.dni || db.users[index].cedula,
    nombre: req.body.first_name || db.users[index].nombre,
    apellido: req.body.last_name || db.users[index].apellido,
    updatedAt: new Date().toISOString(),
  }

  db.users[index] = user
  writeDb(db)
  res.json({ user: normalizeUserRecord(user) })
})

app.patch('/users/:id', (req, res) => {
  const db = readDb()
  const index = db.users.findIndex((item) => String(item.id) === String(req.params.id))

  if (index === -1) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  const user = { ...db.users[index], ...req.body, updatedAt: new Date().toISOString() }
  db.users[index] = user
  writeDb(db)
  res.json({ user: normalizeUserRecord(user) })
})

app.delete('/users/:id', (req, res) => {
  const db = readDb()
  const before = db.users.length
  db.users = db.users.filter((item) => String(item.id) !== String(req.params.id))

  if (db.users.length === before) {
    return res.status(404).json({ message: 'Usuario no encontrado' })
  }

  writeDb(db)
  return res.status(204).send()
})

app.get('/authors', (req, res) => {
  const db = readDb()
  res.json({ authors: db.users.map(normalizeUserRecord) })
})

app.get('/:collection', (req, res) => {
  const db = readDb()
  const items = db[req.params.collection]

  if (!items) {
    return res.status(404).json({ message: 'Recurso no encontrado' })
  }

  return res.json({ [req.params.collection]: items })
})

app.listen(port, () => {
  console.log(`API local disponible en http://localhost:${port}`)
})
