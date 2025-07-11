/**
 * レスポンスレコード型
 */
export interface ResponseRecord {
    id?: number;
    openapi_id: number;
    name: string;
    description?: string;
    content: string;
}
