/**
 * OpenAPIレコード型
 */
export interface OpenAPIRecord {
    id?: number;
    name: string;
    title?: string;
    summary?: string;
    version?: string;
    content: string;
    file_hash?: string;
    created_at?: string;
    updated_at?: string;
}
