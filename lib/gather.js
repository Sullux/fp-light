const gather = fn =>
  (...args) => fn(args)

module.exports = {
  gather,
}
