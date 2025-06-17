import express from 'express'
import cors from 'cors'
import { randomUUID } from 'crypto'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'

// Extend Express Request interface to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string
    }
  }
}

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
    // Request logging middleware
    this.app.use((req, res, next) => {
      const requestId = randomUUID().substring(0, 8)
      req.requestId = requestId
      
      console.error(`🌐 [${requestId}] ${req.method} ${req.path}:`, {
        headers: req.headers,
        query: req.query,
        ip: req.ip,
        timestamp: new Date().toISOString()
      })
      
      // Log response details
      const originalSend = res.send
      res.send = function(body) {
        console.error(`📤 [${requestId}] Response ${res.statusCode}:`, {
          statusCode: res.statusCode,
          headers: res.getHeaders(),
          bodySize: typeof body === 'string' ? body.length : JSON.stringify(body).length,
          timestamp: new Date().toISOString()
        })
        
        // Log response body for errors or when explicitly requested
        if (res.statusCode >= 400) {
          console.error(`📄 [${requestId}] Error response body:`, 
            typeof body === 'string' ? body : JSON.stringify(body, null, 2)
          )
        }
        
        return originalSend.call(this, body)
      }
      
      next()
    })

    // Security: Validate Origin header to prevent DNS rebinding attacks
    this.app.use((req, res, next) => {
      const origin = req.get('Origin')
      if (origin && !this.isValidOrigin(origin)) {
        const requestId = req.requestId || 'unknown'
        console.error(`🚫 [${requestId}] Invalid origin rejected:`, { origin })
        return res.status(403).json({ 
          error: 'Invalid origin',
          requestId,
          timestamp: new Date().toISOString()
        })
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
    const requestId = req.requestId || randomUUID().substring(0, 8)
    const sessionId = req.get('Mcp-Session-Id')
    
    // Log incoming request details
    console.error(`🔄 [${requestId}] POST request:`, {
      sessionId,
      contentType: req.get('Content-Type'),
      bodySize: JSON.stringify(req.body).length,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })

    try {
      let transport = sessionId ? this.transports.get(sessionId) : undefined

      // If this is an initialize request and we don't have a transport, create one
      if (!transport && Array.isArray(req.body) ? isInitializeRequest(req.body[0]) : isInitializeRequest(req.body)) {
        const newSessionId = randomUUID()

        console.error(`🆕 [${requestId}] Creating new session: ${newSessionId}`)

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

        console.error(`✅ [${requestId}] New MCP session created: ${newSessionId}`)
        
        // Handle the initial request
        await transport.handleRequest(req, res, req.body)
        return
      }

      // Use existing transport
      if (!transport) {
        const errorResponse = {
          error: 'Session not found. Please initialize first.',
          code: 'SESSION_NOT_FOUND',
          requestId,
          sessionId
        }
        console.error(`❌ [${requestId}] Session not found:`, errorResponse)
        res.status(400).json(errorResponse)
        return
      }

      console.error(`🔗 [${requestId}] Using existing session: ${sessionId}`)
      
      // Handle the request through the existing transport
      await transport.handleRequest(req, res, req.body)
      
      console.error(`✅ [${requestId}] Request handled successfully`)
    } catch (error) {
      const errorDetails = {
        requestId,
        sessionId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error),
        requestBody: req.body,
        headers: req.headers,
        timestamp: new Date().toISOString()
      }
      
      console.error(`💥 [${requestId}] Error in POST handler:`, errorDetails)
      
      const errorResponse = {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        requestId,
        timestamp: new Date().toISOString()
      }
      
      console.error(`📤 [${requestId}] Error response:`, errorResponse)
      
      res.status(500).json(errorResponse)
    }
  }

  private async handleGet(req: express.Request, res: express.Response): Promise<void> {
    const requestId = req.requestId || randomUUID().substring(0, 8)
    const sessionId = req.get('Mcp-Session-Id')
    
    console.error(`📥 [${requestId}] GET request:`, {
      sessionId,
      lastEventId: req.get('Last-Event-ID'),
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })

    try {
      if (sessionId) {
        const transport = this.transports.get(sessionId)
        if (transport) {
          console.error(`🔗 [${requestId}] Using existing session for GET: ${sessionId}`)
          // Handle GET request for existing session (e.g., resumable connections)
          await transport.handleRequest(req, res)
          console.error(`✅ [${requestId}] GET request handled successfully`)
          return
        } else {
          console.error(`❌ [${requestId}] Session not found for GET: ${sessionId}`)
        }
      }

      // Return server information for GET requests without session
      const infoResponse = {
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
        requestId,
        timestamp: new Date().toISOString()
      }
      
      console.error(`📤 [${requestId}] Server info response:`, infoResponse)
      res.json(infoResponse)
    } catch (error) {
      const errorDetails = {
        requestId,
        sessionId,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error),
        headers: req.headers,
        timestamp: new Date().toISOString()
      }
      
      console.error(`💥 [${requestId}] Error in GET handler:`, errorDetails)
      
      const errorResponse = {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
        requestId,
        timestamp: new Date().toISOString()
      }
      
      console.error(`📤 [${requestId}] Error response:`, errorResponse)
      res.status(500).json(errorResponse)
    }
  }

  private async handleDelete(req: express.Request, res: express.Response): Promise<void> {
    const requestId = req.requestId || randomUUID().substring(0, 8)
    const sessionId = req.get('Mcp-Session-Id')
    
    console.error(`🗑️ [${requestId}] DELETE request:`, {
      sessionId,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    })

    if (!sessionId) {
      const errorResponse = {
        error: 'Session ID required for DELETE requests',
        requestId,
        timestamp: new Date().toISOString()
      }
      console.error(`❌ [${requestId}] Missing session ID:`, errorResponse)
      res.status(400).json(errorResponse)
      return
    }

    const transport = this.transports.get(sessionId)
    if (transport) {
      try {
        console.error(`🔄 [${requestId}] Closing session: ${sessionId}`)
        await transport.close()
        this.transports.delete(sessionId)
        
        const successResponse = {
          message: 'Session closed successfully',
          sessionId,
          requestId,
          timestamp: new Date().toISOString()
        }
        
        console.error(`🧹 [${requestId}] MCP session closed: ${sessionId}`)
        console.error(`📤 [${requestId}] Success response:`, successResponse)
        res.json(successResponse)
      } catch (error) {
        const errorDetails = {
          requestId,
          sessionId,
          error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : String(error),
          timestamp: new Date().toISOString()
        }
        
        console.error(`💥 [${requestId}] Error closing session:`, errorDetails)
        
        const errorResponse = {
          error: 'Error closing session',
          message: error instanceof Error ? error.message : String(error),
          requestId,
          sessionId,
          timestamp: new Date().toISOString()
        }
        
        console.error(`📤 [${requestId}] Error response:`, errorResponse)
        res.status(500).json(errorResponse)
      }
    } else {
      const errorResponse = {
        error: 'Session not found',
        sessionId,
        requestId,
        timestamp: new Date().toISOString()
      }
      
      console.error(`❌ [${requestId}] Session not found:`, errorResponse)
      console.error(`📤 [${requestId}] Not found response:`, errorResponse)
      res.status(404).json(errorResponse)
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
