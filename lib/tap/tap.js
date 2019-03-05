const tap = fn =>
  arg => {
    fn(arg)
    return arg
  }

module.exports = {
  tap,
  aside: tap,
}
