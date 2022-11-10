import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {replaceCodePlugin} from 'vite-plugin-replace';
import pkg from './package.json'

const pkgName = pkg.name
const lexicalPlugins = [
  "whiteboard",
  "whiteboard-history",
  "whiteboard-utils",
]

export default defineConfig({
  plugins: [vue(),
    replaceCodePlugin({
      replacements: [
        {
          from: /__DEV__/g,
          to: 'true',
        },
      ],
    }),],
  define: {
    __DEV__: false
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: pkgName,
      formats: ['es', 'cjs'],
      fileName: format => `${pkgName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        'vue',
        ...lexicalPlugins.map(plugin => `@meogic/${plugin}`),
      ],
    },
    emptyOutDir: false,
  },
})
