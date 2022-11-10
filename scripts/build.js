/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const rollup = require('rollup');
const fsExtra = require('fs-extra');
const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const babel = require('@rollup/plugin-babel').default;
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const extractErrorCodes = require('./error-codes/extract-errors');
const alias = require('@rollup/plugin-alias');
const compiler = require('@ampproject/rollup-plugin-closure-compiler');
const {exec} = require('child-process-promise');
const image = require('@rollup/plugin-image')
const vue = require('rollup-plugin-vue')

const license = ` * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.`;

const isProduction = argv.prod;
const isRelease = argv.release;
const isWWW = argv.www;
const extractCodes = argv.codes;


const wwwMappings = {
  '@meogic/whiteboard': 'whiteboard',
  '@meogic/whiteboard-vue': 'whiteboard-vue',
  '@meogic/whiteboard-history': 'whiteboard-history',
  '@meogic/whiteboard-utils': 'whiteboard-utils',
};

const externals = [
  '@meogic/whiteboard',
  '@meogic/whiteboard-vue',
  '@meogic/whiteboard-history',
  '@meogic/whiteboard-utils',
  ...Object.values(wwwMappings),
];

const errorCodeOpts = {
  errorMapFilePath: 'scripts/error-codes/codes.json',
};

const findAndRecordErrorCodes = extractErrorCodes(errorCodeOpts);

const strictWWWMappings = {};

// Add quotes around mappings to make them more strict.
Object.keys(wwwMappings).forEach((mapping) => {
  strictWWWMappings[`'${mapping}'`] = `'${wwwMappings[mapping]}'`;
});

async function build(name, inputFile, outputPath, outputFile, isProd) {
  const inputOptions = {
    external(modulePath, src) {
      return externals.includes(modulePath);
    },
    input: inputFile,
    onwarn(warning) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') {
        // Ignored
      } else if (warning.code === 'UNUSED_EXTERNAL_IMPORT') {
        // Important, but not enough to stop the build
        console.error();
        console.error(warning.message || warning);
        console.error();
      } else if (typeof warning.code === 'string') {
        console.error(warning);
        // This is a warning coming from Rollup itself.
        // These tend to be important (e.g. clashes in namespaced exports)
        // so we'll fail the build on any of them.
        console.error();
        console.error(warning.message || warning);
        console.error();
        process.exit(1);
      } else {
        // The warning is from one of the plugins.
        // Maybe it's not important, so just print it.
        console.warn(warning.message || warning);
      }
    },
    plugins: [
      name.indexOf('Vue') !== -1 && vue(),
      alias({
        entries: [
          {find: 'shared', replacement: path.resolve('packages/shared/src')},
        ],
      }),
      // Extract error codes from invariant() messages into a file.
      {
        transform(source) {
          // eslint-disable-next-line no-unused-expressions
          extractCodes && findAndRecordErrorCodes(source);
          return source;
        },
      },
      nodeResolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      }),
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        configFile: false,
        exclude: '/**/node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
        plugins: [
          [
            require('./error-codes/transform-error-messages'),
            {noMinify: !isProd},
          ],
        ],
        presets: [
          [
            '@babel/preset-typescript',
            {
              tsconfig: path.resolve('./tsconfig.build.json'),
            },
          ],
          '@babel/preset-react',
          'vue',
        ],
      }),
      {
        resolveId(importee, importer) {
          if (importee === 'formatProdErrorMessage') {
            return path.resolve(
              './scripts/error-codes/formatProdErrorMessage.js',
            );
          }
        },
      },
      commonjs(),
      replace(
        Object.assign(
          {
            __DEV__: isProd ? 'false' : 'true',
            delimiters: ['', ''],
            preventAssignment: true,
          },
          isWWW && strictWWWMappings,
        ),
      ),
      {
        renderChunk(source) {
          return `${getComment()}
${source}`;
        },
      },
      image(),
    ],
    // This ensures PrismJS imports get included in the bundle
    treeshake: isWWW || name !== 'Whiteboard Code' ? 'smallest' : undefined,
  };
  const outputOptions = {
    esModule: false,
    exports: 'auto',
    externalLiveBindings: false,
    file: outputFile,
    format: 'cjs', // change between es and cjs modules
    freeze: false,
    interop: false,
  };
  const result = await rollup.rollup(inputOptions);
  await result.write(outputOptions);
}

function getComment() {
  const lines = ['/**', license];
  if (isWWW) {
    lines.push(
      '*',
      '* @noflow',
      '* @nolint',
      '* @preventMunge',
      '* @preserve-invariant-messages',
      '* @generated',
      '* @preserve-whitespace',
      '* @fullSyntaxTransform',
    );
  }
  lines.push(' */');
  return lines.join('\n');
}

function getFileName(fileName, isProd) {
  if (isWWW || isRelease) {
    return `${fileName}.${isProd ? 'prod' : 'dev'}.js`;
  }
  return `${fileName}.js`;
}

const packages = [
  {
    modules: [
      {
        outputFileName: 'Whiteboard',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Whiteboard',
    outputPath: './packages/whiteboard/dist/',
    packageName: 'whiteboard',
    sourcePath: './packages/whiteboard/src/',
  },
  {
    modules: [
      {
        outputFileName: 'WhiteboardHistory',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Whiteboard History',
    outputPath: './packages/whiteboard-history/dist/',
    packageName: 'whiteboard',
    sourcePath: './packages/whiteboard-history/src/',
  },
  {
    modules: [
      {
        outputFileName: 'WhiteboardUtils',
        sourceFileName: 'index.ts',
      },
    ],
    name: 'Whiteboard Utils',
    outputPath: './packages/whiteboard-utils/dist/',
    packageName: 'whiteboard-utils',
    sourcePath: './packages/whiteboard-utils/src/',
  },
];

async function buildTSDeclarationFiles(packageName, outputPath) {
  await exec('tsc -p ./tsconfig.build.json');
}

async function moveTSDeclarationFilesIntoDist(packageName, outputPath) {
  await fsExtra.copy(`./.ts-temp/${packageName}/src`, outputPath);
}

function buildForkModule(outputPath, outputFileName) {
  const lines = [
    getComment(),
    `'use strict'`,
    `const ${outputFileName} = process.env.NODE_ENV === 'development' ? require('./${outputFileName}.dev.js') : require('./${outputFileName}.prod.js')`,
    `module.exports = ${outputFileName};`,
  ];
  const fileContent = lines.join('\n');
  fsExtra.outputFileSync(
    path.resolve(path.join(`${outputPath}${outputFileName}.js`)),
    fileContent,
  );
}

async function buildAll() {
  if (!isWWW && (isRelease || isProduction)) {
    await buildTSDeclarationFiles();
  }

  for (const pkg of packages) {
    const {name, sourcePath, outputPath, packageName, modules} = pkg;

    for (const module of modules) {
      const {sourceFileName, outputFileName} = module;
      let inputFile = path.resolve(path.join(`${sourcePath}${sourceFileName}`));

      await build(
        `${name}${module.name ? '-' + module.name : ''}`,
        inputFile,
        outputPath,
        path.resolve(
          path.join(
            `${outputPath}${getFileName(outputFileName, isProduction)}`,
          ),
        ),
        isProduction,
      );

      if (isRelease) {
        await build(
          name,
          inputFile,
          outputPath,
          path.resolve(
            path.join(`${outputPath}${getFileName(outputFileName, false)}`),
          ),
          false,
        );
        buildForkModule(outputPath, outputFileName);
      }
    }
    if (!isWWW && (isRelease || isProduction)) {
      await moveTSDeclarationFilesIntoDist(packageName, outputPath);
    }
  }
}
async function buildVue() {
  const prefix = 'packages/whiteboard-vue'
  const whiteboardVue = path.resolve(prefix)
  if(!fsExtra.pathExistsSync(whiteboardVue)){
    console.error(`${whiteboardVue} doesn't exist`)
    return
  }
  await exec(`npm run build --prefix ${prefix}`);
  const typeDirs = fs.readdirSync(`${whiteboardVue}/dist/types`)
  for (let typeDir of typeDirs) {
    if(typeDir !== 'whiteboard-vue'){
      fs.rmSync(`${whiteboardVue}/dist/types/${typeDir}`, {recursive:true})
    }
  }
  await fsExtra.copy(`${whiteboardVue}/dist/types/whiteboard-vue/src`, `${whiteboardVue}/dist/types`)
  fs.rmSync(`${whiteboardVue}/dist/types/whiteboard-vue`, {recursive:true})
}
buildAll().then(() => {
  buildVue()
});

