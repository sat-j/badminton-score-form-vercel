import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic'  // ← This forces React.createElement(), skips jsx-dev-runtime
    })
  ]
})
