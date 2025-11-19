// @ts-ignore
import { $ } from 'command-stream'
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { glob } from 'glob'

export class Agent {
  constructor() {
    this.model = "opencode/zen-grok-code-fast-1"
  }

  async process(request) {
    try {
      const message = request.message || "hi"

      // Execute tools if provided
      let toolResults = []
      if (request.tools && Array.isArray(request.tools)) {
        for (const tool of request.tools) {
          try {
            const result = await this.executeTool(tool.name, tool.params)
            toolResults.push({ tool: tool.name, result })
          } catch (error) {
            toolResults.push({
              tool: tool.name,
              error: error instanceof Error ? error.message : String(error)
            })
          }
        }
      }

      // For MVP, just echo back with a simple response
      // In full implementation, this would call the AI model
      const response = `Hello! You said: "${message}"`

      return {
        response,
        model: this.model,
        timestamp: Date.now(),
        toolResults: toolResults.length > 0 ? toolResults : undefined
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  async executeTool(toolName, params) {
    switch (toolName) {
      case 'bash':
        // Use command-stream for bash execution
        const result = await $(params.command)
        return { stdout: result.stdout, stderr: result.stderr, code: result.code }

      case 'read':
        // Read file content
        try {
          const content = readFileSync(params.filePath, 'utf-8')
          return { content }
        } catch (error) {
          throw new Error(`Failed to read file ${params.filePath}: ${error}`)
        }

      case 'edit':
        // Edit file content
        try {
          let content = readFileSync(params.filePath, 'utf-8')
          if (params.oldString && params.newString !== undefined) {
            // Replace specific string
            if (!content.includes(params.oldString)) {
              throw new Error('oldString not found in file')
            }
            content = content.replace(params.oldString, params.newString)
          } else if (params.newString !== undefined) {
            // Replace entire file
            content = params.newString
          }
          writeFileSync(params.filePath, content, 'utf-8')
          return { success: true }
        } catch (error) {
          throw new Error(`Failed to edit file ${params.filePath}: ${error}`)
        }

      case 'list':
        // List directory contents
        try {
          const items = readdirSync(params.path || '.')
          const detailed = items.map(item => {
            const fullPath = join(params.path || '.', item)
            const stats = statSync(fullPath)
            return {
              name: item,
              type: stats.isDirectory() ? 'directory' : 'file',
              size: stats.size,
              modified: stats.mtime
            }
          })
          return { items: detailed }
        } catch (error) {
          throw new Error(`Failed to list directory ${params.path}: ${error}`)
        }

      case 'glob':
        // Find files with glob pattern
        try {
          const matches = await glob(params.pattern, {
            cwd: params.path || '.',
            absolute: true
          })
          return { matches }
        } catch (error) {
          throw new Error(`Failed to glob pattern ${params.pattern}: ${error}`)
        }

      case 'grep':
        // Search for patterns in files
        try {
          const matches = []
          const files = await glob(params.include || '**/*', {
            cwd: params.path || '.',
            absolute: true
          })

          for (const file of files) {
            try {
              const content = readFileSync(file, 'utf-8')
              const lines = content.split('\n')
              lines.forEach((line, index) => {
                if (line.includes(params.pattern)) {
                  matches.push({
                    file,
                    line: index + 1,
                    content: line
                  })
                }
              })
            } catch (e) {
              // Skip files that can't be read
            }
          }
          return { matches }
        } catch (error) {
          throw new Error(`Failed to grep pattern ${params.pattern}: ${error}`)
        }

      case 'webfetch':
        // Simple web fetch (placeholder - would need fetch implementation)
        throw new Error('webfetch not implemented in MVP')

      default:
        throw new Error(`Unknown tool: ${toolName}`)
    }
  }
}