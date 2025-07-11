import {
    DatabaseManager,
    SQLiteDatabaseConnection,
} from "../database/index.js";
import { OpenAPIRepository } from "@/tools/openapi-tool/repository.js";
import { ServerRepository } from "@/tools/server-tool/repository.js";
import { PathRepository } from "@/tools/path-tool/repository.js";
import { SchemaRepository } from "@/tools/schema-tool/repository.js";
import { SecurityRepository } from "@/tools/security-tool/repository.js";
import { ResponseRepository } from "@/tools/response-tool/repository.js";

// 型定義を新しい統合ファイルからインポート
import type {
    IDatabaseConnection,
    IDatabaseManager,
    IOpenAPIRepository,
    IServerRepository,
    IPathRepository,
    ISchemaRepository,
    ISecurityRepository,
    IResponseRepository,
    IDependencyConfig,
    DIContainerConfig,
} from "../../types/index.js";
import { resolve } from "path";

/**
 * DIコンテナクラス（個別リポジトリ用）
 */
export class DIContainer {
    private static _instance: DIContainer;
    private config: DIContainerConfig;
    private singletonInstances: Map<string, any> = new Map();
    private registeredFactories: Map<string, () => any> = new Map();

    constructor(config: DIContainerConfig = {}) {
        this.config = {
            singleton: true,
            enableCache: true,
            enableLogging: true,
            enableIndexes: true,
            testMode: false,
            ...config,
        };
    }

    /**
     * シングルトンインスタンスを取得
     */
    static getInstance(config?: DIContainerConfig): DIContainer {
        if (!DIContainer._instance) {
            DIContainer._instance = new DIContainer(config);
        }
        return DIContainer._instance;
    }

    /**
     * インスタンスをリセット（テスト用）
     */
    static reset(): void {
        DIContainer._instance = null as any;
    }

    /**
     * ファクトリーを登録
     */
    register<T>(key: string, factory: () => T): void {
        this.registeredFactories.set(key, factory);
        if (this.config.enableLogging) {
            console.log(`📝 DIContainer: ${key} を登録しました`);
        }
    }

    /**
     * インスタンスを解決
     */
    resolve<T>(key: string): T {
        // シングルトンキャッシュから取得
        if (this.config.singleton && this.singletonInstances.has(key)) {
            if (this.config.enableLogging) {
                console.log(`♻️ DIContainer: ${key} をキャッシュから取得`);
            }
            return this.singletonInstances.get(key);
        }

        // ファクトリーから作成
        const factory = this.registeredFactories.get(key);
        if (!factory) {
            throw new Error(`DIContainer: ${key} が見つかりません`);
        }

        const instance = factory();

        // シングルトンキャッシュに保存
        if (this.config.singleton) {
            this.singletonInstances.set(key, instance);
            if (this.config.enableLogging) {
                console.log(`✅ DIContainer: ${key} をキャッシュに保存`);
            }
        }

        return instance;
    }

    /**
     * キャッシュをクリア
     */
    clear(): void {
        this.singletonInstances.clear();
        if (this.config.enableLogging) {
            console.log("🗑️ DIContainer: キャッシュをクリアしました");
        }
    }

    /**
     * データベース接続を作成
     */
    createDatabaseConnection(dbPath?: string): IDatabaseConnection {
        // 絶対パス: プロジェクトルートからの絶対パスを構築
        const absoluteDbPath =
            dbPath ||
            this.config.dbPath ||
            resolve(process.cwd(), "data/openapi.db");
        // シングルトンインスタンスを使用（絶対パス指定）
        return SQLiteDatabaseConnection.getInstance(absoluteDbPath);
    }

    /**
     * DatabaseManagerを作成
     */
    createDatabaseManager(connection?: IDatabaseConnection): IDatabaseManager {
        return new DatabaseManager(connection, this.config);
    }

    /**
     * OpenAPIRepositoryを作成
     */
    createOpenAPIRepository(dbManager?: IDatabaseManager): IOpenAPIRepository {
        return new OpenAPIRepository(dbManager, this.config);
    }

    /**
     * ServerRepositoryを作成
     */
    createServerRepository(dbManager?: IDatabaseManager): IServerRepository {
        return new ServerRepository(dbManager, this.config);
    }

    /**
     * PathRepositoryを作成
     */
    createPathRepository(dbManager?: IDatabaseManager): IPathRepository {
        return new PathRepository(dbManager, this.config);
    }

    /**
     * SchemaRepositoryを作成
     */
    createSchemaRepository(dbManager?: IDatabaseManager): ISchemaRepository {
        return new SchemaRepository(dbManager, this.config);
    }

    /**
     * SecurityRepositoryを作成
     */
    createSecurityRepository(
        dbManager?: IDatabaseManager
    ): ISecurityRepository {
        return new SecurityRepository(dbManager, this.config);
    }

    /**
     * ResponseRepositoryを作成
     */
    createResponseRepository(
        dbManager?: IDatabaseManager
    ): IResponseRepository {
        return new ResponseRepository(dbManager, this.config);
    }

    /**
     * デフォルトの依存関係を登録
     */
    registerDefaults(): void {
        this.register("DatabaseConnection", () =>
            this.createDatabaseConnection()
        );
        this.register("DatabaseManager", () => this.createDatabaseManager());
        this.register("OpenAPIRepository", () =>
            this.createOpenAPIRepository()
        );
        this.register("ServerRepository", () => this.createServerRepository());
        this.register("PathRepository", () => this.createPathRepository());
        this.register("SchemaRepository", () => this.createSchemaRepository());
        this.register("SecurityRepository", () =>
            this.createSecurityRepository()
        );
        this.register("ResponseRepository", () =>
            this.createResponseRepository()
        );

        if (this.config.enableLogging) {
            console.log("✅ DIContainer: デフォルトの依存関係を登録しました");
        }
    }
}

/**
 * ファクトリークラス（個別リポジトリ用）
 */
export class RepositoryFactory {
    private static container: DIContainer;

    /**
     * DIコンテナを設定
     */
    static configure(config?: DIContainerConfig): void {
        RepositoryFactory.container = new DIContainer(config);
        RepositoryFactory.container.registerDefaults();
    }

    /**
     * DatabaseManagerを作成
     */
    static createDatabaseManager(config?: IDependencyConfig): IDatabaseManager {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }
        return RepositoryFactory.container.resolve<IDatabaseManager>(
            "DatabaseManager"
        );
    }

    /**
     * OpenAPIRepositoryを作成
     */
    static createOpenAPIRepository(
        config?: IDependencyConfig
    ): IOpenAPIRepository {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }
        return RepositoryFactory.container.resolve<IOpenAPIRepository>(
            "OpenAPIRepository"
        );
    }

    /**
     * ServerRepositoryを作成
     */
    static createServerRepository(
        config?: IDependencyConfig
    ): IServerRepository {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }
        return RepositoryFactory.container.resolve<IServerRepository>(
            "ServerRepository"
        );
    }

    /**
     * PathRepositoryを作成
     */
    static createPathRepository(config?: IDependencyConfig): IPathRepository {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }
        return RepositoryFactory.container.resolve<IPathRepository>(
            "PathRepository"
        );
    }

    /**
     * SchemaRepositoryを作成
     */
    static createSchemaRepository(
        config?: IDependencyConfig
    ): ISchemaRepository {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }
        return RepositoryFactory.container.resolve<ISchemaRepository>(
            "SchemaRepository"
        );
    }

    /**
     * SecurityRepositoryを作成
     */
    static createSecurityRepository(
        config?: IDependencyConfig
    ): ISecurityRepository {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }
        return RepositoryFactory.container.resolve<ISecurityRepository>(
            "SecurityRepository"
        );
    }

    /**
     * ResponseRepositoryを作成
     */
    static createResponseRepository(
        config?: IDependencyConfig
    ): IResponseRepository {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }
        return RepositoryFactory.container.resolve<IResponseRepository>(
            "ResponseRepository"
        );
    }

    /**
     * 共有DatabaseManagerを使用した各リポジトリセットを作成
     */
    static createRepositorySet(config?: IDependencyConfig): {
        dbManager: IDatabaseManager;
        openapi: IOpenAPIRepository;
        server: IServerRepository;
        path: IPathRepository;
        schema: ISchemaRepository;
        security: ISecurityRepository;
        response: IResponseRepository;
    } {
        if (!RepositoryFactory.container) {
            RepositoryFactory.configure(config);
        }

        const dbManager = RepositoryFactory.container.createDatabaseManager();

        return {
            dbManager,
            openapi:
                RepositoryFactory.container.createOpenAPIRepository(dbManager),
            server: RepositoryFactory.container.createServerRepository(
                dbManager
            ),
            path: RepositoryFactory.container.createPathRepository(dbManager),
            schema: RepositoryFactory.container.createSchemaRepository(
                dbManager
            ),
            security:
                RepositoryFactory.container.createSecurityRepository(dbManager),
            response:
                RepositoryFactory.container.createResponseRepository(dbManager),
        };
    }

    /**
     * テスト用のリポジトリセットを作成
     */
    static createTestRepositorySet(config?: IDependencyConfig): {
        dbManager: IDatabaseManager;
        openapi: IOpenAPIRepository;
        server: IServerRepository;
        path: IPathRepository;
        schema: ISchemaRepository;
        security: ISecurityRepository;
        response: IResponseRepository;
    } {
        const testConfig = {
            ...config,
            testMode: true,
            enableLogging: false,
            dbPath: ":memory:",
        };
        return RepositoryFactory.createRepositorySet(testConfig);
    }

    /**
     * コンテナをリセット（テスト用）
     */
    static reset(): void {
        if (RepositoryFactory.container) {
            RepositoryFactory.container.clear();
        }
        DIContainer.reset();
    }
}

// 型定義も再エクスポート（後方互換性のため）
export type { DIContainerConfig };
