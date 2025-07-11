/**
 * @fileoverview コア機能統合エクスポートファイル
 * @description tool-libsのコア機能（データベース、DI、バリデーション）を統合してエクスポート
 * @since 1.0.0
 */

/**
 * バリデーション結果の型定義
 * @description バリデーション処理の結果を表現する型（循環参照を避けるため直接定義）
 *
 * @template T - バリデーション対象のデータ型
 *
 * @example
 * ```typescript
 * // 成功時の例
 * const successResult: ValidationResult<string> = {
 *   success: true,
 *   data: "validation passed"
 * };
 *
 * // 失敗時の例
 * const errorResult: ValidationResult<string> = {
 *   success: false,
 *   error: "validation failed: required field missing"
 * };
 * ```
 */
export type ValidationResult<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: string;
      };

// データベース関連のエクスポート
/**
 * @description データベース管理機能をエクスポート
 * @see {@link DatabaseManager} SQLiteデータベース管理クラス
 * @see {@link SQLiteDatabaseConnection} SQLite接続クラス
 */
export { DatabaseManager, SQLiteDatabaseConnection } from "./database/index.js";

// DI関連のエクスポート
/**
 * @description 依存性注入コンテナ機能をエクスポート
 * @see {@link DIContainer} 依存性注入コンテナクラス
 * @see {@link RepositoryFactory} リポジトリファクトリクラス
 * @see {@link DIContainerConfig} DI設定インターフェース
 */
export { DIContainer, RepositoryFactory } from "./di/index.js";
export type { DIContainerConfig } from "./di/index.js";

// バリデーション関連のエクスポート
/**
 * @description バリデーション機能をエクスポート
 * @see {@link validateArgs} 汎用バリデーション関数
 */
export { validateArgs } from "./validation/index.js";
