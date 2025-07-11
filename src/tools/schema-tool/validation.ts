/**
 * @fileoverview スキーマツールバリデーション
 * @description スキーマツールの引数バリデーション機能を提供
 * @since 1.0.0
 */

import { z } from "zod";
import { validateArgs } from "../tool-libs/core/index.js";

/**
 * Get Schema List用のバリデーションスキーマ
 * @description スキーマ一覧取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(GetSchemaListArgsSchema, {
 *   name: "petstore"
 * });
 *
 * if (validation.success) {
 *   console.log("OpenAPI名:", validation.data.name);
 * }
 * ```
 */
export const GetSchemaListArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
});

/**
 * Get Schema Information用のバリデーションスキーマ
 * @description スキーマ情報取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(GetSchemaInfoArgsSchema, {
 *   name: "petstore",
 *   schemaName: "Pet"
 * });
 *
 * if (validation.success) {
 *   console.log("スキーマ名:", validation.data.schemaName);
 * }
 * ```
 */
export const GetSchemaInfoArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** 取得対象のスキーマ名 */
    schemaName: z.string().min(1, "スキーマ名は必須です"),
});

/**
 * Get Schema Definition用のバリデーションスキーマ
 * @description スキーマ定義取得の引数を検証するスキーマ
 */
export const GetSchemaDefinitionArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** 取得対象のスキーマ名 */
    schemaName: z.string().min(1, "スキーマ名は必須です"),
});

/**
 * Get Schema Properties用のバリデーションスキーマ
 * @description スキーマプロパティ取得の引数を検証するスキーマ
 */
export const GetSchemaPropertiesArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** 取得対象のスキーマ名 */
    schemaName: z.string().min(1, "スキーマ名は必須です"),
});

/**
 * 共通実装から関数を再エクスポート
 * @description tool-libs/core からインポートした関数を他のモジュールで使用可能にする
 */
export { validateArgs };
