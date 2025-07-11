/**
 * スキーマレコード型
 */
export interface SchemaRecord {
    id?: number;
    openapi_id: number;
    name: string;
    description?: string;
    schema: string;
}
