// Plugin system not supported in agent-cli - stub for compatibility
export namespace Plugin {
  export async function list() {
    return []
  }
  export async function get() {
    return undefined
  }
  export async function trigger() {
    // No-op
  }
  export async function tools() {
    return {}
  }
}
