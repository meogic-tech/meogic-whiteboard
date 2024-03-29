/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';
const {devices} = require('@playwright/test');

const {CI} = process.env;
const IS_CI =  CI === 'true';

const config = {
  forbidOnly: IS_CI,
  // testDir: '.',
  testMatch: '**/*.spec.ts',
  projects: [
    {
      name: 'chromium',
      testDir: './packages/playground-vue/__tests__/',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      testDir: './packages/playground-vue/__tests__/',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      testDir: './packages/playground-vue/__tests__/',
      use: {...devices['Desktop Safari']},
    },
  ],
  retries: IS_CI ? 4 : 1,
  timeout: 150000,
  /*use: {
    navigationTimeout: 30000,
    // this causes issues in the CI on on current version.
    //trace: 'retain-on-failure',
    video: 'on-first-retry',
  },*/
  use: {
    baseURL: 'http://localhost:3000/',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
};
module.exports = config;
