const { I, IAny } = require('./interface')
const { ecma } = require('./ecma')
const { IInt } = require('./number')

const IList = I.define({
  name: 'List',
  properties: [
    {
      length: IInt,
      [I.properties.implicit]: ecma.IArray,
    },
    [IInt, IAny],
  ],
})

const List = (values) => values

const IOrderedList = I.define({
  name: 'OrderedList',
  properties: {
    [I.properties.extends]: IList,
  },
})

I.implicit(IOrderedList, IList)

module.exports = {
  IList,
  List,
}
