import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ErrorCode, McpError, CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

import { CucumberStudioApiClient } from './api/client.js'
import { configManager } from './config/settings.js'
// Tool classes
import { ActionWordTools } from './tools/action-words.js'
import { ProjectTools } from './tools/projects.js'
import { ScenarioTools } from './tools/scenarios.js'
import { TestRunTools } from './tools/test-runs.js'
import { TransportType } from './transports/index.js'
import { createMcpError } from './utils/errors.js'
import { Logger, StderrLogger, getLogLevel } from './utils/logger.js'
import { validateEnvironment } from './utils/validation.js'

export class CucumberStudioMcpServer {
  private server: Server
  private logger: Logger
  private apiClient!: CucumberStudioApiClient
  private projectTools!: ProjectTools
  private scenarioTools!: ScenarioTools
  private actionWordTools!: ActionWordTools
  private testRunTools!: TestRunTools

  constructor(logger?: Logger) {
    this.logger = logger || new StderrLogger({ level: getLogLevel(), prefix: '📡 MCP' })
    this.server = new Server({
      name: 'cucumberstudio-mcp',
      version: '1.0.2',
    }, {
      capabilities: {
        tools: {}
      }
    })
  }

  /**
   * Factory method to create a new server instance
   * Used for HTTP transport where each session needs its own server
   */
  static createServer(_logger?: Logger): Server {
    const server = new Server({
      name: 'cucumberstudio-mcp',
      version: '1.0.2',
    }, {
      capabilities: {
        tools: {}
      }
    })

    // Set up handlers for the new server instance
    const setupHandlers = async () => {
      try {
        // Validate environment variables
        validateEnvironment()

        // Load configuration
        const config = configManager.loadFromEnvironment()

        // Initialize API client
        const apiLogger = new StderrLogger({ level: getLogLevel(), prefix: '🥒 API' })
        const apiClient = new CucumberStudioApiClient(config, apiLogger)

        // Initialize tool classes
        const projectTools = new ProjectTools(apiClient)
        const scenarioTools = new ScenarioTools(apiClient)
        const actionWordTools = new ActionWordTools(apiClient)
        const testRunTools = new TestRunTools(apiClient)

        // Get all tools from each tool class
        const allTools = [
          ...projectTools.getTools(),
          ...scenarioTools.getTools(),
          ...actionWordTools.getTools(),
          ...testRunTools.getTools(),
        ]

        // Register tool listing handler
        server.setRequestHandler(ListToolsRequestSchema, async () => {
          return {
            tools: allTools.map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema
            }))
          }
        })

        // Register tool execution handler
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

      // Initialize API client with API-specific logger
      const apiLogger = new StderrLogger({ level: getLogLevel(), prefix: '🥒 API' })
      this.apiClient = new CucumberStudioApiClient(config, apiLogger)

      // Initialize tool classes
      this.projectTools = new ProjectTools(this.apiClient)
      this.scenarioTools = new ScenarioTools(this.apiClient)
      this.actionWordTools = new ActionWordTools(this.apiClient)
      this.testRunTools = new TestRunTools(this.apiClient)

      // Set up MCP request handlers
      this.setupRequestHandlers()

      console.error('✅ Cucumber Studio MCP Server initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Cucumber Studio MCP Server:', error)
      throw error
    }
  }

  private setupRequestHandlers(): void {
    // Get all tools from each tool class
    const allTools = [
      ...this.projectTools.getTools(),
      ...this.scenarioTools.getTools(),
      ...this.actionWordTools.getTools(),
      ...this.testRunTools.getTools(),
    ]

    // Register tool listing handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: allTools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      }
    })

    // Register tool execution handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
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
      const transport = new StdioServerTransport()
      console.error('🚀 Cucumber Studio MCP Server running on stdio')
      console.error('📡 Transport: STDIO (standard input/output)')
      console.error('🔄 Protocol: MCP')
      await this.server.connect(transport)
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
