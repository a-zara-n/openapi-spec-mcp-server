/**
 * @fileoverview データベース管理
 * @description SQLiteデータベースの接続、初期化、管理を行うクラス
 * @since 1.0.0
 */

import Database from "better-sqlite3";
import * as fs from "fs";
import * as path from "path";
import { IDatabaseManager, IDependencyConfig } from "../types/index.js";

/**
 * データベース管理クラス
 * @description SQLiteデータベースの接続、テーブル作成、トランザクション管理を提供
 *
 * @example
 * ```typescript
 * // デフォルト設定での初期化
 * const dbManager = new DatabaseManager();
 *
 * // カスタム設定での初期化
 * const dbManager = new DatabaseManager('./custom.db', {
 *   enableLogging: true,
 *   testMode: false
 * });
 *
 * // データベース接続の取得
 * const db = dbManager.getDatabase();
 * ```
 *
 * @implements {IDatabaseManager}
 * @since 1.0.0
 */
export class DatabaseManager implements IDatabaseManager {
    /**
     * SQLiteデータベース接続
     * @description Better-sqlite3のDatabaseインスタンス
     * @private
     */
    private db: Database.Database;

    /**
     * DatabaseManagerのコンストラクタ
     * @description データベース接続を初期化し、必要なテーブルを作成する
     *
     * @param {string} [dbPath] - データベースファイルのパス（デフォルト: ./data/openapi.db）
     * @param {IDependencyConfig} [config={}] - 設定オプション
     *
     * @example
     * ```typescript
     * // デフォルト設定
     * const dbManager = new DatabaseManager();
     *
     * // カスタムパス
     * const dbManager = new DatabaseManager('./my-database.db');
     *
     * // 設定付き
     * const dbManager = new DatabaseManager('./my-database.db', {
     *   enableLogging: true,
     *   testMode: true
     * });
     * ```
     */
    constructor(dbPath?: string, config: IDependencyConfig = {}) {
        // データベースファイルのパスを決定
        const finalDbPath =
            dbPath || path.join(__dirname, "../../../data/openapi.db");

        // ディレクトリが存在しない場合は作成
        const dbDir = path.dirname(finalDbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // データベース接続を初期化
        this.db = new Database(finalDbPath);

        // ログ設定
        if (config.enableLogging) {
            console.log(`データベース接続を初期化しました: ${finalDbPath}`);
        }

        // テーブルを初期化
        this.initializeTables();
    }

    /**
     * データベース接続を取得
     * @description Better-sqlite3のDatabaseインスタンスを返す
     *
     * @returns {Database.Database} データベース接続オブジェクト
     *
     * @example
     * ```typescript
     * const dbManager = new DatabaseManager();
     * const db = dbManager.getDatabase();
     *
     * // クエリの実行
     * const stmt = db.prepare("SELECT * FROM openapi_specs WHERE name = ?");
     * const result = stmt.get("petstore");
     * ```
     */
    getDatabase(): Database.Database {
        return this.db;
    }

    /**
     * データベース接続を閉じる
     * @description データベース接続をクローズし、リソースを解放する
     *
     * @example
     * ```typescript
     * const dbManager = new DatabaseManager();
     * // ... データベース操作 ...
     * dbManager.close();
     * ```
     *
     * @since 1.0.0
     */
    close(): void {
        if (this.db) {
            this.db.close();
            console.log("✅ データベース接続を閉じました");
        }
    }

    /**
     * データベーステーブルを初期化
     * @description 必要なテーブルが存在しない場合に作成する
     *
     * @private
     * @since 1.0.0
     */
    private initializeTables(): void {
        // OpenAPI仕様テーブル作成
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS openapi_specs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                version TEXT NOT NULL,
                openapi TEXT NOT NULL,
                summary TEXT,
                description TEXT,
                raw_spec TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("✅ データベーステーブルを初期化しました");
    }
}
