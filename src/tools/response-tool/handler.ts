/**
 * @fileoverview レスポンスツールハンドラー
 * @description OpenAPI仕様のレスポンス情報管理を処理するハンドラー
 * @since 1.0.0
 */

import type {
    CallToolRequest,
    CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import {
    validateArgs,
    ListResponsesArgsSchema,
    GetResponseInformationArgsSchema,
} from "./validation.js";
import { ResponseBusinessLogicService } from "./services/response-business-logic.js";
import { ResponseResponseFormatter } from "./formatters/response-formatter.js";
import { BaseResponseFormatter } from "../tool-libs/utils/index.js";

/**
 * ビジネスロジックサービスのインスタンス
 * @description レスポンス情報の処理を担当するサービス
 */
const responseService = new ResponseBusinessLogicService();

/**
 * レスポンス一覧取得ハンドラー
 * @description 指定されたOpenAPI仕様に定義されているレスポンス一覧を取得する
 *
 * @param {CallToolRequest} request - ツール実行リクエスト
 * @param {string} request.params.arguments.name - OpenAPI仕様名
 * @returns {Promise<CallToolResult>} レスポンス一覧の取得結果
 *
 * @throws {Error} バリデーションエラーまたはビジネスロジックエラーが発生した場合
 *
 * @example
 * ```typescript
 * const request: CallToolRequest = {
 *   params: {
 *     name: 'mcp_openapi_list_responses',
 *     arguments: { name: 'petstore' }
 *   }
 * };
 *
 * const result = await handleListResponses(request);
 * if (result.isError) {
 *   console.error('エラー:', result.content[0].text);
 * } else {
 *   console.log('レスポンス一覧:', result.content[0].text);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function handleListResponses(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        ListResponsesArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await responseService.getResponseList(validation.data.name);
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ResponseResponseFormatter.formatResponses(result.data.responseNames);
}

/**
 * Get Response Information ハンドラー関数
 */
export async function handleGetResponseInformation(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetResponseInformationArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await responseService.getResponseInformation(
        validation.data.name,
        validation.data.responseName
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ResponseResponseFormatter.formatResponseInformation(result.data);
}
