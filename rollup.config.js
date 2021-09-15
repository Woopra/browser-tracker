import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/wpt.js',
      format: 'iife',
      name: 'Woopra'
    },
    {
      file: 'dist/wpt.min.js',
      format: 'iife',
      sourcemap: true,
      name: 'Woopra',
      plugins: [terser({ ecma: 5 })]
    }
  ],
  plugins: [
    nodeResolve(),
    babel({ babelHelpers: 'bundled' }),
    optimizeLodashImports()
  ]
};
