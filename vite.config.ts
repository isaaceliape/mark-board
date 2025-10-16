import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  // Ensure correct asset URLs when hosted at /mark-board/
  base: '/mark-board/',
  build: {
    outDir: '.',
    emptyOutDir: false,
  },
})
