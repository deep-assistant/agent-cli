---
'@link-assistant/agent': patch
---

fix: Resolve 'undefined is not an object (evaluating Log.Default.lazy.info)' error

The error occurred because `Log.Default.lazy` was undefined - the Logger interface doesn't have a `.lazy` property.
The logging methods (info, debug, warn, error) already support lazy evaluation through callback functions.

Changes:

- Fixed `Log.Default.lazy.info()` calls in src/index.js to use `Log.Default.info()` directly
- Added backward-compatible `lazy` property to Logger (self-reference) for any external code using this pattern
- Added unit tests for lazy logging callback support
