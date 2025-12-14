import path from "path"
import { Global } from "../global"
import { Log } from "../util/log"
import z from "zod"

export namespace ClaudeAuth {
  const log = Log.create({ service: "claude-auth" })

  /**
   * Schema for Claude Code CLI OAuth credentials stored in ~/.claude/.credentials.json
   */
  export const Credentials = z.object({
    claudeAiOauth: z
      .object({
        accessToken: z.string(),
        refreshToken: z.string(),
        expiresAt: z.number(),
        scopes: z.array(z.string()).optional(),
        subscriptionType: z.string().optional(),
        rateLimitTier: z.string().optional(),
      })
      .optional(),
  })

  export type Credentials = z.infer<typeof Credentials>

  /**
   * Path to Claude Code CLI credentials file
   */
  const credentialsPath = path.join(Global.Path.home, ".claude", ".credentials.json")

  /**
   * Get Claude Code OAuth credentials from ~/.claude/.credentials.json
   *
   * @returns OAuth credentials if available, undefined otherwise
   */
  export async function get(): Promise<Credentials["claudeAiOauth"] | undefined> {
    try {
      const file = Bun.file(credentialsPath)
      const exists = await file.exists()
      if (!exists) {
        log.info("credentials file not found", { path: credentialsPath })
        return undefined
      }

      const content = await file.json()
      const parsed = Credentials.parse(content)

      if (!parsed.claudeAiOauth) {
        log.info("no claudeAiOauth credentials found")
        return undefined
      }

      // Check if token is expired
      if (parsed.claudeAiOauth.expiresAt < Date.now()) {
        log.info("token expired", {
          expiresAt: new Date(parsed.claudeAiOauth.expiresAt).toISOString(),
        })
        // Note: Token refresh would require Claude Code CLI to handle it
        // For now, we return the token and let the API fail, prompting user to re-authenticate
        log.warn("token may be expired, please run 'claude auth login' to refresh")
      }

      log.info("loaded claude oauth credentials", {
        subscriptionType: parsed.claudeAiOauth.subscriptionType,
        scopes: parsed.claudeAiOauth.scopes,
      })

      return parsed.claudeAiOauth
    } catch (error) {
      log.error("failed to read claude credentials", { error })
      return undefined
    }
  }

  /**
   * Check if Claude OAuth credentials are available
   */
  export async function isAvailable(): Promise<boolean> {
    const creds = await get()
    return creds !== undefined && creds.accessToken !== undefined
  }

  /**
   * Get the access token for API requests
   */
  export async function getAccessToken(): Promise<string | undefined> {
    const creds = await get()
    return creds?.accessToken
  }
}
