import resolve from '@rollup/plugin-node-resolve';
export default {
  input: './lib/index.js',
  output: {
    file: './dist/index.mjs',
    format: 'es',
    sourcemap: false,
  }
}
