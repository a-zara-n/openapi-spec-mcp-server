import { type Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Get Schema List Tool Definition
 */
export const getSchemaListTool: Tool = {
    name: "mcp_openapi_get_schema_list",
    description:
        "Retrieve list of data schemas/models defined in the OpenAPI specification. Returns schema names that can be used as 'schemaName' parameter in other schema tools. Schemas define the structure of request/response data and are referenced throughout the API documentation.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool. Example: 'user-management-api'",
            },
        },
        required: ["name"],
        additionalProperties: false,
    },
};

/**
 * Get Schema Information Tool Definition
 */
export const getSchemaInformationTool: Tool = {
    name: "mcp_openapi_get_schema_information",
    description:
        "Retrieve comprehensive metadata for a specific schema including type, description, usage context, and relationships to other schemas. Use this to understand the purpose and structure of data models before diving into detailed properties.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            schemaName: {
                type: "string",
                description:
                    "Name of the schema to analyze. Obtain from 'mcp_openapi_get_schema_list' tool. Examples: 'User', 'Product', 'OrderRequest', 'ErrorResponse'",
            },
        },
        required: ["name", "schemaName"],
        additionalProperties: false,
    },
};

/**
 * Get Schema Definition Tool Definition
 */
export const getSchemaDefinitionTool: Tool = {
    name: "mcp_openapi_get_schema_definition",
    description:
        "Retrieve complete JSON Schema definition for a specific data model including all properties, types, constraints, and nested object structures. Use this to understand exact data formats for API requests/responses and generate compatible data structures in your code.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            schemaName: {
                type: "string",
                description:
                    "Name of the schema to retrieve. Obtain from 'mcp_openapi_get_schema_list' tool. Examples: 'CreateUserRequest', 'UserProfile', 'ApiError'",
            },
        },
        required: ["name", "schemaName"],
        additionalProperties: false,
    },
};

/**
 * Get Schema Properties Tool Definition
 */
export const getSchemaPropertiesTool: Tool = {
    name: "mcp_openapi_get_schema_properties",
    description:
        "Retrieve detailed property information for a specific schema including field names, data types, validation rules, default values, and examples. Essential for understanding individual fields when constructing objects or validating data structures.",
    inputSchema: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description:
                    "Name of the OpenAPI specification. Obtain from 'mcp_openapi_list_openapis' tool.",
            },
            schemaName: {
                type: "string",
                description:
                    "Name of the schema to analyze. Obtain from 'mcp_openapi_get_schema_list' tool. Examples: 'User', 'Product', 'Address'",
            },
        },
        required: ["name", "schemaName"],
        additionalProperties: false,
    },
};
