import type { PluginOption } from 'vite'
import type { CodeFilesCollection } from './code-files.collection'

export type CodeFilesFn = (fileName: string) => boolean;

export type VitePluginOption = PluginOption

export interface FigmaPluginBundleOptions {
  codeFiles: CodeFilesFn;
  outDir: string;
  watch: boolean;
  root: string;
  emptyOutDir: boolean;
  ui: {
    entry: string;
    plugins: VitePluginOption[];
  };
  code: {
    entry: string;
    plugins: VitePluginOption[];
  };
}

export interface FigmaPluginBundleContext {
  options: FigmaPluginBundleOptions;
  codeFiles: CodeFilesCollection;
}
