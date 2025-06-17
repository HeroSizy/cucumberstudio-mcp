# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CucumberStudio MCP (Model Context Protocol) project. MCP servers provide standardized interfaces for AI assistants to interact with external systems and data sources.

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Run the server in development mode with tsx
- `npm start` - Run the built server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Docker Commands
- `npm run docker:build` - Build production Docker image
- `npm run docker:build:dev` - Build development Docker image
- `npm run docker:run` - Run production container
- `npm run docker:run:dev` - Run development container with hot reload
- `npm run docker:compose:up` - Start with docker-compose
- `npm run docker:compose:up:dev` - Start development environment
- `npm run docker:compose:down` - Stop docker-compose services

### Transport Options
- **STDIO** (default): `npm start` or `MCP_TRANSPORT=stdio npm start`
- **HTTP/Streamable HTTP**: `npm run start:http` or `MCP_TRANSPORT=http npm start`
- **Development HTTP**: `npm run dev:http` or `MCP_TRANSPORT=http npm run dev`

## Architecture

The MCP server is built with TypeScript and follows a clean, modular architecture:

- **Entry Point**: `src/index.ts` - Main entry point with transport selection using enum-based switch cases
- **Server Factory**: `src/mcp-server.ts` - Direct McpServer creation with tool registration
- **Configuration**: `src/config/settings.ts` - Environment-based configuration management
- **Transports**: `src/transports/` - Transport layer implementations
  - `stdio.ts` - Standard input/output transport (default)
  - `http.ts` - Streamable HTTP transport with session management
  - `index.ts` - Transport exports, types, and enums
- **API Client**: `src/api/client.ts` - Cucumber Studio API client with authentication
- **Tool Modules**: `src/tools/` - MCP tool implementations organized by feature
  - `projects.ts` - Project management tools
  - `scenarios.ts` - Scenario retrieval tools  
  - `action-words.ts` - Action word (reusable steps) tools
  - `test-runs.ts` - Test execution and build tools
- **Utilities**: `src/utils/` - Error handling and validation utilities

## MCP Server Development Notes

- MCP servers implement the Model Context Protocol specification
- Servers typically expose tools, resources, and prompts to MCP clients
- Common patterns include resource discovery, tool execution, and state management
- Follow MCP specification for proper server implementation
- **SDK Version**: Uses MCP TypeScript SDK v1.12.3+ with modern `McpServer` class and `registerTool` pattern
- **Implementation**: Uses modern `McpServer.registerTool()` method for clean tool registration with Zod validation
- **Architecture**: Direct McpServer usage without unnecessary wrapper classes

## Key Resources

- MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
- MCP Specifications for LLMs: https://modelcontextprotocol.io/llms.txt
- Cucumber Studio API Documentation: https://studio-api.cucumberstudio.com/#introduction
- Cucumber Studio API Reference (GitHub): https://github.com/SmartBear/cucumberstudio-api-documentation/tree/master/source/includes

## Technical Implementation

### MCP SDK Integration
- **Server Class**: Uses `Server` from `@modelcontextprotocol/sdk/server/index.js`
- **Transport**: Uses `StdioServerTransport` from `@modelcontextprotocol/sdk/server/stdio.js`
- **Request Handlers**: Implements `ListToolsRequestSchema` and `CallToolRequestSchema` handlers
- **Tool Registration**: Tools are registered through request handlers, not direct registration
- **Capabilities**: Server declares `tools: {}` capability to MCP clients

## Project Structure

```
src/
├── index.ts              # Main entry point with transport selection
├── server.ts             # MCP server class and tool handler setup
├── config/
│   └── settings.ts       # Configuration management with Zod validation
├── transports/
│   ├── index.ts          # Transport exports and types
│   ├── stdio.ts          # Standard input/output transport
│   └── http.ts           # Streamable HTTP transport with session management
├── api/
│   ├── client.ts         # Cucumber Studio API client with authentication
│   └── types.ts          # TypeScript types for API responses
├── tools/
│   ├── projects.ts       # Project retrieval tools
│   ├── scenarios.ts      # Scenario and folder tools
│   ├── action-words.ts   # Action word (reusable steps) tools
│   └── test-runs.ts      # Test run, execution, and build tools
└── utils/
    ├── errors.ts         # MCP error handling utilities
    └── validation.ts     # Input validation with Zod schemas
```

## Available MCP Tools

### Project Tools
- `cucumberstudio_list_projects` - List all accessible projects
- `cucumberstudio_get_project` - Get detailed project information

### Scenario Tools  
- `cucumberstudio_list_scenarios` - List scenarios in a project
- `cucumberstudio_get_scenario` - Get detailed scenario information
- `cucumberstudio_find_scenarios_by_tags` - Find scenarios by tags

### Action Word Tools
- `cucumberstudio_list_action_words` - List reusable action words
- `cucumberstudio_get_action_word` - Get detailed action word information  
- `cucumberstudio_find_action_words_by_tags` - Find action words by tags

### Test Execution Tools
- `cucumberstudio_list_test_runs` - List test runs
- `cucumberstudio_get_test_run` - Get detailed test run information
- `cucumberstudio_get_test_executions` - Get individual test results
- `cucumberstudio_list_builds` - List builds
- `cucumberstudio_get_build` - Get build details
- `cucumberstudio_list_execution_environments` - List execution environments

## Environment Setup

Copy `.env.example` to `.env` and configure your Cucumber Studio API credentials:
- `CUCUMBERSTUDIO_ACCESS_TOKEN` - Your API access token
- `CUCUMBERSTUDIO_CLIENT_ID` - Your client ID  
- `CUCUMBERSTUDIO_UID` - Your user ID

### Transport Configuration
- `MCP_TRANSPORT` - Transport type: `stdio` (default), `http`, or `streamable-http`
- `MCP_PORT` - HTTP transport port (default: 3000)
- `MCP_HOST` - HTTP transport host (default: 127.0.0.1)
- `MCP_CORS_ORIGIN` - CORS origin setting (default: true)