import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Get version from package.json at runtime
function getPackageVersion(): string {
  try {
    // For ES modules, get current directory
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    
    // Read package.json from project root
    const packagePath = join(__dirname, '..', 'package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
    return packageJson.version
  } catch {
    // Fallback version if package.json not found (e.g., in Docker)
    return '1.0.3'
  }
}

// Server Configuration
export const SERVER_NAME = 'cucumberstudio-mcp'
export const SERVER_VERSION = getPackageVersion() // Single source of truth from package.json
export const PROTOCOL_VERSION = '2025-03-26' // MCP protocol version

// API Configuration
export const API_VERSION_HEADER = 'application/vnd.api+json; version=1'
export const API_TIMEOUT = 30000 // 30 seconds
export const DEFAULT_API_BASE_URL = 'https://studio.cucumberstudio.com/api'

// Network Configuration
export const DEFAULT_PORT = 3000
export const DEFAULT_HOST = '0.0.0.0'
export const JSON_BODY_LIMIT = '10mb'
export const DEFAULT_CORS_ORIGINS = ['localhost', '127.0.0.1', '0.0.0.0']

// Pagination
export const MAX_PAGE_SIZE = 100
export const DEFAULT_PAGE_SIZE = 20

// Security
export const REDACTED_STRING = '***REDACTED***'

// Logger
export const LOG_PREFIX = '🥒 API'
export const DEFAULT_LOG_LEVEL = 'info'
