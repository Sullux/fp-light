const {
  deepStrictEqual,
  strictEqual,
  ok,
} = require('assert')

const { inspect } = require('util')

const {
  define,
  allProperties,
  bindAll,
  type,
  typeEquals,
  factoryOf,
  Undefined,
  Null,
} = require('./type')

describe('type', () => {
  it('should type undefined', () =>
    deepStrictEqual(
      type(),
      {
        jstype: 'undefined',
        name: 'Undefined',
        factory: Undefined,
        factoryChain: [Undefined, Object],
      }
    ))
  it('should type null', () =>
    deepStrictEqual(
      type(null),
      {
        jstype: 'object',
        name: 'Null',
        factory: Null,
        factoryChain: [Null, Object],
      }
    ))
  it('should type false', () =>
    deepStrictEqual(
      type(false),
      {
        jstype: 'boolean',
        name: 'Boolean',
        factory: Boolean,
        factoryChain: [Boolean, Object],
      }
    ))
  it('should type true', () =>
    deepStrictEqual(
      type(true),
      {
        jstype: 'boolean',
        name: 'Boolean',
        factory: Boolean,
        factoryChain: [Boolean, Object],
      }
    ))
  it('should type falsy number', () =>
    deepStrictEqual(
      type(0),
      {
        jstype: 'number',
        name: 'Number',
        factory: Number,
        factoryChain: [Number, Object],
      }
    ))
  it('should type number', () =>
    deepStrictEqual(
      type(1),
      {
        jstype: 'number',
        name: 'Number',
        factory: Number,
        factoryChain: [Number, Object],
      }
    ))
  it('should type falsy string', () =>
    deepStrictEqual(
      type(''),
      {
        jstype: 'string',
        name: 'String',
        factory: String,
        factoryChain: [String, Object],
      }
    ))
  it('should type string', () =>
    deepStrictEqual(
      type('foo'),
      {
        jstype: 'string',
        name: 'String',
        factory: String,
        factoryChain: [String, Object],
      }
    ))
  it('should type array', () =>
    deepStrictEqual(
      type(['foo']),
      {
        jstype: 'object',
        name: 'Array',
        factory: Array,
        factoryChain: [Array, Object],
      }
    ))
  it('should type date', () =>
    deepStrictEqual(
      type(new Date()),
      {
        jstype: 'object',
        name: 'Date',
        factory: Date,
        factoryChain: [Date, Object],
      }
    ))
  it('should type extended class', () => {
    class Foo {}
    class Bar extends Foo {}
    deepStrictEqual(
      type(new Bar()),
      {
        jstype: 'object',
        name: 'Bar',
        factory: Bar,
        factoryChain: [Bar, Foo, Object],
      }
    )
  })
})

describe('typeEquals', () => {
  it('should equal undefined', () =>
    ok(typeEquals(undefined, undefined)))
  it('should equal null', () =>
    ok(typeEquals(null, null)))
  it('should not equal null', () =>
    ok(!typeEquals(undefined, null)))
  it('should equal sring', () =>
    ok(typeEquals('foo')('bar')))
})

describe('factoryOf', () => {
  it('should have a factory of Undefined', () =>
    strictEqual(factoryOf(), Undefined))
  it('should have a factory of Null', () =>
    strictEqual(factoryOf(null), Null))
  it('should have a factory of Boolean', () =>
    strictEqual(factoryOf(false), Boolean))
})

describe('Undefined', () => {
  it('should return undefined', () =>
    strictEqual(Undefined(), undefined))
})

describe('Null', () => {
  it('should return null', () =>
    strictEqual(Null(), null))
})

describe('define', () => {
  it('should define a function of the given name', () =>
    strictEqual(define('Foo').name, 'Foo'))
  it('should extend Object by default', () =>
    ok(define('Foo')() instanceof Object))
  it('should extend the given definition', () => {
    const Bar = define('Bar')
    const Foo = define('Foo', { extend: Bar })
    ok(Foo() instanceof Bar)
  })
  it('should incorporate the constructed object', () => {
    const Foo = define('Foo', { construct: () => ({ baz: 'biz' }) })
    strictEqual(Foo().baz, 'biz')
  })
  it('should incorporate enumerable properties', () => {
    const Foo = define('Foo', { enumerable: { baz: 'biz' } })
    ok(Object.entries(Foo())
      .some(([key, value]) => key === 'baz' && value === 'biz'))
  })
  it('should incorporate hidden properties', () => {
    const Foo = define('Foo', { hidden: { baz: 'biz' } })
    ok(!Object.entries(Foo())
      .some(([key, value]) => key === 'baz' && value === 'biz'))
    strictEqual(Foo().baz, 'biz')
  })
  it('should incorporate custom properties', () => {
    const Foo = define('Foo', { properties: { baz: { get: () => 'biz' } } })
    const foo = Foo()
    ok(!Object.entries(foo)
      .some(([key, value]) => key === 'baz' && value === 'biz'))
    strictEqual(foo.baz, 'biz')
    foo.baz = 42
    strictEqual(foo.baz, 'biz')
  })
  it('should bind all functions', () => {
    const Foo = define('Foo', {
      construct: () => ({ bar: 42 }),
      enumerable: { baz() { return this.bar.toString() } },
    })
    const baz = Foo().baz
    strictEqual(baz(), '42')
  })
  it('should describe an inspector', () => {
    const description = 'any description'
    const Foo = define('Foo', { describe: () => description })
    strictEqual(inspect(Foo()), description)
  })
})

describe('allProperties', () => {
  it('should include all defined properties', () => {
    const properties = {
      bar: {
        enumerable: true,
        value: 42,
        configurable: false,
        writable: false,
      },
      baz: {
        configurable: false,
        enumerable: false,
        get() { this.bar.toString() },
        set(value) { this.bar = value },
      },
    }
    const Foo = define('Foo', { properties })
    const instanceProperties = allProperties(Foo())
    Object.entries(properties)
      .forEach(([k, v]) => deepStrictEqual(instanceProperties[k], v))
  })
  it('should include prototype properties', () => {
    const properties = {
      bar: {
        enumerable: true,
        value: 42,
        configurable: false,
        writable: false,
      },
      baz: {
        configurable: false,
        enumerable: false,
        get() { this.bar.toString() },
        set(value) { this.bar = value },
      },
    }
    const Foo = define('Foo', { properties })
    const Bar = define('Bar', { extend: Foo })
    const instanceProperties = allProperties(Bar())
    Object.entries(properties)
      .forEach(([k, v]) => deepStrictEqual(instanceProperties[k], v))
  })
})

describe('bindAll', () => {
  it('should bind functions', () => {
    function Foo() { this.bar = 42 }
    Foo.prototype.baz = function () { return this.bar.toString() }
    const boundFoo = bindAll(new Foo())
    const baz = boundFoo.baz
    strictEqual(baz(), '42')
  })
})
