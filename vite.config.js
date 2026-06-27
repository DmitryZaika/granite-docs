import { defineConfig } from 'vite'

export default defineConfig({
    root: 'app',
    publicDir: '../docs',
    build: {
        outDir: '../dist',
    },
})
