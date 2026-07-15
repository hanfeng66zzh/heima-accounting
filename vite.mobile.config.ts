import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 手机版专用 Vite 构建配置
// 只构建 React 渲染进程（不需要 Electron）
export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  },
  build: {
    outDir: '../../dist/mobile',
    emptyOutDir: true
  }
})
