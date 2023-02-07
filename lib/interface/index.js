module.exports = require('./interface')
const { I } = module.exports
require('./array')(I)
require('./number')(I)
require('./object')(I)
require('./string')(I)
require('./function')(I)
