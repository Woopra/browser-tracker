import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/wpt.min.js',
    format: 'iife',
    sourcemap: true,
    name: 'Woopra'
  },
  plugins: [babel(), uglify()]
};
