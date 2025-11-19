// Server not supported in agent-cli - stub for compatibility
export namespace Server {
  export async function start() {
    throw new Error("Server not supported in agent-cli - CLI only")
  }
}
