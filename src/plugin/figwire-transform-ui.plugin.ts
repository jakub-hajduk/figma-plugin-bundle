import { dirname, resolve } from 'node:path';
import { parseModule } from 'magicast';
import type { Plugin } from 'vite';
import type { FigstackContext } from '../build';

export function figwireTransformUi(context: FigstackContext): Plugin {
  const finalOptions = context.options;

  const VIRTUAL_UI_SIDE_NAME = 'virtual:figwire-transform-ui';
  const RESOLVED_VIRTUAL_UI_SIDE_NAME = `\0${VIRTUAL_UI_SIDE_NAME}`;
  const VIRTUAL_UI_SIDE = `import { client } from 'figwire/ui';\nexport const mainApiClient = client();`;

  return {
    name: 'vite:figwire-transform-ui',
    enforce: 'post',
    resolveId(id) {
      if (id === VIRTUAL_UI_SIDE_NAME) return RESOLVED_VIRTUAL_UI_SIDE_NAME;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_UI_SIDE_NAME)
        return parseModule(VIRTUAL_UI_SIDE).generate();
    },
    transform(code, id) {
      if (
        (id.endsWith('.ts') || id.endsWith('.js')) &&
        !id.includes('node_modules')
      ) {
        const mod = parseModule(code);

        mod.imports.$append({
          imported: 'mainApiClient',
          from: VIRTUAL_UI_SIDE_NAME,
        });

        for (const [name, value] of Object.entries(mod.imports)) {
          const fileName = resolve(dirname(id), value.from);
          finalOptions.codeFiles(value.from);

          if (context.codeFiles.isCodeFileImport(fileName)) {
            // @ts-ignore
            mod.$ast.body.unshift(`const ${name} = mainApiClient.${name};`);
            delete mod.imports[name];
          }
        }

        return mod.generate();
      }
    },
  };
}
