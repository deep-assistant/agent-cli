# Usage Examples

This document provides practical examples for using each tool with both `agent-cli` and `opencode` commands.

## Table of Contents

- [Basic Usage](#basic-usage)
- [File Operations](#file-operations)
- [Search Tools](#search-tools)
- [Execution Tools](#execution-tools)
- [Utility Tools](#utility-tools)

## Basic Usage

### Simplest Examples - Start Here!

**Plain text (agent-cli only, easiest!):**
```bash
echo "hi" | bun run src/index.js
```

**Simple JSON message (both agent-cli and opencode):**

agent-cli:
```bash
echo '{"message":"hi"}' | bun run src/index.js
```

opencode:
```bash
echo '{"message":"hi"}' | opencode run --format json --model opencode/grok-code
```

### Plain Text Input (agent-cli only)

```bash
# Simple message
echo "hello world" | bun run src/index.js

# Ask a question
echo "what is TypeScript?" | bun run src/index.js

# Request web search
echo "search the web for latest React news" | bun run src/index.js
```

### JSON Input Examples

**agent-cli:**
```bash
echo '{"message":"hello world"}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"hello world"}' | opencode run --format json --model opencode/grok-code
```

## File Operations

### bash Tool

Execute shell commands.

**agent-cli:**
```bash
echo '{"message":"run command","tools":[{"name":"bash","params":{"command":"echo hello world"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"run command","tools":[{"name":"bash","params":{"command":"echo hello world"}}]}' | opencode run --format json --model opencode/grok-code
```

**Example with description:**
```bash
echo '{"message":"list files","tools":[{"name":"bash","params":{"command":"ls -la","description":"List all files in current directory"}}]}' | bun run src/index.js
```

### read Tool

Read file contents.

**agent-cli:**
```bash
echo '{"message":"read file","tools":[{"name":"read","params":{"file_path":"/path/to/file.txt"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"read file","tools":[{"name":"read","params":{"file_path":"/path/to/file.txt"}}]}' | opencode run --format json --model opencode/grok-code
```

### write Tool

Write content to a file.

**agent-cli:**
```bash
echo '{"message":"write file","tools":[{"name":"write","params":{"file_path":"/tmp/test.txt","content":"Hello World"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"write file","tools":[{"name":"write","params":{"file_path":"/tmp/test.txt","content":"Hello World"}}]}' | opencode run --format json --model opencode/grok-code
```

### edit Tool

Edit file with string replacement.

**agent-cli:**
```bash
echo '{"message":"edit file","tools":[{"name":"edit","params":{"file_path":"/tmp/test.txt","old_string":"Hello","new_string":"Hi"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"edit file","tools":[{"name":"edit","params":{"file_path":"/tmp/test.txt","old_string":"Hello","new_string":"Hi"}}]}' | opencode run --format json --model opencode/grok-code
```

### list Tool

List directory contents.

**agent-cli:**
```bash
echo '{"message":"list directory","tools":[{"name":"list","params":{"path":"."}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"list directory","tools":[{"name":"list","params":{"path":"."}}]}' | opencode run --format json --model opencode/grok-code
```

## Search Tools

### glob Tool

Find files using glob patterns.

**agent-cli:**
```bash
# Find all JavaScript files
echo '{"message":"find js files","tools":[{"name":"glob","params":{"pattern":"**/*.js"}}]}' | bun run src/index.js

# Find TypeScript files in src directory
echo '{"message":"find ts files","tools":[{"name":"glob","params":{"pattern":"src/**/*.ts"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"find js files","tools":[{"name":"glob","params":{"pattern":"**/*.js"}}]}' | opencode run --format json --model opencode/grok-code
```

### grep Tool

Search text in files with regex.

**agent-cli:**
```bash
# Search for pattern in files
echo '{"message":"search pattern","tools":[{"name":"grep","params":{"pattern":"function","output_mode":"files_with_matches"}}]}' | bun run src/index.js

# Search with content display
echo '{"message":"search TODO","tools":[{"name":"grep","params":{"pattern":"TODO","output_mode":"content"}}]}' | bun run src/index.js

# Case-insensitive search in JavaScript files
echo '{"message":"search error","tools":[{"name":"grep","params":{"pattern":"error","-i":true,"type":"js","output_mode":"content"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"search pattern","tools":[{"name":"grep","params":{"pattern":"TODO","output_mode":"content"}}]}' | opencode run --format json --model opencode/grok-code
```

### websearch Tool

Search the web using Exa API.

**agent-cli (no environment variable needed!):**
```bash
echo '{"message":"search web","tools":[{"name":"websearch","params":{"query":"TypeScript latest features"}}]}' | bun run src/index.js

echo '{"message":"search web","tools":[{"name":"websearch","params":{"query":"React hooks best practices"}}]}' | bun run src/index.js
```

**opencode (requires OPENCODE_EXPERIMENTAL_EXA=true):**
```bash
echo '{"message":"search web","tools":[{"name":"websearch","params":{"query":"TypeScript latest features"}}]}' | OPENCODE_EXPERIMENTAL_EXA=true opencode run --format json --model opencode/grok-code
```

### codesearch Tool

Search code repositories and documentation.

**agent-cli (no environment variable needed!):**
```bash
echo '{"message":"search code","tools":[{"name":"codesearch","params":{"query":"React hooks implementation"}}]}' | bun run src/index.js

echo '{"message":"search code","tools":[{"name":"codesearch","params":{"query":"async/await patterns"}}]}' | bun run src/index.js
```

**opencode (requires OPENCODE_EXPERIMENTAL_EXA=true):**
```bash
echo '{"message":"search code","tools":[{"name":"codesearch","params":{"query":"React hooks implementation"}}]}' | OPENCODE_EXPERIMENTAL_EXA=true opencode run --format json --model opencode/grok-code
```

## Execution Tools

### batch Tool

Batch multiple tool calls together for optimal performance.

**agent-cli (no configuration needed!):**
```bash
echo '{"message":"run batch","tools":[{"name":"batch","params":{"tool_calls":[{"tool":"bash","parameters":{"command":"echo hello"}},{"tool":"bash","parameters":{"command":"echo world"}}]}}]}' | bun run src/index.js
```

**opencode (requires experimental config):**
```bash
# Create config file first
mkdir -p .opencode
echo '{"experimental":{"batch_tool":true}}' > .opencode/config.json

# Then run
echo '{"message":"run batch","tools":[{"name":"batch","params":{"tool_calls":[{"tool":"bash","parameters":{"command":"echo hello"}},{"tool":"bash","parameters":{"command":"echo world"}}]}}]}' | opencode run --format json --model opencode/grok-code
```

### task Tool

Launch specialized agents for complex tasks.

**agent-cli:**
```bash
echo '{"message":"launch task","tools":[{"name":"task","params":{"description":"Analyze codebase","prompt":"Find all TODO comments in JavaScript files","subagent_type":"general-purpose"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"launch task","tools":[{"name":"task","params":{"description":"Analyze codebase","prompt":"Find all TODO comments in JavaScript files","subagent_type":"general-purpose"}}]}' | opencode run --format json --model opencode/grok-code
```

## Utility Tools

### todo Tool

Read and write TODO items for task tracking.

**agent-cli:**
```bash
# Write todos
echo '{"message":"add todos","tools":[{"name":"todowrite","params":{"todos":[{"content":"Implement feature X","status":"pending","activeForm":"Implementing feature X"},{"content":"Write tests","status":"pending","activeForm":"Writing tests"}]}}]}' | bun run src/index.js

# Read todos
echo '{"message":"read todos","tools":[{"name":"todoread","params":{}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"add todos","tools":[{"name":"todowrite","params":{"todos":[{"content":"Implement feature X","status":"pending","activeForm":"Implementing feature X"}]}}]}' | opencode run --format json --model opencode/grok-code
```

### webfetch Tool

Fetch and process web content.

**agent-cli:**
```bash
echo '{"message":"fetch url","tools":[{"name":"webfetch","params":{"url":"https://example.com","prompt":"Summarize the content"}}]}' | bun run src/index.js
```

**opencode:**
```bash
echo '{"message":"fetch url","tools":[{"name":"webfetch","params":{"url":"https://example.com","prompt":"Summarize the content"}}]}' | opencode run --format json --model opencode/grok-code
```

## Output Format

### Pretty-Printed by Default

agent-cli outputs pretty-printed JSON for better human readability:

```json
{
  "type": "text",
  "timestamp": 1763582229355,
  "sessionID": "ses_mi6fbp514d3kuvvtjwk",
  "part": {
    "id": "prt_mi6fbp7vkxvwk17e3c",
    "type": "text",
    "text": "Hi!",
    "time": {
      "start": 1763582229355,
      "end": 1763582229355
    }
  }
}
```

### Compact Mode for Automation

For programmatic use (tests, scripts, automation), use compact mode:

```bash
export AGENT_CLI_COMPACT=1
echo "hi" | bun run src/index.js
```

Compact output (one JSON object per line):
```json
{"type":"step_start","timestamp":1234567890,"sessionID":"ses_xxx","part":{...}}
{"type":"tool_use","timestamp":1234567891,"sessionID":"ses_xxx","part":{...}}
{"type":"step_finish","timestamp":1234567892,"sessionID":"ses_xxx","part":{...}}
{"type":"text","timestamp":1234567893,"sessionID":"ses_xxx","part":{"text":"Response"}}
```

### Filtering Output

Extract specific event types using `jq`:

```bash
# Get only text responses (pretty-printed)
echo '{"message":"hello"}' | bun run src/index.js | jq -r 'select(.type=="text") | .part.text'

# Get only text responses (compact mode)
AGENT_CLI_COMPACT=1 echo '{"message":"hello"}' | bun run src/index.js | jq -r 'select(.type=="text") | .part.text'

# Get tool use events
echo '{"message":"run","tools":[{"name":"bash","params":{"command":"ls"}}]}' | bun run src/index.js | jq 'select(.type=="tool_use")'

# Get bash tool output
echo '{"message":"run","tools":[{"name":"bash","params":{"command":"echo test"}}]}' | bun run src/index.js | jq -r 'select(.type=="tool_use" and .part.tool=="bash") | .part.state.output'
```

## Tips

### Agent-CLI Advantages

1. **No Configuration**: WebSearch, CodeSearch, and Batch tools work without any setup
2. **Plain Text Input**: Can use simple text instead of JSON
3. **Always Enabled**: All tools available by default

### Working with JSON

Use single quotes for the outer shell command and double quotes inside JSON:

```bash
echo '{"message":"test","tools":[{"name":"bash","params":{"command":"echo hello"}}]}' | bun run src/index.js
```

### Debugging

Add `| jq` to prettify JSON output:

```bash
echo "hello" | bun run src/index.js | jq
```

### Chaining Commands

Process output with standard Unix tools:

```bash
# Count events
echo "hello" | bun run src/index.js | wc -l

# Filter and format
echo "hello" | bun run src/index.js | jq -r 'select(.type=="text") | .part.text'
```
