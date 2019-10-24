const { join } = require('path')
const { autodocPlugin } = require('./autodoc')

module.exports = {
  // mode: 'production',
  mode: 'development',
  entry: './index.js',
  devtool: 'source-map',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.afterCompile.tapAsync('AUTODOC', autodocPlugin)
      },
    },
  ],
}
