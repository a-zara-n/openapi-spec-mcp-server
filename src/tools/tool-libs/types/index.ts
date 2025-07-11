/**
 * @fileoverview tool-libs 統合型定義ファイル
 * @description tool-libs内の全ての型定義とインターフェースを集約
 * @version 1.0.0
 * @since 1.0.0
 */

// =============================================================================
// 基盤型（共通利用される型）
// =============================================================================

/**
 * 汎用結果型
 * @description 成功または失敗の状態を表現する汎用的な型
 *
 * @template T - 成功時のデータ型
 *
 * @example
 * ```typescript
 * // 成功時の例
 * const success: Result<string> = {
 *   success: true,
 *   data: "処理が成功しました"
 * };
 *
 * // 失敗時の例
 * const failure: Result<string> = {
 *   success: false,
 *   error: "処理が失敗しました"
 * };
 * ```
 */
export type Result<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: string;
      };

/**
 * ビジネスロジックの結果型
 * @description 全てのビジネスロジックサービスで共通して使用される結果型
 *
 * @template T - 成功時のデータ型
 * @see {@link Result} 基底となる結果型
 */
export type BusinessLogicResult<T> = Result<T>;

/**
 * バリデーション結果の型
 * @description バリデーション処理の結果を表現する型
 *
 * @template T - バリデーション対象のデータ型
 * @see {@link Result} 基底となる結果型
 */
export type ValidationResult<T> = Result<T>;

// =============================================================================
// データベース関連型
// =============================================================================

/**
 * データベース接続インターフェース
 * @description データベースへの基本的な操作を定義するインターフェース
 *
 * @example
 * ```typescript
 * class MyDatabaseConnection implements IDatabaseConnection {
 *   exec(sql: string): void {
 *     // SQL実行処理
 *   }
 *
 *   prepare(sql: string) {
 *     // プリペアドステートメント作成
 *   }
 *
 *   close(): void {
 *     // 接続クローズ処理
 *   }
 * }
 * ```
 */
export interface IDatabaseConnection {
    /**
     * SQL文を実行
     * @param {string} sql - 実行するSQL文
     */
    exec(sql: string): void;

    /**
     * プリペアドステートメントを作成
     * @param {string} sql - プリペアドステートメント用のSQL文
     * @returns {any} プリペアドステートメントオブジェクト
     */
    prepare(sql: string): any;

    /**
     * データベース接続を閉じる
     */
    close(): void;
}

/**
 * データベース管理インターフェース
 * @description データベース管理機能を定義するインターフェース
 *
 * @example
 * ```typescript
 * class MyDatabaseManager implements IDatabaseManager {
 *   close(): void {
 *     // データベース管理終了処理
 *   }
 * }
 * ```
 */
export interface IDatabaseManager {
    /**
     * データベース管理を終了
     */
    close(): void;

    /**
     * データベース統計情報を取得（オプション）
     * @returns {any} 統計情報オブジェクト
     */
    getDatabaseStats?(): any;

    /**
     * データベースを再構築（オプション）
     */
    rebuildDatabase?(): void;
}

/**
 * DI設定インターフェース
 * @description 依存性注入コンテナの設定を定義するインターフェース
 *
 * @example
 * ```typescript
 * const config: IDependencyConfig = {
 *   dbPath: './data/openapi.db',
 *   enableLogging: true,
 *   enableIndexes: true,
 *   testMode: false
 * };
 * ```
 */
export interface IDependencyConfig {
    /**
     * データベースファイルのパス
     * @default ':memory:'
     */
    dbPath?: string;

    /**
     * ログ出力を有効にするか
     * @default false
     */
    enableLogging?: boolean;

    /**
     * データベースインデックスを有効にするか
     * @default true
     */
    enableIndexes?: boolean;

    /**
     * テストモードで動作するか
     * @default false
     */
    testMode?: boolean;
}

/**
 * DIコンテナ設定
 * @description 依存性注入コンテナの詳細設定を定義するインターフェース
 * @extends IDependencyConfig
 *
 * @example
 * ```typescript
 * const containerConfig: DIContainerConfig = {
 *   dbPath: './data/openapi.db',
 *   singleton: true,
 *   enableCache: true,
 *   enableLogging: true
 * };
 * ```
 */
export interface DIContainerConfig extends IDependencyConfig {
    /**
     * シングルトンパターンを使用するか
     * @default true
     */
    singleton?: boolean;

    /**
     * キャッシュを有効にするか
     * @default true
     */
    enableCache?: boolean;
}

// =============================================================================
// リポジトリインターフェース
// =============================================================================

/**
 * OpenAPIリポジトリインターフェース
 * @description OpenAPI仕様データの永続化操作を定義するインターフェース
 *
 * @example
 * ```typescript
 * class OpenAPIRepository implements IOpenAPIRepository {
 *   insertOrUpdateOpenAPI(record: OpenAPIRecord): number {
 *     // OpenAPI仕様を挿入または更新
 *     return 1;
 *   }
 *
 *   getAllOpenAPIs(): OpenAPIRecord[] {
 *     // 全OpenAPI仕様を取得
 *     return [];
 *   }
 * }
 * ```
 */
export interface IOpenAPIRepository {
    /**
     * OpenAPI仕様を挿入または更新
     * @param {any} record - OpenAPI仕様レコード
     * @returns {number} 挿入または更新されたレコードのID
     */
    insertOrUpdateOpenAPI(record: any): number;

    /**
     * 全てのOpenAPI仕様を取得
     * @returns {any[]} OpenAPI仕様の配列
     */
    getAllOpenAPIs(): any[];

    /**
     * 名前でOpenAPI仕様を取得
     * @param {string} name - OpenAPI仕様名
     * @returns {any | null} 該当するOpenAPI仕様、または見つからない場合はnull
     */
    getOpenAPIByName(name: string): any | null;

    /**
     * OpenAPI仕様データを削除
     * @param {number} openapiId - 削除するOpenAPI仕様のID
     */
    deleteOpenAPIData(openapiId: number): void;
}

/**
 * サーバーリポジトリインターフェース
 * @description サーバー情報の永続化操作を定義するインターフェース
 */
export interface IServerRepository {
    /**
     * サーバー情報を挿入
     * @param {any} record - サーバー情報レコード
     * @returns {number} 挿入されたレコードのID
     */
    insertServer(record: any): number;

    /**
     * OpenAPI IDでサーバー情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @returns {any[]} サーバー情報の配列
     */
    getServersByOpenAPIId(openapiId: number): any[];
}

/**
 * パスリポジトリインターフェース
 * @description パス情報の永続化操作を定義するインターフェース
 */
export interface IPathRepository {
    /**
     * パス情報を挿入
     * @param {any} record - パス情報レコード
     * @returns {number} 挿入されたレコードのID
     */
    insertPath(record: any): number;

    /**
     * OpenAPI IDでパス情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @returns {any[]} パス情報の配列
     */
    getPathsByOpenAPIId(openapiId: number): any[];

    /**
     * メソッドとパスで特定のパス情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @param {string} method - HTTPメソッド
     * @param {string} path - APIパス
     * @returns {any | null} 該当するパス情報、または見つからない場合はnull
     */
    getPathByMethodAndPath(
        openapiId: number,
        method: string,
        path: string
    ): any | null;
}

/**
 * スキーマリポジトリインターフェース
 * @description スキーマ情報の永続化操作を定義するインターフェース
 */
export interface ISchemaRepository {
    /**
     * スキーマ情報を挿入
     * @param {any} record - スキーマ情報レコード
     * @returns {number} 挿入されたレコードのID
     */
    insertSchema(record: any): number;

    /**
     * OpenAPI IDでスキーマ情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @returns {any[]} スキーマ情報の配列
     */
    getSchemasByOpenAPIId(openapiId: number): any[];

    /**
     * 名前で特定のスキーマ情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @param {string} name - スキーマ名
     * @returns {any | null} 該当するスキーマ情報、または見つからない場合はnull
     */
    getSchemaByName(openapiId: number, name: string): any | null;
}

/**
 * セキュリティリポジトリインターフェース
 * @description セキュリティスキーム情報の永続化操作を定義するインターフェース
 */
export interface ISecurityRepository {
    /**
     * セキュリティスキーム情報を挿入
     * @param {any} record - セキュリティスキーム情報レコード
     * @returns {number} 挿入されたレコードのID
     */
    insertSecurityScheme(record: any): number;

    /**
     * OpenAPI IDでセキュリティスキーム情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @returns {any[]} セキュリティスキーム情報の配列
     */
    getSecuritySchemesByOpenAPIId(openapiId: number): any[];

    /**
     * 名前で特定のセキュリティスキーム情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @param {string} name - セキュリティスキーム名
     * @returns {any | null} 該当するセキュリティスキーム情報、または見つからない場合はnull
     */
    getSecuritySchemeByName(openapiId: number, name: string): any | null;
}

/**
 * レスポンスリポジトリインターフェース
 * @description レスポンス情報の永続化操作を定義するインターフェース
 */
export interface IResponseRepository {
    /**
     * レスポンス情報を挿入
     * @param {any} record - レスポンス情報レコード
     * @returns {number} 挿入されたレコードのID
     */
    insertResponse(record: any): number;

    /**
     * OpenAPI IDでレスポンス情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @returns {any[]} レスポンス情報の配列
     */
    getResponsesByOpenAPIId(openapiId: number): any[];

    /**
     * 名前で特定のレスポンス情報を取得
     * @param {number} openapiId - OpenAPI仕様のID
     * @param {string} name - レスポンス名
     * @returns {any | null} 該当するレスポンス情報、または見つからない場合はnull
     */
    getResponseByName(openapiId: number, name: string): any | null;
}

// =============================================================================
// OpenAPI仕様関連型
// =============================================================================

/**
 * OpenAPIスペック型（標準構造）
 * @description OpenAPI 3.0仕様に基づく基本構造を定義
 *
 * @example
 * ```typescript
 * const spec: OpenAPISpec = {
 *   openapi: "3.0.0",
 *   info: {
 *     title: "Sample API",
 *     version: "1.0.0",
 *     description: "サンプルAPI"
 *   },
 *   servers: [
 *     {
 *       url: "https://api.example.com",
 *       description: "本番環境"
 *     }
 *   ]
 * };
 * ```
 */
export interface OpenAPISpec {
    /** OpenAPIバージョン */
    openapi: string;

    /** API情報 */
    info: {
        /** APIタイトル */
        title: string;
        /** APIバージョン */
        version: string;
        /** API概要（オプション） */
        summary?: string;
        /** API説明（オプション） */
        description?: string;
    };

    /** サーバー情報（オプション） */
    servers?: Array<{
        /** サーバーURL */
        url: string;
        /** サーバー説明（オプション） */
        description?: string;
    }>;

    /** パス定義（オプション） */
    paths?: Record<string, any>;

    /** コンポーネント定義（オプション） */
    components?: {
        /** スキーマ定義（オプション） */
        schemas?: Record<string, any>;
        /** セキュリティスキーム定義（オプション） */
        securitySchemes?: Record<string, any>;
        /** レスポンス定義（オプション） */
        responses?: Record<string, any>;
    };
}

// =============================================================================
// ファイル処理関連型
// =============================================================================

/**
 * ファイル読み込み結果
 */
export interface FileLoadResult {
    success: boolean;
    content?: string;
    name?: string;
    source: string;
    message: string;
}

/**
 * URL読み込み結果
 */
export interface URLLoadResult {
    success: boolean;
    content?: string;
    name?: string;
    source: string;
    message: string;
}

/**
 * ディレクトリスキャン結果
 */
export interface DirectoryScanResult {
    success: boolean;
    files: string[];
    message: string;
}

/**
 * ファイルローダー設定
 */
export interface FileLoaderConfig {
    enableLogging?: boolean;
    timeout?: number;
    supportedExtensions?: string[];
}

// =============================================================================
// バリデーション関連型
// =============================================================================

/**
 * OpenAPIバリデーション結果
 */
export interface OpenAPIValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    openApiVersion?: string;
}

// =============================================================================
// 抽出・処理関連型
// =============================================================================

/**
 * 抽出されたOpenAPIデータ
 */
export interface ExtractedOpenAPIData {
    basic: {
        name: string;
        title: string;
        summary: string;
        version: string;
        openApiVersion: string;
    };
    servers: Array<{
        description: string;
        url: string;
    }>;
    paths: Array<{
        method: string;
        path: string;
        summary: string;
        description: string;
        security?: any;
        parameters?: any;
        responses?: any;
        requestBody?: any;
    }>;
    schemas: Array<{
        name: string;
        description: string;
        schema: any;
    }>;
    securitySchemes: Array<{
        name: string;
        type: string;
        scheme?: string;
        description: string;
        content: any;
    }>;
    responses: Array<{
        name: string;
        description: string;
        content: any;
    }>;
    // ハッシュ情報（ファイル変更検知用）
    fileHash?: string;
    shortHash?: string;
}

/**
 * OpenAPI処理結果
 */
export interface ProcessingResult {
    success: boolean;
    name?: string;
    message: string;
    validation?: OpenAPIValidationResult;
    storage?: StorageResult;
    source: string;
}

/**
 * OpenAPIプロセッサー設定
 */
export interface ProcessorConfig {
    enableLogging?: boolean;
    enableValidation?: boolean;
    skipInvalidFiles?: boolean;
    dependencyConfig?: IDependencyConfig;
}

// =============================================================================
// ストレージ関連型
// =============================================================================

/**
 * ストレージ操作結果
 */
export interface StorageResult {
    success: boolean;
    openapiId?: number;
    message: string;
    details?: {
        serversStored: number;
        pathsStored: number;
        schemasStored: number;
        securitySchemesStored: number;
        responsesStored: number;
    };
    // ハッシュ未変更によりスキップされた場合はtrue
    skipped?: boolean;
}

/**
 * ストレージサービス設定
 */
export interface StorageServiceConfig {
    enableLogging?: boolean;
    replaceExisting?: boolean;
    validateBeforeStore?: boolean;
}

// =============================================================================
// 外部ツール型参照（各ツールフォルダから取得）
// =============================================================================

export type { OpenAPIRecord } from "../../openapi-tool/types.js";
export type { ServerRecord } from "../../server-tool/types.js";
export type { PathRecord } from "../../path-tool/types.js";
export type { SchemaRecord } from "../../schema-tool/types.js";
export type { SecuritySchemeRecord } from "../../security-tool/types.js";
export type { ResponseRecord } from "../../response-tool/types.js";
