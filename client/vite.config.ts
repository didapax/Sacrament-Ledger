import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
    'process.env': {},
    'process.browser': true,
    'Buffer': ['buffer', 'Buffer'],
  },
  resolve: {
    alias: {
      events: 'events',
    },
  },
})