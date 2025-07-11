import { type Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * List Security Schemes Tool Definition
 */
export const listSecuritySchemesTool: Tool = {
    name: "mcp_openapi_list_security_schemes",
    description:
        "Retrieve list of authentication and authorization mechanisms defined in the OpenAPI specification including API keys, OAuth2, Bearer tokens, Basic auth, etc. Returns security scheme names that can be used as 'securitySchemeName' parameter in get_security_scheme_information tool. Essential for understanding how to authenticate API requests.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool. Example: 'secure-banking-api'",
            },
        },
        required: ["name"],
        additionalProperties: false,
    },
};

/**
 * Get Security Scheme Information Tool Definition
 */
export const getSecuritySchemeInformationTool: Tool = {
    name: "mcp_openapi_get_security_scheme_information",
    description:
        "Retrieve detailed configuration for a specific security scheme including authentication type, token locations, OAuth2 flows, scopes, and implementation requirements. Use this to understand how to properly authenticate requests and implement security in your API client.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            securitySchemeName: {
                type: "string",
                description:
                    "Name of the security scheme to analyze. Obtain from 'mcp_openapi_list_security_schemes' tool. Examples: 'ApiKeyAuth', 'BearerToken', 'OAuth2', 'BasicAuth', 'CookieAuth'",
            },
        },
        required: ["name", "securitySchemeName"],
        additionalProperties: false,
    },
};
