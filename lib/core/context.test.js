import { context } from './context.js'

describe({
  name: 'context',
  usage: `The context module supports tracking context and debug tracing across
    asynchronous invocations. It is mostly used as an internal tool within the
    FP Light library, but it is available for use by 3rd-party developers. The
    context module has the following properties:

    * {{context.await}} used to restore the current context in a \`then\` handler
    * {{context.enter}} used to push a new value into the context stack
    * {{context.trace}} gets the current context stack trace
    * {{context.value}} gets a context value (either current or at specified depth)
    * {{context.get}} recursively walks the context stack to find the requested property value
    * {{context.defaultStackTraceLimit}} the default max number of lines of a stack trace`.split('\n').map((l) => l.trimStart()).join('\n'),
  type: 'Object',
}, () => {
  it('should have the context entries', () => {
    const expected = [
      'await',
      'enter',
      'trace',
      'value',
      'get',
      'defaultStackTraceLimit',
    ].sort()
    const actual = Object.keys(context).sort()
    expect(actual).toEqual(expected)
  })
})

describe({
  name: 'context.await',
  usage: `Given a {{DeepAsync}} value, a \`resolve\` function, and optionally a
    \`reject\` function, resolves the {{DeepSync(value)}} Promise with the
    \`resolve\` or \`reject\` function invoked in the original context in which
    \`awaitContext\` was called.`,
  args: [
    {
      name: 'value',
      type: '*TIn',
      description: 'any {{DeepAsync}} value',
    },
    {
      name: 'resolve',
      type: '(TIn=>TOut)',
      description: 'a function that accepts the awaited {{DeepSync(value)}}',
    },
    {
      name: 'reject',
      type: '?(TErr=>TOut)',
      description: 'a function that accepts the rejected error from the {{DeepSync(value)}}',
    },
  ],
  returns: {
    type: '*TOut',
    description: 'a Promise resolving to the output of the `resolve` or `reject` function.',
  },
}, () => {
  it('should resolve the async value in its original context', async () => {
    const asyncValue = Promise.resolve(40)
    const addToContext = (value) => value + (context.value() || 0)
    const [withoutContext, withContext] = context.enter(2, () => ([
      asyncValue.then(addToContext),
      context.await(asyncValue, addToContext), // capture the 2
    ]))
    expect(await withoutContext).toBe(40)
    expect(await withContext).toBe(42)
  })
})
