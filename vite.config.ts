import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const proxy = {
  '/merkl-api': {
    target: 'https://api.merkl.xyz',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/merkl-api/, ''),
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy },   // npm run dev
  preview: { proxy },  // npm run preview
})