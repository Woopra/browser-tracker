import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify-es';
import buble from 'rollup-plugin-buble';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/wpt.js',
    format: 'iife'
  },
  legacy: true,
  name: 'Woopra',
  plugins: [
    resolve({
      module: true,
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    buble(),
    uglify({
      ie8: true
    })
  ]
}
