#!/usr/bin/env node

import { Agent } from './session/agent.js'
import { Instance } from './project/instance.ts'
import { Log } from './util/log.ts'

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = ''
    process.stdin.on('data', chunk => {
      data += chunk
    })
    process.stdin.on('end', () => {
      resolve(data)
    })
    process.stdin.on('error', reject)
  })
}

async function main() {
  try {
    // Initialize logging to redirect to log file instead of stderr
    // This prevents log messages from mixing with JSON output
    await Log.init({
      print: false,  // Don't print to stderr
      level: 'INFO'
    })

    // Read input from stdin
    const input = await readStdin()
    const trimmedInput = input.trim()

    // Try to parse as JSON, if it fails treat it as plain text message
    let request
    try {
      request = JSON.parse(trimmedInput)
    } catch (e) {
      // Not JSON, treat as plain text message
      request = {
        message: trimmedInput
      }
    }

    // Wrap in Instance.provide for OpenCode infrastructure
    await Instance.provide({
      directory: process.cwd(),
      fn: async () => {
        // Create agent and process request (events are emitted during processing)
        const agent = new Agent()
        await agent.process(request)
      }
    })

    // No final output since we stream events
    // Explicitly exit to ensure process terminates
    process.exit(0)
  } catch (error) {
    console.error(JSON.stringify({
      type: 'error',
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : String(error)
    }))
    process.exit(1)
  }
}

main()