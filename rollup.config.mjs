import { optimizeLodashImports } from '@optimize-lodash/rollup-plugin';
import babel from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import fs from 'fs/promises';
import path from 'path';
import license from 'rollup-plugin-license';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const licenseFile = await fs.readFile(path.join(__dirname, 'LICENSE'), 'utf8');
const pageLifecyclelicenseFile = await fs.readFile(
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
