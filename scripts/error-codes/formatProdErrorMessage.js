/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

// Do not require this module directly! Use normal `invariant` calls with
// template literal strings. The messages will be replaced with error codes
// during build.

function formatProdErrorMessage(code) {
  throw Error(
    `Minified Whiteboard error #${code}.`,
  );
}

module.exports = formatProdErrorMessage;
