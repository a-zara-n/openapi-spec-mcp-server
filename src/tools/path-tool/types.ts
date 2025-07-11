/**
 * パスレコード型
 */
export interface PathRecord {
    id?: number;
    openapi_id: number;
    method: string;
    path: string;
    summary?: string;
    description?: string;
    security?: string;
    parameters?: string;
    responses?: string;
    requestBody?: string;
}
