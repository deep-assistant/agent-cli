# agent-cli

A minimal AI CLI agent MVP based on OpenCode, providing JSON input/output with unrestricted file and system access.

## Design Choices

### Why Bun.sh + JavaScript instead of TypeScript?

For this MVP, we chose **Bun.sh + JavaScript** over TypeScript for the following reasons:

1. **Faster Development**: No compilation step - direct execution with `bun run`
2. **Simpler Dependencies**: Fewer dev dependencies, no TypeScript compiler overhead
3. **MVP Focus**: Type safety is less critical for a proof-of-concept than rapid iteration
4. **Bun Ecosystem**: Leverages Bun's native ESM support and fast runtime
5. **Minimalism**: Aligns with the project's goal of being a "slimmest possible AI CLI agent"

If the project grows and requires type safety, TypeScript can be reintroduced later.

## Features

- **JSON Input/Output**: Accepts JSON via stdin, outputs JSON responses
- **Unrestricted Access**: Full file system and command execution access
- **Tool Support**: Built-in tools for file operations, bash commands, and more
- **Hardcoded Model**: Uses OpenCode Zen Grok Code Fast 1 model
- **No TUI**: Pure CLI interface for automation and integration

## Installation

```bash
# Using bun (recommended)
bun install
bun link

# Or using npm
npm install -g .
```

## Usage

Pipe JSON input to the agent:

```bash
echo '{"message":"hello"}' | agent
```

### Input Format

```json
{
  "message": "Your message here",
  "tools": [
    {
      "name": "bash",
      "params": { "command": "ls -la" }
    }
  ]
}
```

### Output Format

```json
{
  "response": "Agent response",
  "model": "opencode/zen-grok-code-fast-1",
  "timestamp": 1234567890,
  "toolResults": [...]
}
```

## Supported Tools

- `bash`: Execute shell commands
- `read`: Read file contents
- `edit`: Edit file contents
- `list`: List directory contents
- `glob`: Find files with patterns
- `grep`: Search text in files

## Testing

Run tests with:

```bash
# Using bun (recommended)
bun test

# Or using npm
npm test
```

The tests use [command-stream](https://github.com/link-foundation/command-stream) to pipe JSON input to the CLI and verify the JSON output responses.

## License

Unlicense (Public Domain)
