/**
 * @fileoverview セキュリティツールバリデーション
 * @description セキュリティツールの引数バリデーション機能を提供
 * @since 1.0.0
 */

import { z } from "zod";
import { validateArgs } from "../tool-libs/core/index.js";
import {
    openAPINameSchema,
    securitySchemeNameSchema,
} from "../shared/validation-schemas.js";

/**
 * List Security Schemes用のバリデーションスキーマ
 * @description セキュリティスキーム一覧取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(ListSecuritySchemesArgsSchema, {
 *   name: "petstore"
 * });
 *
 * if (validation.success) {
 *   console.log("OpenAPI名:", validation.data.name);
 * }
 * ```
 */
export const ListSecuritySchemesArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: openAPINameSchema,
});

/**
 * Get Security Scheme Information用のバリデーションスキーマ
 * @description セキュリティスキーム情報取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(GetSecuritySchemeInfoArgsSchema, {
 *   name: "petstore",
 *   schemeName: "api_key"
 * });
 *
 * if (validation.success) {
 *   console.log("スキーム名:", validation.data.schemeName);
 * }
 * ```
 */
export const GetSecuritySchemeInfoArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: openAPINameSchema,
    /** 取得対象のセキュリティスキーム名 */
    schemeName: securitySchemeNameSchema,
});

/**
 * 共通実装から関数を再エクスポート
 * @description tool-libs/core からインポートした関数を他のモジュールで使用可能にする
 */
export { validateArgs };
