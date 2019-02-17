[home](https://github.com/Sullux/fp-light/blob/master/README.md)

## fp-light-trap

`npm i @sullux/fp-light-trap`
[source](https://github.com/Sullux/fp-light/blob/master/lib/trap/trap.js)
[test](https://github.com/Sullux/fp-light/blob/master/lib/trap/trap.spec.js)

The trap helper allows for a more functional approach to error handling.

* [trap](#trap)

### trap

`trap(critical: (...mixed[]) => [] | Promise): (...mixed[]) => [] | Promise<[]>`

The trap function can accept two types of values: a function or a thennable. When passed a function, trap returns a wrapped function that will return or resolve to a callback-style array in the form of `[error, result]`. When passed a thennable, trap will return a promise that resolves to the callback-style `[error, result]` array.

Following is an example that uses error trapping. This example exports a function that is made to be used in a directory of json files. The `readAllObjects` function reads all files in the given directory, parses them, and returns a promise that resolves to the array of all the objects read from the files.

The reason error trapping is so important in this example is that file systems are inconsistent. Instead of checking for the existence or type of a file, recommended practice is to try to read the file and ignore errors. Note that this example will still resolve to an error if the file data cannot be parsed as JSON.

```javascript
const { get } = require('@sullux/fp-light-get')
const { pipe } = require('@sullux/fp-light-pipe')
const { trap } = require('@sullux/fp-light-trap')
const { readFile, readdir } = require('fs')
const { promisify } = require('util')

const readAllObjects = pipe(
  promisify(readdir),
  map(get('toString')),
  map(trap(promisify(readFile))),
  filter(get(1)),
  map(get(1, 'toString')),
  map(JSON.parse),
  Promise.all,
)

module.exports = { readAllObjects }
```
