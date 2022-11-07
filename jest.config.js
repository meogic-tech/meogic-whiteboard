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
        '^./dist/(.+)': './src/$1',
        '^@meogic/tab-manager$': '<rootDir>/packages/tab-manager/src/index.ts',
        '^@meogic/tab-manager-resizable$': '<rootDir>/packages/tab-manager-resizable/src/index.ts',
        '^@meogic/tab-manager-tab-group-bar': '<rootDir>/packages/tab-manager-tab-group-bar/src/index.ts',
        '^@meogic/tab-manager-utils$': '<rootDir>/packages/tab-manager-utils/src/index.ts',
        '^shared/invariant$': '<rootDir>/packages/shared/src/invariant.ts',
      },
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/unit/**/*.test{.ts,.tsx,.js,.jsx}'],
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
        '^.+\\.tsx$': 'ts-jest',
        '^.+\\.svg$': '<rootDir>/scripts/svgTransform.js',
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
