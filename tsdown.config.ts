import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts',
    cli: './src/cli.ts',
  },
  outDir: './dist',
  exports: true,
  sourcemap: 'inline',
  format: ['es', 'cjs'],
  dts: {
    sourcemap: true,
  },
  target: 'esnext',
  external: ['figwire'],
});
