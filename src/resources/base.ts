import {
    type ReadResourceRequest,
    type ReadResourceResult,
    type Resource as MCPResource,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCPリソースのベースクラス
 * すべてのリソースはこのクラスを継承する
 */
export abstract class BaseResource {
    /**
     * リソースURI（一意である必要がある）
     */
    abstract readonly uri: string;

    /**
     * リソース名
     */
    abstract readonly name: string;

    /**
     * リソースの説明
     */
    abstract readonly description: string;

    /**
     * MIMEタイプ（省略可能）
     */
    abstract readonly mimeType?: string;

    /**
     * リソースの読み取り処理
     * @param request MCP Read Resource Request
     * @returns リソースの内容
     */
    abstract read(request: ReadResourceRequest): Promise<ReadResourceResult>;

    /**
     * MCPリソース定義を取得
     * @returns MCP Resource definition
     */
    getMCPResource(): MCPResource {
        return {
            uri: this.uri,
            name: this.name,
            description: this.description,
            mimeType: this.mimeType,
        };
    }

    /**
     * リソースハンドラーを取得
     * @returns リソース読み取りハンドラー
     */
    handler(request: ReadResourceRequest): Promise<ReadResourceResult> {
        try {
            return this.read(request);
        } catch (error) {
            console.error(`[${this.name}] Resource read error:`, error);
            
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
            
            return Promise.resolve({
                contents: [{
                    uri: this.uri,
                    mimeType: "text/plain",
                    text: `Error: ${errorMessage}`
                }],
            });
        }
    }

    /**
     * 成功レスポンスを作成
     * @param content リソースの内容
     * @param mimeType MIMEタイプ
     * @returns ReadResourceResult
     */
    protected createSuccessResponse(content: string, mimeType: string = "text/plain"): ReadResourceResult {
        return {
            contents: [{
                uri: this.uri,
                mimeType: mimeType,
                text: content
            }],
        };
    }

    /**
     * バイナリレスポンスを作成
     * @param data バイナリデータ
     * @param mimeType MIMEタイプ
     * @returns ReadResourceResult
     */
    protected createBinaryResponse(data: string, mimeType: string): ReadResourceResult {
        return {
            contents: [{
                uri: this.uri,
                mimeType: mimeType,
                blob: data
            }],
        };
    }

    /**
     * エラーレスポンスを作成
     * @param message エラーメッセージ
     * @returns ReadResourceResult
     */
    protected createErrorResponse(message: string): ReadResourceResult {
        return {
            contents: [{
                uri: this.uri,
                mimeType: "text/plain",
                text: `Error: ${message}`
            }],
        };
    }
} 