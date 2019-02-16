const collect = fn =>
  (...args) => fn(args)

module.exports = {
  collect
}
