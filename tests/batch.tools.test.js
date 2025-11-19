import { test, expect } from 'bun:test'
import { $ } from 'bun'
import { setDefaultTimeout } from 'bun:test'

// Disable timeouts for these tests
setDefaultTimeout(0)

// Shared assertion function to validate OpenCode-compatible JSON structure for batch tool
function validateBatchToolOutput(toolEvent, label) {
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
  expect(toolEvent.part.tool).toBe('batch')

  // Validate state structure
  expect(toolEvent.part.state).toBeTruthy()
  expect(toolEvent.part.state.status).toBe('completed')
  expect(typeof toolEvent.part.state.title).toBe('string')

  // Validate input structure
  expect(toolEvent.part.state.input).toBeTruthy()
  expect(Array.isArray(toolEvent.part.state.input.tools)).toBeTruthy()

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

test('Reference test: OpenCode batch tool produces expected JSON format', async () => {
  const input = `{"message":"run batch","tools":[{"name":"batch","params":{"tool_calls":[{"tool":"bash","parameters":{"command":"echo hello","description":"Echo hello"}},{"tool":"bash","parameters":{"command":"echo world","description":"Echo world"}}]}}]}`

  // Create temporary config for OpenCode with batch_tool enabled
  const tmpDir = `/tmp/opencode-test-${Date.now()}`
  await $`mkdir -p ${tmpDir}/.opencode`.quiet()
  await $`echo '{"experimental":{"batch_tool":true}}' > ${tmpDir}/.opencode/config.json`.quiet()

  const originalResult = await $`cd ${tmpDir} && echo ${input} | opencode run --format json --model opencode/grok-code`.quiet().nothrow()
  const originalLines = originalResult.stdout.toString().trim().split('\n').filter(line => line.trim())
  const originalEvents = originalLines.map(line => JSON.parse(line))

  // Clean up
  await $`rm -rf ${tmpDir}`.quiet()

  // Find tool_use events for batch
  const batchEvent = originalEvents.find(e => e.type === 'tool_use' && e.part.tool === 'batch')

  // Should have tool_use event for batch
  expect(batchEvent).toBeTruthy()

  // Validate using shared assertion function
  validateBatchToolOutput(batchEvent, 'OpenCode')

  console.log('✅ Reference test passed - OpenCode produces expected JSON format')
})

test('Agent-cli batch tool produces 100% compatible JSON output with OpenCode', async () => {
  const input = `{"message":"run batch","tools":[{"name":"batch","params":{"tool_calls":[{"tool":"bash","parameters":{"command":"echo hello","description":"Echo hello"}},{"tool":"bash","parameters":{"command":"echo world","description":"Echo world"}}]}}]}`

  // Create temporary config for OpenCode with batch_tool enabled
  const tmpDir = `/tmp/opencode-test-${Date.now()}`
  await $`mkdir -p ${tmpDir}/.opencode`.quiet()
  await $`echo '{"experimental":{"batch_tool":true}}' > ${tmpDir}/.opencode/config.json`.quiet()

  // Get OpenCode output
  const originalResult = await $`cd ${tmpDir} && echo ${input} | opencode run --format json --model opencode/grok-code`.quiet().nothrow()
  const originalLines = originalResult.stdout.toString().trim().split('\n').filter(line => line.trim())
  const originalEvents = originalLines.map(line => JSON.parse(line))
  const originalBatch = originalEvents.find(e => e.type === 'tool_use' && e.part.tool === 'batch')

  // Clean up OpenCode temp dir
  await $`rm -rf ${tmpDir}`.quiet()

  // Get agent-cli output - need to set experimental config
  const projectRoot = process.cwd()
  const configPath = `${projectRoot}/.opencode/config.json`
  await $`mkdir -p ${projectRoot}/.opencode`.quiet()
  await $`echo '{"experimental":{"batch_tool":true}}' > ${configPath}`.quiet()

  const agentResult = await $`echo ${input} | bun run ${projectRoot}/src/index.js`.quiet()
  const agentLines = agentResult.stdout.toString().trim().split('\n').filter(line => line.trim())
  const agentEvents = agentLines.map(line => JSON.parse(line))
  const agentBatch = agentEvents.find(e => e.type === 'tool_use' && e.part.tool === 'batch')

  // Clean up agent-cli config
  await $`rm -rf ${projectRoot}/.opencode`.quiet()

  // Validate both outputs
  validateBatchToolOutput(originalBatch, 'OpenCode')
  validateBatchToolOutput(agentBatch, 'Agent-cli')

  // Verify structure matches
  expect(Object.keys(agentBatch).sort()).toEqual(Object.keys(originalBatch).sort())
  expect(Object.keys(agentBatch.part).sort()).toEqual(Object.keys(originalBatch.part).sort())
  expect(Object.keys(agentBatch.part.state).sort()).toEqual(Object.keys(originalBatch.part.state).sort())

  console.log('\n✅ Agent-cli produces 100% OpenCode-compatible JSON structure for batch tool')
  console.log('All required fields and nested structure match OpenCode output format')
})
