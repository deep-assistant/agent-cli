---
'@link-assistant/agent': patch
---

Improve error messages for package installation failures

- Enhanced BunProc error messages to include stderr and stdout output
- Added optional details field to BunInstallFailedError for better debugging
- Created cache directory before package installation to prevent permission errors
