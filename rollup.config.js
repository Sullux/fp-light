module.exports = {
  external: ['assert', 'util'],
  input: 'lib/index.js',
  output: {
    dir: 'dist',
    format: 'umd',
    name: 'fp',
    globals: {
      assert: 'assert',
      util: 'util',
    },
  },
}
