import { test, expect } from 'bun:test'
import { $ } from 'bun'
import { setDefaultTimeout } from 'bun:test'

// Disable timeouts for these tests
setDefaultTimeout(0)

// Shared assertion function to validate OpenCode-compatible JSON structure for websearch tool
function validateWebSearchToolOutput(toolEvent, label) {
  console.log(`\n${label} JSON structure:`)
  console.log(JSON.stringify(toolEvent, null, 2))

  // Validate top-level structure
  expect(typeof toolEvent.type).toBe('string')
  expect(toolEvent.type).toBe('tool_use')
  expect(typeof toolEvent.timestamp).toBe('number')
  expect(typeof toolEvent.sessionID).toBe('string')
  expect(toolEvent.sessionID.startsWith('ses_')).toBeTruthy()

  // Validate part structure
  expect(toolEvent.part).toBeTruthy()
  expect(typeof toolEvent.part.id).toBe('string')
  expect(toolEvent.part.id.startsWith('prt_')).toBeTruthy()
  expect(typeof toolEvent.part.sessionID).toBe('string')
  expect(typeof toolEvent.part.messageID).toBe('string')
  expect(toolEvent.part.type).toBe('tool')
  expect(typeof toolEvent.part.callID).toBe('string')
  expect(toolEvent.part.callID.startsWith('call_')).toBeTruthy()
  expect(toolEvent.part.tool).toBe('websearch')

  // Validate state structure
  expect(toolEvent.part.state).toBeTruthy()
  expect(toolEvent.part.state.status).toBe('completed')
  expect(typeof toolEvent.part.state.title).toBe('string')

  // Validate input structure
  expect(toolEvent.part.state.input).toBeTruthy()
  expect(typeof toolEvent.part.state.input.query).toBe('string')

  // Validate output
  expect(typeof toolEvent.part.state.output).toBe('string')

  // Validate timing information
  expect(toolEvent.part.state.time).toBeTruthy()
  expect(typeof toolEvent.part.state.time.start).toBe('number')
  expect(typeof toolEvent.part.state.time.end).toBe('number')
  expect(toolEvent.part.state.time.end >= toolEvent.part.state.time.start).toBeTruthy()

  console.log(`✅ ${label} structure validation passed`)
}

console.log('This establishes the baseline behavior for compatibility testing')

test('Reference test: OpenCode websearch tool produces expected JSON format', async () => {
  const input = `{"message":"search web","tools":[{"name":"websearch","params":{"query":"TypeScript latest features"}}]}`

  // Set OPENCODE_EXPERIMENTAL_EXA flag
  const originalResult = await $`OPENCODE_EXPERIMENTAL_EXA=true echo ${input} | opencode run --format json --model opencode/grok-code`.quiet().nothrow()
  const originalLines = originalResult.stdout.toString().trim().split('\n').filter(line => line.trim())
  const originalEvents = originalLines.map(line => JSON.parse(line))

  // Find tool_use events for websearch
  const searchEvent = originalEvents.find(e => e.type === 'tool_use' && e.part.tool === 'websearch')

  // Should have tool_use event for websearch
  expect(searchEvent).toBeTruthy()

  // Validate using shared assertion function
  validateWebSearchToolOutput(searchEvent, 'OpenCode')

  console.log('✅ Reference test passed - OpenCode produces expected JSON format')
})

test('Agent-cli websearch tool produces 100% compatible JSON output with OpenCode', async () => {
  const input = `{"message":"search web","tools":[{"name":"websearch","params":{"query":"TypeScript latest features"}}]}`

  // Get OpenCode output
  const originalResult = await $`OPENCODE_EXPERIMENTAL_EXA=true echo ${input} | opencode run --format json --model opencode/grok-code`.quiet().nothrow()
  const originalLines = originalResult.stdout.toString().trim().split('\n').filter(line => line.trim())
  const originalEvents = originalLines.map(line => JSON.parse(line))
  const originalSearch = originalEvents.find(e => e.type === 'tool_use' && e.part.tool === 'websearch')

  // Get agent-cli output with OPENCODE_EXPERIMENTAL_EXA flag
  const projectRoot = process.cwd()
  const agentResult = await $`OPENCODE_EXPERIMENTAL_EXA=true echo ${input} | bun run ${projectRoot}/src/index.js`.quiet()
  const agentLines = agentResult.stdout.toString().trim().split('\n').filter(line => line.trim())
  const agentEvents = agentLines.map(line => JSON.parse(line))
  const agentSearch = agentEvents.find(e => e.type === 'tool_use' && e.part.tool === 'websearch')

  // Validate both outputs
  validateWebSearchToolOutput(originalSearch, 'OpenCode')
  validateWebSearchToolOutput(agentSearch, 'Agent-cli')

  // Verify structure matches
  expect(Object.keys(agentSearch).sort()).toEqual(Object.keys(originalSearch).sort())
  expect(Object.keys(agentSearch.part).sort()).toEqual(Object.keys(originalSearch.part).sort())
  expect(Object.keys(agentSearch.part.state).sort()).toEqual(Object.keys(originalSearch.part.state).sort())

  console.log('\n✅ Agent-cli produces 100% OpenCode-compatible JSON structure for websearch tool')
  console.log('All required fields and nested structure match OpenCode output format')
})
