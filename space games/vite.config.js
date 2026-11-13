import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/stats.html',
      template: 'treemap',
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/react-router/') || id.includes('/react-router-dom/') || id.includes('/scheduler/')) {
            return 'vendor-react'
          }
          if (id.includes('/three/') || id.includes('/@react-three/')) {
            return 'vendor-three'
          }
          if (id.includes('/recharts/') || id.includes('/d3-') || id.includes('/victory')) {
            return 'vendor-charts'
          }
          if (id.includes('/framer-motion/') || id.includes('/lucide-react/') || id.includes('/motion-dom/')) {
            return 'vendor-ui'
          }
          if (id.includes('/zustand/') || id.includes('/use-sync-external-store/')) {
            return 'vendor-state'
          }
          if (id.includes('/axios/') || id.includes('/clsx/') || id.includes('/tailwind-merge/') || id.includes('/uuid/')) {
            return 'vendor-utils'
          }
        },
      },
    },
  },
})
