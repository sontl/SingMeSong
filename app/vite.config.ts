import { defineConfig } from 'vite'
//import inject from '@rollup/plugin-inject';

export default defineConfig({
  // plugins: [
  //   inject({
  //     p5: 'p5',
  //   }),
  // ],
  server: {
    open: true,
  },
  optimizeDeps: {
    include: ['p5/lib/addons/p5.sound'],
  },
})
