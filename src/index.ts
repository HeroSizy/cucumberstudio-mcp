#!/usr/bin/env node

import { CucumberStudioMcpServer } from './server.js'
import { StreamableHttpTransport, TransportType } from './transports/index.js'
import { StderrLogger, getLogLevel } from './utils/logger.js'

/**
 * Main entry point for the Cucumber Studio MCP Server
 * Supports both STDIO and HTTP transports based on environment variables
 */
async function main(): Promise<void> {
  // Determine transport based on environment variable
  const transport = (process.env.MCP_TRANSPORT?.toLowerCase() || 'stdio') as TransportType
  const port = parseInt(process.env.MCP_PORT || '3000', 10)
  const host = process.env.MCP_HOST || '127.0.0.1'

  console.error(`🎯 Starting Cucumber Studio MCP Server with ${transport} transport...`)

  if (transport === 'http' || transport === 'streamable-http') {
    // HTTP/Streamable HTTP transport
    try {
      const logger = new StderrLogger({ level: getLogLevel(), prefix: '📡 MCP' })
      const httpLogger = new StderrLogger({ level: getLogLevel(), prefix: '🌐 HTTP' })
      const httpTransport = new StreamableHttpTransport(
        () => CucumberStudioMcpServer.createServer(logger), 
        {
          port,
          host,
          cors: {
            origin: process.env.MCP_CORS_ORIGIN === 'false' ? false : true,
            credentials: true,
          },
        },
        httpLogger
      )

      await httpTransport.start()

      // Handle graceful shutdown for HTTP transport
      const shutdown = async () => {
        console.error('🛑 Shutting down HTTP transport...')
        await httpTransport.close()
        process.exit(0)
      }

      process.on('SIGINT', shutdown)
      process.on('SIGTERM', shutdown)
    } catch (error) {
      console.error('❌ HTTP transport failed to start:', error)
      process.exit(1)
    }
  } else {
    // STDIO transport (default)
    const logger = new StderrLogger({ level: getLogLevel(), prefix: '📡 MCP' })
    const server = new CucumberStudioMcpServer(logger)

    try {
      await server.initialize()
      await server.runWithTransport('stdio')
    } catch (error) {
      console.error('❌ STDIO transport failed to start:', error)
      process.exit(1)
    }
  }
}

// Handle graceful shutdown for STDIO transport
process.on('SIGINT', () => {
  console.error('🛑 Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.error('🛑 Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error)
    process.exit(1)
  })
}
