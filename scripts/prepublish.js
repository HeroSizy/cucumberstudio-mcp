#!/usr/bin/env node

import { existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const buildGenDir = join(__dirname, '..', 'build', 'generated')
const versionFile = join(buildGenDir, 'version.js')

// Check if version file exists in build
if (!existsSync(versionFile)) {
  console.log('⚠️  Version file not found in build, creating it...')
  
  // Ensure generated directory exists
  mkdirSync(buildGenDir, { recursive: true })
  
  // Run the generate-version script
  try {
    execSync('node scripts/generate-version.js', {
      cwd: join(__dirname, '..'),
      stdio: 'inherit'
    })
    
    // Build again to include the version file
    execSync('npm run build', {
      cwd: join(__dirname, '..'),
      stdio: 'inherit'
    })
  } catch (error) {
    console.error('❌ Failed to generate version file:', error)
    process.exit(1)
  }
}