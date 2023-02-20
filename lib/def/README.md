# Definitions

This is the full set of FP functionality. All definitions are described in terms of properties. Properties can be of any other primitive type, including functions. If the definition itself is a function, the invocation will be described by a property labeled `{invoke}` in order to make this document easier to read.

## Primitives

This is the core set of FP functionality underlying the rest of the library.

### Ecma

A native Javascript function.

* `{invoke}` _(code: String, options: Ecma.Options) => Function_

#### Ecma.Options

* `in` _List[Interface]?_ the interfaces of each function argument
* `out` _Interface_ the interface of the return value
* `throws` _List[Interface{Error}]_
* `isPure` _Boolean? = false_

### Identifier

A globally-unique identifier.

* `{invoke}`
  * _() -> Identifier_ creates a single identifier with the MISC as the name
  * _name: String -> Identifier_ creates a single, named identifier
  * _n: Int -> List[Identifier]_ creates a list of _n_ identifiers with the MISC as the name
  * _(name: String, n: Int) -> List[Identifier]_ creates a list of _n_ named identifiers
* `for`
  * _name: String -> Identifier_ if an identifier by this name has already been created, returns it; otherwise, creates a single, named identifier_
* `[instance]`
  * `name`
  * `id`
  * `uuid`
  * `symbol`
  * `misc`
* `{implicit}`
  * `Ecma.Symbol` the _symbol_ property
  * `String` the _misc_ property
  * `Int` the _id_ property

#### Identifier.Name

`String{_.length>0}`

### Interface

Defines the minimum set of properties a value must provide in order to be considered an instance of the interface.

* `{invoke}`
  * `[in]` _Map:_
    * `name` _String{_.length>0}?_ the name of the interface
    * `properties` _Map[Identifier, Interface]_
  * `[out]` _Interface_
* `implicit` _Function:_
  * _List(sourceInterface:Interface, destinationInterface:Interface)_
  * _sourceInterface=>destinationInterface_
* `explicit`  _Map:_
  * _List(sourceInterface:Interface, destinationInterface:Interface)_
  * _sourceInterface=>destinationInterface_
* `isInstance` _TODO_
* `isImplicit` _TODO_
* `isExplicit` _TODO_
* `canConvert` _TODO_
* `convert` _TODO_
* `as` _TODO
* `implicitly` _TODO: return array of implicit conversion types_
* `explicitly` _TODO: return array of explicit conversion types_
* `union` _TODO_
* `intersection` _TODO_
* `assert` _Function:_
  * `List(ITarget:Interface, Value)`
  * `ITarget`
* `for` _String=>Interface?_ given a name, returns the interface or null
* TODO: isImplemented, apply, etc.
* `[instance]`
  * `{invoke}` _T=>self !ConversionError[T self]_ explicitly convert a value to the current interface; if no implicit or explicit conversion exists, throw a ConversionError
  * `name` _Identifier?_ the name of the interface
  * `id` _Identifier_ a unique identifier for this interface
  * `properties` _Map[Identifier, Interface]_

#### Interface.Convert

* `{invoke}` _(Interface, Interface, Ecma.Function)=>Convert
* `instance`
  * `in`
  * `out`
  * `convert`

### Context

### Function

* `{invoke}`
  * `IN`
    * `List(...Value, Value)`
  * `OUT`
    * _Function_
* `[instance]`
  * `{invoke}`
    * `IN`
      * todo
    * `OUT`
      * todo
  * `in` _Interface_ the interface of the function arguments
  * `out` _Interface_ the interface of the return value
  * `throws` _List[Interface{Error}]_
  * `isPure` _Boolean_

### Pipe

### List

### Stack

### Array

### Map

### String

### Regex

### Number

#### Int

#### Float

#### Boolean

### Error

### Value

### Module

#### Native

A native Javascript value.

#### Val

#### Ref

#### Unresolved

#### Future
