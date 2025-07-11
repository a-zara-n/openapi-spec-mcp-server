import { DatabaseManager } from "../tool-libs/core/database/index.js";
import type { ResponseRecord } from "./types.js";
import type {
    IResponseRepository,
    IDatabaseManager,
    IDependencyConfig,
} from "../tool-libs/types/index.js";

/**
 * Responseレコード専用リポジトリ（DI対応）
 */
export class ResponseRepository implements IResponseRepository {
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
     * Responseレコードを挿入
     */
    insertResponse(record: ResponseRecord): number {
        const stmt = this.db.prepare(`
            INSERT INTO responses (openapi_id, name, description, content)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(
            record.openapi_id,
            record.name,
            record.description,
            record.content
        );
        return result.lastInsertRowid as number;
    }

    /**
     * OpenAPI IDによるResponseレコード一覧取得
     */
    getResponsesByOpenAPIId(openapiId: number): ResponseRecord[] {
        const stmt = this.db.prepare(
            "SELECT * FROM responses WHERE openapi_id = ?"
        );
        return stmt.all(openapiId) as ResponseRecord[];
    }

    /**
     * 名前で特定のResponseレコードを取得
     */
    getResponseByName(openapiId: number, name: string): ResponseRecord | null {
        const stmt = this.db.prepare(
            "SELECT * FROM responses WHERE openapi_id = ? AND name = ?"
        );
        return stmt.get(openapiId, name) as ResponseRecord | null;
    }
}
