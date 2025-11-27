import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Users = React.lazy(() => import('./views/users/Users'))
const Profile = React.lazy(() => import('./views/profile/Profile'))
const Charts = React.lazy(() => import('./views/charts/Charts'))
const Widgets = React.lazy(() => import('./views/widgets/Widgets'))
const Post = React.lazy(() => import('./views/post/Post'))
const Projects = React.lazy(() => import('./views/projects/Projects'))
const Documents = React.lazy(() => import('./views/documents/Documents'))


const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/users', name: 'Usuarios', element: Users },
  { path: '/profile', name: 'Perfil', element: Profile },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
  { path: '/post', name: 'Post', element: Post },
  { path: '/projects', name: 'Proyectos', element: Projects },
  { path: '/documents', name: 'Documentos', element: Documents },

]

export default routes
