#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Read package.json
const packagePath = join(__dirname, '..', 'package.json')
const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))

// Generate version constants file
const versionContent = `// Auto-generated version info - DO NOT EDIT
// Generated at build time from package.json

export const PACKAGE_VERSION = '${packageJson.version}'
export const PACKAGE_NAME = '${packageJson.name}'
`

// Ensure the generated directory exists
const generatedDir = join(__dirname, '..', 'src', 'generated')
mkdirSync(generatedDir, { recursive: true })

// Write to src/generated/version.ts
const outputPath = join(generatedDir, 'version.ts')
writeFileSync(outputPath, versionContent)

console.log(`✅ Generated version constants: ${packageJson.name}@${packageJson.version}`)