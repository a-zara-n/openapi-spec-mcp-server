/**
 * @fileoverview OpenAPI Tool Definitions
 * @description Provides MCP tool definitions for OpenAPI operations
 * @since 1.0.0
 */

import type { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * OpenAPI List Tool Definition
 * @description MCP tool to retrieve list of registered OpenAPI specifications
 *
 * @example
 * ```typescript
 * // Tool execution example
 * const request = {
 *   method: "tools/call",
 *   params: {
 *     name: "mcp_openapi_list_openapis",
 *     arguments: {}
 *   }
 * };
 * ```
 */
export const listOpenAPIsTool: Tool = {
    name: "mcp_openapi_list_openapis",
    description:
        "Retrieve list of registered OpenAPI specifications. This is typically the first tool to call to discover available APIs. Returns specification names that can be used as 'name' parameter in all other OpenAPI tools (paths, schemas, servers, security, responses).",
    inputSchema: {
        type: "object",
        properties: {},
        required: [],
    },
};

/**
 * Server Information Setup Tool Definition
 * @description MCP tool to load OpenAPI specification files and set server information
 *
 * @example
 * ```typescript
 * // Tool execution example
 * const request = {
 *   method: "tools/call",
 *   params: {
 *     name: "openapi_set_server_info",
 *     arguments: {
 *       path: "./openapi/petstore.yaml"
 *     }
 *   }
 * };
 * ```
 */
export const setServerInfoTool: Tool = {
    name: "openapi_set_server_info",
    description:
        "Load and register OpenAPI specification files into the system database. Use this tool to make OpenAPI specs available for analysis. After successful execution, the registered specification names can be retrieved using 'mcp_openapi_list_openapis' and used in all other tools.",
    inputSchema: {
        type: "object",
        properties: {
            path: {
                type: "string",
                description:
                    "Path to OpenAPI file (.yaml, .yml, .json) or directory containing OpenAPI files. Examples: './data/openapi/petstore.yaml', './specs/', '/absolute/path/to/api.json'",
            },
        },
        required: ["path"],
    },
};
