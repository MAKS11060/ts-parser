import {defineConfig} from 'tsdown'

export default defineConfig({
  entry: './mod.ts',
  outDir: 'dist',
  format: 'esm',
  dts: {
    tsgo: true,
  },
  unbundle: true,
  cjsDefault: false,
  target: false,

  deps: {
    alwaysBundle: [
      '@maks11060/parser-lib/*',
    ],
  },
})
