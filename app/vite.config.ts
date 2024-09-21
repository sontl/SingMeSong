import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    open: true,
  },
  optimizeDeps: {
    include: ['p5/lib/addons/p5.sound'],
  },
})
