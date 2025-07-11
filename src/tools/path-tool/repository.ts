import { DatabaseManager } from "../tool-libs/core/database/index.js";
import type { PathRecord } from "./types.js";
import type {
    IPathRepository,
    IDatabaseManager,
    IDependencyConfig,
} from "../tool-libs/types/index.js";

/**
 * Pathレコード専用リポジトリ（DI対応）
 */
export class PathRepository implements IPathRepository {
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
     * Pathレコードを挿入
     */
    insertPath(record: PathRecord): number {
        const stmt = this.db.prepare(`
            INSERT INTO paths (openapi_id, method, path, summary, description, security, parameters, responses, requestBody)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            record.openapi_id,
            record.method,
            record.path,
            record.summary,
            record.description,
            record.security,
            record.parameters,
            record.responses,
            record.requestBody
        );
        return result.lastInsertRowid as number;
    }

    /**
     * OpenAPI IDによるPathレコード一覧取得
     */
    getPathsByOpenAPIId(openapiId: number): PathRecord[] {
        const stmt = this.db.prepare(
            "SELECT * FROM paths WHERE openapi_id = ?"
        );
        return stmt.all(openapiId) as PathRecord[];
    }

    /**
     * メソッドとパスで特定のPathレコードを取得
     */
    getPathByMethodAndPath(
        openapiId: number,
        method: string,
        path: string
    ): PathRecord | null {
        const stmt = this.db.prepare(
            "SELECT * FROM paths WHERE openapi_id = ? AND method = ? AND path = ?"
        );
        return stmt.get(openapiId, method, path) as PathRecord | null;
    }
}
