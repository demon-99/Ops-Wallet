import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Prevent two copies of React (one from the app, one pre-bundled for R3F) —
  // without `dedupe` React hooks throw "Cannot read properties of null (reading 'useMemo')"
  // as soon as <Canvas> mounts.
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@react-three/fiber',
      '@react-three/drei',
      'three',
    ],
  },
})
