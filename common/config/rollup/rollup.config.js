const commonjs = require('@rollup/plugin-commonjs')
const { nodeResolve } = require('@rollup/plugin-node-resolve')
const typescript = require('@rollup/plugin-typescript')
const peerDepsExternal = require('rollup-plugin-peer-deps-external')
const autoExternal = require('rollup-plugin-auto-external')

const commonOutputOptions = {
  // Easier development with sourcemaps enabled
  sourcemap: true,
  // Do not let Rollup call Object.freeze() on namespace import objects
  // (i.e. import * as namespaceImportObject from...) that are accessed dynamically.
  freeze: false,
  // Enforce named exports
  exports: 'named',
}

module.exports = [
  {
    input: './src/index.ts',
    preserveSymlinks: true,
    output: [
      {
        file: './dist/cjs/index.js',
        format: 'cjs',
        ...commonOutputOptions,
      },
      {
        // dir preserves sourcemaps
        dir: './dist',
        format: 'esm',
        ...commonOutputOptions,
      },
    ],
    plugins: [
      autoExternal(),
      peerDepsExternal(),
      nodeResolve(),
      commonjs({ include: /\/node_modules\//, }),
      typescript({
        typescript: require('typescript'),
        tsconfig: './tsconfig.json',
        noEmitOnError: process.env.ROLLUP_WATCH !== 'true',
        exclude: ['node_modules', 'dist'],
        module: 'esnext',
        sourceMap: true,
        declaration: true,
      }),
      // replace({
      //   'process.env.NODE_ENV': JSON.stringify(env),
      // }),
      // terser(),
    ],
    external: [],
  },
]
