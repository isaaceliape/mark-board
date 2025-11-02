import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Resolve project root without relying on Node typings
  const root = new URL('.', import.meta.url).pathname
  const env = loadEnv(mode, root, '')

  const isDev = mode === 'development'
  const base = env.VITE_BASE || (isDev ? '/' : '/mark-board/')

  return {
    plugins: [react()],
    define: {
      global: 'globalThis',
    },
    // Ensure correct asset URLs based on environment
    base,
    build: {
      outDir: 'docs',
      emptyOutDir: true,
    },
  }
})
