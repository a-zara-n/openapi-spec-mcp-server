/**
 * @fileoverview 共有バリデーションスキーマ
 * @description 複数のツールで共通して使用されるバリデーションスキーマを提供
 * @since 1.0.0
 */

import { z } from "zod";

/**
 * OpenAPI名のバリデーションスキーマ
 * @description OpenAPI仕様名の形式を検証するスキーマ
 *
 * @example
 * ```typescript
 * const result = openAPINameSchema.safeParse("petstore");
 * if (result.success) {
 *   console.log("有効なOpenAPI名:", result.data);
 * }
 * ```
 */
export const openAPINameSchema = z
    .string()
    .min(1, "OpenAPI名は必須です")
    .regex(
        /^[a-zA-Z0-9_-]+$/,
        "OpenAPI名は英数字、ハイフン、アンダースコアのみ使用可能です"
    );

/**
 * ファイルパスのバリデーションスキーマ
 * @description ファイルパスの形式を検証するスキーマ
 *
 * @example
 * ```typescript
 * const result = pathSchema.safeParse("./openapi/petstore.yaml");
 * if (result.success) {
 *   console.log("有効なパス:", result.data);
 * }
 * ```
 */
export const pathSchema = z
    .string()
    .min(1, "パスは必須です")
    .refine((path) => !path.includes(".."), "相対パス（..）は使用できません");

/**
 * スキーマ名のバリデーションスキーマ
 */
export const schemaNameSchema = z.string().min(1, "スキーマ名は必須です");

/**
 * レスポンス名のバリデーションスキーマ
 * @description レスポンス名（ステータスコードなど）の形式を検証するスキーマ
 *
 * @example
 * ```typescript
 * const result = responseNameSchema.safeParse("200");
 * if (result.success) {
 *   console.log("有効なレスポンス名:", result.data);
 * }
 * ```
 */
export const responseNameSchema = z.string().min(1, "レスポンス名は必須です");

/**
 * methodAndPathのバリデーションスキーマ
 */
export const methodAndPathSchema = z.string().min(1, "methodAndPathは必須です");

/**
 * セキュリティスキーム名のバリデーションスキーマ
 * @description セキュリティスキーム名の形式を検証するスキーマ
 *
 * @example
 * ```typescript
 * const result = securitySchemeNameSchema.safeParse("api_key");
 * if (result.success) {
 *   console.log("有効なセキュリティスキーム名:", result.data);
 * }
 * ```
 */
export const securitySchemeNameSchema = z
    .string()
    .min(1, "セキュリティスキーム名は必須です");
