/**
 * @fileoverview パスツールバリデーション
 * @description パスツールの引数バリデーション機能を提供
 * @since 1.0.0
 */

import { z } from "zod";
import { validateArgs } from "../tool-libs/core/index.js";

/**
 * List Paths用のバリデーションスキーマ
 * @description パス一覧取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(ListPathsArgsSchema, {
 *   name: "petstore"
 * });
 *
 * if (validation.success) {
 *   console.log("OpenAPI名:", validation.data.name);
 * }
 * ```
 */
export const ListPathsArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
});

/**
 * Get Path Information用のバリデーションスキーマ
 * @description パス情報取得の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(GetPathInfoArgsSchema, {
 *   name: "petstore",
 *   methodAndPath: "GET /pets"
 * });
 * ```
 */
export const GetPathInfoArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** HTTPメソッドとパスの組み合わせ（例: "GET /pets"） */
    methodAndPath: z.string().min(1, "methodAndPathは必須です"),
});

/**
 * Get Path Parameters用のバリデーションスキーマ
 * @description パスパラメータ情報取得の引数を検証するスキーマ
 */
export const GetPathParametersArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** HTTPメソッドとパスの組み合わせ */
    methodAndPath: z.string().min(1, "methodAndPathは必須です"),
});

/**
 * Get Path Responses用のバリデーションスキーマ
 * @description パスレスポンス情報取得の引数を検証するスキーマ
 */
export const GetPathResponsesArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** HTTPメソッドとパスの組み合わせ */
    methodAndPath: z.string().min(1, "methodAndPathは必須です"),
});

/**
 * Get Path Request Body用のバリデーションスキーマ
 * @description パスリクエストボディ情報取得の引数を検証するスキーマ
 */
export const GetPathRequestBodyArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** HTTPメソッドとパスの組み合わせ */
    methodAndPath: z.string().min(1, "methodAndPathは必須です"),
});

/**
 * Get Path Describe用のバリデーションスキーマ
 * @description パス説明取得の引数を検証するスキーマ
 */
export const GetPathDescribeArgsSchema = z.object({
    /** 対象のOpenAPI仕様名 */
    name: z.string().min(1, "OpenAPI名は必須です"),
    /** HTTPメソッドとパスの組み合わせ */
    methodAndPath: z.string().min(1, "methodAndPathは必須です"),
});

/**
 * 共通実装から関数を再エクスポート
 * @description tool-libs/core からインポートした関数を他のモジュールで使用可能にする
 */
export { validateArgs };
