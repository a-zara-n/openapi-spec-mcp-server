import {
    ReadResourceRequest,
    ReadResourceResult,
    type Resource as MCPResource,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import { BaseResource } from "./base.js";

/**
 * リソースマネージャークラス
 * MCPサーバーで利用可能なすべてのリソースを管理する
 */
export class ResourceManager {
    private resources: Map<string, BaseResource> = new Map();

    constructor() {
        this.initializeResources();
    }

    /**
     * リソースを初期化
     */
    private initializeResources() {
        console.log(
            `📁 合計 ${this.resources.size} 個のリソースが登録されました`
        );
    }

    /**
     * MCPリソースのリストを取得
     * @returns MCPリソースの配列
     */
    getResourceList(): MCPResource[] {
        return Array.from(this.resources.values()).map((resource) =>
            resource.getMCPResource()
        );
    }

    /**
     * リソースが存在するかチェック
     * @param uri リソースURI
     * @returns 存在するかどうか
     */
    hasResource(uri: string): boolean {
        return this.resources.has(uri);
    }

    /**
     * リソースを読み取り
     * @param request ReadResourceRequest
     * @returns リソースの内容
     */
    async readResource(
        request: ReadResourceRequest
    ): Promise<ReadResourceResult> {
        const resource = this.resources.get(request.params.uri);

        if (!resource) {
            throw new McpError(
                ErrorCode.InvalidRequest,
                `Resource '${request.params.uri}' not found`
            );
        }

        try {
            console.log(`📖 リソース読み取り開始: ${request.params.uri}`);
            const result = await resource.handler(request);
            console.log(`✅ リソース読み取り完了: ${request.params.uri}`);
            return result;
        } catch (error) {
            console.error(
                `❌ リソース読み取りエラー: ${request.params.uri}`,
                error
            );

            if (error instanceof McpError) {
                throw error;
            }

            throw new McpError(
                ErrorCode.InternalError,
                `Resource read failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * 利用可能なリソースの情報を取得
     * @returns リソース情報の文字列
     */
    getResourcesInfo(): string {
        const resourceList = Array.from(this.resources.values()).map(
            (resource) => {
                return `- ${resource.uri}: ${resource.description}`;
            }
        );

        return `利用可能なリソース (${
            this.resources.size
        }個):\n${resourceList.join("\n")}`;
    }
}

// シングルトンのリソースマネージャーインスタンス
export const resourceManager = new ResourceManager();
