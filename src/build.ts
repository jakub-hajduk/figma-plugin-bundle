import { existsSync, globSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { CodeFilesCollection } from './code-files.collection';
import { buildCode } from './vite.code';
import { buildUi } from './vite.ui';

const defaultCodeFiles = (fileName: string) => fileName.endsWith('.code.ts');

export type CodeFilesFn = (fileName: string) => boolean;

export interface FigstackOptions {
  codeFiles: CodeFilesFn;
  outDir: string;
  watch: boolean;
  root: string;
  emptyOutDir: boolean;
  ui: {
    entry: string;
    plugins: Plugin[];
  };
  code: {
    entry: string;
    plugins: Plugin[];
  };
}

export interface FigstackContext {
  options: FigstackOptions;
  codeFiles: CodeFilesCollection;
}

export async function build(options: Partial<FigstackOptions>) {
  const finalOptions: FigstackOptions = {
    watch: false,
    outDir: resolve(process.cwd(), 'dist'),
    codeFiles: defaultCodeFiles,
    root: resolve(process.cwd(), 'src'),
    emptyOutDir: true,
    ui: {
      entry: 'index.html',
      plugins: [],
      ...options.ui,
    },
    code: {
      entry: 'code.ts',
      plugins: [],
      ...options.code,
    },
    ...options,
  };

  console.log('watch mode', options.watch, finalOptions.watch);

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
