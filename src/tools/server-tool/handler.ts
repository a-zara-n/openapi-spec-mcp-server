import {
    type CallToolRequest,
    type CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";

import {
    validateArgs,
    ListApplicationServersArgsSchema,
    GetServerInformationArgsSchema,
} from "./validation.js";
import { ServerBusinessLogicService } from "./services/server-business-logic.js";
import { ServerResponseFormatter } from "./formatters/response-formatter.js";
import { BaseResponseFormatter } from "../tool-libs/utils/index.js";

/**
 * @fileoverview サーバーツールハンドラー
 * @description OpenAPI仕様のサーバー情報管理を処理するハンドラー
 * @since 1.0.0
 */

// ビジネスロジックサービスのインスタンス
const serverService = new ServerBusinessLogicService();

/**
 * アプリケーションサーバー一覧取得ハンドラー
 * @description 指定されたOpenAPI仕様に定義されているサーバー一覧を取得する
 *
 * @param {CallToolRequest} request - ツール実行リクエスト
 * @param {string} request.params.arguments.name - OpenAPI仕様名
 * @returns {Promise<CallToolResult>} サーバー一覧の取得結果
 *
 * @throws {Error} バリデーションエラーまたはビジネスロジックエラーが発生した場合
 *
 * @example
 * ```typescript
 * const request: CallToolRequest = {
 *   params: {
 *     name: 'mcp_openapi_list_application_servers',
 *     arguments: { name: 'petstore' }
 *   }
 * };
 *
 * const result = await handleListApplicationServers(request);
 * if (result.isError) {
 *   console.error('エラー:', result.content[0].text);
 * } else {
 *   console.log('サーバー一覧:', result.content[0].text);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function handleListApplicationServers(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        ListApplicationServersArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await serverService.getApplicationServers(
        validation.data.name
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ServerResponseFormatter.formatServerList(result.data.servers);
}

/**
 * Get Server Information ハンドラー関数
 */
export async function handleGetServerInformation(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetServerInformationArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await serverService.getServerInformation(
        validation.data.name
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return BaseResponseFormatter.formatSuccess(result.data);
}
