import {defineConfig} from 'tsdown'

export default defineConfig({
  entry: [
    './mod.ts',
    './src/magnet.ts',
    './src/rutracker.ts',
    './src/nyaa.ts',
  ],
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
