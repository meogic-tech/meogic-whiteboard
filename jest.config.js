/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const common = {
  modulePathIgnorePatterns: ['/npm'],
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: 'unit',
      globals: {
        IS_REACT_ACT_ENVIRONMENT: true,
        __DEV__: true,
        'ts-jest': {
          tsconfig: 'tsconfig.test.json',
        },
      },
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        '^@meogic/whiteboard$': '<rootDir>/packages/whiteboard/src/index.ts',
        '^@meogic/whiteboard-history$': '<rootDir>/packages/whiteboard-history/src/index.ts',
        '^@meogic/whiteboard-utils$': '<rootDir>/packages/whiteboard-utils/src/index.ts',
        '^@meogic/whiteboard-vue$': '<rootDir>/packages/whiteboard-vue/src/index.ts',
        '^shared/invariant$': '<rootDir>/packages/shared/src/invariant.ts',
        '^shared/environment$': '<rootDir>/packages/shared/src/environment.ts',
      },
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/unit/**/*.test{.ts,.tsx,.js,.jsx}'],
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.tsx$': 'ts-jest',
        '^.+\\.svg$': '<rootDir>/scripts/svgTransform.js',
        '^.+\\.vue$': '@vue/vue3-jest'
      },
    },
    {
      ...common,
      displayName: 'e2e',
      testMatch: [
        '**/__tests__/e2e/**/*.js',
        '**/__tests__/regression/**/*.js',
      ],
    },
  ],
};
