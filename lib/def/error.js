const { I } = require('./interface')
const { IString } = require('./string')
const { IInt } = require('./number')

const ISourceEntry = I.define({
  name: 'SourceEntry',
  properties: {
    file: IString,
    location: IInt,
    length: IInt,
    line: IInt,
    offset: IInt,
  },
})

const IError = I.define({
  name: 'Error',
  properties: {
    name: IString,
    message: IString,
    source: IList.of(ISourceEntry),
  },
})
