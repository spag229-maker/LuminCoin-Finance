import { defineConfig } from 'vite'

export default defineConfig({
    root: '.',
    publicDir: 'static',
    build: {
        outDir: 'dist',
    },
    server: {
        port: 5173,
    },
})
