# OpenAPI MCP Server

English | **[日本語](README.md)**

A TypeScript-based Model Context Protocol (MCP) server that provides intelligent tools for analyzing, validating, and managing OpenAPI specifications. This server enables AI assistants to interact with OpenAPI documentation through a structured interface.

## Table of Contents

-   [Overview](#overview)
-   [Architecture](#architecture)
-   [Features](#features)
-   [Available Tools](#available-tools)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Configuration](#configuration)
-   [Development Guidelines](#development-guidelines)
-   [API Reference](#api-reference)
-   [Troubleshooting](#troubleshooting)

## Overview

The OpenAPI MCP Server bridges the gap between AI assistants and OpenAPI specifications. With this server, AI models can:

-   Automatically load and parse OpenAPI specifications from local files or directories
-   Analyze API structures including paths, schemas, and security configurations in detail
-   Query specific API endpoints and parameters using natural language
-   Validate specifications for compliance with OpenAPI standards
-   Manage multiple API specifications simultaneously with cross-referencing capabilities

By implementing the Model Context Protocol (MCP), this server seamlessly integrates with AI development tools like Claude, dramatically improving how AI understands and utilizes API documentation.

## Architecture

### Directory Structure

```
openapi-mcp-server/
├── src/                      # Source code
│   ├── index.ts              # Main entry point
│   ├── server.ts             # MCP server implementation
│   ├── config.ts             # Configuration management
│   ├── resources/            # MCP resource definitions
│   └── tools/                # Tool implementations
│       ├── openapi-tool/     # OpenAPI specification management
│       ├── path-tool/        # API path analysis
│       ├── response-tool/    # Response schema analysis
│       ├── schema-tool/      # Schema component management
│       ├── security-tool/    # Security scheme analysis
│       ├── server-tool/      # Server endpoint management
│       ├── tool-libs/        # Shared tool libraries
│       │   ├── core/         # Core functionality
│       │   ├── parsers/      # File parsers
│       │   ├── services/     # Business logic services
│       │   ├── types/        # TypeScript type definitions
│       │   └── utils/        # Utility functions
│       └── shared/           # Shared utilities
├── data/                     # Data storage
│   ├── openapi/              # OpenAPI files
│   └── openapi.db            # SQLite database
├── build/                    # Compiled JS
├── docs/                     # Documentation
├── tests/                    # Test files
├── package.json              # Node.js dependencies
└── tsconfig.json            # TypeScript configuration
```

### Core Components

#### 1. **Server Component** (`server.ts`)

-   Implements Streamable HTTP transport for MCP communication
-   Handles both POST and GET requests for stateless operations
-   Manages tool registration and execution
-   Provides comprehensive request/response logging
-   Monitors OpenAPI directory for file changes

#### 2. **Tool Manager** (`tools/index.ts`)

-   Centralized tool registry and execution engine
-   Maps tool names to handler functions
-   Provides error handling and execution tracking
-   Currently manages 17 different tools across 6 categories

#### 3. **Database Layer** (`tool-libs/core/database/`)

-   SQLite-based storage for OpenAPI specifications
-   Manages relationships between specifications, paths, schemas, etc.
-   Provides efficient querying and caching mechanisms
-   Supports full CRUD operations

#### 4. **OpenAPI Processor** (`tool-libs/services/openapi-processor.ts`)

-   Parses YAML and JSON OpenAPI files
-   Validates specifications against OpenAPI standards
-   Extracts and normalizes API information
-   Handles file change detection via hashing

#### 5. **Dependency Injection Container** (`tool-libs/core/di-container.ts`)

-   Manages service dependencies
-   Provides singleton instances for repositories
-   Configurable for different environments (production, testing)

## Features

### Core Capabilities

-   **Multi-format Support**: Handles OpenAPI 3.0+ specifications in YAML and JSON formats
-   **Real-time Monitoring**: Watches OpenAPI directory for changes and updates
-   **Stateless Architecture**: Each request is independent, ensuring scalability
-   **Comprehensive Validation**: Validates specifications before storage
-   **Detailed Logging**: Extensive logging for debugging and monitoring
-   **Error Handling**: Robust error management with detailed error messages

### Technical Features

-   **TypeScript**: Full type safety and IntelliSense support
-   **Express.js**: HTTP server implementation
-   **SQLite**: Lightweight embedded database
-   **MCP SDK**: Official Model Context Protocol implementation
-   **Hot Reload**: Automatic detection of specification changes

## Available Tools

The server provides 17 specialized tools organized into 6 categories:

### 1. OpenAPI Management Tools

-   **`openapi_set_server_info`**: Load and register OpenAPI specifications
    -   Supports individual files or entire directories
    -   Validates specifications before storage
-   **`mcp_openapi_list_openapis`**: List all registered OpenAPI specifications
    -   Returns specification names for use in other tools

### 2. Server Information Tools

-   **`mcp_openapi_list_servers`**: List all servers defined in a specification
-   **`mcp_openapi_get_server_info`**: Get detailed information about a specific server

### 3. Path Analysis Tools

-   **`mcp_openapi_list_paths`**: List all API paths in a specification
-   **`mcp_openapi_get_path_info`**: Get detailed information about a specific path
-   **`mcp_openapi_get_path_parameters`**: Extract path parameters
-   **`mcp_openapi_get_path_responses`**: Get response definitions for a path
-   **`mcp_openapi_get_path_request_body`**: Get request body schema
-   **`mcp_openapi_describe_path`**: Get a natural language description of an endpoint

### 4. Schema Inspection Tools

-   **`mcp_openapi_list_schemas`**: List all defined schemas
-   **`mcp_openapi_get_schema_info`**: Get schema details
-   **`mcp_openapi_get_schema_definition`**: Get full schema definition
-   **`mcp_openapi_get_schema_properties`**: Extract schema properties

### 5. Security Tools

-   **`mcp_openapi_list_security_schemes`**: List security schemes
-   **`mcp_openapi_get_security_scheme_info`**: Get security scheme details

### 6. Response Tools

-   **`mcp_openapi_list_responses`**: List reusable response definitions
-   **`mcp_openapi_get_response_info`**: Get response definition details

## Installation

### Prerequisites

-   Node.js 18+ and npm
-   TypeScript 5.0+
-   Git

### Setup Steps

1. **Clone the repository**:

```bash
git clone <repository-url>
cd openapi-mcp-server
```

2. **Install dependencies**:

```bash
npm install
```

3. **Build the project**:

```bash
npm run build
```

4. **Create data directory** (if not exists):

```bash
mkdir -p data/openapi
```

5. **Add OpenAPI files**:
   Place your OpenAPI specification files (`.yaml`, `.yml`, or `.json`) in the `data/openapi` directory.

## Usage

### Starting the Server

The server supports multiple run modes:

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Build TypeScript files
npm run build
```

### Integration with MCP Clients

In Claude Desktop app or MCP-compatible clients:

```json
{
    "mcpServers": {
        "openapi-server": {
            "command": "node",
            "args": ["/path/to/openapi-mcp-server/build/index.js"]
        }
    }
}
```

### Example Workflow

1. **Load OpenAPI specifications**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "openapi_set_server_info",
        "arguments": {
            "path": "./data/openapi/petstore.yaml"
        }
    }
}
```

2. **List available APIs**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "mcp_openapi_list_openapis",
        "arguments": {}
    }
}
```

3. **Explore API paths**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "mcp_openapi_list_paths",
        "arguments": {
            "name": "petstore"
        }
    }
}
```

4. **Inspect specific endpoint**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "mcp_openapi_get_path_info",
        "arguments": {
            "name": "petstore",
            "path": "/pets/{petId}",
            "method": "get"
        }
    }
}
```

## Configuration

### Environment Variables

You can override default settings using environment variables:

-   `PORT`: Server port (default: 3000)
-   `DB_PATH`: Database file path
-   `OPENAPI_DIR`: OpenAPI files directory

## Development Guidelines

### Adding New Tools

1. **Create tool directory**: Create a new directory under `src/tools/`
2. **Define tool interface**: Create `tool.ts` with MCP tool definition
3. **Implement handler**: Create `handler.ts` with business logic
4. **Add validation**: Create `validation.ts` for input validation
5. **Register tool**: Add to `src/tools/index.ts`

Example tool structure:

```
src/tools/my-tool/
├── tool.ts          # Tool definition
├── handler.ts       # Request handler
├── validation.ts    # Input validation
├── types.ts         # TypeScript types
└── index.ts         # Exports
```

### Code Style

-   Use TypeScript strict mode
-   Follow ESLint rules
-   Add JSDoc comments for all public APIs
-   Write unit tests for business logic
-   Use meaningful variable and function names

### Testing

Run tests with:

```bash
npm test
```

Tests are located in `src/tools/*/tests/` directories.

### Building

Build the project:

```bash
npm run build
```

Output is generated in the `build/` directory.

## API Reference

### Tool Request Format

All tools follow the MCP standard format:

```typescript
{
    method: "tools/call",
    params: {
        name: string,      // Tool name
        arguments: object  // Tool-specific arguments
    }
}
```

### Response Format

```typescript
{
    content: [
        {
            type: "text",
            text: string   // Response data
        }
    ]
}
```

## Troubleshooting

### Common Issues

1. **Server fails to start**:

    - Check if port 3000 is already in use
    - Verify all dependencies are installed
    - Ensure TypeScript build completed successfully

2. **OpenAPI files not loading**:

    - Check file permissions in `data/openapi/`
    - Verify files are valid YAML/JSON
    - Check server logs for validation errors

3. **Database errors**:

    - Ensure `data/` directory exists and is writable
    - Delete `openapi.db` to reset database
    - Check disk space availability

4. **Tool execution failures**:
    - Verify tool name is correct
    - Check required arguments are provided
    - Review server logs for detailed error messages

### Debug Mode

Enable detailed logging by setting:

```typescript
enableLogging: true; // in various configuration objects
```

### Support

For issues and questions:

-   Check server logs for detailed error information
-   Review existing documentation in `/docs`
-   Examine test files for usage examples

## License

ISC License - See [LICENSE file](LICENSE) for details.

## Contributing

Contributions are welcome! Please follow the development guidelines and ensure all tests pass before submitting pull requests.