# OpenAPI MCP Server Tools Guide

English | **[日本語](TOOLS_GUIDE.md)**

This guide provides detailed information about the functionality and usage of each tool provided by the OpenAPI MCP Server.

## Table of Contents

1. [Overview](#overview)
2. [OpenAPI Tool](#openapi-tool-openapi-specification-management)
3. [Path Tool](#path-tool-api-path-analysis)
4. [Response Tool](#response-tool-response-definition-analysis)
5. [Schema Tool](#schema-tool-schema-management)
6. [Security Tool](#security-tool-security-scheme-analysis)
7. [Server Tool](#server-tool-server-information-management)
8. [Tool Libraries](#tool-libs-common-libraries)

## Overview

The OpenAPI MCP Server provides 18 tools across 6 categories for comprehensive management and analysis of OpenAPI specifications. Each tool is designed as an independent module with specific responsibilities.

### Common Tool Structure

All tools follow this common architecture:

```
tool-name/
├── formatters/           # Response formatters
├── services/            # Business logic
├── tests/              # Test suite
├── handler.ts          # Request handler
├── repository.ts       # Data access layer
├── tool.ts            # Tool definition
├── types.ts           # TypeScript type definitions
└── validation.ts      # Input validation
```

### Basic Workflow

1. Load OpenAPI specifications with `openapi_set_server_info`
2. Get available specification names with `mcp_openapi_list_openapis`
3. Use the specification names with tools in each category

## openapi-tool: OpenAPI Specification Management

### Overview
Core tools for loading, parsing, saving, and managing OpenAPI specification files.

### Available Tools

#### 1. `mcp_openapi_list_openapis`
Retrieve list of registered OpenAPI specifications. This is typically the first tool to call to discover available APIs.

**Parameters:**
- None (empty object)

**Response Example:**
```json
{
  "specifications": [
    {
      "name": "petstore-api",
      "version": "1.0.0",
      "title": "Swagger Petstore"
    }
  ]
}
```

#### 2. `openapi_set_server_info`
Load and register OpenAPI specification files into the system database.

**Parameters:**
- `path` (string, required): Path to OpenAPI file (.yaml, .yml, .json) or directory containing OpenAPI files
  - Examples: `./data/openapi/petstore.yaml`, `./specs/`, `/absolute/path/to/api.json`

**Response Example:**
```json
{
  "success": true,
  "message": "Successfully loaded 3 OpenAPI specifications",
  "details": [
    {
      "name": "petstore-api",
      "path": "./data/openapi/petstore.yaml"
    }
  ]
}
```

## path-tool: API Path Analysis

### Overview
Tools for analyzing and searching API paths (endpoints) within OpenAPI specifications.

### Available Tools

#### 1. `mcp_openapi_list_paths`
Retrieve list of API endpoint paths from specified OpenAPI specification.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification (obtain from `mcp_openapi_list_openapis`)

**Response Example:**
```json
{
  "paths": [
    {
      "methodAndPath": "GET /users/{id}",
      "summary": "Get user by ID"
    },
    {
      "methodAndPath": "POST /users",
      "summary": "Create new user"
    }
  ]
}
```

#### 2. `mcp_openapi_get_path_information`
Retrieve comprehensive details for a specific API endpoint.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `methodAndPath` (string, required): HTTP method and path combination (e.g., `GET /users/{id}`)

**Response Example:**
```json
{
  "methodAndPath": "GET /users/{id}",
  "summary": "Get user by ID",
  "description": "Returns a single user",
  "operationId": "getUserById",
  "tags": ["users"],
  "deprecated": false
}
```

#### 3. `mcp_openapi_get_path_parameters`
Retrieve parameter definitions for a specific endpoint.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `methodAndPath` (string, required): HTTP method and path combination

**Response Example:**
```json
{
  "parameters": [
    {
      "name": "id",
      "in": "path",
      "required": true,
      "schema": {
        "type": "string",
        "format": "uuid"
      },
      "description": "User ID"
    }
  ]
}
```

#### 4. `mcp_openapi_get_path_responses`
Retrieve response definitions for a specific endpoint.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `methodAndPath` (string, required): HTTP method and path combination

**Response Example:**
```json
{
  "responses": {
    "200": {
      "description": "Successful response",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/User"
          }
        }
      }
    },
    "404": {
      "description": "User not found"
    }
  }
}
```

#### 5. `mcp_openapi_get_path_request_body`
Retrieve request body schema and requirements for endpoints that accept data (POST, PUT, PATCH).

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `methodAndPath` (string, required): HTTP method and path combination

**Response Example:**
```json
{
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/CreateUserRequest"
        }
      }
    },
    "description": "User creation data"
  }
}
```

#### 6. `mcp_openapi_get_path_describe`
Retrieve human-readable description and documentation for a specific API endpoint.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `methodAndPath` (string, required): HTTP method and path combination

## response-tool: Response Definition Analysis

### Overview
Tools for managing and analyzing reusable response definitions in API specifications.

### Available Tools

#### 1. `mcp_openapi_list_responses`
Retrieve list of reusable response definitions from the OpenAPI specification.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification

**Response Example:**
```json
{
  "responses": [
    {
      "responseName": "NotFoundError",
      "description": "Resource not found"
    },
    {
      "responseName": "ValidationError",
      "description": "Request validation failed"
    }
  ]
}
```

#### 2. `mcp_openapi_get_response_information`
Retrieve detailed information for a specific reusable response definition.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `responseName` (string, required): Name of the response definition (obtain from `mcp_openapi_list_responses`)

**Response Example:**
```json
{
  "responseName": "NotFoundError",
  "description": "Resource not found",
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/Error"
      }
    }
  },
  "headers": {
    "X-Rate-Limit-Remaining": {
      "schema": {
        "type": "integer"
      }
    }
  }
}
```

## schema-tool: Schema Management

### Overview
Tools for managing schemas (data models) defined in OpenAPI specifications.

### Available Tools

#### 1. `mcp_openapi_get_schema_list`
Retrieve list of data schemas/models defined in the OpenAPI specification.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification

**Response Example:**
```json
{
  "schemas": [
    {
      "schemaName": "User",
      "type": "object",
      "description": "User model"
    },
    {
      "schemaName": "CreateUserRequest",
      "type": "object",
      "description": "Request body for creating a user"
    }
  ]
}
```

#### 2. `mcp_openapi_get_schema_information`
Retrieve comprehensive metadata for a specific schema.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `schemaName` (string, required): Name of the schema (obtain from `mcp_openapi_get_schema_list`)

**Response Example:**
```json
{
  "schemaName": "User",
  "type": "object",
  "description": "User model",
  "required": ["id", "username", "email"],
  "additionalProperties": false
}
```

#### 3. `mcp_openapi_get_schema_definition`
Retrieve complete JSON Schema definition for a specific data model.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `schemaName` (string, required): Name of the schema

**Response Example:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20
    },
    "email": {
      "type": "string",
      "format": "email"
    }
  },
  "required": ["id", "username", "email"]
}
```

#### 4. `mcp_openapi_get_schema_properties`
Retrieve detailed property information for a specific schema.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `schemaName` (string, required): Name of the schema

**Response Example:**
```json
{
  "properties": {
    "id": {
      "name": "id",
      "type": "string",
      "format": "uuid",
      "required": true,
      "description": "Unique identifier"
    },
    "username": {
      "name": "username",
      "type": "string",
      "required": true,
      "minLength": 3,
      "maxLength": 20,
      "description": "User's username"
    }
  }
}
```

## security-tool: Security Scheme Analysis

### Overview
Tools for analyzing security mechanisms defined in API specifications.

### Available Tools

#### 1. `mcp_openapi_list_security_schemes`
Retrieve list of authentication and authorization mechanisms defined in the OpenAPI specification.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification

**Response Example:**
```json
{
  "securitySchemes": [
    {
      "securitySchemeName": "ApiKeyAuth",
      "type": "apiKey",
      "description": "API Key Authentication"
    },
    {
      "securitySchemeName": "OAuth2",
      "type": "oauth2",
      "description": "OAuth 2.0 Authentication"
    }
  ]
}
```

#### 2. `mcp_openapi_get_security_scheme_information`
Retrieve detailed configuration for a specific security scheme.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `securitySchemeName` (string, required): Name of the security scheme (obtain from `mcp_openapi_list_security_schemes`)

**Response Example:**
```json
{
  "securitySchemeName": "OAuth2",
  "type": "oauth2",
  "description": "OAuth 2.0 Authentication",
  "flows": {
    "authorizationCode": {
      "authorizationUrl": "https://api.example.com/oauth/authorize",
      "tokenUrl": "https://api.example.com/oauth/token",
      "scopes": {
        "read:users": "Read user information",
        "write:users": "Create and update users"
      }
    }
  }
}
```

## server-tool: Server Information Management

### Overview
Tools for managing server information defined in OpenAPI specifications.

### Available Tools

#### 1. `mcp_openapi_list_application_servers`
Retrieve list of server configurations defined in the OpenAPI specification.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification

**Response Example:**
```json
{
  "servers": [
    {
      "server_url": "https://api.example.com/v1",
      "description": "Production server"
    },
    {
      "server_url": "https://staging-api.example.com",
      "description": "Staging server"
    },
    {
      "server_url": "{protocol}://api.{domain}/v2",
      "description": "Templated server URL"
    }
  ]
}
```

#### 2. `mcp_openapi_get_server_information`
Retrieve detailed configuration for a specific server.

**Parameters:**
- `name` (string, required): Name of the OpenAPI specification
- `server_url` (string, required): Server URL (obtain from `mcp_openapi_list_application_servers`)

**Response Example:**
```json
{
  "server_url": "{protocol}://api.{domain}/v2",
  "description": "Templated server URL",
  "variables": {
    "protocol": {
      "default": "https",
      "enum": ["http", "https"],
      "description": "Protocol to use"
    },
    "domain": {
      "default": "example.com",
      "description": "API domain"
    }
  }
}
```

## tool-libs: Common Libraries

### Overview
Libraries providing foundational functionality shared across all tools.

### Core Components

#### 1. Database (`core/database/`)
- SQLite connection management
- Transaction processing
- Migrations

#### 2. DI Container (`core/di-container.ts`)
- Dependency injection
- Service lifecycle management
- Repository factory

#### 3. Parsers (`parsers/`)
- **content-parser.ts**: YAML/JSON parsing
- **validator.ts**: OpenAPI specification validation
- **extractor.ts**: Data extraction logic

#### 4. Services (`services/`)
- **file-loader.ts**: File/URL loading
- **openapi-processor.ts**: Integration processing
- **storage-service.ts**: Data persistence

#### 5. Utils (`utils/`)
- **hash.ts**: File hash calculation
- **directory-watcher.ts**: File monitoring
- **response-formatter.ts**: Response formatting
- **business-logic.ts**: Common business logic

### Error Handling

Unified error handling system:
- Custom error classes
- Error code system
- Stack trace preservation
- User-friendly messages

### Validation

Common validation schemas:
- Input parameter validation
- OpenAPI specification compliance checks
- Type safety guarantees

## Usage Examples

### Complete Workflow Example

```typescript
// 1. Load OpenAPI specification
await openapi_set_server_info({ 
  path: "./data/openapi/petstore.yaml" 
});

// 2. Check available specifications
const specs = await mcp_openapi_list_openapis();
// => { specifications: [{ name: "petstore-api", ... }] }

// 3. Explore API paths
const paths = await mcp_openapi_list_paths({ 
  name: "petstore-api" 
});
// => { paths: [{ methodAndPath: "GET /pets/{id}", ... }] }

// 4. Get details for specific endpoint
const pathInfo = await mcp_openapi_get_path_information({
  name: "petstore-api",
  methodAndPath: "GET /pets/{id}"
});

// 5. Check parameters
const params = await mcp_openapi_get_path_parameters({
  name: "petstore-api",
  methodAndPath: "GET /pets/{id}"
});

// 6. Check response schema
const responses = await mcp_openapi_get_path_responses({
  name: "petstore-api",
  methodAndPath: "GET /pets/{id}"
});

// 7. Get schema details
const schemas = await mcp_openapi_get_schema_list({
  name: "petstore-api"
});

const petSchema = await mcp_openapi_get_schema_definition({
  name: "petstore-api",
  schemaName: "Pet"
});

// 8. Check security requirements
const security = await mcp_openapi_list_security_schemes({
  name: "petstore-api"
});

// 9. Get server information
const servers = await mcp_openapi_list_application_servers({
  name: "petstore-api"
});
```

## Best Practices

### 1. Error Handling
Wrap all tool calls in try-catch:
```typescript
try {
  const result = await mcp_openapi_list_paths({ name: "api-name" });
  // Handle success
} catch (error) {
  // Handle error
  console.error(error.message);
}
```

### 2. Tool Ordering
Use tools in the correct order:
1. `openapi_set_server_info` → Load specifications
2. `mcp_openapi_list_openapis` → Get available specification names
3. List tools → Check available resources
4. Detail tools → Get specific resource details

### 3. Parameter Validation
Always obtain parameters from previous tool outputs:
```typescript
// Good example
const specs = await mcp_openapi_list_openapis();
const specName = specs.specifications[0].name;
const paths = await mcp_openapi_list_paths({ name: specName });

// Bad example
const paths = await mcp_openapi_list_paths({ name: "guessed-name" });
```

### 4. Batch Processing
Efficiently process multiple specifications:
```typescript
// Load all specifications in directory
await openapi_set_server_info({ 
  path: "./data/openapi/" 
});

// Process all specifications
const specs = await mcp_openapi_list_openapis();
for (const spec of specs.specifications) {
  const paths = await mcp_openapi_list_paths({ name: spec.name });
  // Process each specification
}
```

## Summary

The OpenAPI MCP Server enables comprehensive management and analysis of OpenAPI specifications through 18 specialized tools. Each tool has a clear scope of responsibility and works in conjunction with other tools. By selecting appropriate tools and using them in the correct order, you can address various use cases including API specification understanding, validation, and documentation generation.