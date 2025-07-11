/**
 * @fileoverview OpenAPIレスポンスフォーマッター
 * @description OpenAPIツールのレスポンスを統一フォーマットで整形するクラス
 * @since 1.0.0
 */

import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseResponseFormatter } from "@/tools/tool-libs/utils/index.js";

/**
 * OpenAPIレスポンス整形サービス
 * @description OpenAPIツールのレスポンスをMCPツール形式に統一して整形するクラス
 *
 * @example
 * ```typescript
 * // OpenAPI一覧の整形
 * const listResult = OpenAPIResponseFormatter.formatOpenAPIList({
 *   "petstore": { title: "Pet Store", summary: "ペットストア", version: "1.0.0" }
 * });
 *
 * // サーバー情報設定結果の整形
 * const setResult = OpenAPIResponseFormatter.formatSetServerInfo({
 *   status: "success",
 *   message: "OpenAPIファイルを正常に読み込みました"
 * });
 * ```
 *
 * @extends BaseResponseFormatter
 * @since 1.0.0
 */
export class OpenAPIResponseFormatter extends BaseResponseFormatter {
    /**
     * OpenAPI一覧のレスポンスを整形
     * @description OpenAPIファイル情報を標準的なCallToolResult形式に整形する
     *
     * @param {object} openAPIFiles - OpenAPIファイル情報のマップ
     * @param {string} openAPIFiles[].title - APIタイトル
     * @param {string} openAPIFiles[].summary - API概要
     * @param {string} openAPIFiles[].version - APIバージョン
     * @returns {CallToolResult} 整形されたCallToolResult
     *
     * @example
     * ```typescript
     * const result = OpenAPIResponseFormatter.formatOpenAPIList({
     *   "petstore": {
     *     title: "Swagger Petstore",
     *     summary: "ペットストアAPI",
     *     version: "1.0.0"
     *   },
     *   "user-api": {
     *     title: "User Management API",
     *     summary: "ユーザー管理API",
     *     version: "2.1.0"
     *   }
     * });
     *
     * console.log(result.content[0].text); // JSON形式の文字列
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatOpenAPIList(openAPIFiles: {
        [key: string]: {
            title: string;
            summary: string;
            version: string;
        };
    }): CallToolResult {
        const result = { openapi_files: openAPIFiles };
        return BaseResponseFormatter.formatSuccess(result);
    }

    /**
     * サーバー情報設定のレスポンスを整形
     * @description サーバー情報設定の結果を標準的なCallToolResult形式に整形する
     *
     * @param {object} serverInfo - サーバー情報設定の結果
     * @param {string} serverInfo.status - 処理ステータス（"success" | "error"）
     * @param {string} serverInfo.message - 処理結果メッセージ
     * @returns {CallToolResult} 整形されたCallToolResult
     *
     * @example
     * ```typescript
     * const result = OpenAPIResponseFormatter.formatSetServerInfo({
     *   status: "success",
     *   message: "3個のOpenAPIファイルを正常に読み込みました。\n読み込まれたファイル: petstore, user-api, admin-api"
     * });
     *
     * console.log(result.content[0].text); // JSON形式の文字列
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatSetServerInfo(serverInfo: {
        status: string;
        message: string;
    }): CallToolResult {
        return BaseResponseFormatter.formatSuccess(serverInfo);
    }

    /**
     * 空のOpenAPI一覧のレスポンスを整形
     * @description OpenAPIファイルが見つからない場合の空一覧レスポンスを整形する
     *
     * @returns {CallToolResult} 空のOpenAPI一覧を表すCallToolResult
     *
     * @example
     * ```typescript
     * const result = OpenAPIResponseFormatter.formatEmptyOpenAPIList();
     * console.log(result.content[0].text); // '{"openapi_files":{}}'
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatEmptyOpenAPIList(): CallToolResult {
        const result = { openapi_files: {} };
        return BaseResponseFormatter.formatSuccess(result);
    }
}
