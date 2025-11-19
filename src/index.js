#!/usr/bin/env node

import { Agent } from './agent.js'

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
    // Read JSON from stdin
    const input = await readStdin()
    const request = JSON.parse(input.trim())

    // Create agent and process request
    const agent = new Agent()
    const response = await agent.process(request)

    // Output JSON response
    console.log(JSON.stringify(response))
  } catch (error) {
    console.error(JSON.stringify({
      error: error instanceof Error ? error.message : String(error)
    }))
    process.exit(1)
  }
}

main()