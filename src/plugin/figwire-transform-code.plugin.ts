import { parseModule } from 'magicast';
import type { Plugin } from 'vite';
import type { FigmaPluginBundleContext } from '../build';

export function figwireTransformCode(
  context: FigmaPluginBundleContext,
): Plugin {
  const finalOptions = context.options;

  const VIRTUAL_PLUGIN_SIDE_NAME = 'virtual:figwire-transform-code';
  const RESOLVED_VIRTUAL_PLUGIN_SIDE_NAME = `\0${VIRTUAL_PLUGIN_SIDE_NAME}`;
  const codeFiles = context.codeFiles.toArray();
  const VIRTUAL_PLUGIN_SIDE = codeFiles.map((f) => `import '${f}';`).join('\n');

  return {
    name: 'vite:figwire-transform-code',
    enforce: 'post',
    resolveId(id) {
      if (id === VIRTUAL_PLUGIN_SIDE_NAME)
        return RESOLVED_VIRTUAL_PLUGIN_SIDE_NAME;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_PLUGIN_SIDE_NAME)
        return parseModule(VIRTUAL_PLUGIN_SIDE).generate();
    },
    transform(code, id) {
      const moduleInfo = this.getModuleInfo(id);

      if (moduleInfo?.isEntry) {
        const mod = parseModule(code);

        mod.imports.$prepend({
          imported: '',
          from: VIRTUAL_PLUGIN_SIDE_NAME,
        });

        return mod.generate();
      }

      if (finalOptions.codeFiles(id)) {
        const mod = parseModule(code);

        mod.imports.$append({
          imported: 'pluginApiInstance',
          from: 'figwire/plugin',
        });

        for (const name of Object.keys(mod.exports)) {
          // @ts-ignore
          mod.$ast.body.push(
            `pluginApiInstance.registerMethod('${name}', ${name})`,
          );
        }

        return mod.generate();
      }
    },
  };
}
