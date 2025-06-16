# Cucumber Studio MCP Server

A Model Context Protocol (MCP) server that provides LLM access to Cucumber Studio's testing platform. This server enables AI assistants to retrieve test scenarios, action words, test runs, and project information from Cucumber Studio.

## Features

- **Dual Transport Support** - STDIO and Streamable HTTP transports
- **Project Management** - List and retrieve project details
- **Scenario Access** - Browse test scenarios and search by tags
- **Action Words** - Access reusable test steps and definitions
- **Test Execution** - View test runs, executions, and build information
- **Comprehensive Error Handling** - Robust error handling with detailed feedback
- **Type Safety** - Full TypeScript implementation with Zod validation
- **Comprehensive Testing** - Near 100% test coverage with Vitest

## Installation

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

### Using Docker Compose (Recommended)

1. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Cucumber Studio API credentials
```

2. Run with Docker Compose:
```bash
# Production
docker-compose up

# Development with hot reload
docker-compose --profile dev up cucumberstudio-mcp-dev
```

### Using Docker directly

1. Build the image:
```bash
# Production
npm run docker:build

# Development
npm run docker:build:dev
```

2. Run the container:
```bash
# Production
npm run docker:run

# Development with hot reload
npm run docker:run:dev
```

## Configuration

The server requires Cucumber Studio API credentials. Get these from your Cucumber Studio account settings:

- `CUCUMBER_STUDIO_ACCESS_TOKEN` - Your API access token
- `CUCUMBER_STUDIO_CLIENT_ID` - Your client ID
- `CUCUMBER_STUDIO_UID` - Your user ID

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

#### Environment Variables
- `MCP_TRANSPORT` - Transport type: `stdio` (default), `http`, or `streamable-http`
- `MCP_PORT` - HTTP transport port (default: 3000)
- `MCP_HOST` - HTTP transport host (default: 127.0.0.1)

### Using with Claude Desktop

Add this to your Claude Desktop configuration:

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

### Using with Docker in Claude Desktop

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

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

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

# Run tests with coverage
npm run test:coverage
```

## Architecture

The server is built with a modular architecture:

- **TypeScript** - Full type safety throughout
- **Dual Transports** - STDIO for local use, HTTP for remote access
- **Zod** - Runtime validation for API inputs and configuration
- **Axios** - HTTP client with comprehensive error handling
- **MCP SDK** - Official Model Context Protocol implementation
- **Express** - HTTP server with CORS and security middleware
- **Vitest** - Modern testing framework with comprehensive coverage

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