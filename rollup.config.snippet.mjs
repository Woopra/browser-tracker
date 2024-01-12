import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/snippet.js',
  output: [
    {
      file: 'dist/snippet.min.js',
      format: 'iife',
      plugins: [terser({ ecma: 5 })]
    }
  ]
};
