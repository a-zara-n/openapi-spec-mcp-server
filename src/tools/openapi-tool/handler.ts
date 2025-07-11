/**
 * @fileoverview OpenAPIツールハンドラー
 * @description OpenAPI仕様の基本操作（リスト取得、サーバー情報設定）を処理するハンドラー
 * @since 1.0.0
 */

import type {
    CallToolRequest,
    CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import {
    ListOpenAPIsArgsSchema,
    SetServerInfoArgsSchema,
    validateArgs,
} from "./validation.js";
import { OpenAPIBusinessLogicService } from "./services/openapi-business-logic.js";
import { OpenAPIResponseFormatter } from "./formatters/response-formatter.js";
import { BaseResponseFormatter } from "../tool-libs/utils/index.js";

/**
 * ビジネスロジックサービスのインスタンス
 * @description OpenAPI仕様の基本操作を処理するサービス
 */
const businessLogicService = new OpenAPIBusinessLogicService();

/**
 * OpenAPI一覧取得ハンドラー
 * @description 登録されている全てのOpenAPI仕様の一覧を取得する
 *
 * @param {CallToolRequest} request - ツール実行リクエスト
 * @returns {Promise<CallToolResult>} OpenAPI仕様一覧の取得結果
 *
 * @throws {Error} バリデーションエラーまたはビジネスロジックエラーが発生した場合
 *
 * @example
 * ```typescript
 * const request: CallToolRequest = {
 *   params: {
 *     name: 'mcp_openapi_list_openapis',
 *     arguments: {}
 *   }
 * };
 *
 * const result = await handleListOpenAPIs(request);
 * if (result.isError) {
 *   console.error('エラー:', result.content[0].text);
 * } else {
 *   console.log('成功:', result.content[0].text);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function handleListOpenAPIs(
    request: CallToolRequest
): Promise<CallToolResult> {
    const startTime = Date.now();
    const handlerId = Math.random().toString(36).substring(2, 8);

    console.log(`📋 === OpenAPI List Handler [${handlerId}] ===`);
    console.log(`🕐 Handler実行開始時刻: ${new Date().toISOString()}`);
    console.log(`🔧 実行ツール: ${request.params.name}`);

    try {
        // リクエスト引数のバリデーション
        console.log(`🔍 引数バリデーション実行中...`);
        const validation = validateArgs(
            ListOpenAPIsArgsSchema,
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

        // ビジネスロジックの実行
        console.log(`🚀 ビジネスロジック実行開始...`);
        console.log(`   📊 対象: 全OpenAPI仕様一覧取得`);

        const result = await businessLogicService.getOpenAPIList();
        const processingTime = Date.now() - startTime;

        if (!result.success) {
            console.error(`💥 ビジネスロジックエラー [${handlerId}]:`);
            console.error(`   📝 エラー: ${result.error}`);
            console.error(`   ⏱️ 失敗までの時間: ${processingTime}ms`);
            return BaseResponseFormatter.formatError(result.error);
        }

        // 成功結果の詳細ログ
        const openApiCount = Object.keys(result.data.openapi_files).length;
        console.log(`📈 ビジネスロジック実行完了 [${handlerId}]:`);
        console.log(`   ✅ ステータス: 成功`);
        console.log(`   📊 取得したOpenAPI数: ${openApiCount}個`);
        console.log(`   ⏱️ 処理時間: ${processingTime}ms`);

        if (openApiCount > 0) {
            console.log(`   📋 OpenAPI一覧:`);
            Object.entries(result.data.openapi_files).forEach(
                ([name, info], index) => {
                    console.log(
                        `      ${index + 1}. 📄 ${name}: ${info.title} v${
                            info.version
                        }`
                    );
                    if (info.summary) {
                        console.log(
                            `         📝 概要: ${info.summary.substring(
                                0,
                                80
                            )}${info.summary.length > 80 ? "..." : ""}`
                        );
                    }
                }
            );
        }

        // 成功レスポンスの生成
        console.log(`🎯 レスポンス生成中...`);
        const response = OpenAPIResponseFormatter.formatOpenAPIList(
            result.data.openapi_files
        );

        console.log(
            `🎉 OpenAPI List Handler完了 [${handlerId}]: ${processingTime}ms`
        );
        return response;
    } catch (error) {
        // 予期しないエラーの処理
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
            `OpenAPI一覧の取得中にエラーが発生しました: ${
                error instanceof Error ? error.message : "不明なエラー"
            }`
        );
    }
}

/**
 * サーバー情報設定ハンドラー
 * @description OpenAPI仕様ファイルを読み込み、サーバー情報を設定する
 *
 * @param {CallToolRequest} request - ツール実行リクエスト
 * @param {string} request.params.arguments.path - OpenAPI仕様ファイルのパス
 * @returns {Promise<CallToolResult>} サーバー情報設定の実行結果
 *
 * @throws {Error} バリデーションエラー、ファイル読み込みエラー、またはビジネスロジックエラーが発生した場合
 *
 * @example
 * ```typescript
 * const request: CallToolRequest = {
 *   params: {
 *     name: 'openapi_set_server_info',
 *     arguments: {
 *       path: './openapi/petstore.yaml'
 *     }
 *   }
 * };
 *
 * const result = await handleSetServerInfo(request);
 * if (result.isError) {
 *   console.error('設定エラー:', result.content[0].text);
 * } else {
 *   console.log('設定成功:', result.content[0].text);
 * }
 * ```
 *
 * @since 1.0.0
 */
export async function handleSetServerInfo(
    request: CallToolRequest
): Promise<CallToolResult> {
    try {
        // リクエスト引数のバリデーション
        const validation = validateArgs(
            SetServerInfoArgsSchema,
            request.params.arguments
        );
        if (!validation.success) {
            return BaseResponseFormatter.formatValidationError(
                validation.error
            );
        }

        const { path } = validation.data;
        console.log("path", path);

        // ビジネスロジックの実行
        const result = await businessLogicService.setServerInfo(path);
        if (!result.success) {
            return BaseResponseFormatter.formatError(result.error);
        }

        // 成功レスポンスの生成
        return OpenAPIResponseFormatter.formatSetServerInfo(result.data);
    } catch (error) {
        // 予期しないエラーの処理
        return BaseResponseFormatter.formatError(
            `サーバー情報の設定中にエラーが発生しました: ${
                error instanceof Error ? error.message : "不明なエラー"
            }`
        );
    }
}
