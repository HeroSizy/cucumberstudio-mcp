# Cucumber Studio MCP Server

A Model Context Protocol (MCP) server that provides LLM access to Cucumber Studio's testing platform. This server enables AI assistants to retrieve test scenarios, action words, test runs, and project information from Cucumber Studio.

## Features

- **Project Management** - List and retrieve project details
- **Scenario Access** - Browse test scenarios and search by tags
- **Action Words** - Access reusable test steps and definitions
- **Test Execution** - View test runs, executions, and build information
- **Comprehensive Error Handling** - Robust error handling with detailed feedback
- **Type Safety** - Full TypeScript implementation with Zod validation

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

## Configuration

The server requires Cucumber Studio API credentials. Get these from your Cucumber Studio account settings:

- `CUCUMBER_STUDIO_ACCESS_TOKEN` - Your API access token
- `CUCUMBER_STUDIO_CLIENT_ID` - Your client ID
- `CUCUMBER_STUDIO_UID` - Your user ID

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

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
```

## Architecture

The server is built with a modular architecture:

- **TypeScript** - Full type safety throughout
- **Zod** - Runtime validation for API inputs and configuration
- **Axios** - HTTP client with comprehensive error handling
- **MCP SDK** - Official Model Context Protocol implementation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [Cucumber Studio API Documentation](https://studio-api.cucumberstudio.com/#introduction)
- [Cucumber Studio API Reference](https://github.com/SmartBear/cucumberstudio-api-documentation)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)