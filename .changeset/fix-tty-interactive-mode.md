---
'@link-assistant/agent': patch
---

fix: Enable interactive terminal mode when stdin is TTY

Previously, when running `agent` in an interactive terminal (TTY), the CLI
would immediately show help and exit, not accepting any input. This was a
regression from issue #76 fix that treated all TTY connections as "no input
expected".

Now, when running `agent` in a terminal:

- Outputs status message indicating interactive terminal mode
- Accepts typed input from the user
- Processes messages in continuous mode with session persistence
- Respects `--verbose` and other flags

To get the old behavior (show help and exit), use `--no-always-accept-stdin`.

Fixes #84
