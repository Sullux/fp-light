const fail = (message, source) => {
  const error = new Error(message)
  error.source = source
  throw error
}

module.exports = { fail }
