import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/wpt.js',
    format: 'iife',
    name: 'Woopra'
  },
  plugins: [babel(), serve('.')]
};
