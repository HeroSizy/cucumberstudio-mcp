export { StdioTransport } from './stdio.js'
export { StreamableHttpTransport } from './http.js'
export type { HttpTransportOptions } from './http.js'

// Transport type enum
export type TransportType = 'stdio' | 'http' | 'streamable-http'

/**
 * Transport configuration interface
 */
export interface TransportConfig {
  type: TransportType
  port?: number
  host?: string
  cors?: {
    origin?: string | string[] | boolean
    credentials?: boolean
  }
}
