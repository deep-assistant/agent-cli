// Share not supported in agent-cli - stub for compatibility
export namespace Share {
  export async function create() {
    throw new Error("Share not supported in agent-cli")
  }
  export async function sync() {
    // No-op
  }
  export async function remove() {
    // No-op
  }
}
