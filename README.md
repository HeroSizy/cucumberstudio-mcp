# Cucumber Studio MCP Server

A Model Context Protocol (MCP) server that provides LLM access to Cucumber Studio's testing platform. This server enables AI assistants to retrieve test scenarios, action words, test runs, and project information from Cucumber Studio.

## Features

- **Dual Transport Support** - STDIO and Streamable HTTP transports with session management
- **Project Management** - List and retrieve project details
- **Scenario Access** - Browse test scenarios and search by tags
- **Action Words** - Access reusable test steps and definitions
- **Test Execution** - View test runs, executions, and build information
- **Hot Reload Development** - Instant server restart on file changes with tsx --watch
- **Configurable Logging** - Structured logging with multiple output destinations
- **Comprehensive Error Handling** - Robust error handling with detailed feedback
- **Type Safety** - Full TypeScript implementation with Zod validation
- **Comprehensive Testing** - 82%+ test coverage with Vitest and MSW

## Installation

### Quick Start (Recommended)

Run directly with npx (no installation required):
```bash
npx cucumberstudio-mcp
```

Set your environment variables first:
```bash
export CUCUMBER_STUDIO_ACCESS_TOKEN="your_token"
export CUCUMBER_STUDIO_CLIENT_ID="your_client_id"
export CUCUMBER_STUDIO_UID="your_uid"
```

### Development Installation

1. Clone the repository:
```bash
git clone https://github.com/HeroSizy/cucumberstudio-mcp.git
cd cucumberstudio-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Cucumber Studio API credentials
```

4. Build the server:
```bash
npm run build
```

## Docker Support

### Using Pre-built Image (Recommended)

Run the official Docker image from Docker Hub:
```bash
# With environment file
docker run --env-file .env herosizy/cucumberstudio-mcp

# With environment variables
docker run -e CUCUMBER_STUDIO_ACCESS_TOKEN=your_token \
           -e CUCUMBER_STUDIO_CLIENT_ID=your_client_id \
           -e CUCUMBER_STUDIO_UID=your_uid \
           herosizy/cucumberstudio-mcp
```

### Using Docker Compose

1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Cucumber Studio API credentials
```

2. Update docker-compose.yml to use the pre-built image:
```yaml
version: '3.8'
services:
  cucumberstudio-mcp:
    image: herosizy/cucumberstudio-mcp
    env_file:
      - .env
    restart: unless-stopped
    ports:
      - "${MCP_PORT:-3000}:3000"
```

3. Run with Docker Compose:
```bash
docker-compose up
```

### Building Locally

1. Build the image:
```bash
npm run docker:build
```

2. Run the container:
```bash
npm run docker:run
```

The Docker setup includes health checks and automatic restarts for production use.

## Configuration

The server requires Cucumber Studio API credentials. Get these from your Cucumber Studio account settings:

### Required Environment Variables
- `CUCUMBER_STUDIO_ACCESS_TOKEN` - Your API access token
- `CUCUMBER_STUDIO_CLIENT_ID` - Your client ID  
- `CUCUMBER_STUDIO_UID` - Your user ID

### Optional Configuration
- `CUCUMBER_STUDIO_BASE_URL` - API base URL (default: https://studio.cucumberstudio.com/api)
- `MCP_TRANSPORT` - Transport type: `stdio` (default), `http`, or `streamable-http`
- `MCP_PORT` - HTTP transport port (default: 3000)
- `MCP_HOST` - HTTP transport host (default: 0.0.0.0)
- `MCP_CORS_ORIGIN` - CORS origin setting (default: true)

### Logging Configuration
- `LOG_LEVEL` - Log level: `error`, `warn`, `info`, `debug`, `trace` (default: info)
- `LOG_API_RESPONSES` - Log Cucumber Studio API responses (default: false)
- `LOG_REQUEST_BODIES` - Log API request bodies for debugging (default: false)
- `LOG_RESPONSE_BODIES` - Log API response bodies for debugging (default: false)
- `LOG_TRANSPORT` - Logging output: `console`, `stderr`, `file`, `none` (default: stderr)
- `LOG_FILE` - Log file path (required if LOG_TRANSPORT=file)

## Usage

### Transport Options

The server supports both STDIO and HTTP transports:

#### STDIO Transport (Default)
```bash
# Development
npm run dev

# Production
npm start
```

#### HTTP Transport
```bash
# Development
npm run dev:http

# Production
npm run start:http
```


### Using with Claude Desktop

#### Option 1: NPX (Recommended)
```json
{
  "mcpServers": {
    "cucumberstudio": {
      "command": "npx",
      "args": ["cucumberstudio-mcp"],
      "env": {
        "CUCUMBER_STUDIO_ACCESS_TOKEN": "your_token",
        "CUCUMBER_STUDIO_CLIENT_ID": "your_client_id",
        "CUCUMBER_STUDIO_UID": "your_uid"
      }
    }
  }
}
```

#### Option 2: Local Installation
```json
{
  "mcpServers": {
    "cucumberstudio": {
      "command": "node",
      "args": ["/path/to/cucumberstudio-mcp/build/index.js"],
      "env": {
        "CUCUMBER_STUDIO_ACCESS_TOKEN": "your_token",
        "CUCUMBER_STUDIO_CLIENT_ID": "your_client_id",
        "CUCUMBER_STUDIO_UID": "your_uid"
      }
    }
  }
}
```

#### Option 3: Docker Hub Image
```json
{
  "mcpServers": {
    "cucumberstudio": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--env-file", "/path/to/.env", "herosizy/cucumberstudio-mcp"]
    }
  }
}
```

#### Option 4: Local Docker Build
```json
{
  "mcpServers": {
    "cucumberstudio": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "--env-file", "/path/to/.env", "cucumberstudio-mcp"]
    }
  }
}
```

## Available Tools

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

## Development

### Hot Reload Development
The server supports hot reload for rapid development:

```bash
# STDIO transport with hot reload
npm run dev

# HTTP transport with hot reload  
npm run dev:http
```

Files are automatically recompiled and the server restarts when changes are detected.

### Testing and Quality
```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage (82%+ coverage)
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Architecture

The server is built with a modular, production-ready architecture:

### Core Technologies
- **TypeScript** - Full type safety with strict configuration
- **Dual Transports** - STDIO for local use, Streamable HTTP for remote access
- **Zod** - Runtime validation for API inputs and configuration
- **Axios** - HTTP client with comprehensive error handling and logging
- **MCP SDK** - Official Model Context Protocol implementation
- **Express** - HTTP server with CORS, security middleware, and session management
- **Vitest** - Modern testing framework with 82%+ code coverage
- **MSW** - Mock Service Worker for realistic API testing

### Key Features
- **Session Management** - HTTP transport with session tracking and cleanup
- **Comprehensive Logging** - Structured logging with configurable outputs and levels
- **Error Handling** - Robust error handling with detailed feedback and recovery
- **Security** - Origin validation, CORS protection, and input sanitization
- **Health Monitoring** - Health check endpoints and request/response tracking
- **Development Workflow** - Hot reload, comprehensive testing, and Docker support

## Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

Test coverage includes:
- Unit tests for all modules
- Integration tests for the MCP server
- Transport layer testing
- API client mocking and testing
- Configuration validation
- Error handling scenarios

## Publishing and Releases

This project uses automated releases via GitHub Actions. When a version tag is pushed, it automatically:

1. **Runs full test suite** - Ensures code quality and coverage
2. **Publishes to NPM** - Makes the package available via `npx cucumberstudio-mcp`
3. **Builds and publishes Docker image** - Pushes multi-platform images to Docker Hub
4. **Creates GitHub release** - Generates release notes and links

### Creating a Release

1. Update the version in `package.json`:
```bash
npm version patch|minor|major
```

2. Push the tag to trigger the release:
```bash
git push origin --tags
```

3. The GitHub Action will automatically:
   - Publish to NPM: https://www.npmjs.com/package/cucumberstudio-mcp
   - Push to Docker Hub: https://hub.docker.com/r/herosizy/cucumberstudio-mcp
   - Create a GitHub release with changelog

### Required Secrets

For automated publishing, the following secrets must be configured in the GitHub repository:

- `NPM_TOKEN` - NPM authentication token
- `DOCKER_USERNAME` - Docker Hub username  
- `DOCKER_PASSWORD` - Docker Hub password or access token

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Cucumber Studio API Documentation](https://studio-api.cucumberstudio.com/#introduction)
- [Cucumber Studio API Reference](https://github.com/SmartBear/cucumberstudio-api-documentation)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)