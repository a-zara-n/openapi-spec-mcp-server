import { DatabaseManager } from "../tool-libs/core/database/index.js";
import type { OpenAPIRecord } from "./types.js";
import type {
    IOpenAPIRepository,
    IDatabaseManager,
    IDependencyConfig,
} from "../tool-libs/types/index.js";

/**
 * @fileoverview OpenAPIリポジトリ
 * @description OpenAPI仕様データの永続化操作を提供するリポジトリクラス
 * @since 1.0.0
 */

/**
 * OpenAPIレコード専用リポジトリ（DI対応）
 * @description OpenAPI仕様データのCRUD操作を提供するリポジトリクラス
 *
 * @example
 * ```typescript
 * const repository = new OpenAPIRepository();
 *
 * // OpenAPI仕様の挿入
 * const id = repository.insertOrUpdateOpenAPI({
 *   name: "petstore",
 *   title: "Pet Store API",
 *   version: "1.0.0",
 *   openapi: "3.0.0",
 *   summary: "ペットストアAPI",
 *   description: "ペット管理のためのAPI"
 * });
 *
 * // 全OpenAPI仕様の取得
 * const allAPIs = repository.getAllOpenAPIs();
 *
 * // 特定OpenAPI仕様の取得
 * const api = repository.getOpenAPIByName("petstore");
 * ```
 *
 * @implements {IOpenAPIRepository}
 * @since 1.0.0
 */
export class OpenAPIRepository implements IOpenAPIRepository {
    /**
     * データベース管理インスタンス
     * @description データベース接続とトランザクション管理を担当
     * @protected
     */
    protected dbManager: IDatabaseManager;

    /**
     * OpenAPIRepositoryのコンストラクタ
     * @description リポジトリを初期化し、データベース接続を設定する
     *
     * @param {IDatabaseManager} [dbManager] - データベース管理インスタンス
     * @param {IDependencyConfig} [config={}] - DI設定オプション
     *
     * @example
     * ```typescript
     * // デフォルト設定での初期化
     * const repository = new OpenAPIRepository();
     *
     * // カスタム設定での初期化
     * const repository = new OpenAPIRepository(customDbManager, {
     *   enableLogging: true,
     *   testMode: false
     * });
     * ```
     */
    constructor(dbManager?: IDatabaseManager, config: IDependencyConfig = {}) {
        // DI: DatabaseManagerを注入、なければデフォルト作成
        this.dbManager = dbManager || new DatabaseManager(undefined, config);
    }

    /**
     * データベース接続にアクセス
     * @description 内部的にデータベース接続オブジェクトを取得する
     * @returns データベース接続オブジェクト
     * @protected
     */
    protected get db() {
        return (this.dbManager as any).db;
    }

    /**
     * OpenAPIレコードを挿入または更新
     * @description OpenAPI仕様をデータベースに挿入、既存の場合は更新する
     *
     * @param {OpenAPIRecord} record - 挿入/更新するOpenAPIレコード
     * @returns {number} 挿入または更新されたレコードのID
     *
     * @example
     * ```typescript
     * const repository = new OpenAPIRepository();
     * const id = repository.insertOrUpdateOpenAPI({
     *   name: "petstore",
     *   title: "Pet Store API",
     *   version: "1.0.0",
     *   openapi: "3.0.0",
     *   summary: "ペットストアAPI",
     *   description: "ペット管理のためのAPI"
     * });
     *
     * console.log(`OpenAPI ID: ${id}`);
     * ```
     *
     * @throws {Error} データベース操作時にエラーが発生した場合
     * @since 1.0.0
     */
    insertOrUpdateOpenAPI(record: OpenAPIRecord): number {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO openapi (name, title, summary, version, content, file_hash, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        const result = stmt.run(
            record.name,
            record.title,
            record.summary,
            record.version,
            record.content,
            record.file_hash || null
        );
        return result.lastInsertRowid as number;
    }

    /**
     * 全OpenAPIレコードを取得
     */
    getAllOpenAPIs(): OpenAPIRecord[] {
        const stmt = this.db.prepare("SELECT * FROM openapi");
        return stmt.all() as OpenAPIRecord[];
    }

    /**
     * 名前でOpenAPIレコードを取得
     */
    getOpenAPIByName(name: string): OpenAPIRecord | null {
        const stmt = this.db.prepare("SELECT * FROM openapi WHERE name = ?");
        return stmt.get(name) as OpenAPIRecord | null;
    }

    /**
     * OpenAPIの全関連データを削除
     */
    deleteOpenAPIData(openapiId: number): void {
        const transaction = this.db.prepare("BEGIN TRANSACTION");
        try {
            transaction.run();
            this.db
                .prepare("DELETE FROM servers WHERE openapi_id = ?")
                .run(openapiId);
            this.db
                .prepare("DELETE FROM paths WHERE openapi_id = ?")
                .run(openapiId);
            this.db
                .prepare("DELETE FROM schemas WHERE openapi_id = ?")
                .run(openapiId);
            this.db
                .prepare("DELETE FROM security_schemes WHERE openapi_id = ?")
                .run(openapiId);
            this.db
                .prepare("DELETE FROM responses WHERE openapi_id = ?")
                .run(openapiId);
            this.db.prepare("DELETE FROM openapi WHERE id = ?").run(openapiId);
            this.db.prepare("COMMIT").run();
        } catch (error) {
            this.db.prepare("ROLLBACK").run();
            throw error;
        }
    }
}
