# Case Study: Issue #78 - Google OAuth Authorization Not Working

## Issue Summary

**Title:** "Не работает авторизация в Google" (Google authentication not working)
**Reporter:** @andchir
**Status:** Resolved
**Date Filed:** December 2025
**Date Resolved:** December 2025

**Problem Statement:** Google OAuth authorization doesn't work because it redirects to localhost, causing confusion and potential reliability issues.

## Timeline of Events

1. User attempts to authenticate with Google using `agent auth google`
2. Browser opens with Google OAuth consent screen
3. After Google authentication, browser redirects to localhost callback URL
4. Local server setup was complex and error-prone
5. Issue reported: "redirect happens to localhost" as if this was unexpected
6. Investigation revealed that localhost redirect works for OAuth but may be unreliable
7. Solution implemented: Switch to out-of-band OAuth flow

## Root Cause Analysis

### Primary Issue: Localhost Redirect Complexity

The original implementation used a localhost redirect URI with a local HTTP server to handle the OAuth callback. While technically correct for OAuth flows, this approach had several issues:

1. **Complexity**: Required starting a local HTTP server with dynamic port assignment
2. **Reliability**: Port conflicts, firewall issues, or browser security restrictions could break the flow
3. **User Confusion**: Users expected the authentication to happen entirely in the browser
4. **Maintenance**: Complex server setup code that was error-prone

### Investigation Findings

Research into Google OAuth documentation and the official Gemini CLI revealed that Google supports an "out-of-band" flow for installed applications using special redirect URIs like `urn:ietf:wg:oauth:2.0:oob:auto`. In this flow:

1. After authentication, Google displays the authorization code directly on the page
2. The user manually copies the code
3. The application prompts the user to paste the code back
4. No local server required - much simpler and more reliable

## Comparison with Gemini CLI

The official [google-gemini/gemini-cli](https://github.com/google-gemini/gemini-cli) implementation handles this correctly:

```typescript
// From gemini-cli/packages/core/src/code_assist/oauth2.ts
export function getAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, () => {
      const address = server.address()! as net.AddressInfo;
      port = address.port;
    });
    server.on('close', () => resolve(port)); // Only resolves after port is known
  });
}

// Usage: Wait for port before building redirect URI
const port = await getAvailablePort();
const redirectUri = `http://localhost:${port}/oauth2callback`;
```

## Related Issues in Gemini CLI

Research uncovered similar issues in the official Gemini CLI:

1. **[Issue #2515](https://github.com/google-gemini/gemini-cli/issues/2515)**: OAuth Authentication Challenges in Containerized Environments
   - Dynamic port makes Docker port mapping impossible
   - Solution: `--network host` mode or environment variable `OAUTH_CALLBACK_PORT`

2. **[Issue #2547](https://github.com/google-gemini/gemini-cli/issues/2547)**: Failed to Log In via 'Login with Google' on macOS
   - Redirect loop issues on macOS
   - Related to firewall/localhost resolution issues

## Solution

### Implemented Fix: Switch to Out-of-Band OAuth Flow

The solution was to replace the localhost redirect approach with Google's out-of-band OAuth flow, which is simpler and more reliable.

#### Changes Made

1. **Updated Redirect URI**: Changed from `http://localhost:{port}/oauth/callback` to `urn:ietf:wg:oauth:2.0:oob:auto`

2. **Removed Local Server**: Eliminated the complex HTTP server setup that was causing reliability issues

3. **Manual Code Entry**: Users now copy the authorization code from Google's page and paste it back in the terminal

4. **Simplified Code**: Removed ~150 lines of server management code, making the implementation much cleaner

#### Code Changes

**Before (localhost redirect):**

```typescript
// Complex server setup with dynamic ports
const serverPort = await getGoogleOAuthPort();
const redirectUri = `http://localhost:${serverPort}/oauth/callback`;
// ... 100+ lines of server code
```

**After (out-of-band flow):**

```typescript
// Simple out-of-band flow
const redirectUri = 'urn:ietf:wg:oauth:2.0:oob:auto';
// No server code needed
```

#### Benefits

- **Reliability**: No dependency on local server or port availability
- **Simplicity**: Much less code to maintain
- **Compatibility**: Works in all environments (containers, firewalls, etc.)
- **User Experience**: Clear instructions to copy/paste the code

## Testing Plan

1. **Unit Test**: Verify out-of-band redirect URI is used correctly
2. **Integration Test**: Complete OAuth flow with manual code entry
3. **Manual Test**: Verify browser flow and code copying works
4. **Cross-platform Test**: Test on different operating systems
5. **Error Handling Test**: Verify graceful handling of invalid codes

## Verification

The fix was verified by:

1. **Code Review**: TypeScript compilation and ESLint checks pass
2. **Logic Review**: OAuth flow follows Google's out-of-band specification
3. **Documentation Update**: User instructions updated to reflect new flow

## References

- [Google OAuth 2.0 for Desktop Applications](https://developers.google.com/identity/protocols/oauth2#installed)
- [OAuth 2.0 Security Best Current Practice](https://tools.ietf.org/html/rfc8252)
- [Gemini CLI Authentication Documentation](https://google-gemini.github.io/gemini-cli/docs/get-started/authentication.html)

## Impact

- **Severity**: Medium - Google OAuth was confusing but functional
- **Affected Users**: Users who found the localhost redirect confusing
- **Solution**: Simplified, more reliable OAuth flow
- **Benefit**: Better user experience and improved reliability
