import { DatabaseManager } from "../tool-libs/core/database/index.js";
import type { SchemaRecord } from "./types.js";
import type {
    ISchemaRepository,
    IDatabaseManager,
    IDependencyConfig,
} from "../tool-libs/types/index.js";

/**
 * Schemaレコード専用リポジトリ（DI対応）
 */
export class SchemaRepository implements ISchemaRepository {
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
     * Schemaレコードを挿入
     */
    insertSchema(record: SchemaRecord): number {
        const stmt = this.db.prepare(`
            INSERT INTO schemas (openapi_id, name, description, schema)
            VALUES (?, ?, ?, ?)
        `);
        const result = stmt.run(
            record.openapi_id,
            record.name,
            record.description,
            record.schema
        );
        return result.lastInsertRowid as number;
    }

    /**
     * OpenAPI IDによるSchemaレコード一覧取得
     */
    getSchemasByOpenAPIId(openapiId: number): SchemaRecord[] {
        const stmt = this.db.prepare(
            "SELECT * FROM schemas WHERE openapi_id = ?"
        );
        return stmt.all(openapiId) as SchemaRecord[];
    }

    /**
     * 名前で特定のSchemaレコードを取得
     */
    getSchemaByName(openapiId: number, name: string): SchemaRecord | null {
        const stmt = this.db.prepare(
            "SELECT * FROM schemas WHERE openapi_id = ? AND name = ?"
        );
        return stmt.get(openapiId, name) as SchemaRecord | null;
    }
}
