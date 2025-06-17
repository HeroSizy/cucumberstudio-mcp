import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'

export interface HttpTransportOptions {
  port: number
  host?: string
  cors?: {
    origin?: string | string[] | boolean
    credentials?: boolean
  }
}

/**
 * Creates an HTTP server using MCP's official Streamable HTTP transport
 */
export class StreamableHttpTransport {
  private app: express.Application
  private httpServer: any
  private transports = new Map<string, StreamableHTTPServerTransport>()
  private createMcpServer: () => Server

  constructor(
    createMcpServer: () => Server,
    private options: HttpTransportOptions,
  ) {
    this.createMcpServer = createMcpServer
    this.app = express()
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware(): void {
    // Security: Validate Origin header to prevent DNS rebinding attacks
    this.app.use((req, res, next) => {
      const origin = req.get('Origin')
      if (origin && !this.isValidOrigin(origin)) {
        return res.status(403).json({ error: 'Invalid origin' })
      }
      next()
    })

    // Enable CORS with specific security considerations
    this.app.use(
      cors({
        origin: this.options.cors?.origin ?? true,
        credentials: this.options.cors?.credentials ?? true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Accept', 'Mcp-Session-Id', 'Last-Event-ID'],
      }),
    )

    // Parse JSON bodies with size limit
    this.app.use(express.json({ limit: '10mb' }))

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        transport: 'streamable-http',
        protocol: '2025-03-26',
        activeSessions: this.transports.size,
      })
    })
  }

  private setupRoutes(): void {
    // Main MCP Streamable HTTP endpoint
    this.app
      .route('/mcp')
      .post(this.handlePost.bind(this))
      .get(this.handleGet.bind(this))
      .delete(this.handleDelete.bind(this))

    // Root endpoint for compatibility
    this.app
      .route('/')
      .post(this.handlePost.bind(this))
      .get(this.handleGet.bind(this))
      .delete(this.handleDelete.bind(this))

    // MCP server info endpoint
    this.app.get('/mcp/info', (req, res) => {
      res.json({
        name: 'Cucumber Studio MCP Server',
        version: '1.0.0',
        transport: 'streamable-http',
        protocol: '2025-03-26',
        capabilities: {
          tools: true,
          resources: false,
          prompts: false,
          sessionManagement: true,
          streaming: true,
        },
        activeSessions: this.transports.size,
      })
    })
  }

  private async handlePost(req: express.Request, res: express.Response): Promise<void> {
    try {
      const sessionId = req.get('Mcp-Session-Id')
      let transport = sessionId ? this.transports.get(sessionId) : undefined

      // If this is an initialize request and we don't have a transport, create one
      if (!transport && Array.isArray(req.body) ? isInitializeRequest(req.body[0]) : isInitializeRequest(req.body)) {
        const newSessionId = randomUUID()

        // Create new MCP server instance for this session
        const mcpServer = this.createMcpServer()

        // Create streamable HTTP transport
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => newSessionId,
        })
        this.transports.set(newSessionId, transport)

        // Set session ID in response header
        res.setHeader('Mcp-Session-Id', newSessionId)

        // Connect transport to server
        await mcpServer.connect(transport)

        console.error(`✅ New MCP session created: ${newSessionId}`)
        
        // Handle the initial request
        await transport.handleRequest(req, res, req.body)
        return
      }

      // Use existing transport
      if (!transport) {
        res.status(400).json({
          error: 'Session not found. Please initialize first.',
          code: 'SESSION_NOT_FOUND',
        })
        return
      }

      // Handle the request through the existing transport
      await transport.handleRequest(req, res, req.body)
    } catch (error) {
      console.error('Error in POST handler:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  private async handleGet(req: express.Request, res: express.Response): Promise<void> {
    const sessionId = req.get('Mcp-Session-Id')

    if (sessionId) {
      const transport = this.transports.get(sessionId)
      if (transport) {
        // Handle GET request for existing session (e.g., resumable connections)
        await transport.handleRequest(req, res)
        return
      }
    }

    // Return server information for GET requests without session
    res.json({
      name: 'Cucumber Studio MCP Server',
      version: '1.0.0',
      transport: 'streamable-http',
      protocol: '2024-11-05',
      endpoint: '/mcp',
      methods: ['POST', 'GET', 'DELETE'],
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
        sessionManagement: true,
        streaming: true,
      },
      activeSessions: this.transports.size,
      usage: {
        initialize: 'POST /mcp with initialize request',
        communicate: 'POST /mcp with Mcp-Session-Id header',
        cleanup: 'DELETE /mcp with Mcp-Session-Id header',
      },
    })
  }

  private async handleDelete(req: express.Request, res: express.Response): Promise<void> {
    const sessionId = req.get('Mcp-Session-Id')

    if (!sessionId) {
      res.status(400).json({
        error: 'Session ID required for DELETE requests',
      })
      return
    }

    const transport = this.transports.get(sessionId)
    if (transport) {
      try {
        await transport.close()
        this.transports.delete(sessionId)
        console.error(`🧹 MCP session closed: ${sessionId}`)
        res.json({ message: 'Session closed successfully', sessionId })
      } catch (error) {
        console.error('Error closing session:', error)
        res.status(500).json({
          error: 'Error closing session',
          message: error instanceof Error ? error.message : String(error),
        })
      }
    } else {
      res.status(404).json({
        error: 'Session not found',
        sessionId,
      })
    }
  }

  private isValidOrigin(origin: string): boolean {
    // Implement your origin validation logic here
    // For development, allow localhost and 127.0.0.1
    const allowedOrigins = ['localhost', '127.0.0.1', '0.0.0.0']

    return allowedOrigins.some((allowed) => origin.includes(allowed))
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.httpServer = this.app.listen(
          this.options.port,
          this.options.host || '127.0.0.1', // Bind to localhost for security
          () => {
            console.error(
              `🌐 Streamable HTTP transport listening on ${this.options.host || '127.0.0.1'}:${this.options.port}`,
            )
            console.error(`📡 MCP endpoint: http://${this.options.host || 'localhost'}:${this.options.port}/mcp`)
            console.error(`🔄 Protocol: MCP 2025-03-26 with Streamable HTTP`)
            resolve()
          },
        )

        this.httpServer.on('error', (error: Error) => {
          reject(error)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  async close(): Promise<void> {
    // Close all active transports
    const closePromises = Array.from(this.transports.values()).map((transport) =>
      transport.close().catch((error) => console.error('Error closing transport:', error)),
    )

    await Promise.all(closePromises)
    this.transports.clear()

    return new Promise((resolve) => {
      if (this.httpServer) {
        this.httpServer.close(() => {
          console.error('🛑 Streamable HTTP transport closed')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }
}
