/**
 * @fileoverview サーバーツールバリデーション
 * @description サーバーツールの引数バリデーション機能を提供
 * @since 1.0.0
 */

import { z } from "zod";
import { validateArgs } from "../tool-libs/core/index.js";
import { openAPINameSchema } from "../shared/validation-schemas.js";

/**
 * List Application Servers用のバリデーションスキーマ
 * @description アプリケーションサーバー一覧取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(ListApplicationServersArgsSchema, {
 *   name: "petstore"
 * });
 *
 * if (validation.success) {
 *   console.log("OpenAPI名:", validation.data.name);
 * } else {
 *   console.error("エラー:", validation.error);
 * }
 * ```
 */
export const ListApplicationServersArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: openAPINameSchema,
});

/**
 * Get Server Information用のバリデーションスキーマ
 * @description サーバー情報取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(GetServerInformationArgsSchema, {
 *   name: "petstore",
 *   serverUrl: "https://api.petstore.com"
 * });
 *
 * if (validation.success) {
 *   console.log("OpenAPI名:", validation.data.name);
 *   console.log("サーバーURL:", validation.data.serverUrl);
 * }
 * ```
 */
export const GetServerInformationArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: openAPINameSchema,
    /** 取得対象のサーバーURL */
    serverUrl: z.string().min(1, "サーバーURLは必須です"),
});

/**
 * 共通実装から関数を再エクスポート
 * @description tool-libs/core からインポートした関数を他のモジュールで使用可能にする
 */
export { validateArgs };
