#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const TAB_MANAGER_PKG = 'tab-manager';
const DEFAULT_PKGS = [
    'tab-manager-tab-group-bar',
    'tab-manager-resizable',
    'tab-manager-draggable',
    'tab-manager-vue',
    'tab-manager-utils'
];
const SHARED_PKG = 'shared';

module.exports = {
    DEFAULT_PKGS,
    TAB_MANAGER_PKG,
    SHARED_PKG,
};
