const { join } = require('path')
const { DefinePlugin } = require('webpack')

const docsCollection = []

const featureFlags = new DefinePlugin({
  __TEST__: !!process.env.TEST,
  __DOCS__: docs => docsCollection.push(docs),
  // $test: () => {},
  // $spec: () => {},
})

module.exports = {
  mode: 'development',
  entry: './index.js',
  devtool: 'source-map',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  // module: {
  //   rules: [
  //     {
  //       test: /\.js$/,
  //       use: [
  //         { loader: './test-loader.js' },
  //       ],
  //     },
  //   ],
  // },
  plugins: [
    featureFlags,
    // {
    //   apply: compiler =>
    //     compiler.hooks.compilation.tap('compilationPlugin', (compilation, compilationParams) => {
    //       console.log('=== compilation ===')
    //       console.log(Object.keys(compilation))
    //       // console.log('=== compilation params ===') ||
    //       // console.log(compilationParams)
    //       console.log('=== modules ===')
    //       console.log(compilation.modules)
    //       const data = stringify(docsCollection)
    //       compilation.assets['docs.md'] = {
    //         source: () => data,
    //         size: () => data.length,
    //       }
    //     }),
    // },
  ],
}
