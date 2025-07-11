/**
 * セキュリティスキームレコード型
 */
export interface SecuritySchemeRecord {
    id?: number;
    openapi_id: number;
    name: string;
    type: string;
    scheme?: string;
    description?: string;
    content: string;
}
