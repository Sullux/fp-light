const compileFunction = (spec, expressions, compilers, compile, input) => {
  // todo
}

// todo: add length to input
const compileInvoke = (label, args, compilers, compile, input) => {
  const { output: name } = compile({ element: label, compilers, compile })
  const compiledArgs = args.map((element) =>
    compile({ element, compilers, compile }).output)
  return {
    compilers,
    compile,
    // todo: push input into the execution stack
    output: `(${name})(${compiledArgs.join(',')})`, // todo: async
  }
}

const functionCompiler = (context) => {
  const { element: { value, input }, compilers, compile } = context
  const [spec, ...args] = value
  return (spec.type === 'array' ? compileFunction : compileInvoke)(
    spec,
    args,
    compilers,
    compile,
    input,
  )
}

module.exports = { functionCompiler }
