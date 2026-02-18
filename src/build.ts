import defu from 'defu'
import { existsSync, globSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { CodeFilesCollection } from './code-files.collection';
import type { FigmaPluginBundleOptions } from './types'
import { buildCode } from './vite.code';
import { buildUi } from './vite.ui';

const defaultCodeFiles = (fileName: string) => fileName.endsWith('.code.ts');

export async function build(options: Partial<FigmaPluginBundleOptions>) {
  const finalOptions: FigmaPluginBundleOptions = defu(options, {
    watch: false,
    outDir: resolve(process.cwd(), 'dist'),
    codeFiles: defaultCodeFiles,
    root: resolve(process.cwd(), 'src'),
    emptyOutDir: true,
    ui: {
      entry: 'index.html',
      plugins: [],
    },
    code: {
      entry: 'code.ts',
      plugins: [],
    },
  });

  if (existsSync(finalOptions.outDir)) {
    rmSync(finalOptions.outDir, { recursive: true });
  }

  const files = globSync('**/*', {
    cwd: resolve(finalOptions.root),
    withFileTypes: true,
  })
    .filter((dirEnt) => {
      const filePath = resolve(dirEnt.parentPath, dirEnt.name);
      return dirEnt.isFile() && finalOptions.codeFiles(filePath);
    })
    .map((dirEnt) => resolve(dirEnt.parentPath, dirEnt.name));

  const context = {
    options: finalOptions,
    codeFiles: new CodeFilesCollection(files),
  };

  await Promise.all([buildCode(context), buildUi(context)]);
}
