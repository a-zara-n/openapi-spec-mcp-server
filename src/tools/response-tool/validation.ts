/**
 * @fileoverview レスポンスツールバリデーション
 * @description レスポンスツールの引数バリデーション機能を提供
 * @since 1.0.0
 */

import { z } from "zod";
import { validateArgs } from "../tool-libs/core/index.js";
import {
    openAPINameSchema,
    responseNameSchema,
} from "../shared/validation-schemas.js";

/**
 * List Responses用のバリデーションスキーマ
 * @description レスポンス一覧取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(ListResponsesArgsSchema, {
 *   name: "petstore"
 * });
 *
 * if (validation.success) {
 *   console.log("OpenAPI名:", validation.data.name);
 * }
 * ```
 */
export const ListResponsesArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: openAPINameSchema,
});

/**
 * Get Response Information用のバリデーションスキーマ
 * @description レスポンス情報取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(GetResponseInformationArgsSchema, {
 *   name: "petstore",
 *   responseName: "200"
 * });
 *
 * if (validation.success) {
 *   console.log("レスポンス名:", validation.data.responseName);
 * }
 * ```
 */
export const GetResponseInformationArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: openAPINameSchema,
    /** 取得対象のレスポンス名 */
    responseName: responseNameSchema,
});

/**
 * Get Response Info用の正式なスキーマ名（互換性のため）
 * @description 後方互換性を保つためのエイリアス
 */
export const GetResponseInfoArgsSchema = GetResponseInformationArgsSchema;

/**
 * 共通実装から関数を再エクスポート
 * @description tool-libs/core からインポートした関数を他のモジュールで使用可能にする
 */
export { validateArgs };
