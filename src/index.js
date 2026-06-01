import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import 'core-js'

import App from './App'
import store from './store'

const CHUNK_RELOAD_KEY = 'observatory:chunk-reload-attempted'
const isChunkLoadError = (message = '') =>
  /Failed to fetch dynamically imported module|Expected a JavaScript-or-Wasm module script|Importing a module script failed/i.test(
    message,
  )

const reloadForFreshChunks = () => {
  if (sessionStorage.getItem(CHUNK_RELOAD_KEY)) return
  sessionStorage.setItem(CHUNK_RELOAD_KEY, 'true')
  window.location.reload()
}

window.addEventListener('unhandledrejection', (event) => {
  const message = event.reason?.message || String(event.reason || '')
  if (isChunkLoadError(message)) reloadForFreshChunks()
})

window.addEventListener(
  'error',
  (event) => {
    const message = event.message || event.error?.message || ''
    if (isChunkLoadError(message)) reloadForFreshChunks()
  },
  true,
)

window.addEventListener('load', () => {
  sessionStorage.removeItem(CHUNK_RELOAD_KEY)
})

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
)
