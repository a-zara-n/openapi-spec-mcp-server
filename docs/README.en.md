# OpenAPI MCP Server

English | **[日本語](README.md)**

A Model Context Protocol (MCP) server that provides tools for analyzing, validating, and working with OpenAPI specifications. This server enables AI assistants to understand and interact with API documentation through a structured interface.

## Overview

The OpenAPI MCP Server is a specialized tool designed to help AI assistants (particularly Claude) deeply understand and effectively utilize OpenAPI specifications. Beyond simply reading API documentation, this server enables AI to comprehend API structures and provide appropriate suggestions based on developer needs.

Key features include support for both JSON and YAML formats, with real-time file change detection to maintain up-to-date information. This allows seamless collaboration even with API documentation that's actively being developed.

## Architecture

### Directory Structure

```
openapi-mcp-server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── server.ts             # MCP server implementation
│   ├── config.ts             # Configuration management
│   ├── resources/            # MCP resources definitions
│   └── tools/                # Tool implementations
│       ├── openapi-tool/     # OpenAPI specification management
│       ├── path-tool/        # API path analysis
│       ├── response-tool/    # Response schema analysis
│       ├── schema-tool/      # Schema component management
│       ├── security-tool/    # Security scheme analysis
│       ├── server-tool/      # Server endpoint management
│       ├── tool-libs/        # Shared tool libraries
│       └── shared/           # Shared utilities
├── data/                     # SQLite database storage
├── docs/                     # Documentation
└── build/                    # Compiled JavaScript output
```

### Core Components

1. **MCP Server** (`server.ts`)
   - Implements the Model Context Protocol
   - Manages tool registration and execution
   - Handles client communication

2. **Tool Manager** (`tools/index.ts`)
   - Registers and manages all available tools
   - Provides tool discovery and execution

3. **Database Layer** (`tool-libs/core/database.ts`)
   - SQLite-based storage for OpenAPI specifications
   - Manages data persistence and retrieval

4. **OpenAPI Processor** (`tool-libs/services/openapi-processor.ts`)
   - Parses and validates OpenAPI specifications
   - Extracts and indexes API components

5. **DI Container** (`tool-libs/core/di-container.ts`)
   - Manages dependency injection
   - Ensures proper service initialization

## Features

- **Multi-format Support**: Handles JSON and YAML OpenAPI specifications
- **Real-time Monitoring**: Watches for changes in OpenAPI files
- **Comprehensive Validation**: Validates specifications against OpenAPI standards
- **Component Analysis**: Deep inspection of paths, schemas, responses, and security
- **Database Storage**: Persistent storage of parsed specifications
- **TypeScript**: Fully typed for better development experience
- **Express.js Integration**: HTTP endpoint for health checks
- **SQLite Database**: Lightweight, file-based storage

## Available Tools

### 1. OpenAPI Management
- **list_openapi_specs**: List all stored OpenAPI specifications
- **load_openapi_from_file**: Load specification from file
- **load_openapi_from_url**: Load specification from URL
- **delete_openapi_spec**: Remove stored specification

### 2. Path Analysis
- **list_paths**: List all API paths in a specification
- **get_path_details**: Get detailed information about a specific path
- **search_paths**: Search paths by various criteria

### 3. Response Analysis
- **list_responses**: List all response definitions
- **get_response_details**: Get detailed response information
- **search_responses**: Search responses by criteria

### 4. Schema Management
- **list_schemas**: List all schema components
- **get_schema_details**: Get detailed schema information
- **search_schemas**: Search schemas by name or properties

### 5. Security Analysis
- **list_security_schemes**: List all security schemes
- **get_security_details**: Get detailed security information

### 6. Server Management
- **list_servers**: List all server definitions
- **get_server_details**: Get detailed server information

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd openapi-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Configure MCP client (e.g., Claude Desktop):
```json
{
  "mcpServers": {
    "openapi": {
      "command": "node",
      "args": ["/path/to/openapi-mcp-server/build/index.js"]
    }
  }
}
```

## Usage

### Starting the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Build TypeScript files
npm run build
```

### Example Workflow

1. **Load an OpenAPI specification**:
   - Use `load_openapi_from_file` to load a local spec
   - Use `load_openapi_from_url` to load from a URL

2. **Explore the API**:
   - Use `list_paths` to see all available endpoints
   - Use `get_path_details` to inspect specific endpoints
   - Use `list_schemas` to explore data models

3. **Analyze Security**:
   - Use `list_security_schemes` to understand authentication
   - Check security requirements for specific paths

4. **Search and Filter**:
   - Use search tools to find specific paths, schemas, or responses
   - Filter by HTTP methods, tags, or properties

## Development

### Adding New Tools

1. Create a new directory under `src/tools/`:
```
src/tools/your-tool/
├── index.ts          # Tool registration
├── tool.ts           # Tool implementation
├── handler.ts        # Business logic
├── repository.ts     # Database operations
├── types.ts          # TypeScript types
└── validation.ts     # Input validation
```

2. Implement the tool interface:
```typescript
export class YourTool extends ToolBase {
  name = "your_tool_name";
  description = "Tool description";
  
  inputSchema = {
    type: "object",
    properties: {
      // Define input parameters
    }
  };
  
  async execute(params: YourParams): Promise<YourResponse> {
    // Implementation
  }
}
```

3. Register the tool in `src/tools/index.ts`

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Code Style

- Uses TypeScript strict mode
- Follows functional programming principles where appropriate
- Implements dependency injection for testability
- Uses async/await for asynchronous operations

## Configuration

The server uses environment variables and a configuration file:

- `PORT`: HTTP server port (default: 3000)
- `LOG_LEVEL`: Logging verbosity (default: info)
- `DB_PATH`: Database file location (default: ./data/openapi.db)
- `WATCH_ENABLED`: Enable file watching (default: true)

## Troubleshooting

### Common Issues

1. **Database Lock Errors**:
   - Ensure only one instance of the server is running
   - Check file permissions on the data directory

2. **File Watch Limits**:
   - On Linux, increase inotify watches: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`

3. **Memory Issues**:
   - For large specifications, increase Node.js memory: `node --max-old-space-size=4096 build/index.js`

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm start
```

## License

[Specify your license here]

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

For more details, see [CONTRIBUTING.md](./CONTRIBUTING.md)