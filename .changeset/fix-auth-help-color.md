---
'@link-assistant/agent': patch
---

fix: Display help text on stdout instead of stderr to prevent red color

Fixes issue #77 where help text appeared in red color when running `agent auth` without a subcommand.

Root Cause:

- Help text was being written to stderr using `console.error()`
- Many terminals display stderr output in red by default, making informational help text appear as an error

Changes:

- Modified the yargs fail handler in `src/index.js` to use `console.log()` instead of `console.error()` for validation error messages and help text
- Added `stripAnsi()` calls to ensure help text is free from ANSI color codes
- Added test scripts in `experiments/` folder to verify the fix

Impact:

- Help text for `agent auth`, `agent mcp`, and other commands now displays in normal terminal color
- Actual errors still go to stderr appropriately
- Improves user experience by making help text clearly distinguishable from actual errors
