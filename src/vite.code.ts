import { resolve } from 'node:path';
import { build, defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import type {
  FigmaPluginBundleContext,
  FigmaPluginBundleOptions,
} from './build';
import { figwireTransformCode } from './plugin/figwire-transform-code.plugin';

export async function buildCode(context: FigmaPluginBundleContext) {
  const isProd = process.env.NODE_ENV === 'production';
  const finalOptions: FigmaPluginBundleOptions = context.options;

  const config = defineConfig({
    plugins: [
      figwireTransformCode(context),
      viteSingleFile(),
      ...finalOptions.code.plugins,
    ],
    root: finalOptions.root,
    build: {
      target: 'es6',
      lib: {
        fileName: 'code',
        entry: resolve(finalOptions.root, finalOptions.code.entry),
        formats: ['es'],
      },
      emptyOutDir: false,
      cssCodeSplit: false,
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
