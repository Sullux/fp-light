const call = (...args) =>
  args.length > 1
    ? args[1](args[0])
    : fn => fn(args[0])

module.exports = {
  call,
}
