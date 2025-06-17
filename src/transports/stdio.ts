import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

/**
 * Creates a STDIO transport for MCP server
 * This is the default transport for local MCP servers
 */
export class StdioTransport {
  private transport: StdioServerTransport
  private mcpServer: Server

  constructor(mcpServer: Server) {
    this.mcpServer = mcpServer
    this.transport = new StdioServerTransport()
  }

  async start(): Promise<void> {
    await this.mcpServer.connect(this.transport)
    console.error('🚀 Cucumber Studio MCP Server running on stdio')
    console.error('📡 Transport: STDIO (standard input/output)')
    console.error('🔄 Protocol: MCP 2025-03-26')
  }

  async close(): Promise<void> {
    await this.transport.close()
    console.error('🛑 STDIO transport closed')
  }
}
