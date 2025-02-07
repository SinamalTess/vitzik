import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import * as path from 'path'

export default defineConfig({
    base: '',
    plugins: [tsconfigPaths(), react()],
    server: {
        open: true,
        port: 3000,
    },
    resolve: {
        alias: {
            'vitzik-ui': path.resolve(
                __dirname,
                './../../packages/vitzik-ui/src'
            ), // TODO: make ready for production build
        },
    },
    optimizeDeps: {
        exclude: ['vitzik-ui'],
    },
    test: {
        include: ['./**/*.{test,spec}.{ts,tsx}'],
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./setupTests.jsx'],
    },
})
