#!/usr/bin/env node

import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Check if we're in a development environment (has src directory)
const srcDir = join(__dirname, '..', 'src')
const buildDir = join(__dirname, '..', 'build')

// Only run version generation if we're in development (has src directory)
// and the build directory doesn't exist yet
if (existsSync(srcDir) && !existsSync(buildDir)) {
  console.log('🔧 Running postinstall setup...')
  try {
    // Generate version file
    execSync('node scripts/generate-version.js', { 
      cwd: join(__dirname, '..'),
      stdio: 'inherit' 
    })
  } catch (error) {
    console.error('⚠️  Warning: Failed to generate version file:', error.message)
    // Don't fail the installation
  }
}