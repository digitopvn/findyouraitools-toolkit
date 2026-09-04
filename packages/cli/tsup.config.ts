import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'bin/fyai': 'bin/fyai.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
