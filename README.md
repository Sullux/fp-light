# readme

# fp-light

This is a functional programming library with a focus on point-free coding style
and abstracting the complexity of asynchronous programming. This library has no
dependencies, so adding it to your project does not introduce a lot of bloat.

## Installation

```bash
npm i -P @sullux/fp-light
# or
yarn add @sullux/fp-light
```

## Basic Usage

Coming soon!

These docs are in the process of being built. We will be using the common
pattern of even numbered releases for LTS, so we are treating this 1.0 release
as a beta. While most of this library is relatively stable, some things might
change before we get to our first LTS candidate.

## API

[API](https://github.com/Sullux/fp-light/blob/master/API.md)

The full [API](https://github.com/Sullux/fp-light/blob/master/API.md) includes all exports from this library. While the source code
is light, the list of exported function is long. To make it easier to navigate,
here are the same exports broken into categories. Some functions will be found
in multiple categories. We just wanted to make it as easy as possible for you to
quickly find what you're looking for.

* [Async](https://github.com/Sullux/fp-light/blob/master/ASYNC.md)
* [Bitwise](https://github.com/Sullux/fp-light/blob/master/BITWISE.md)
* [Comparison](https://github.com/Sullux/fp-light/blob/master/COMPARISON.md)
* [Compilable](https://github.com/Sullux/fp-light/blob/master/COMPILABLE.md)
* [Composition](https://github.com/Sullux/fp-light/blob/master/COMPOSITION.md)
* [Convenience Functions](https://github.com/Sullux/fp-light/blob/master/CONVENIENCE-FUNCTIONS.md)
* [Environment](https://github.com/Sullux/fp-light/blob/master/ENVIRONMENT.md)
* [Error](https://github.com/Sullux/fp-light/blob/master/ERROR.md)
* [Foundational](https://github.com/Sullux/fp-light/blob/master/FOUNDATIONAL.md)
* [Mapping](https://github.com/Sullux/fp-light/blob/master/MAPPING.md)
* [Side Effect](https://github.com/Sullux/fp-light/blob/master/SIDE-EFFECT.md)
* [Spreadable](https://github.com/Sullux/fp-light/blob/master/SPREADABLE.md)
* [Strings](https://github.com/Sullux/fp-light/blob/master/STRINGS.md)
* [Types](https://github.com/Sullux/fp-light/blob/master/TYPES.md)
* [arrays](https://github.com/Sullux/fp-light/blob/master/ARRAYS.md)
* [compilable](https://github.com/Sullux/fp-light/blob/master/COMPILABLE.md)
* [strings](https://github.com/Sullux/fp-light/blob/master/STRINGS.md)

## Development

To document a function in a comment, use the following YML template:

```javascript
/* #AUTODOC#
module: API
name: <name>
aliases: [<name>]
tags: [<Tag>]
ts: |
  declare function <name>(<arg>: <type>): <type>
description: |
  <add description here>
examples: |
  <add code blocks and explanations here>
specs:
  - !spec
    name: <name>
    fn: !js <name>
    tests:
      - name: should <do what>
        input: [<value>]
        output: <value>
*/
```
