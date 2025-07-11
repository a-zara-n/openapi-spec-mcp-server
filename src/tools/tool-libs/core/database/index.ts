import Database from "better-sqlite3";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { mkdirSync } from "fs";

// 型定義を新しい統合ファイルからインポート
import type {
    IDatabaseConnection,
    IDatabaseManager,
    IDependencyConfig,
} from "../../types/index.js";

// エラーハンドリングシステムをインポート
import { ErrorManager, DetailedError, ErrorHandler } from "../error/index.js";

// ディレクトリパスの取得（ES6モジュール対応）
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * SQLite データベース接続ラッパー（シングルトン）
 */
export class SQLiteDatabaseConnection implements IDatabaseConnection {
    private static instance: SQLiteDatabaseConnection | null = null;
    private static instancePath: string | null = null;
    private db: Database.Database;

    private constructor(dbPath: string) {
        try {
            // データベース接続を試行
            console.log(`🔄 データベース接続を初期化中: ${dbPath}`);
            this.db = new Database(dbPath);

            // 接続テストを実行
            this.db.pragma("user_version");

            // 自動コミットを確実にする
            this.db.pragma("journal_mode = WAL"); // WALモードでパフォーマンス向上
            this.db.pragma("synchronous = NORMAL"); // 適切な同期設定

            console.log(`✅ データベース接続確立: ${dbPath}`);
            console.log(`📊 WALモード有効化、同期設定: NORMAL`);
        } catch (error) {
            const detailedError = ErrorManager.createDatabaseError(
                "CONNECTION",
                `データベースファイル '${dbPath}' への接続に失敗しました`,
                {
                    filePath: dbPath,
                    originalError:
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    technicalDetails:
                        error instanceof Error ? error.message : String(error),
                    context: {
                        dbPath,
                        operation: "constructor",
                    },
                }
            );

            ErrorManager.logError(detailedError, "DatabaseConnection");
            throw detailedError;
        }
    }

    /**
     * シングルトンインスタンスを取得
     */
    static getInstance(dbPath: string): SQLiteDatabaseConnection {
        // 異なるパスが指定された場合、既存の接続を閉じて新しく作成
        if (
            SQLiteDatabaseConnection.instance &&
            SQLiteDatabaseConnection.instancePath !== dbPath
        ) {
            SQLiteDatabaseConnection.instance.close();
            SQLiteDatabaseConnection.instance = null;
        }

        if (!SQLiteDatabaseConnection.instance) {
            SQLiteDatabaseConnection.instance = new SQLiteDatabaseConnection(
                dbPath
            );
            SQLiteDatabaseConnection.instancePath = dbPath;
        }

        return SQLiteDatabaseConnection.instance;
    }

    exec(sql: string): void {
        try {
            console.log(
                `🔧 SQL実行: ${sql.substring(0, 100)}${
                    sql.length > 100 ? "..." : ""
                }`
            );
            this.db.exec(sql);
            console.log(`✅ SQL実行完了`);
        } catch (error) {
            const detailedError = ErrorManager.createDatabaseError(
                "QUERY",
                `SQL実行エラー`,
                {
                    originalError:
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    technicalDetails: `SQL: ${sql}\nエラー: ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                    context: {
                        sql: sql.substring(0, 200), // SQLの先頭200文字
                        operation: "exec",
                    },
                }
            );

            ErrorManager.logError(detailedError, "DatabaseConnection");
            throw detailedError;
        }
    }

    prepare(sql: string): any {
        try {
            console.log(
                `🔧 SQL準備: ${sql.substring(0, 100)}${
                    sql.length > 100 ? "..." : ""
                }`
            );
            const statement = this.db.prepare(sql);
            console.log(`✅ SQL準備完了`);
            return statement;
        } catch (error) {
            const detailedError = ErrorManager.createDatabaseError(
                "QUERY",
                `SQL準備エラー`,
                {
                    originalError:
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    technicalDetails: `SQL: ${sql}\nエラー: ${
                        error instanceof Error ? error.message : String(error)
                    }`,
                    context: {
                        sql: sql.substring(0, 200), // SQLの先頭200文字
                        operation: "prepare",
                    },
                }
            );

            ErrorManager.logError(detailedError, "DatabaseConnection");
            throw detailedError;
        }
    }

    close(): void {
        try {
            if (this.db) {
                console.log("🔄 データベース接続を終了中...");
                this.db.close();
                console.log("✅ データベース接続を正常に閉じました");
            }
            SQLiteDatabaseConnection.instance = null;
            SQLiteDatabaseConnection.instancePath = null;
        } catch (error) {
            const detailedError = ErrorManager.createDatabaseError(
                "CONNECTION",
                `データベース接続の終了でエラーが発生しました`,
                {
                    originalError:
                        error instanceof Error
                            ? error
                            : new Error(String(error)),
                    technicalDetails:
                        error instanceof Error ? error.message : String(error),
                    context: {
                        operation: "close",
                    },
                }
            );

            ErrorManager.logError(detailedError, "DatabaseConnection");
            // 接続終了エラーは投げずにログのみ出力
            // throw detailedError;
        }
    }

    get instance(): Database.Database {
        return this.db;
    }
}

/**
 * データベース管理基底クラス（DI対応）
 */
export class DatabaseManager implements IDatabaseManager {
    protected db: IDatabaseConnection;
    protected config: IDependencyConfig;

    constructor(
        connection?: IDatabaseConnection,
        config: IDependencyConfig = {}
    ) {
        this.config = {
            enableLogging: true,
            enableIndexes: true,
            testMode: false,
            ...config,
        };

        // DI: データベース接続を注入、なければシングルトン接続を作成
        if (connection) {
            this.db = connection;
        } else {
            try {
                // 絶対パス: プロジェクトルートからの絶対パスを構築
                const absoluteDbPath =
                    this.config.dbPath || resolve(process.cwd(), "data/openapi.db");

                console.log(`🔄 データベースディレクトリ作成中: ${dirname(absoluteDbPath)}`);

                // データベースディレクトリを作成（絶対パス基準）
                const absoluteDbDir = dirname(absoluteDbPath);
                mkdirSync(absoluteDbDir, { recursive: true });

                console.log(`📁 データベースディレクトリ作成完了: ${absoluteDbDir}`);

                // シングルトン接続を使用（絶対パス指定）
                this.db = SQLiteDatabaseConnection.getInstance(absoluteDbPath);
            } catch (error) {
                const detailedError = ErrorManager.createDatabaseError(
                    "CONNECTION",
                    `データベース接続またはディレクトリ作成に失敗しました`,
                    {
                        originalError: error instanceof Error ? error : new Error(String(error)),
                        technicalDetails: error instanceof Error ? error.message : String(error),
                        context: {
                            operation: "DatabaseManager constructor",
                            config: this.config
                        }
                    }
                );

                ErrorManager.logError(detailedError, "DatabaseManager");
                throw detailedError;
            }
        }

        try {
            this.initializeDatabase();
        } catch (error) {
            const detailedError = ErrorManager.createDatabaseError(
                "SCHEMA",
                `データベース初期化に失敗しました`,
                {
                    originalError: error instanceof Error ? error : new Error(String(error)),
                    technicalDetails: error instanceof Error ? error.message : String(error),
                    context: {
                        operation: "DatabaseManager initialization",
                        config: this.config
                    }
                }
            );

            ErrorManager.logError(detailedError, "DatabaseManager");
            throw detailedError;
        }
    }

    /**
     * データベースを初期化
     */
    protected initializeDatabase() {
        try {
            this.createTables();
            if (this.config.enableIndexes) {
                this.createIndexes();
            }
            if (this.config.enableLogging) {
                console.log(`✅ SQLiteデータベースを初期化: DI対応モード`);
            }
        } catch (error) {
            if (this.config.enableLogging) {
                console.error("❌ データベース初期化エラー:", error);
            }
            throw error;
        }
    }

    /**
     * 全テーブルを作成
     */
    private createTables() {
        this.createOpenAPITable();
        this.createServersTable();
        this.createPathsTable();
        this.createSchemasTable();
        this.createSecuritySchemesTable();
        this.createResponsesTable();
    }

    /**
     * OpenAPIテーブルを作成
     */
    private createOpenAPITable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS openapi (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                title TEXT,
                summary TEXT,
                version TEXT,
                content TEXT NOT NULL,
                file_hash TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // 既存テーブルにfile_hashカラムを追加（互換性のため）
        try {
            this.db.exec(`ALTER TABLE openapi ADD COLUMN file_hash TEXT`);
        } catch (error) {
            // カラムが既に存在する場合はエラーを無視
        }
        
        try {
            this.db.exec(`ALTER TABLE openapi ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
        } catch (error) {
            // カラムが既に存在する場合はエラーを無視
        }
        
        try {
            this.db.exec(`ALTER TABLE openapi ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
        } catch (error) {
            // カラムが既に存在する場合はエラーを無視
        }
        
        if (this.config.enableLogging) {
            console.log("✅ OpenAPIテーブル作成完了（file_hash, created_at, updated_at対応）");
        }
    }

    /**
     * Serversテーブルを作成
     */
    private createServersTable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS servers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                openapi_id INTEGER NOT NULL,
                description TEXT,
                url TEXT NOT NULL,
                FOREIGN KEY (openapi_id) REFERENCES openapi(id)
            )
        `);
        if (this.config.enableLogging) {
            console.log("✅ Serversテーブル作成完了");
        }
    }

    /**
     * Pathsテーブルを作成
     */
    private createPathsTable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS paths (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                openapi_id INTEGER NOT NULL,
                method TEXT NOT NULL,
                path TEXT NOT NULL,
                summary TEXT,
                description TEXT,
                security TEXT,
                parameters TEXT,
                responses TEXT,
                requestBody TEXT,
                FOREIGN KEY (openapi_id) REFERENCES openapi(id)
            )
        `);
        if (this.config.enableLogging) {
            console.log("✅ Pathsテーブル作成完了");
        }
    }

    /**
     * Schemasテーブルを作成
     */
    private createSchemasTable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS schemas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                openapi_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                schema TEXT NOT NULL,
                FOREIGN KEY (openapi_id) REFERENCES openapi(id)
            )
        `);
        if (this.config.enableLogging) {
            console.log("✅ Schemasテーブル作成完了");
        }
    }

    /**
     * SecuritySchemesテーブルを作成
     */
    private createSecuritySchemesTable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS security_schemes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                openapi_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                scheme TEXT,
                description TEXT,
                content TEXT NOT NULL,
                FOREIGN KEY (openapi_id) REFERENCES openapi(id)
            )
        `);
        if (this.config.enableLogging) {
            console.log("✅ SecuritySchemesテーブル作成完了");
        }
    }

    /**
     * Responsesテーブルを作成
     */
    private createResponsesTable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                openapi_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                content TEXT NOT NULL,
                FOREIGN KEY (openapi_id) REFERENCES openapi(id)
            )
        `);
        if (this.config.enableLogging) {
            console.log("✅ Responsesテーブル作成完了");
        }
    }

    /**
     * 特定テーブルのインデックスを作成
     */
    protected createIndexes() {
        this.createOpenAPIIndexes();
        this.createServersIndexes();
        this.createPathsIndexes();
        this.createSchemasIndexes();
        this.createSecuritySchemesIndexes();
        this.createResponsesIndexes();
    }

    /**
     * OpenAPIテーブルのインデックスを作成
     */
    private createOpenAPIIndexes() {
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_openapi_name 
            ON openapi(name)
        `);
    }

    /**
     * Serversテーブルのインデックスを作成
     */
    private createServersIndexes() {
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_servers_openapi_id 
            ON servers(openapi_id)
        `);
    }

    /**
     * Pathsテーブルのインデックスを作成
     */
    private createPathsIndexes() {
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_paths_openapi_id 
            ON paths(openapi_id)
        `);
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_paths_method_path 
            ON paths(openapi_id, method, path)
        `);
    }

    /**
     * Schemasテーブルのインデックスを作成
     */
    private createSchemasIndexes() {
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_schemas_openapi_id 
            ON schemas(openapi_id)
        `);
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_schemas_name 
            ON schemas(openapi_id, name)
        `);
    }

    /**
     * SecuritySchemesテーブルのインデックスを作成
     */
    private createSecuritySchemesIndexes() {
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_security_schemes_openapi_id 
            ON security_schemes(openapi_id)
        `);
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_security_schemes_name 
            ON security_schemes(openapi_id, name)
        `);
    }

    /**
     * Responsesテーブルのインデックスを作成
     */
    private createResponsesIndexes() {
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_responses_openapi_id 
            ON responses(openapi_id)
        `);
        this.db.exec(`
            CREATE INDEX IF NOT EXISTS idx_responses_name 
            ON responses(openapi_id, name)
        `);
    }

    /**
     * 全テーブルを削除（開発・テスト用）
     */
    protected dropAllTables() {
        this.dropResponsesTable();
        this.dropSecuritySchemesTable();
        this.dropSchemasTable();
        this.dropPathsTable();
        this.dropServersTable();
        this.dropOpenAPITable();
    }

    /**
     * OpenAPIテーブルを削除
     */
    private dropOpenAPITable() {
        this.db.exec(`DROP TABLE IF EXISTS openapi`);
        if (this.config.enableLogging) {
            console.log("🗑️ OpenAPIテーブル削除完了");
        }
    }

    /**
     * Serversテーブルを削除
     */
    private dropServersTable() {
        this.db.exec(`DROP TABLE IF EXISTS servers`);
        if (this.config.enableLogging) {
            console.log("🗑️ Serversテーブル削除完了");
        }
    }

    /**
     * Pathsテーブルを削除
     */
    private dropPathsTable() {
        this.db.exec(`DROP TABLE IF EXISTS paths`);
        if (this.config.enableLogging) {
            console.log("🗑️ Pathsテーブル削除完了");
        }
    }

    /**
     * Schemasテーブルを削除
     */
    private dropSchemasTable() {
        this.db.exec(`DROP TABLE IF EXISTS schemas`);
        if (this.config.enableLogging) {
            console.log("🗑️ Schemasテーブル削除完了");
        }
    }

    /**
     * SecuritySchemesテーブルを削除
     */
    private dropSecuritySchemesTable() {
        this.db.exec(`DROP TABLE IF EXISTS security_schemes`);
        if (this.config.enableLogging) {
            console.log("🗑️ SecuritySchemesテーブル削除完了");
        }
    }

    /**
     * Responsesテーブルを削除
     */
    private dropResponsesTable() {
        this.db.exec(`DROP TABLE IF EXISTS responses`);
        if (this.config.enableLogging) {
            console.log("🗑️ Responsesテーブル削除完了");
        }
    }

    /**
     * データベースを再構築
     */
    rebuildDatabase() {
        if (this.config.enableLogging) {
            console.log("🔄 データベース再構築開始");
        }
        this.dropAllTables();
        this.createTables();
        if (this.config.enableIndexes) {
            this.createIndexes();
        }
        if (this.config.enableLogging) {
            console.log("✅ データベース再構築完了");
        }
    }

    /**
     * データベース統計情報を取得
     */
    getDatabaseStats() {
        const stats = {
            openapi: this.db
                .prepare("SELECT COUNT(*) as count FROM openapi")
                .get() as { count: number },
            servers: this.db
                .prepare("SELECT COUNT(*) as count FROM servers")
                .get() as { count: number },
            paths: this.db
                .prepare("SELECT COUNT(*) as count FROM paths")
                .get() as { count: number },
            schemas: this.db
                .prepare("SELECT COUNT(*) as count FROM schemas")
                .get() as { count: number },
            security_schemes: this.db
                .prepare("SELECT COUNT(*) as count FROM security_schemes")
                .get() as { count: number },
            responses: this.db
                .prepare("SELECT COUNT(*) as count FROM responses")
                .get() as { count: number },
        };

        if (this.config.enableLogging) {
            console.log("📊 データベース統計:", stats);
        }
        return stats;
    }

    /**
     * データベースを閉じる
     */
    close(): void {
        if (this.db) {
            this.db.close();
            if (this.config.enableLogging) {
                console.log("✅ データベース接続を閉じました");
            }
        }
    }
}
