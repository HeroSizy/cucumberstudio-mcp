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
- `npm test` - Run tests

## Architecture

The MCP server is built with TypeScript and follows a modular architecture:

- **Entry Point**: `src/index.ts` - Main MCP server setup and initialization
- **Configuration**: `src/config/settings.ts` - Environment-based configuration management
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

## Key Resources

- MCP TypeScript SDK: https://studio-api.cucumberstudio.com/
- MCP Specifications for LLMs: https://studio-api.cucumberstudio.com/
- Cucumber Studio API Documentation: https://studio-api.cucumberstudio.com/#introduction
- Cucumber Studio API Reference (GitHub): https://github.com/SmartBear/cucumberstudio-api-documentation/tree/master/source/includes

## Project Structure

```
src/
├── index.ts              # MCP server entry point
├── config/
│   └── settings.ts       # Configuration management with Zod validation
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
- `CUCUMBER_STUDIO_ACCESS_TOKEN` - Your API access token
- `CUCUMBER_STUDIO_CLIENT_ID` - Your client ID  
- `CUCUMBER_STUDIO_UID` - Your user ID