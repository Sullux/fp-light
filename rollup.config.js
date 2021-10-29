import resolve from '@rollup/plugin-node-resolve';
export default {
  input: './lib/index.js',
  output: {
    file: './dist/index.js',
    format: 'es',
    sourcemap: false,
  }
}
