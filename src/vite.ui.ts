import { resolve } from 'node:path';
import { build, defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import type { FigstackContext, FigstackOptions } from './build';
import { figwireTransformUi } from './plugin/figwire-transform-ui.plugin';

export async function buildUi(context: FigstackContext) {
  const isProd = process.env.NODE_ENV === 'production';
  const finalOptions: FigstackOptions = context.options;

  const config = defineConfig({
    plugins: [
      figwireTransformUi(context),
      viteSingleFile(),
      ...finalOptions.ui.plugins,
    ],
    root: finalOptions.root,
    build: {
      lib: {
        fileName: 'index',
        entry: resolve(finalOptions.root, finalOptions.ui.entry),
        formats: ['es'],
      },
      emptyOutDir: false,
      sourcemap: isProd ? false : 'inline',
      cssMinify: isProd,
      minify: isProd,
      outDir: resolve(process.cwd(), finalOptions.outDir),
      ...(finalOptions.watch ? { watch: { include: ['**/*'] } } : null),
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV === 'production' ? 'production' : 'development',
      ),
    },
  });

  return build(config);
}
