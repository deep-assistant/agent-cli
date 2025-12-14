# Claude OAuth Provider

> **⚠️ Current Limitation:** As of December 2024, Anthropic's public API does not accept OAuth tokens for programmatic access. The API returns "OAuth authentication is currently not supported" when attempting to use Claude Code CLI OAuth tokens. This provider is implemented for future compatibility when Anthropic enables OAuth token support for the API.
>
> **Recommended Alternative:** Use the `anthropic` provider with an API key from the [Anthropic Console](https://console.anthropic.com/), or use the `opencode` provider which includes Claude models.

The Claude OAuth provider is designed to allow using Claude Code CLI OAuth credentials to access Claude models. This feature is prepared for when Anthropic enables OAuth token support for their public API.

## Current Status

| Feature | Status |
|---------|--------|
| Token Reading | ✅ Works - reads from `~/.claude/.credentials.json` |
| Token Detection | ✅ Works - detects `CLAUDE_CODE_OAUTH_TOKEN` env var |
| Provider Setup | ✅ Works - provider loads with Claude models |
| API Authentication | ❌ Blocked by Anthropic - API rejects OAuth tokens |

## Why This Doesn't Work Yet

According to [Anthropic's documentation](https://github.com/anthropics/claude-code/issues/6536):

> "The SDK is designed for programmatic use and requires an API key (which starts with `sk-ant-api...`) for API-based billing."

The OAuth tokens from Claude Code CLI (`sk-ant-oat...`) are designed for interactive CLI usage only, not for programmatic API access. Anthropic's API explicitly rejects these tokens with the error: "OAuth authentication is currently not supported."

## Current Alternatives

### Option 1: Use Anthropic API Key (Direct)

Get an API key from the [Anthropic Console](https://console.anthropic.com/) and use the `anthropic` provider:

```bash
export ANTHROPIC_API_KEY="sk-ant-api03-..."
echo "hello" | agent --model anthropic/claude-sonnet-4-5
```

### Option 2: Use OpenCode Provider (Recommended)

The OpenCode provider includes Claude models with a simpler setup:

```bash
# Free tier (limited)
echo "hello" | agent --model opencode/grok-code

# Paid models via OpenCode subscription
echo "hello" | agent --model opencode/claude-sonnet-4-5
```

## Prerequisites (For Future Use)

When Anthropic enables OAuth token support, you'll need:
- [Claude Code CLI](https://claude.ai/code) installed and authenticated
- A Claude Pro or Max subscription
- Or a `CLAUDE_CODE_OAUTH_TOKEN` environment variable

## How It Will Work (Future)

### Method 1: Claude Code CLI

Once enabled, the agent will automatically detect and use your OAuth credentials:

1. Install Claude Code CLI from [claude.ai/code](https://claude.ai/code)
2. Run `claude auth login` to authenticate
3. Use the agent with `claude-oauth` provider:

```bash
echo "hello" | agent --model claude-oauth/claude-sonnet-4-5
```

The agent reads OAuth tokens from `~/.claude/.credentials.json`, which is created by the Claude Code CLI.

### Method 2: Environment Variable

You can also set the `CLAUDE_CODE_OAUTH_TOKEN` environment variable directly:

```bash
export CLAUDE_CODE_OAUTH_TOKEN="sk-ant-oat01-..."
echo "hello" | agent --model claude-oauth/claude-sonnet-4-5
```

## Available Models (When Enabled)

The Claude OAuth provider gives you access to all Anthropic models:

| Model | Model ID | Description |
|-------|----------|-------------|
| Claude Sonnet 4.5 | `claude-oauth/claude-sonnet-4-5` | Latest Claude Sonnet |
| Claude Opus 4.1 | `claude-oauth/claude-opus-4-1` | Most capable Claude model |
| Claude Haiku 4.5 | `claude-oauth/claude-haiku-4-5` | Fastest Claude model |
| Claude Sonnet 3.5 v2 | `claude-oauth/claude-3-5-sonnet-20241022` | Previous generation Sonnet |

## Token Storage

OAuth tokens from Claude Code CLI are stored in:

```
~/.claude/.credentials.json
```

The format is:
```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": 1765759825273,
    "scopes": ["user:inference", "user:profile", "user:sessions:claude_code"],
    "subscriptionType": "max",
    "rateLimitTier": "default_claude_max_20x"
  }
}
```

## Differences from Direct Anthropic API

| Feature | Claude OAuth | Anthropic API |
|---------|--------------|---------------|
| Token Format | `sk-ant-oat...` (OAuth) | `sk-ant-api...` (API key) |
| Authentication | Bearer token | x-api-key header |
| Billing | Claude Pro/Max subscription | Pay-as-you-go through Console |
| Setup | `claude auth login` | Generate API key in Console |
| Environment Variable | `CLAUDE_CODE_OAUTH_TOKEN` | `ANTHROPIC_API_KEY` |
| **API Support** | ❌ Not supported yet | ✅ Fully supported |

## Technical Implementation

The provider is implemented to:

1. Check for `CLAUDE_CODE_OAUTH_TOKEN` environment variable
2. If not found, read OAuth credentials from `~/.claude/.credentials.json`
3. Use Bearer token authentication (when supported)
4. Inherit all Claude models from the Anthropic provider

## References

- [Claude Code CLI OAuth Issue #6536](https://github.com/anthropics/claude-code/issues/6536) - SDK OAuth support discussion
- [Claude Code CLI Documentation](https://code.claude.com/docs/en/setup)
- [Anthropic API Documentation](https://docs.anthropic.com/en/docs/about-claude/models)
- [Anthropic Console](https://console.anthropic.com/) - For API key generation
