import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createCucumberStudioMcpServer } from './mcp-server.js'

/**
 * MCPB-optimized entry point for the Cucumber Studio MCP Server
 * STDIO transport only - HTTP transport code excluded from bundle
 * Environment variables provided by MCPB runtime (no .env files needed)
 */
async function main(): Promise<void> {
  // MCPB provides environment variables through manifest configuration
  // No need for dotenv in MCPB runtime

  console.error(`🎯 Starting Cucumber Studio MCP Server with stdio transport...`)

  try {
    // STDIO transport only (MCPB optimization)
    const server = createCucumberStudioMcpServer()
    const stdioTransport = new StdioServerTransport()

    console.error('🚀 CucumberStudio MCP Server running on stdio')
    console.error('📡 Transport: STDIO (standard input/output)')
    console.error('🔄 Protocol: MCP')

    await server.connect(stdioTransport)
  } catch (error) {
    console.error(`❌ stdio transport failed to start:`, error)
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

// Run main function
main().catch((error) => {
  console.error('❌ Unhandled error:', error)
  process.exit(1)
})