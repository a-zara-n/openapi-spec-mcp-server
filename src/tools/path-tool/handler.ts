/**
 * @fileoverview パスツールハンドラー
 * @description OpenAPI仕様のパス情報管理を処理するハンドラー
 * @since 1.0.0
 */

import type {
    CallToolRequest,
    CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import {
    validateArgs,
    ListPathsArgsSchema,
    GetPathInfoArgsSchema,
    GetPathParametersArgsSchema,
    GetPathResponsesArgsSchema,
    GetPathRequestBodyArgsSchema,
    GetPathDescribeArgsSchema,
} from "./validation.js";
import { PathBusinessLogicService } from "./services/path-business-logic.js";
import { ResponseFormatter } from "./formatters/response-formatter.js";
import { BaseResponseFormatter } from "../tool-libs/utils/index.js";

/**
 * ビジネスロジックサービスのインスタンス
 * @description パス情報の処理を担当するサービス
 */
const pathService = new PathBusinessLogicService();

/**
 * パス一覧取得ハンドラー
 * @description 指定されたOpenAPI仕様に定義されているパス一覧を取得する
 *
 * @param {CallToolRequest} request - ツール実行リクエスト
 * @param {string} request.params.arguments.name - OpenAPI仕様名
 * @returns {Promise<CallToolResult>} パス一覧の取得結果
 *
 * @throws {Error} バリデーションエラーまたはビジネスロジックエラーが発生した場合
 *
 * @example
 * ```typescript
 * const request: CallToolRequest = {
 *   params: {
 *     name: 'mcp_openapi_list_paths',
 *     arguments: { name: 'petstore' }
 *   }
 * };
 *
 * const result = await handleListPaths(request);
 * if (result.isError) {
 *   console.error('エラー:', result.content[0].text);
 * } else {
 *   console.log('パス一覧:', result.content[0].text);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function handleListPaths(
    request: CallToolRequest
): Promise<CallToolResult> {
    const startTime = Date.now();
    const handlerId = Math.random().toString(36).substring(2, 8);

    console.log(`🛣️ === Path List Handler [${handlerId}] ===`);
    console.log(`🕐 Handler実行開始時刻: ${new Date().toISOString()}`);
    console.log(`🔧 実行ツール: ${request.params.name}`);

    try {
        // 引数の検証
        console.log(`🔍 引数バリデーション実行中...`);
        console.log(`   📋 引数: ${JSON.stringify(request.params.arguments)}`);

        const validation = validateArgs(
            ListPathsArgsSchema,
            request.params.arguments
        );

        if (!validation.success) {
            console.error(
                `❌ バリデーションエラー [${handlerId}]:`,
                validation.error
            );
            console.error(`   📝 エラー詳細: ${validation.error}`);
            return BaseResponseFormatter.formatValidationError(
                validation.error
            );
        }

        console.log(`✅ 引数バリデーション完了`);
        console.log(`   🎯 対象OpenAPI: ${validation.data.name}`);

        // ビジネスロジック実行
        console.log(`🚀 ビジネスロジック実行開始...`);
        console.log(`   📊 対象: ${validation.data.name} のパス一覧取得`);

        const result = await pathService.getPathList(validation.data.name);
        const processingTime = Date.now() - startTime;

        if (!result.success) {
            console.error(`💥 ビジネスロジックエラー [${handlerId}]:`);
            console.error(`   📝 エラー: ${result.error}`);
            console.error(`   🎯 対象OpenAPI: ${validation.data.name}`);
            console.error(`   ⏱️ 失敗までの時間: ${processingTime}ms`);
            return BaseResponseFormatter.formatError(result.error);
        }

        // 成功結果の詳細ログ
        const pathCount = result.data.methodAndPaths.length;
        console.log(`📈 ビジネスロジック実行完了 [${handlerId}]:`);
        console.log(`   ✅ ステータス: 成功`);
        console.log(`   🎯 対象OpenAPI: ${validation.data.name}`);
        console.log(`   📊 取得したパス数: ${pathCount}個`);
        console.log(`   ⏱️ 処理時間: ${processingTime}ms`);

        if (pathCount > 0) {
            console.log(`   🛣️ パス一覧:`);
            result.data.methodAndPaths.forEach((pathInfo, index) => {
                console.log(
                    `      ${index + 1}. ${pathInfo.method.toUpperCase()} ${
                        pathInfo.path
                    }`
                );
            });
        } else {
            console.log(`   📝 注意: パスが見つかりませんでした`);
        }

        // レスポンス生成
        console.log(`🎯 レスポンス生成中...`);
        const response = ResponseFormatter.formatPathList(
            result.data.methodAndPaths
        );

        console.log(
            `🎉 Path List Handler完了 [${handlerId}]: ${processingTime}ms`
        );
        return response;
    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`💥 予期しないエラー [${handlerId}]:`);
        console.error(
            `   🚨 エラータイプ: ${
                error instanceof Error ? error.name : "UnknownError"
            }`
        );
        console.error(
            `   📝 エラーメッセージ: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
        console.error(`   ⏱️ 失敗までの時間: ${processingTime}ms`);

        if (error instanceof Error && error.stack) {
            console.error(
                `   📚 スタックトレース: ${error.stack
                    .split("\n")
                    .slice(0, 2)
                    .join(" | ")}`
            );
        }

        return BaseResponseFormatter.formatError(
            `パス一覧の取得中にエラーが発生しました: ${
                error instanceof Error ? error.message : "不明なエラー"
            }`
        );
    }
}

/**
 * Get Path Information ハンドラー関数
 */
export async function handleGetPathInformation(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetPathInfoArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await pathService.getPathDetail(
        validation.data.name,
        validation.data.methodAndPath
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ResponseFormatter.formatPathDetail(result.data);
}

/**
 * Get Path Parameters ハンドラー関数
 */
export async function handleGetPathParameters(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetPathParametersArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await pathService.getPathParameters(
        validation.data.name,
        validation.data.methodAndPath
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ResponseFormatter.formatParameters(result.data.parameters);
}

/**
 * Get Path Responses ハンドラー関数
 */
export async function handleGetPathResponses(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetPathResponsesArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await pathService.getPathResponses(
        validation.data.name,
        validation.data.methodAndPath
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ResponseFormatter.formatResponses(result.data.responses);
}

/**
 * Get Path Request Body ハンドラー関数
 */
export async function handleGetPathRequestBody(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetPathRequestBodyArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await pathService.getPathRequestBody(
        validation.data.name,
        validation.data.methodAndPath
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ResponseFormatter.formatRequestBody(result.data);
}

/**
 * Get Path Describe ハンドラー関数
 */
export async function handleGetPathDescribe(
    request: CallToolRequest
): Promise<CallToolResult> {
    // 引数の検証
    const validation = validateArgs(
        GetPathDescribeArgsSchema,
        request.params.arguments
    );
    if (!validation.success) {
        return BaseResponseFormatter.formatValidationError(validation.error);
    }

    // ビジネスロジック実行
    const result = await pathService.getPathDescription(
        validation.data.name,
        validation.data.methodAndPath
    );
    if (!result.success) {
        return BaseResponseFormatter.formatError(result.error);
    }

    // レスポンス整形
    return ResponseFormatter.formatPathDescription(result.data);
}
