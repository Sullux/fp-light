const preOperator = (pre, name, compile) => {}

const postOperator = (name, post, compile) => {}

const straddleOperator = (pre, name, post, compile) => {}

const blockOperator = (openName, body, closeName, compile) => {}

module.exports = {
  preOperator,
  postOperator,
  straddleOperator,
  blockOperator,
}
