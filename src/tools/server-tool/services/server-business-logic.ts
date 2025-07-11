import { RepositoryFactory } from "@/tools/tool-libs/core/index.js";
import { BusinessLogicResult } from "@/tools/tool-libs/types/index.js";

/**
 * サーバー一覧の結果型
 */
export interface ServerListResult {
    servers: Array<{
        description: string;
        url: string;
    }>;
}

/**
 * サーバー情報の結果型
 */
export interface ServerInfoResult {
    title: string;
    description: string;
    version: string;
}

/**
 * @fileoverview サーバービジネスロジックサービス
 * @description OpenAPI仕様のサーバー情報に関するビジネスロジックを処理するサービス
 * @since 1.0.0
 */

/**
 * サーバー情報のビジネスロジックサービス
 * @description OpenAPI仕様のサーバー情報の取得、検索、管理を行うビジネスロジック層
 *
 * @example
 * ```typescript
 * const service = new ServerBusinessLogicService();
 *
 * // サーバー一覧取得
 * const listResult = await service.getApplicationServers('petstore');
 * if (listResult.success) {
 *   console.log('サーバー一覧:', listResult.data);
 * }
 *
 * // 特定サーバー情報取得
 * const serverResult = await service.getServerInformation('petstore', 'production');
 * if (serverResult.success) {
 *   console.log('サーバー情報:', serverResult.data);
 * }
 * ```
 *
 * @since 1.0.0
 */
export class ServerBusinessLogicService {
    /**
     * OpenAPIリポジトリインスタンス
     * @description データベースアクセスを担当するリポジトリ
     * @private
     */
    private openAPIRepository = RepositoryFactory.createOpenAPIRepository();

    /**
     * サーバーリポジトリインスタンス
     * @description サーバー情報のデータベースアクセスを担当するリポジトリ
     * @private
     */
    private serverRepository = RepositoryFactory.createServerRepository();

    /**
     * アプリケーションサーバー一覧を取得
     * @description 指定されたOpenAPI仕様に定義されているサーバー一覧を取得する
     *
     * @param {string} name - OpenAPI仕様名
     * @returns {Promise<BusinessLogicResult<any[]>>} サーバー一覧の取得結果
     *
     * @example
     * ```typescript
     * const service = new ServerBusinessLogicService();
     * const result = await service.getApplicationServers('petstore');
     *
     * if (result.success) {
     *   result.data.forEach(server => {
     *     console.log(`サーバー: ${server.url} - ${server.description}`);
     *   });
     * } else {
     *   console.error('エラー:', result.error);
     * }
     * ```
     *
     * @throws {Error} データベースアクセス時にエラーが発生した場合
     * @since 1.0.0
     */
    async getApplicationServers(
        openAPIName: string
    ): Promise<BusinessLogicResult<ServerListResult>> {
        try {
            // OpenAPIレコードを取得
            const openapi =
                this.openAPIRepository.getOpenAPIByName(openAPIName);
            if (!openapi) {
                return {
                    success: false,
                    error: `OpenAPI仕様 '${openAPIName}' が見つかりません。`,
                };
            }

            // サーバー一覧を取得
            const servers = this.serverRepository.getServersByOpenAPIId(
                openapi.id!
            );

            // 設計仕様に合わせて結果を整形
            const formattedServers = servers.map((server: any) => ({
                description: server.description || "",
                url: server.url || "",
            }));

            return {
                success: true,
                data: { servers: formattedServers },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "サーバー一覧取得中にエラーが発生しました",
            };
        }
    }

    /**
     * サーバー情報を取得
     * @param openAPIName - OpenAPI名
     * @returns サーバー情報
     */
    async getServerInformation(
        openAPIName: string
    ): Promise<BusinessLogicResult<ServerInfoResult>> {
        try {
            // OpenAPIレコードを取得
            const openapi =
                this.openAPIRepository.getOpenAPIByName(openAPIName);
            if (!openapi) {
                return {
                    success: false,
                    error: `OpenAPI仕様 '${openAPIName}' が見つかりません。`,
                };
            }

            // OpenAPI自体の情報を返す（サーバー情報として）
            return {
                success: true,
                data: {
                    title: openapi.title || "",
                    description: openapi.summary || "",
                    version: openapi.version || "",
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "サーバー情報取得中にエラーが発生しました",
            };
        }
    }
}
