/**
 * @fileoverview ベースレスポンスフォーマッター
 * @description 全ツール共通のレスポンス整形機能を提供する基底クラス
 * @since 1.0.0
 */

import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * ベースレスポンス整形クラス
 * @description MCPツールの標準的なレスポンス形式への整形機能を提供する基底クラス
 *
 * @example
 * ```typescript
 * // 成功レスポンスの生成
 * const successResult = BaseResponseFormatter.formatSuccess({
 *   message: "処理が成功しました",
 *   data: { id: 1, name: "example" }
 * });
 *
 * // エラーレスポンスの生成
 * const errorResult = BaseResponseFormatter.formatError("エラーが発生しました");
 *
 * // バリデーションエラーレスポンスの生成
 * const validationResult = BaseResponseFormatter.formatValidationError(
 *   "name: 必須フィールドが不足しています"
 * );
 * ```
 *
 * @abstract
 * @since 1.0.0
 */
export abstract class BaseResponseFormatter {
    /**
     * 成功レスポンスを整形
     * @description 成功時のデータを標準的なCallToolResult形式に整形する
     *
     * @param {any} data - 成功時のレスポンスデータ
     * @returns {CallToolResult} 整形されたCallToolResult
     *
     * @example
     * ```typescript
     * const result = BaseResponseFormatter.formatSuccess({
     *   users: [
     *     { id: 1, name: "Alice" },
     *     { id: 2, name: "Bob" }
     *   ],
     *   total: 2
     * });
     *
     * // 結果:
     * // {
     * //   content: [{
     * //     type: "text",
     * //     text: '{"users":[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}],"total":2}'
     * //   }]
     * // }
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatSuccess(data: any): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }

    /**
     * エラーレスポンスを整形
     * @description エラー時のメッセージを標準的なCallToolResult形式に整形する
     *
     * @param {string} message - エラーメッセージ
     * @returns {CallToolResult} 整形されたCallToolResult
     *
     * @example
     * ```typescript
     * const result = BaseResponseFormatter.formatError("データベース接続エラーが発生しました");
     *
     * // 結果:
     * // {
     * //   content: [{
     * //     type: "text",
     * //     text: '{"error":"データベース接続エラーが発生しました"}'
     * //   }],
     * //   isError: true
     * // }
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatError(message: string): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({ error: message }, null, 2),
                },
            ],
            isError: true,
        };
    }

    /**
     * バリデーションエラーレスポンスを整形
     * @description バリデーションエラー時のメッセージを標準的なCallToolResult形式に整形する
     *
     * @param {string} message - バリデーションエラーメッセージ
     * @returns {CallToolResult} 整形されたCallToolResult
     *
     * @example
     * ```typescript
     * const result = BaseResponseFormatter.formatValidationError(
     *   "name: 必須フィールドです, age: 0以上の値を指定してください"
     * );
     *
     * // 結果:
     * // {
     * //   content: [{
     * //     type: "text",
     * //     text: '{"validation_error":"name: 必須フィールドです, age: 0以上の値を指定してください"}'
     * //   }],
     * //   isError: true
     * // }
     * ```
     *
     * @static
     * @since 1.0.0
     */
    static formatValidationError(message: string): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(
                        { validation_error: message },
                        null,
                        2
                    ),
                },
            ],
            isError: true,
        };
    }
}
