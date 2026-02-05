import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [autoprefixer({})],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 3000,
      proxy: {
        // Proxy API requests to the remote backend during development to avoid CORS.
        // Adjust the target if your backend runs elsewhere.
        '/api': {
          target: 'https://backend-observatory.onrender.com',
          changeOrigin: true,
          secure: false,
        },
        '/auth': {
          target: 'https://backend-observatory.onrender.com',
          changeOrigin: true,
          secure: false,
        },
        '/login': {
          target: 'https://backend-observatory.onrender.com',
          changeOrigin: true,
          secure: false,
        },
        '/users': {
          target: 'https://backend-observatory.onrender.com',
          changeOrigin: true,
          secure: false,
        },
        '/projects': {
          target: 'https://backend-observatory.onrender.com',
          changeOrigin: true,
          secure: false,
        },
        '/documents': {
          target: 'https://backend-observatory.onrender.com',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
