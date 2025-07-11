import { RepositoryFactory } from "../core/di/index.js";

// 型定義を新しい統合ファイルからインポート
import type {
    ExtractedOpenAPIData,
    IDependencyConfig,
    StorageResult,
    StorageServiceConfig,
} from "../types/index.js";

// ハッシュ比較ユーティリティをインポート
import { compareHashes } from "../utils/hash.js";

/**
 * OpenAPIストレージサービス
 * データベースへの保存処理のみを担当
 */
export class OpenAPIStorageService {
    private config: StorageServiceConfig;
    private repositories: any;

    constructor(
        dependencyConfig?: IDependencyConfig,
        storageConfig: StorageServiceConfig = {}
    ) {
        this.config = {
            enableLogging: true,
            replaceExisting: true,
            validateBeforeStore: false,
            ...storageConfig,
        };

        // リポジトリセットを作成
        this.repositories =
            RepositoryFactory.createRepositorySet(dependencyConfig);
    }

    /**
     * 抽出されたOpenAPIデータをデータベースに保存
     * @param extractedData 抽出されたOpenAPIデータ
     * @returns 保存結果
     */
    async store(extractedData: ExtractedOpenAPIData): Promise<StorageResult> {
        try {
            this.log(`🔍 OpenAPI保存開始: ${extractedData.basic.name}`);

            // ハッシュチェック（ファイルが変更されていない場合はスキップ）
            const hashCheckResult = await this.checkFileHash(extractedData);
            if (!hashCheckResult.shouldUpdate) {
                this.log(`⏭️ ハッシュ未変更のためスキップ: ${extractedData.basic.name} (${hashCheckResult.existingHash?.substring(0, 16)}...)`);
                
                return {
                    success: true,
                    openapiId: hashCheckResult.existingId!,
                    message: `OpenAPI "${extractedData.basic.name}" は変更されていないためスキップしました`,
                    details: {
                        serversStored: 0,
                        pathsStored: 0,
                        schemasStored: 0,
                        securitySchemesStored: 0,
                        responsesStored: 0,
                    },
                    skipped: true,
                };
            }

            this.log(`🔄 ハッシュ変更検知: ${extractedData.basic.name} - 更新処理を実行`);
            if (hashCheckResult.existingHash) {
                this.log(`   📝 旧ハッシュ: ${hashCheckResult.existingHash.substring(0, 16)}...`);
            }
            this.log(`   📝 新ハッシュ: ${extractedData.fileHash?.substring(0, 16)}...`);

            // 既存データの処理
            if (this.config.replaceExisting && hashCheckResult.existingId) {
                await this.handleExistingData(extractedData.basic.name);
            }

            // 基本情報を保存（ハッシュ含む）
            const openapiId = await this.storeBasicInfo(extractedData.basic, extractedData.fileHash);
            this.log(`✅ OpenAPIレコード保存完了: ID=${openapiId}`);

            // 関連データを保存
            const details = await this.storeRelatedData(
                openapiId,
                extractedData
            );

            this.log(`🎉 OpenAPI保存完了: ${extractedData.basic.name}`);

            return {
                success: true,
                openapiId,
                message: `OpenAPI "${extractedData.basic.name}" の保存が完了しました`,
                details,
            };
        } catch (error) {
            const errorMessage = `OpenAPI保存エラー: ${
                error instanceof Error ? error.message : "Unknown error"
            }`;
            this.log(`❌ ${errorMessage}`, true);

            return {
                success: false,
                message: errorMessage,
            };
        }
    }

    /**
     * 既存データの処理
     * @param name API名
     */
    private async handleExistingData(name: string): Promise<void> {
        const existingAPI = this.repositories.openapi.getOpenAPIByName(name);
        if (existingAPI) {
            this.repositories.openapi.deleteOpenAPIData(existingAPI.id!);
            this.log(`🗑️ 既存データを削除: ${name}`);
        }
    }

    /**
     * ファイルハッシュをチェックして更新が必要か判定
     * @param extractedData 抽出されたデータ
     * @returns ハッシュチェック結果
     */
    private async checkFileHash(extractedData: ExtractedOpenAPIData): Promise<{
        shouldUpdate: boolean;
        existingId?: number;
        existingHash?: string;
    }> {
        try {
            const existingAPI = this.repositories.openapi.getOpenAPIByName(extractedData.basic.name);
            
            if (!existingAPI) {
                // 新規データの場合は必ず更新
                return { shouldUpdate: true };
            }

            const existingHash = existingAPI.file_hash;
            const newHash = extractedData.fileHash;

            if (!newHash) {
                // 新しいハッシュがない場合は更新
                return { 
                    shouldUpdate: true, 
                    existingId: existingAPI.id,
                    existingHash 
                };
            }

            if (!existingHash) {
                // 既存データにハッシュがない場合は更新
                return { 
                    shouldUpdate: true, 
                    existingId: existingAPI.id,
                    existingHash 
                };
            }

            // ハッシュ比較
            const shouldUpdate = !compareHashes(existingHash, newHash);
            
            return {
                shouldUpdate,
                existingId: existingAPI.id,
                existingHash
            };
        } catch (error) {
            this.log(`⚠️ ハッシュチェックエラー: ${error}`, true);
            // エラーの場合は安全のため更新を実行
            return { shouldUpdate: true };
        }
    }

    /**
     * 基本情報を保存
     * @param basicInfo 基本情報
     * @param fileHash ファイルハッシュ
     * @returns OpenAPI ID
     */
    private async storeBasicInfo(
        basicInfo: ExtractedOpenAPIData["basic"],
        fileHash?: string
    ): Promise<number> {
        return this.repositories.openapi.insertOrUpdateOpenAPI({
            name: basicInfo.name,
            title: basicInfo.title,
            summary: basicInfo.summary,
            version: basicInfo.version,
            content: JSON.stringify({
                openapi: basicInfo.openApiVersion,
                info: basicInfo,
            }),
            file_hash: fileHash,
        });
    }

    /**
     * 関連データを保存
     * @param openapiId OpenAPI ID
     * @param extractedData 抽出されたデータ
     * @returns 保存詳細
     */
    private async storeRelatedData(
        openapiId: number,
        extractedData: ExtractedOpenAPIData
    ): Promise<StorageResult["details"]> {
        const details = {
            serversStored: 0,
            pathsStored: 0,
            schemasStored: 0,
            securitySchemesStored: 0,
            responsesStored: 0,
        };

        // サーバー情報を保存
        details.serversStored = await this.storeServers(
            openapiId,
            extractedData.servers
        );

        // パス情報を保存
        details.pathsStored = await this.storePaths(
            openapiId,
            extractedData.paths
        );

        // スキーマ情報を保存
        details.schemasStored = await this.storeSchemas(
            openapiId,
            extractedData.schemas
        );

        // セキュリティスキーム情報を保存
        details.securitySchemesStored = await this.storeSecuritySchemes(
            openapiId,
            extractedData.securitySchemes
        );

        // レスポンス情報を保存
        details.responsesStored = await this.storeResponses(
            openapiId,
            extractedData.responses
        );

        return details;
    }

    /**
     * サーバー情報を保存
     * @param openapiId OpenAPI ID
     * @param servers サーバー情報の配列
     * @returns 保存した件数
     */
    private async storeServers(
        openapiId: number,
        servers: ExtractedOpenAPIData["servers"]
    ): Promise<number> {
        let count = 0;
        for (const server of servers) {
            try {
                this.repositories.server.insertServer({
                    openapi_id: openapiId,
                    description: server.description,
                    url: server.url,
                });
                this.log(`🌐 サーバー保存: ${server.url}`);
                count++;
            } catch (error) {
                this.log(
                    `❌ サーバー保存エラー: ${server.url} - ${error}`,
                    true
                );
            }
        }
        return count;
    }

    /**
     * パス情報を保存
     * @param openapiId OpenAPI ID
     * @param paths パス情報の配列
     * @returns 保存した件数
     */
    private async storePaths(
        openapiId: number,
        paths: ExtractedOpenAPIData["paths"]
    ): Promise<number> {
        let count = 0;
        for (const path of paths) {
            try {
                this.repositories.path.insertPath({
                    openapi_id: openapiId,
                    method: path.method,
                    path: path.path,
                    summary: path.summary,
                    description: path.description,
                    security: path.security
                        ? JSON.stringify(path.security)
                        : undefined,
                    parameters: path.parameters
                        ? JSON.stringify(path.parameters)
                        : undefined,
                    responses: path.responses
                        ? JSON.stringify(path.responses)
                        : undefined,
                    requestBody: path.requestBody
                        ? JSON.stringify(path.requestBody)
                        : undefined,
                });
                this.log(`🛤️ パス保存: ${path.method} ${path.path}`);
                count++;
            } catch (error) {
                this.log(
                    `❌ パス保存エラー: ${path.method} ${path.path} - ${error}`,
                    true
                );
            }
        }
        return count;
    }

    /**
     * スキーマ情報を保存
     * @param openapiId OpenAPI ID
     * @param schemas スキーマ情報の配列
     * @returns 保存した件数
     */
    private async storeSchemas(
        openapiId: number,
        schemas: ExtractedOpenAPIData["schemas"]
    ): Promise<number> {
        let count = 0;
        for (const schema of schemas) {
            try {
                this.repositories.schema.insertSchema({
                    openapi_id: openapiId,
                    name: schema.name,
                    description: schema.description,
                    schema: JSON.stringify(schema.schema),
                });
                this.log(`📊 スキーマ保存: ${schema.name}`);
                count++;
            } catch (error) {
                this.log(
                    `❌ スキーマ保存エラー: ${schema.name} - ${error}`,
                    true
                );
            }
        }
        return count;
    }

    /**
     * セキュリティスキーム情報を保存
     * @param openapiId OpenAPI ID
     * @param securitySchemes セキュリティスキーム情報の配列
     * @returns 保存した件数
     */
    private async storeSecuritySchemes(
        openapiId: number,
        securitySchemes: ExtractedOpenAPIData["securitySchemes"]
    ): Promise<number> {
        let count = 0;
        for (const scheme of securitySchemes) {
            try {
                this.repositories.security.insertSecurityScheme({
                    openapi_id: openapiId,
                    name: scheme.name,
                    type: scheme.type,
                    scheme: scheme.scheme,
                    description: scheme.description,
                    content: JSON.stringify(scheme.content),
                });
                this.log(`🔐 セキュリティスキーム保存: ${scheme.name}`);
                count++;
            } catch (error) {
                this.log(
                    `❌ セキュリティスキーム保存エラー: ${scheme.name} - ${error}`,
                    true
                );
            }
        }
        return count;
    }

    /**
     * レスポンス情報を保存
     * @param openapiId OpenAPI ID
     * @param responses レスポンス情報の配列
     * @returns 保存した件数
     */
    private async storeResponses(
        openapiId: number,
        responses: ExtractedOpenAPIData["responses"]
    ): Promise<number> {
        let count = 0;
        for (const response of responses) {
            try {
                this.repositories.response.insertResponse({
                    openapi_id: openapiId,
                    name: response.name,
                    description: response.description,
                    content: JSON.stringify(response.content),
                });
                this.log(`📤 レスポンス保存: ${response.name}`);
                count++;
            } catch (error) {
                this.log(
                    `❌ レスポンス保存エラー: ${response.name} - ${error}`,
                    true
                );
            }
        }
        return count;
    }

    /**
     * ログ出力
     * @param message メッセージ
     * @param isError エラーかどうか
     */
    private log(message: string, isError: boolean = false): void {
        if (this.config.enableLogging) {
            if (isError) {
                console.error(message);
            } else {
                console.log(message);
            }
        }
    }

    /**
     * 設定を更新
     * @param newConfig 新しい設定
     */
    updateConfig(newConfig: Partial<StorageServiceConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

/**
 * デフォルトインスタンス作成関数
 */
export function createStorageService(
    dependencyConfig?: IDependencyConfig,
    storageConfig?: StorageServiceConfig
): OpenAPIStorageService {
    return new OpenAPIStorageService(dependencyConfig, storageConfig);
}

// 型定義も再エクスポート（後方互換性のため）
export type { StorageResult, StorageServiceConfig };
