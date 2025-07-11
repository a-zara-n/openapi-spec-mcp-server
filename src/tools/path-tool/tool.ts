import { type Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * List Paths Tool Definition
 */
export const listPathsTool: Tool = {
    name: "mcp_openapi_list_paths",
    description:
        "Retrieve list of API endpoint paths from specified OpenAPI specification. Returns path information including HTTP methods and endpoint patterns. Use the returned 'methodAndPath' values (e.g., 'GET /users/{id}') as input for other path-related tools like get_path_information, get_path_parameters, get_path_responses.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain this value from 'mcp_openapi_list_openapis' tool. Example: 'petstore-api'",
            },
        },
        required: ["name"],
        additionalProperties: false,
    },
};

/**
 * Get Path Information Tool Definition
 */
export const getPathInformationTool: Tool = {
    name: "mcp_openapi_get_path_information",
    description:
        "Retrieve comprehensive details for a specific API endpoint including summary, description, operation ID, tags, and metadata. Use this for understanding endpoint purpose and functionality before implementing API calls.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            methodAndPath: {
                type: "string",
                description:
                    "HTTP method and path combination. Obtain from 'mcp_openapi_list_paths' tool. Format: 'METHOD /path'. Examples: 'GET /users/{id}', 'POST /orders', 'DELETE /items/{itemId}'",
            },
        },
        required: ["name", "methodAndPath"],
        additionalProperties: false,
    },
};

/**
 * Get Path Parameters Tool Definition
 */
export const getPathParametersTool: Tool = {
    name: "mcp_openapi_get_path_parameters",
    description:
        "Retrieve parameter definitions for a specific endpoint including path parameters, query parameters, headers, and their validation rules. Essential for constructing valid API requests and understanding required vs optional parameters.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            methodAndPath: {
                type: "string",
                description:
                    "HTTP method and path combination. Obtain from 'mcp_openapi_list_paths' tool. Examples: 'GET /users/{id}', 'POST /search'",
            },
        },
        required: ["name", "methodAndPath"],
        additionalProperties: false,
    },
};

/**
 * Get Path Responses Tool Definition
 */
export const getPathResponsesTool: Tool = {
    name: "mcp_openapi_get_path_responses",
    description:
        "Retrieve response definitions for a specific endpoint including status codes, response schemas, headers, and examples. Use this to understand what data structure to expect from API calls and handle different response scenarios (success, error cases).",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            methodAndPath: {
                type: "string",
                description:
                    "HTTP method and path combination. Obtain from 'mcp_openapi_list_paths' tool. Examples: 'GET /users/{id}', 'POST /orders'",
            },
        },
        required: ["name", "methodAndPath"],
        additionalProperties: false,
    },
};

/**
 * Get Path Request Body Tool Definition
 */
export const getPathRequestBodyTool: Tool = {
    name: "mcp_openapi_get_path_request_body",
    description:
        "Retrieve request body schema and requirements for endpoints that accept data (POST, PUT, PATCH). Returns content types, required fields, validation rules, and example payloads. Essential for constructing valid request bodies when calling APIs.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            methodAndPath: {
                type: "string",
                description:
                    "HTTP method and path combination for endpoints that accept request bodies. Obtain from 'mcp_openapi_list_paths' tool. Examples: 'POST /users', 'PUT /users/{id}', 'PATCH /settings'",
            },
        },
        required: ["name", "methodAndPath"],
        additionalProperties: false,
    },
};

/**
 * Get Path Description Tool Definition
 */
export const getPathDescribeTool: Tool = {
    name: "mcp_openapi_get_path_describe",
    description:
        "Retrieve human-readable description and documentation for a specific API endpoint. Provides summary, detailed description, and usage notes. Use this to understand the business purpose and behavior of an endpoint before implementation.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            methodAndPath: {
                type: "string",
                description:
                    "HTTP method and path combination. Obtain from 'mcp_openapi_list_paths' tool. Examples: 'GET /users/{id}', 'POST /auth/login'",
            },
        },
        required: ["name", "methodAndPath"],
        additionalProperties: false,
    },
};
