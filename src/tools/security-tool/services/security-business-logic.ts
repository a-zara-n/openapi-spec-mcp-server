import { RepositoryFactory } from "../../tool-libs/core/index.js";
import { BusinessLogicResult } from "../../tool-libs/types/index.js";

/**
 * @fileoverview セキュリティビジネスロジックサービス
 * @description OpenAPI仕様のセキュリティスキーム情報に関するビジネスロジックを処理するサービス
 * @since 1.0.0
 */

/**
 * セキュリティスキーム一覧の結果型
 */
export interface SecuritySchemeListResult {
    securitySchemes: string[];
}

/**
 * セキュリティスキーム情報の結果型
 */
export interface SecuritySchemeInfoResult {
    type: string;
    scheme?: string;
    description: string;
}

/**
 * セキュリティスキーム情報のビジネスロジックサービス
 * @description OpenAPI仕様のセキュリティスキーム情報の取得、検索、管理を行うビジネスロジック層
 *
 * @example
 * ```typescript
 * const service = new SecurityBusinessLogicService();
 *
 * // セキュリティスキーム一覧取得
 * const listResult = await service.getSecuritySchemes('petstore');
 * if (listResult.success) {
 *   console.log('セキュリティスキーム一覧:', listResult.data);
 * }
 *
 * // 特定セキュリティスキーム情報取得
 * const schemeResult = await service.getSecuritySchemeInformation('petstore', 'api_key');
 * if (schemeResult.success) {
 *   console.log('セキュリティスキーム情報:', schemeResult.data);
 * }
 * ```
 *
 * @since 1.0.0
 */
export class SecurityBusinessLogicService {
    /**
     * OpenAPIリポジトリインスタンス
     * @description データベースアクセスを担当するリポジトリ
     * @private
     */
    private openAPIRepository = RepositoryFactory.createOpenAPIRepository();

    /**
     * セキュリティリポジトリインスタンス
     * @description セキュリティスキーム情報のデータベースアクセスを担当するリポジトリ
     * @private
     */
    private securityRepository = RepositoryFactory.createSecurityRepository();

    /**
     * セキュリティスキーム一覧を取得
     * @description 指定されたOpenAPI仕様に定義されているセキュリティスキーム一覧を取得する
     *
     * @param {string} name - OpenAPI仕様名
     * @returns {Promise<BusinessLogicResult<any[]>>} セキュリティスキーム一覧の取得結果
     *
     * @example
     * ```typescript
     * const service = new SecurityBusinessLogicService();
     * const result = await service.getSecuritySchemes('petstore');
     *
     * if (result.success) {
     *   result.data.forEach(scheme => {
     *     console.log(`セキュリティスキーム: ${scheme.name} - ${scheme.type}`);
     *   });
     * } else {
     *   console.error('エラー:', result.error);
     * }
     * ```
     *
     * @throws {Error} データベースアクセス時にエラーが発生した場合
     * @since 1.0.0
     */
    async getSecuritySchemes(
        openAPIName: string
    ): Promise<BusinessLogicResult<SecuritySchemeListResult>> {
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

            // セキュリティスキーム一覧を取得
            const securitySchemes =
                this.securityRepository.getSecuritySchemesByOpenAPIId(
                    openapi.id!
                );

            // スキーム名を抽出
            const schemeNames = securitySchemes.map(
                (scheme: any) => scheme.name
            );

            return {
                success: true,
                data: { securitySchemes: schemeNames },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "セキュリティスキーム一覧取得中にエラーが発生しました",
            };
        }
    }

    /**
     * セキュリティスキーム情報を取得
     * @param openAPIName - OpenAPI名
     * @param schemeName - セキュリティスキーム名
     * @returns セキュリティスキーム情報
     */
    async getSecuritySchemeInformation(
        openAPIName: string,
        schemeName: string
    ): Promise<BusinessLogicResult<SecuritySchemeInfoResult>> {
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

            // 特定のセキュリティスキームを取得
            const securityScheme =
                this.securityRepository.getSecuritySchemeByName(
                    openapi.id!,
                    schemeName
                );
            if (!securityScheme) {
                return {
                    success: false,
                    error: `セキュリティスキーム '${schemeName}' が見つかりません。`,
                };
            }

            // スキーム定義を解析
            let schemeData: any = {};
            try {
                if (securityScheme.scheme) {
                    schemeData = JSON.parse(securityScheme.scheme);
                }
            } catch (parseError) {
                console.warn(
                    "セキュリティスキーム定義の解析に失敗:",
                    parseError
                );
                // 解析に失敗した場合でも空オブジェクトで継続
            }

            return {
                success: true,
                data: {
                    type: schemeData.type || "",
                    scheme: schemeData.scheme,
                    description: securityScheme.description || "",
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "セキュリティスキーム情報取得中にエラーが発生しました",
            };
        }
    }
}
