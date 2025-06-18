#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { config as loadDotenv } from 'dotenv'

import { createCucumberStudioMcpServer } from './mcp-server.js'
import { StreamableHttpTransport, TransportType } from './transports/index.js'
import { StderrLogger, getLogLevel } from './utils/logger.js'

/**
 * Main entry point for the Cucumber Studio MCP Server
 * Supports both STDIO and HTTP transports based on environment variables
 */
async function main(): Promise<void> {
  // Load .env file first to ensure environment variables are available
  loadDotenv({ path: '.env' })

  // Determine transport based on environment variable
  const transportString = process.env.MCP_TRANSPORT?.toLowerCase() || 'stdio'
  const transport = Object.values(TransportType).includes(transportString as TransportType)
    ? (transportString as TransportType)
    : TransportType.STDIO

  const port = parseInt(process.env.MCP_PORT || '3000', 10)
  const host = process.env.MCP_HOST || '127.0.0.1'

  console.error(`🎯 Starting Cucumber Studio MCP Server with ${transport} transport...`)

  try {
    switch (transport) {
      case TransportType.HTTP:
      case TransportType.STREAMABLE_HTTP: {
        // HTTP/Streamable HTTP transport
        const httpLogger = new StderrLogger({ level: getLogLevel(), prefix: '🌐 HTTP' })
        const httpTransport = new StreamableHttpTransport(
          createCucumberStudioMcpServer,
          {
            port,
            host,
            cors: {
              origin: process.env.MCP_CORS_ORIGIN === 'false' ? false : true,
              credentials: true,
            },
          },
          httpLogger,
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
        break
      }

      case TransportType.STDIO:
      default: {
        // STDIO transport (default)
        const server = createCucumberStudioMcpServer()
        const stdioTransport = new StdioServerTransport()

        console.error('🚀 CucumberStudio MCP Server running on stdio')
        console.error('📡 Transport: STDIO (standard input/output)')
        console.error('🔄 Protocol: MCP')

        await server.connect(stdioTransport)
        break
      }
    }
  } catch (error) {
    console.error(`❌ ${transport} transport failed to start:`, error)
    process.exit(1)
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
