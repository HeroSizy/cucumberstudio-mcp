#!/usr/bin/env node

import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Path to the actual server
const serverPath = join(__dirname, '..', 'build', 'index.js')

// Check if running via npx (no node_modules in parent paths)
const isNpx = !process.cwd().includes('node_modules')

if (isNpx) {
  console.error('🚀 Starting CucumberStudio MCP Server via npx...')
  console.error('📋 Make sure you have set the required environment variables:')
  console.error('   - CUCUMBERSTUDIO_ACCESS_TOKEN')
  console.error('   - CUCUMBERSTUDIO_CLIENT_ID')
  console.error('   - CUCUMBERSTUDIO_UID\n')
}

// Spawn the actual server process
const child = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: process.env
})

// Forward exit codes
child.on('exit', (code) => {
  process.exit(code || 0)
})

// Handle signals
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))