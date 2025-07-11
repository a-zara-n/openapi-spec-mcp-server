/**
 * @fileoverview スキーマツールハンドラー
 * @description OpenAPI仕様のスキーマ情報管理を処理するハンドラー
 * @since 1.0.0
 */

import type {
    CallToolRequest,
    CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import {
    validateArgs,
    GetSchemaListArgsSchema,
    GetSchemaInfoArgsSchema,
    GetSchemaDefinitionArgsSchema,
    GetSchemaPropertiesArgsSchema,
} from "./validation.js";
import { SchemaBusinessLogicService } from "./services/schema-business-logic.js";
import { SchemaResponseFormatter } from "./formatters/response-formatter.js";
import { BaseResponseFormatter } from "../tool-libs/utils/index.js";

/**
 * ビジネスロジックサービスのインスタンス
 * @description スキーマ情報の処理を担当するサービス
 */
const schemaService = new SchemaBusinessLogicService();

/**
 * スキーマ一覧取得ハンドラー
 * @description 指定されたOpenAPI仕様に定義されているスキーマ一覧を取得する
 *
 * @param {CallToolRequest} request - ツール実行リクエスト
 * @param {string} request.params.arguments.name - OpenAPI仕様名
 * @returns {Promise<CallToolResult>} スキーマ一覧の取得結果
 *
 * @throws {Error} バリデーションエラーまたはビジネスロジックエラーが発生した場合
 *
 * @example
 * ```typescript
 * const request: CallToolRequest = {
 *   params: {
 *     name: 'mcp_openapi_get_schema_list',
 *     arguments: { name: 'petstore' }
 *   }
 * };
 *
 * const result = await handleGetSchemaList(request);
 * if (result.isError) {
 *   console.error('エラー:', result.content[0].text);
 * } else {
 *   console.log('スキーマ一覧:', result.content[0].text);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function handleGetSchemaList(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetSchemaListArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return SchemaResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await schemaService.getSchemaList(validation.data.name);
    if (!result.success) {
        return SchemaResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return SchemaResponseFormatter.formatSchemaList(result.data.schemas);
}

/**
 * Get Schema Information ハンドラー関数
 */
export async function handleGetSchemaInformation(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetSchemaInfoArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return SchemaResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await schemaService.getSchemaInformation(
        validation.data.name,
        validation.data.schemaName
    );
    if (!result.success) {
        return SchemaResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return SchemaResponseFormatter.formatSchemaInformation(
        result.data.description
    );
}

/**
 * Get Schema Definition ハンドラー関数
 */
export async function handleGetSchemaDefinition(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetSchemaDefinitionArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return SchemaResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await schemaService.getSchemaDefinition(
        validation.data.name,
        validation.data.schemaName
    );
    if (!result.success) {
        return SchemaResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return SchemaResponseFormatter.formatSchemaDefinition(result.data);
}

/**
 * Get Schema Properties ハンドラー関数
 */
export async function handleGetSchemaProperties(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetSchemaPropertiesArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return SchemaResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await schemaService.getSchemaProperties(
        validation.data.name,
        validation.data.schemaName
    );
    if (!result.success) {
        return SchemaResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return SchemaResponseFormatter.formatSchemaProperties(result.data.schema);
}
