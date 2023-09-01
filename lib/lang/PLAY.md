# Low-Level Language

* `_` argument passed to function
* `^` object of declarations in local scope
* `^^` object of all declarations in scope
* `fn` function declaration
* `nd` non-deterministic value declaration
* `res` resolve a non-deterministic value
* `obj` object declaration
* `seq` sequence declaration
* `'...'` string literal
* `"..."` label literal
* \`...` native language literal
* `when` conditional
* `str` string
* `num` number
* `buf` buffer
* `ent` entry (key, value)
* `key` the key for the given entry
* `value` the value for the given entry
* `i` the 0-based index of the entry in the sequence
* `with` entries to include in current scope
* `from` (seq, ...keys)

```
(fn
  x 21
  y 2
  z (mul x y)
  (obj x x y y z z))

; same as

(fn
  x 21
  y 2
  z (mul x y)
  ^)

; same as

(obj
  x 21
  y 2
  z (mul x y)
)
```
