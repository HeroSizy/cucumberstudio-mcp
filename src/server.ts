import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from '@modelcontextprotocol/sdk/types.js'

import { configManager } from './config/settings.js'
import { CucumberStudioApiClient } from './api/client.js'
import { validateEnvironment } from './utils/validation.js'
import { createMcpError } from './utils/errors.js'
import { StdioTransport, TransportType } from './transports/index.js'

// Tool classes
import { ProjectTools } from './tools/projects.js'
import { ScenarioTools } from './tools/scenarios.js'
import { ActionWordTools } from './tools/action-words.js'
import { TestRunTools } from './tools/test-runs.js'

export class CucumberStudioMcpServer {
  private server: Server
  private apiClient!: CucumberStudioApiClient
  private projectTools!: ProjectTools
  private scenarioTools!: ScenarioTools
  private actionWordTools!: ActionWordTools
  private testRunTools!: TestRunTools

  constructor() {
    this.server = new Server(
      {
        name: 'cucumberstudio-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    this.setupToolHandlers()
  }

  /**
   * Factory method to create a new server instance
   * Used for HTTP transport where each session needs its own server
   */
  static createServer(): Server {
    const server = new Server(
      {
        name: 'cucumberstudio-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    )

    // Set up handlers for the new server instance
    const setupHandlers = async () => {
      try {
        // Validate environment variables
        validateEnvironment()

        // Load configuration
        const config = configManager.loadFromEnvironment()

        // Initialize API client
        const apiClient = new CucumberStudioApiClient(config)

        // Test connection
        const connectionOk = await apiClient.testConnection()
        if (!connectionOk) {
          throw new Error('Failed to connect to Cucumber Studio API. Please check your credentials.')
        }

        // Initialize tool classes
        const projectTools = new ProjectTools(apiClient)
        const scenarioTools = new ScenarioTools(apiClient)
        const actionWordTools = new ActionWordTools(apiClient)
        const testRunTools = new TestRunTools(apiClient)

        // List tools handler
        server.setRequestHandler(ListToolsRequestSchema, async () => {
          const allTools = [
            ...projectTools.getTools(),
            ...scenarioTools.getTools(),
            ...actionWordTools.getTools(),
            ...testRunTools.getTools(),
          ]

          return {
            tools: allTools,
          }
        })

        // Call tool handler
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
          try {
            const toolName = request.params.name

            // Route to appropriate tool handler based on tool name prefix
            if (toolName.includes('_project')) {
              return await projectTools.handleToolCall(request)
            } else if (toolName.includes('_scenario')) {
              return await scenarioTools.handleToolCall(request)
            } else if (toolName.includes('_action_word')) {
              return await actionWordTools.handleToolCall(request)
            } else if (
              toolName.includes('_test_run') ||
              toolName.includes('_test_execution') ||
              toolName.includes('_build') ||
              toolName.includes('_execution_environment')
            ) {
              return await testRunTools.handleToolCall(request)
            } else {
              throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`)
            }
          } catch (error) {
            throw createMcpError(error, `tool call: ${request.params.name}`)
          }
        })

        console.error('✅ MCP Server instance initialized')
      } catch (error) {
        console.error('❌ Failed to initialize MCP Server instance:', error)
        throw error
      }
    }

    // Initialize handlers asynchronously
    setupHandlers().catch((error) => {
      console.error('❌ Failed to set up server handlers:', error)
    })

    return server
  }

  async initialize(): Promise<void> {
    try {
      // Validate environment variables
      validateEnvironment()

      // Load configuration
      const config = configManager.loadFromEnvironment()

      // Initialize API client
      this.apiClient = new CucumberStudioApiClient(config)

      // Test connection
      const connectionOk = await this.apiClient.testConnection()
      if (!connectionOk) {
        throw new Error('Failed to connect to Cucumber Studio API. Please check your credentials.')
      }

      // Initialize tool classes
      this.projectTools = new ProjectTools(this.apiClient)
      this.scenarioTools = new ScenarioTools(this.apiClient)
      this.actionWordTools = new ActionWordTools(this.apiClient)
      this.testRunTools = new TestRunTools(this.apiClient)

      console.error('✅ Cucumber Studio MCP Server initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Cucumber Studio MCP Server:', error)
      throw error
    }
  }

  private setupToolHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      if (!this.projectTools) {
        throw new McpError(ErrorCode.InternalError, 'Server not properly initialized')
      }

      const allTools = [
        ...this.projectTools.getTools(),
        ...this.scenarioTools.getTools(),
        ...this.actionWordTools.getTools(),
        ...this.testRunTools.getTools(),
      ]

      return {
        tools: allTools,
      }
    })

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.projectTools) {
        throw new McpError(ErrorCode.InternalError, 'Server not properly initialized')
      }

      try {
        const toolName = request.params.name

        // Route to appropriate tool handler based on tool name prefix
        if (toolName.includes('_project')) {
          return await this.projectTools.handleToolCall(request)
        } else if (toolName.includes('_scenario')) {
          return await this.scenarioTools.handleToolCall(request)
        } else if (toolName.includes('_action_word')) {
          return await this.actionWordTools.handleToolCall(request)
        } else if (
          toolName.includes('_test_run') ||
          toolName.includes('_test_execution') ||
          toolName.includes('_build') ||
          toolName.includes('_execution_environment')
        ) {
          return await this.testRunTools.handleToolCall(request)
        } else {
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`)
        }
      } catch (error) {
        throw createMcpError(error, `tool call: ${request.params.name}`)
      }
    })
  }

  async runWithTransport(transportType: TransportType): Promise<void> {
    if (transportType === 'stdio') {
      const transport = new StdioTransport(this.server)
      await transport.start()
    } else {
      throw new Error(
        `Transport ${transportType} not supported in instance mode. Use static factory for HTTP transports.`,
      )
    }
  }

  getServer(): Server {
    return this.server
  }
}
