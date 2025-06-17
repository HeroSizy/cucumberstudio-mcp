export { StdioTransport } from './stdio.js'
export { StreamableHttpTransport } from './http.js'
export type { HttpTransportOptions } from './http.js'

// Transport type enum
export enum TransportType {
  STDIO = 'stdio',
  HTTP = 'http',
  STREAMABLE_HTTP = 'streamable-http'
}

// Legacy type alias for backwards compatibility
export type TransportTypeString = 'stdio' | 'http' | 'streamable-http'

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
