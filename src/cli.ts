#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineCommand, runMain } from 'citty';
import { createJiti } from 'jiti';
import { build } from './build';
import type { FigmaPluginBundleOptions } from './types'

const main = defineCommand({
  meta: {
    name: 'fpb',
    description: 'Vite-powered tool for Figma Plugin development',
  },
  args: {
    build: {
      type: 'positional',
      description: 'Build plugin for the production environment',
      required: false,
    },
  },
  async run({ args }) {
    const jiti = createJiti(import.meta.url, { debug: true });
    const configFileName = 'figma-plugin-bundle.config';
    const watch = !args.build;
    let options = {};
    const configFile = ['ts', 'js']
      .map((extension) => resolve(`${configFileName}.${extension}`))
      .find((fileName) => existsSync(fileName));

    if (configFile) {
      options = await jiti.import<FigmaPluginBundleOptions>(configFile, {
        default: true,
      });
    }

    build({ watch, ...options });
  },
});

runMain(main);
