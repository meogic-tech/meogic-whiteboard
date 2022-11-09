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
    find: /\@meogic\/whiteboard$/,
    replacement: path.resolve('../whiteboard/src/index.ts'),
  },
  {
    find: /\@meogic\/whiteboard\-vue/,
    replacement: path.resolve('../whiteboard-vue/src/index.ts'),
  },
  {
    find: '@meogic/whiteboard-history',
    replacement: path.resolve('../whiteboard-history/src/index.ts'),
  },
  {
    find: '@meogic/whiteboard-utils',
    replacement: path.resolve('../whiteboard-utils/src/index.ts'),
  },
  {
    find: 'shared',
    replacement: path.resolve('../shared/src'),
  },
];
// Vue
[
  'WhiteboardComposer',
  'WhiteboardComposerContext',
  'TabGroupBarPlugin',
].forEach((module) => {
  let resolvedPath = path.resolve(`../whiteboard-vue/src/${module}.ts`);
  moduleResolution.push({
    find: `@meogic/whiteboard-vue/${module}`,
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
