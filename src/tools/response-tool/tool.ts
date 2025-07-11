import { type Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * List Responses Tool Definition
 */
export const listResponsesTool: Tool = {
    name: "mcp_openapi_list_responses",
    description:
        "Retrieve list of reusable response definitions from the OpenAPI specification. These are common response patterns (like standard error responses) that are referenced across multiple endpoints. Returns response names that can be used as 'responseName' parameter in get_response_information tool.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool. Example: 'e-commerce-api'",
            },
        },
        required: ["name"],
        additionalProperties: false,
    },
};

/**
 * Get Response Information Tool Definition
 */
export const getResponseInformationTool: Tool = {
    name: "mcp_openapi_get_response_information",
    description:
        "Retrieve detailed information for a specific reusable response definition including status codes, content types, schema references, headers, and examples. Use this to understand standard response patterns and error handling across the API.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            responseName: {
                type: "string",
                description:
                    "Name of the response definition to analyze. Obtain from 'mcp_openapi_list_responses' tool. Examples: 'NotFoundError', 'ValidationError', 'UnauthorizedError', 'StandardSuccess'",
            },
        },
        required: ["name", "responseName"],
        additionalProperties: false,
    },
};
