---
'@link-assistant/agent': patch
---

fix(google): Fall back to API key when OAuth fails with scope errors

When Google OAuth authentication fails with "insufficient authentication scopes" (HTTP 403),
the agent now automatically falls back to API key authentication if available.

This addresses issue #100 where users could successfully authenticate with Google OAuth
but then receive scope errors when trying to use the Gemini API. The OAuth client only
has `cloud-platform` scope registered, which doesn't cover all Gemini API operations.

The fallback mechanism:

1. Detects OAuth scope errors (403 with `insufficient_scope` in `www-authenticate` header)
2. Falls back to API key auth if `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY` is set
3. Logs helpful hints directing users to set an API key or re-authenticate

This allows users with Google AI subscriptions to authenticate via OAuth and have the
system automatically use their API key when needed.
