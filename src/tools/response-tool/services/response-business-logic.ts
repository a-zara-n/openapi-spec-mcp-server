import { RepositoryFactory } from "../../tool-libs/core/index.js";
import { BusinessLogicResult } from "../../tool-libs/types/index.js";

/**
 * レスポンス一覧の結果型
 */
export interface ResponseListResult {
    responseNames: string[];
}

/**
 * レスポンス情報の結果型
 */
export interface ResponseInfoResult {
    description: string;
    content?: any;
}

/**
 * @fileoverview レスポンスビジネスロジックサービス
 * @description OpenAPI仕様のレスポンス情報に関するビジネスロジックを処理するサービス
 * @since 1.0.0
 */

/**
 * レスポンス情報のビジネスロジックサービス
 * @description OpenAPI仕様のレスポンス情報の取得、検索、管理を行うビジネスロジック層
 *
 * @example
 * ```typescript
 * const service = new ResponseBusinessLogicService();
 *
 * // レスポンス一覧取得
 * const listResult = await service.getResponseList('petstore');
 * if (listResult.success) {
 *   console.log('レスポンス一覧:', listResult.data);
 * }
 *
 * // 特定レスポンス情報取得
 * const responseResult = await service.getResponseInformation('petstore', '200');
 * if (responseResult.success) {
 *   console.log('レスポンス情報:', responseResult.data);
 * }
 * ```
 *
 * @since 1.0.0
 */
export class ResponseBusinessLogicService {
    /**
     * OpenAPIリポジトリインスタンス
     * @description データベースアクセスを担当するリポジトリ
     * @private
     */
    private openAPIRepository = RepositoryFactory.createOpenAPIRepository();

    /**
     * レスポンスリポジトリインスタンス
     * @description レスポンス情報のデータベースアクセスを担当するリポジトリ
     * @private
     */
    private responseRepository = RepositoryFactory.createResponseRepository();

    /**
     * レスポンス一覧を取得
     * @description 指定されたOpenAPI仕様に定義されているレスポンス一覧を取得する
     *
     * @param {string} name - OpenAPI仕様名
     * @returns {Promise<BusinessLogicResult<any[]>>} レスポンス一覧の取得結果
     *
     * @example
     * ```typescript
     * const service = new ResponseBusinessLogicService();
     * const result = await service.getResponseList('petstore');
     *
     * if (result.success) {
     *   result.data.forEach(response => {
     *     console.log(`レスポンス: ${response.name} - ${response.description}`);
     *   });
     * } else {
     *   console.error('エラー:', result.error);
     * }
     * ```
     *
     * @throws {Error} データベースアクセス時にエラーが発生した場合
     * @since 1.0.0
     */
    async getResponseList(
        openAPIName: string
    ): Promise<BusinessLogicResult<ResponseListResult>> {
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

            // レスポンス一覧を取得
            const responses = this.responseRepository.getResponsesByOpenAPIId(
                openapi.id!
            );

            // レスポンス名を抽出
            const responseNames = responses.map(
                (response: any) => response.name
            );

            return {
                success: true,
                data: { responseNames },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "レスポンス一覧取得中にエラーが発生しました",
            };
        }
    }

    /**
     * レスポンス情報を取得
     * @param openAPIName - OpenAPI名
     * @param responseName - レスポンス名
     * @returns レスポンス情報
     */
    async getResponseInformation(
        openAPIName: string,
        responseName: string
    ): Promise<BusinessLogicResult<ResponseInfoResult>> {
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

            // 特定のレスポンスを取得
            const response = this.responseRepository.getResponseByName(
                openapi.id!,
                responseName
            );
            if (!response) {
                return {
                    success: false,
                    error: `レスポンス '${responseName}' が見つかりません。`,
                };
            }

            // レスポンス定義を解析
            let responseContent: any = undefined;
            try {
                if (response.content) {
                    responseContent = JSON.parse(response.content);
                }
            } catch (parseError) {
                console.warn("レスポンス定義の解析に失敗:", parseError);
                // 解析に失敗した場合でもundefinedで継続
            }

            return {
                success: true,
                data: {
                    description: response.description || "",
                    content: responseContent,
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "レスポンス情報取得中にエラーが発生しました",
            };
        }
    }
}
