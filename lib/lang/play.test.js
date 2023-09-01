const { make } = require('./play')

describe('play', () => {
  it('should compile', () => {
    const result = make('(foo bar baz 42)', 'play.test.js')
    console.log(result)
  })
})
