#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { configManager } from './config/settings.js';
import { CucumberStudioApiClient } from './api/client.js';
import { validateEnvironment } from './utils/validation.js';
import { createMcpError } from './utils/errors.js';

// Tool classes
import { ProjectTools } from './tools/projects.js';
import { ScenarioTools } from './tools/scenarios.js';
import { ActionWordTools } from './tools/action-words.js';
import { TestRunTools } from './tools/test-runs.js';

class CucumberStudioMcpServer {
  private server: Server;
  private apiClient!: CucumberStudioApiClient;
  private projectTools!: ProjectTools;
  private scenarioTools!: ScenarioTools;
  private actionWordTools!: ActionWordTools;
  private testRunTools!: TestRunTools;

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
      }
    );

    this.setupToolHandlers();
  }

  async initialize(): Promise<void> {
    try {
      // Validate environment variables
      validateEnvironment();

      // Load configuration
      const config = configManager.loadFromEnvironment();

      // Initialize API client
      this.apiClient = new CucumberStudioApiClient(config);

      // Test connection
      const connectionOk = await this.apiClient.testConnection();
      if (!connectionOk) {
        throw new Error('Failed to connect to Cucumber Studio API. Please check your credentials.');
      }

      // Initialize tool classes
      this.projectTools = new ProjectTools(this.apiClient);
      this.scenarioTools = new ScenarioTools(this.apiClient);
      this.actionWordTools = new ActionWordTools(this.apiClient);
      this.testRunTools = new TestRunTools(this.apiClient);

      console.error('✅ Cucumber Studio MCP Server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Cucumber Studio MCP Server:', error);
      throw error;
    }
  }

  private setupToolHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      if (!this.projectTools) {
        throw new McpError(ErrorCode.InternalError, 'Server not properly initialized');
      }

      const allTools = [
        ...this.projectTools.getTools(),
        ...this.scenarioTools.getTools(),
        ...this.actionWordTools.getTools(),
        ...this.testRunTools.getTools(),
      ];

      return {
        tools: allTools,
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!this.projectTools) {
        throw new McpError(ErrorCode.InternalError, 'Server not properly initialized');
      }

      try {
        const toolName = request.params.name;

        // Route to appropriate tool handler based on tool name prefix
        if (toolName.includes('_project')) {
          return await this.projectTools.handleToolCall(request);
        } else if (toolName.includes('_scenario')) {
          return await this.scenarioTools.handleToolCall(request);
        } else if (toolName.includes('_action_word')) {
          return await this.actionWordTools.handleToolCall(request);
        } else if (
          toolName.includes('_test_run') || 
          toolName.includes('_test_execution') || 
          toolName.includes('_build') || 
          toolName.includes('_execution_environment')
        ) {
          return await this.testRunTools.handleToolCall(request);
        } else {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${toolName}`
          );
        }
      } catch (error) {
        throw createMcpError(error, `tool call: ${request.params.name}`);
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Cucumber Studio MCP Server running on stdio');
  }
}

// Main execution
async function main(): Promise<void> {
  const server = new CucumberStudioMcpServer();
  
  try {
    await server.initialize();
    await server.run();
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}