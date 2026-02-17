# API Documentation: `build()`

## Overview

The `build()` function is the main entry point for building Figma plugins with figma-plugin-bundle. It bundles both the plugin code and UI into a single output using Vite, with automatic figwire integration for seamless communication between the UI and plugin code.

## Function Signature

```typescript
async function build(options: Partial<FigmaPluginBundleOptions>): Promise<void>
```

## Parameters

### `options: Partial<FigmaPluginBundleOptions>`

All options are optional and will be merged with sensible defaults.

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `watch` | `boolean` | `false` | Enable watch mode for automatic rebuilds on file changes |
| `outDir` | `string` | `'dist'` (resolved from cwd) | Output directory for built files |
| `root` | `string` | `'src'` (resolved from cwd) | Root directory containing source files |
| `emptyOutDir` | `boolean` | `true` | Whether to empty the output directory before building |
| `codeFiles` | `CodeFilesFn` | `(fileName) => fileName.endsWith('.code.ts')` | Function to identify which files contain plugin code |
| `ui.entry` | `string` | `'index.html'` | Entry point for the UI bundle |
| `ui.plugins` | `Plugin[]` | `[]` | Additional Vite plugins for the UI build |
| `code.entry` | `string` | `'code.ts'` | Entry point for the plugin code bundle |
| `code.plugins` | `Plugin[]` | `[]` | Additional Vite plugins for the code build |

## Type Definitions

```typescript
type CodeFilesFn = (fileName: string) => boolean;

interface FigmaPluginBundleOptions {
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
```

## Behavior

1. **Merges options with defaults**: Partial options are deep-merged with default values
2. **Cleans output directory**: If `emptyOutDir` is `true` (default) and the output directory exists, it will be deleted
3. **Discovers code files**: Scans the `root` directory recursively for files matching the `codeFiles` predicate
4. **Parallel builds**: Builds both plugin code and UI concurrently using Vite
5. **Automatic figwire integration**: Transforms code files to enable seamless UI-to-plugin communication

## Build Output

The build produces files in the `outDir` directory:
- `code.js` - Plugin code bundle (ES6 module)
- `index.js` - UI bundle (ES module with inlined assets)

## Return Value

Returns a `Promise<void>` that resolves when both builds complete successfully.

## Examples

### Basic Usage

```typescript
import { build } from 'figma-plugin-bundle';

await build({});
```

### Custom Configuration

```typescript
import { build } from 'figma-plugin-bundle';
import react from '@vitejs/plugin-react';

await build({
  outDir: 'build',
  root: 'plugin-src',
  ui: {
    entry: 'ui.html',
    plugins: [react()],
  },
  code: {
    entry: 'main.ts',
  },
});
```

### Watch Mode

```typescript
import { build } from 'figma-plugin-bundle';

await build({
  watch: true,
});
```

### Custom Code File Pattern

```typescript
import { build } from 'figma-plugin-bundle';

await build({
  codeFiles: (fileName) =>
    fileName.endsWith('.plugin.ts') || fileName.endsWith('.figma.ts'),
});
```

### Using with defineConfig Helper

```typescript
import { build, defineConfig } from 'figma-plugin-bundle';

const config = defineConfig({
  outDir: 'dist',
  ui: {
    entry: 'index.html',
  },
});

await build(config);
```

## Related Functions

- **`defineConfig(config?: Partial<FigmaPluginBundleOptions>)`**: Type-safe configuration helper that provides IntelliSense for configuration options

## Environment Variables

The build respects the `NODE_ENV` environment variable:
- `NODE_ENV=production`: Enables minification and disables source maps
- Other values: Development mode with inline source maps

## Notes

- The build uses `vite-plugin-singlefile` to inline all assets into single files
- Code files are automatically transformed with figwire for cross-context communication
- All paths are resolved relative to `process.cwd()` by default
- The function logs watch mode status to the console