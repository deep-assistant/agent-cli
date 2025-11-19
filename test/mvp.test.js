import { test, assert } from 'test-anywhere'
// @ts-ignore
import { sh } from 'command-stream'
import { writeFileSync, unlinkSync } from 'fs'

test('MVP agent responds to JSON input', async () => {
  // Pipe JSON input to the agent CLI using command-stream
  const result = await sh(`echo '{"message":"hi"}' | bun run src/index.js`)

  // Parse the JSON output
  const response = JSON.parse(result.stdout.trim())

  // Verify the response
  assert.ok(response.response, 'Should have a response')
  assert.equal(response.model, 'opencode/zen-grok-code-fast-1', 'Should use the correct model')
  assert.ok(response.timestamp, 'Should have a timestamp')
  assert.ok(response.response.includes('hi'), 'Response should contain the input message')
})

test('MVP agent executes tools', async () => {
  // Create a test file
  writeFileSync('test-file.txt', 'Hello World\n')

  try {
    // Pipe JSON input with tools to the agent CLI using command-stream
    const jsonInput = JSON.stringify({
      message: "test",
      tools: [{
        name: "read",
        params: { filePath: "test-file.txt" }
      }]
    })

    const result = await sh(`echo '${jsonInput}' | bun run src/index.js`)

    // Parse the JSON output
    const response = JSON.parse(result.stdout.trim())

    // Verify the response
    assert.ok(response.toolResults, 'Should have tool results')
    assert.equal(response.toolResults.length, 1, 'Should have one tool result')
    assert.equal(response.toolResults[0].tool, 'read', 'Should be read tool')
    assert.ok(response.toolResults[0].result.content, 'Should have file content')
    assert.ok(response.toolResults[0].result.content.includes('Hello World'), 'Should contain file content')
  } finally {
    // Clean up
    try {
      unlinkSync('test-file.txt')
    } catch (e) {
      // Ignore cleanup errors
    }
  }
})