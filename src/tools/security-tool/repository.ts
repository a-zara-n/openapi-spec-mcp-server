import { DatabaseManager } from "../tool-libs/core/database/index.js";
import type { SecuritySchemeRecord } from "./types.js";
import type {
    ISecurityRepository,
    IDatabaseManager,
    IDependencyConfig,
} from "../tool-libs/types/index.js";

/**
 * SecuritySchemeレコード専用リポジトリ（DI対応）
 */
export class SecurityRepository implements ISecurityRepository {
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
     * SecuritySchemeレコードを挿入
     */
    insertSecurityScheme(record: SecuritySchemeRecord): number {
        const stmt = this.db.prepare(`
            INSERT INTO security_schemes (openapi_id, name, type, scheme, description, content)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            record.openapi_id,
            record.name,
            record.type,
            record.scheme,
            record.description,
            record.content
        );
        return result.lastInsertRowid as number;
    }

    /**
     * OpenAPI IDによるSecuritySchemeレコード一覧取得
     */
    getSecuritySchemesByOpenAPIId(openapiId: number): SecuritySchemeRecord[] {
        const stmt = this.db.prepare(
            "SELECT * FROM security_schemes WHERE openapi_id = ?"
        );
        return stmt.all(openapiId) as SecuritySchemeRecord[];
    }

    /**
     * 名前で特定のSecuritySchemeレコードを取得
     */
    getSecuritySchemeByName(
        openapiId: number,
        name: string
    ): SecuritySchemeRecord | null {
        const stmt = this.db.prepare(
            "SELECT * FROM security_schemes WHERE openapi_id = ? AND name = ?"
        );
        return stmt.get(openapiId, name) as SecuritySchemeRecord | null;
    }
}
