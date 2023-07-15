#!/usr/bin/env node

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const readline = require('readline');
const {exec} = require('child-process-promise');
const {WHITEBOARD_PKG, DEFAULT_PKGS} = require('./packages');

async function publish() {
  const pkgs = [WHITEBOARD_PKG, ...DEFAULT_PKGS];

  console.info(
    `You're about to publish:
${pkgs.join('\n')}

Type "publish" to confirm.`,
  );
  await waitForInput();

  for (let i = 0; i < pkgs.length; i++) {
    const pkg = pkgs[i];
    try{
      await exec(`cd ./packages/${pkg}/npm && npm publish --public`);
    }catch (e) {
      console.log(e)
    }

  }
}

async function waitForInput() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', function (line) {
      if (line === 'publish') {
        rl.close();
        resolve();
      }
    });
  });
}

publish();
