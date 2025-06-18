// Import version from package.json at build time
import { version } from '../package.json'

// Server Configuration
export const SERVER_NAME = 'cucumberstudio-mcp'
export const SERVER_VERSION = version // Single source of truth from package.json
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
