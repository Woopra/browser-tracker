import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import fs from 'fs';
import path from 'path';
import license from 'rollup-plugin-license';
import { terser } from 'rollup-plugin-terser';

const licenseFile = fs.readFileSync(path.join(__dirname, 'LICENSE'), 'utf8');
const pageLifecyclelicenseFile = fs.readFileSync(
  path.join(__dirname, 'page-lifecycle.LICENSE.txt'),
  'utf8'
);

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/wpt.js',
      format: 'iife',
      name: 'Woopra'
    },
    {
      file: 'dist/w.js',
      format: 'iife',
      sourcemap: true,
      name: 'Woopra',
      plugins: [terser({ ecma: 5 })]
    }
  ],
  plugins: [
    nodeResolve(),
    babel({ babelHelpers: 'bundled' }),
    optimizeLodashImports(),
    license({
      banner: {
        commentStyle: 'ignored',
        content: `Copyright (c) <%= moment().format('YYYY') %> Woopra, Inc.\n\nFor license information please see https://static.woopra.com/js/w.js.LICENSE.txt`
      },
      thirdParty: {
        output: {
          file: path.join(__dirname, 'dist', 'w.js.LICENSE.txt'),
          template: `${licenseFile}\n\n\n${pageLifecyclelicenseFile}\n\n<% _.forEach(dependencies, function (dependency) { %><%= dependency.text() %><% }) %>`
        }
      }
    })
  ]
};
