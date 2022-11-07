/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {defineConfig} from 'vite';
import {resolve} from 'path';
import path from 'path';
import fs from 'fs';
import {replaceCodePlugin} from 'vite-plugin-replace';
import babel from '@rollup/plugin-babel';

const moduleResolution = [
  {
    find: /\@meogic\/tab\-manager$/,
    replacement: path.resolve('../tab-manager/src/index.ts'),
  },
  {
    find: /\@meogic\/tab\-manager\-vue/,
    replacement: path.resolve('../tab-manager-vue/src/index.ts'),
  },
  {
    find: /\@meogic\/tab\-manager\-tab\-group\-bar$/,
    replacement: path.resolve('../tab-manager-tab-group-bar/src/index.ts'),
  },
  {
    find: '@meogic/tab-manager-resizable',
    replacement: path.resolve('../tab-manager-resizable/src/index.ts'),
  },
  {
    find: '@meogic/tab-manager-draggable',
    replacement: path.resolve('../tab-manager-draggable/src/index.ts'),
  },
  {
    find: '@meogic/tab-manager-utils',
    replacement: path.resolve('../tab-manager-utils/src/index.ts'),
  },
  {
    find: 'shared',
    replacement: path.resolve('../shared/src'),
  },
];
// Vue
[
  'TabManagerComposer',
  'TabManagerComposerContext',
  'TabGroupBarPlugin',
].forEach((module) => {
  let resolvedPath = path.resolve(`../tab-manager-vue/src/${module}.ts`);
  moduleResolution.push({
    find: `@meogic/tab-manager-vue/${module}`,
    replacement: resolvedPath,
  });
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    replaceCodePlugin({
      replacements: [
        {
          from: /__DEV__/g,
          to: 'true',
        },
      ],
    }),
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      configFile: false,
      exclude: '/**/node_modules/**',
      extensions: ['jsx', 'js', 'ts', 'tsx', 'mjs'],
      plugins: ['@babel/plugin-transform-flow-strip-types'],
    }),
  ],
  resolve: {
    alias: moduleResolution,
  },
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
      },
    },
    commonjsOptions: {include: []},
  },
});
