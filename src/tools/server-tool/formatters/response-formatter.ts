/**
 * @fileoverview サーバーレスポンスフォーマッター
 * @description サーバーツールのレスポンスを統一フォーマットで整形するクラス
 * @since 1.0.0
 */

import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseResponseFormatter } from "../../tool-libs/utils/index.js";

/**
 * サーバーレスポンス整形サービス
 * @description サーバーツールのレスポンスをMCPツール形式に統一して整形するクラス
 *
 * @example
 * ```typescript
 * // サーバー一覧の整形
 * const listResult = ServerResponseFormatter.formatServerList([
 *   { url: "https://api.example.com", description: "本番環境" }
 * ]);
 *
 * // サーバー情報の整形
 * const infoResult = ServerResponseFormatter.formatServerInformation({
 *   url: "https://api.example.com",
 *   description: "本番環境",
 *   variables: {}
 * });
 * ```
 *
 * @extends BaseResponseFormatter
 * @since 1.0.0
 */
export class ServerResponseFormatter extends BaseResponseFormatter {
    /**
     * サーバー一覧のレスポンスを整形
     * @description サーバー一覧を標準的なCallToolResult形式に整形する
     *
     * @param {Array<object>} servers - サーバー情報の配列
     * @param {string} servers[].url - サーバーURL
     * @param {string} [servers[].description] - サーバー説明
     * @returns {CallToolResult} 整形されたCallToolResult
     *
     * @example
     * ```typescript
     * const result = ServerResponseFormatter.formatServerList([
     *   {
     *     url: "https://api.petstore.com",
     *     description: "本番環境サーバー"
     *   },
     *   {
     *     url: "https://dev-api.petstore.com",
     *     description: "開発環境サーバー"
     *   }
     * ]);
     *
     * console.log(result.content[0].text); // JSON形式の文字列
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatServerList(
        servers: Array<{
            url: string;
            description?: string;
        }>
    ): CallToolResult {
        return BaseResponseFormatter.formatSuccess({ servers });
    }

    /**
     * サーバー情報のレスポンスを整形
     * @description 特定サーバーの詳細情報を標準的なCallToolResult形式に整形する
     *
     * @param {object} serverInfo - サーバー詳細情報
     * @param {string} serverInfo.url - サーバーURL
     * @param {string} [serverInfo.description] - サーバー説明
     * @param {object} [serverInfo.variables] - サーバー変数
     * @returns {CallToolResult} 整形されたCallToolResult
     *
     * @example
     * ```typescript
     * const result = ServerResponseFormatter.formatServerInformation({
     *   url: "https://{environment}.petstore.com",
     *   description: "動的環境サーバー",
     *   variables: {
     *     environment: {
     *       default: "api",
     *       enum: ["api", "dev", "staging"]
     *     }
     *   }
     * });
     *
     * console.log(result.content[0].text); // JSON形式の文字列
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatServerInformation(serverInfo: {
        url: string;
        description?: string;
        variables?: any;
    }): CallToolResult {
        return BaseResponseFormatter.formatSuccess(serverInfo);
    }
}
