import type { FigmaPluginBundleOptions } from './types'

export type RecursivePartial<Type> = {
  [Prop in keyof Type]?: Type[Prop] extends (infer U)[]
    ? RecursivePartial<U>[]
    : Type[Prop] extends object | undefined
      ? RecursivePartial<Type[Prop]>
      : Type[Prop];
};

export function defineConfig(config?: RecursivePartial<FigmaPluginBundleOptions>) {
  return config;
}
