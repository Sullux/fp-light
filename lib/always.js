const always = value =>
  () => value

module.exports = {
  always,
  constant: always,
  just: always,
}
