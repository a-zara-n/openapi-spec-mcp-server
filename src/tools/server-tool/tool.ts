import { type Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * List Application Servers Tool Definition
 */
export const listApplicationServersTool: Tool = {
    name: "mcp_openapi_list_application_servers",
    description:
        "Retrieve list of server configurations defined in the OpenAPI specification including base URLs, environments (dev/staging/prod), and descriptions. Returns server URLs that can be used as 'server_url' parameter in get_server_information tool. Essential for determining API endpoints and environments.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool. Example: 'payment-gateway-api'",
            },
        },
        required: ["name"],
        additionalProperties: false,
    },
};

/**
 * Get Server Information Tool Definition
 */
export const getServerInformationTool: Tool = {
    name: "mcp_openapi_get_server_information",
    description:
        "Retrieve detailed configuration for a specific server including full URL, description, environment variables, and URL templating information. Use this to understand how to construct base URLs for API calls and configure clients for different environments.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            server_url: {
                type: "string",
                description:
                    "Server URL to analyze. Obtain from 'mcp_openapi_list_application_servers' tool. Examples: 'https://api.example.com/v1', 'https://staging-api.example.com', '{protocol}://api.{domain}/v2'",
            },
        },
        required: ["name", "server_url"],
        additionalProperties: false,
    },
};
