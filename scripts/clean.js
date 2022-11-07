/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const {DEFAULT_PKGS, SHARED_PKG, TAB_MANAGER_PKG} = require('./npm/packages');

fs.removeSync(path.resolve(`./node_modules`));
const packages = [TAB_MANAGER_PKG, ...DEFAULT_PKGS, SHARED_PKG];
packages.forEach((pkg) => {
  fs.removeSync(path.resolve(`./.ts-temp`));
  fs.removeSync(path.resolve(`./packages/${pkg}/dist`));
  fs.removeSync(path.resolve(`./packages/${pkg}/npm`));
  fs.removeSync(path.resolve(`./packages/${pkg}/node_modules`));
});
