import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    base: './',   // IMPORTANT: relative paths for Electron file:// protocol
    plugins: [react()],
})
