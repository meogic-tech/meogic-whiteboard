#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const {exec} = require('child-process-promise');
const {TAB_MANAGER_PKG, DEFAULT_PKGS} = require('./packages');

async function prepareTabManagerPackage() {
  await exec(`rm -rf ./packages/${TAB_MANAGER_PKG}/npm`);
  await exec(`mkdir ./packages/${TAB_MANAGER_PKG}/npm`);
  await exec(
    `cp -R ./packages/${TAB_MANAGER_PKG}/dist/* ./packages/${TAB_MANAGER_PKG}/npm`,
  );

  // Other bits
  await exec(
    `cp -R ./packages/${TAB_MANAGER_PKG}/package.json ./packages/${TAB_MANAGER_PKG}/npm`,
  );
  await exec(`cp -R LICENSE ./packages/${TAB_MANAGER_PKG}/npm`);
  await exec(
    `cp -R ./packages/${TAB_MANAGER_PKG}/README.md ./packages/${TAB_MANAGER_PKG}/npm`,
  );
  /*// Flow Types
  await exec(
    `cp -R ./packages/${TAB_MANAGER_PKG}/flow/!*.flow ./packages/${TAB_MANAGER_PKG}/npm`,
  );*/
}

async function prepareDefaultPackages() {
  for (let i = 0; i < DEFAULT_PKGS.length; i++) {
    const pkg = DEFAULT_PKGS[i];
    await exec(`rm -rf ./packages/${pkg}/npm`);
    await exec(`mkdir ./packages/${pkg}/npm`);
    await exec(`cp -R ./packages/${pkg}/dist/* ./packages/${pkg}/npm`);
    await exec(`cp -R ./packages/${pkg}/package.json ./packages/${pkg}/npm`);
    await exec(`cp -R LICENSE ./packages/${pkg}/npm`);
    await exec(`cp -R ./packages/${pkg}/README.md ./packages/${pkg}/npm`);
  }
}

prepareTabManagerPackage();
prepareDefaultPackages();
