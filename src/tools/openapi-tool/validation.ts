/**
 * @fileoverview OpenAPIツールバリデーション
 * @description OpenAPIツールの引数バリデーション機能を提供
 * @since 1.0.0
 */

import { z } from "zod";
import { validateArgs, ValidationResult } from "../tool-libs/core/index.js";
import { pathSchema } from "../shared/validation-schemas.js";

/**
 * List OpenAPIs用のバリデーションスキーマ
 * @description OpenAPI一覧取得の引数を検証するスキーマ（引数なし）
 *
 * @example
 * ```typescript
 * const validation = validateArgs(ListOpenAPIsArgsSchema, {});
 * if (validation.success) {
 *   console.log("バリデーション成功:", validation.data);
 * }
 * ```
 */
export const ListOpenAPIsArgsSchema = z.object({});

/**
 * Set Server Info用のバリデーションスキーマ
 * @description サーバー情報設定の引数を検証するスキーマ
 *
 * @example
 * ```typescript
 * const validation = validateArgs(SetServerInfoArgsSchema, {
 *   path: "./openapi/petstore.yaml"
 * });
 *
 * if (validation.success) {
 *   console.log("パス:", validation.data.path);
 * } else {
 *   console.error("エラー:", validation.error);
 * }
 * ```
 */
export const SetServerInfoArgsSchema = z.object({
    /** OpenAPIファイルまたはディレクトリのパス */
    path: pathSchema,
});

/**
 * 共通実装から関数を再エクスポート
 * @description tool-libs/core からインポートした関数を他のモジュールで使用可能にする
 */
export { validateArgs };
