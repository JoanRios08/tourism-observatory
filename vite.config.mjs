import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import autoprefixer from 'autoprefixer'

export default defineConfig(() => {
  const backendTarget =
    process.env.VITE_API_BASE || process.env.API_BASE || 'https://backend-observatory.onrender.com'
  const proxyOptions = {
    target: backendTarget,
    changeOrigin: true,
    secure: false,
  }

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
        '/login': proxyOptions,
        '/auth': proxyOptions,
        '/users': proxyOptions,
        '/authors': proxyOptions,
        '/projects': proxyOptions,
        '/documents': proxyOptions,
        '/posts': proxyOptions,
        '/dashboard': proxyOptions,
      },
    },
  }
})
