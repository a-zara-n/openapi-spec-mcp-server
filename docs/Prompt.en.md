# OpenAPI MCP Server Project Creation Prompt

English | **[日本語](Prompt.md)**

Please create a TypeScript project with the following directory structure and files.

## Project Overview
- Project Name: openapi-mcp-server
- Type: MCP (Model Context Protocol) Server
- Language: TypeScript (ES Modules)
- Key Technologies: Express, SQLite, Jest

## Directory Structure

```
openapi-mcp-server/
├── src/
│   ├── config.ts
│   ├── index.ts
│   ├── server.ts
│   ├── resources/
│   │   ├── base.ts
│   │   └── index.ts
│   └── tools/
│       ├── base.ts
│       ├── index.ts
│       ├── openapi-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── openapi-business-logic.ts
│       │   ├── tests/
│       │   │   ├── openapi-business-logic.test.ts
│       │   │   ├── response-formatter.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── path-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── parser.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── path-business-logic.ts
│       │   ├── tests/
│       │   │   ├── parser.test.ts
│       │   │   ├── path-business-logic.test.ts
│       │   │   ├── response-formatter.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── response-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── response-business-logic.ts
│       │   ├── tests/
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── schema-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── schema-business-logic.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── security-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── security-business-logic.ts
│       │   ├── tests/
│       │   │   ├── security-business-logic.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── server-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── server-business-logic.ts
│       │   ├── tests/
│       │   │   ├── response-formatter.test.ts
│       │   │   ├── server-business-logic.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── shared/
│       │   ├── index.ts
│       │   ├── test-utilities.ts
│       │   └── validation-schemas.ts
│       └── tool-libs/
│           ├── core/
│           │   ├── database.ts
│           │   ├── database/
│           │   │   └── index.ts
│           │   ├── di-container.ts
│           │   ├── di/
│           │   │   └── index.ts
│           │   ├── error/
│           │   │   └── index.ts
│           │   ├── index.ts
│           │   └── validation/
│           │       └── index.ts
│           ├── index.ts
│           ├── parsers/
│           │   ├── content-parser.ts
│           │   ├── extractor.ts
│           │   ├── index.ts
│           │   └── validator.ts
│           ├── services/
│           │   ├── file-loader.ts
│           │   ├── index.ts
│           │   ├── openapi-processor.ts
│           │   └── storage-service.ts
│           ├── tests/
│           │   ├── content-parser.test.ts
│           │   ├── storage-service.test.ts
│           │   └── validator.test.ts
│           ├── types/
│           │   ├── index.ts
│           │   └── interfaces.ts
│           └── utils/
│               ├── business-logic.ts
│               ├── directory-watcher.ts
│               ├── hash.ts
│               ├── index.ts
│               ├── parser.ts
│               └── response-formatter.ts
├── data/
│   ├── openapi.db
│   └── openapi/
├── package.json
├── tsconfig.json
├── README.md
├── UNIT_TESTING_GUIDE.md
└── 機能設計.md
```

## package.json

```json
{
    "name": "openapi-mcp-server",
    "version": "1.0.0",
    "description": "OpenAPI MCP Server",
    "main": "build/server.js",
    "type": "module",
    "scripts": {
        "http": "npm run build && node build/server.js",
        "streamable": "npm run build && node build/server.js",
        "build": "tsc --noCheck && tsc-alias",
        "typecheck": "tsc --noEmit",
        "start": "node build/index.js",
        "dev": "tsx src/index.ts",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [
        "mcp",
        "server",
        "openapi"
    ],
    "author": "",
    "license": "ISC",
    "dependencies": {
        "@modelcontextprotocol/sdk": "^1.15.0",
        "better-sqlite3": "^12.2.0",
        "cors": "^2.8.5",
        "express": "^5.1.0",
        "jest": "^29.7.0",
        "mcp-proxy": "^5.3.0",
        "npx": "^3.0.0",
        "yaml": "^2.8.0"
    },
    "devDependencies": {
        "@types/better-sqlite3": "^7.6.13",
        "@types/cors": "^2.8.17",
        "@types/express": "^5.0.0",
        "@types/jest": "^30.0.0",
        "@types/node": "^22.13.10",
        "tsc-alias": "^1.8.16",
        "tsconfig-paths": "^4.2.0",
        "tsx": "^4.19.3",
        "typescript": "^5.8.3"
    }
}
```

## tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "node",
        "outDir": "build",
        "rootDir": "src",
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        },
        "strict": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "build"]
}
```

## Tool Configuration Pattern

Each tool (openapi-tool, path-tool, response-tool, schema-tool, security-tool, server-tool) has the following common structure:

- `formatters/response-formatter.ts`: Response formatting
- `handler.ts`: Request handling
- `index.ts`: Export definitions
- `repository.ts`: Data access layer
- `services/*-business-logic.ts`: Business logic
- `tests/`: Test files
- `tool.ts`: Main tool definition
- `types.ts`: Type definitions
- `validation.ts`: Validation processing

## Key Features

1. **OpenAPI Specification Management**: Loading, parsing, and saving OpenAPI specification files
2. **MCP Server**: Server implementation compliant with Model Context Protocol
3. **Database**: Data persistence using SQLite (better-sqlite3)
4. **Tool Suite**: Tools for handling each element of OpenAPI specifications (paths, responses, schemas, security, servers)
5. **Testing**: Unit testing using Jest

## Implementation Steps

1. Create project directory
2. Generate package.json with `npm init -y` and update with the above content
3. Install necessary dependencies: `npm install`
4. Create TypeScript configuration file (tsconfig.json)
5. Create folders according to the directory structure
6. Implement base classes and interfaces for each tool
7. Add specific implementations for each tool
8. Create test files

This project functions as an MCP server that manages and processes OpenAPI specifications, with each tool implemented as an independent module.