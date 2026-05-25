import {defineConfig} from 'tsdown'

export default defineConfig({
  entry: [
    './src/*.ts',
    '!**.test.ts',
  ],
  outDir: 'dist',
  format: 'esm',
  dts: {
    tsgo: true,
  },
  unbundle: true,
})
