#!/usr/bin/env node

import { chmodSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Make the build/index.js file executable
const indexPath = join(__dirname, '..', 'build', 'index.js')

try {
  chmodSync(indexPath, '755')
  console.log('✅ Made build/index.js executable')
} catch (error) {
  console.error('⚠️  Warning: Failed to make build/index.js executable:', error.message)
}