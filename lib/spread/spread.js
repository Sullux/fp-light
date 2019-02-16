const spread = fn =>
  (args = []) =>
    fn(...args)

module.exports = { spread }
