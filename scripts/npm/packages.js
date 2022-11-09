#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const TAB_MANAGER_PKG = 'whiteboard';
const DEFAULT_PKGS = [
    'whiteboard-vue',
    'whiteboard-utils'
];
const SHARED_PKG = 'shared';

module.exports = {
    DEFAULT_PKGS,
    TAB_MANAGER_PKG,
    SHARED_PKG,
};
