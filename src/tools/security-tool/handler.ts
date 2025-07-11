/**
 * @fileoverview セキュリティツールハンドラー
 * @description OpenAPI仕様のセキュリティスキーム情報管理を処理するハンドラー
 * @since 1.0.0
 */

import type {
    CallToolRequest,
    CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import {
    validateArgs,
    ListSecuritySchemesArgsSchema,
    GetSecuritySchemeInfoArgsSchema,
} from "./validation.js";
import { SecurityBusinessLogicService } from "./services/security-business-logic.js";
import { SecurityResponseFormatter } from "./formatters/response-formatter.js";
import { BaseResponseFormatter } from "../tool-libs/utils/index.js";

/**
 * ビジネスロジックサービスのインスタンス
 * @description セキュリティスキーム情報の処理を担当するサービス
 */
const securityService = new SecurityBusinessLogicService();

/**
 * セキュリティスキーム一覧取得ハンドラー
 * @description 指定されたOpenAPI仕様に定義されているセキュリティスキーム一覧を取得する
 *
 * @param {CallToolRequest} request - ツール実行リクエスト
 * @param {string} request.params.arguments.name - OpenAPI仕様名
 * @returns {Promise<CallToolResult>} セキュリティスキーム一覧の取得結果
 *
 * @throws {Error} バリデーションエラーまたはビジネスロジックエラーが発生した場合
 *
 * @example
 * ```typescript
 * const request: CallToolRequest = {
 *   params: {
 *     name: 'mcp_openapi_list_security_schemes',
 *     arguments: { name: 'petstore' }
 *   }
 * };
 *
 * const result = await handleListSecuritySchemes(request);
 * if (result.isError) {
 *   console.error('エラー:', result.content[0].text);
 * } else {
 *   console.log('セキュリティスキーム一覧:', result.content[0].text);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function handleListSecuritySchemes(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        ListSecuritySchemesArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await securityService.getSecuritySchemes(
        validation.data.name
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return SecurityResponseFormatter.formatSecuritySchemes(
        result.data.securitySchemes
    );
}

/**
 * Get Security Scheme Information ハンドラー関数
 */
export async function handleGetSecuritySchemeInformation(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetSecuritySchemeInfoArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await securityService.getSecuritySchemeInformation(
        validation.data.name,
        validation.data.schemeName
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return SecurityResponseFormatter.formatSecuritySchemeInformation(
        result.data
    );
}
