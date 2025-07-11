import { DatabaseManager } from "../tool-libs/core/database/index.js";
import type { ServerRecord } from "./types.js";
import type {
    IServerRepository,
    IDatabaseManager,
    IDependencyConfig,
} from "../tool-libs/types/index.js";

/**
 * Serverレコード専用リポジトリ（DI対応）
 */
export class ServerRepository implements IServerRepository {
    protected dbManager: IDatabaseManager;

    constructor(dbManager?: IDatabaseManager, config: IDependencyConfig = {}) {
        // DI: DatabaseManagerを注入、なければデフォルト作成
        this.dbManager = dbManager || new DatabaseManager(undefined, config);
    }

    /**
     * データベース接続にアクセス
     */
    protected get db() {
        return (this.dbManager as any).db;
    }

    /**
     * Serverレコードを挿入
     */
    insertServer(record: ServerRecord): number {
        const stmt = this.db.prepare(`
            INSERT INTO servers (openapi_id, description, url)
            VALUES (?, ?, ?)
        `);
        const result = stmt.run(
            record.openapi_id,
            record.description,
            record.url
        );
        return result.lastInsertRowid as number;
    }

    /**
     * OpenAPI IDによるServerレコード一覧取得
     */
    getServersByOpenAPIId(openapiId: number): ServerRecord[] {
        const stmt = this.db.prepare(
            "SELECT * FROM servers WHERE openapi_id = ?"
        );
        return stmt.all(openapiId) as ServerRecord[];
    }
}
