import { RepositoryFactory } from "../../tool-libs/core/index.js";
import {
    parseMethodAndPath,
    parseParameters,
    parseResponses,
    parseSecurity,
} from "../parser.js";

/**
 * ビジネスロジックの結果型
 */
export type BusinessLogicResult<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: string;
      };

/**
 * パス一覧の結果型
 */
export interface PathListResult {
    methodAndPaths: string[];
}

/**
 * パス詳細情報の結果型
 */
export interface PathDetailResult {
    method: string;
    path: string;
    summary?: string;
    description?: string;
    security: any[];
    parameters: any[];
    responses: Record<string, any>;
}

/**
 * @fileoverview パスビジネスロジックサービス
 * @description OpenAPI仕様のパス情報に関するビジネスロジックを処理するサービス
 * @since 1.0.0
 */

/**
 * パス情報のビジネスロジックサービス
 * @description OpenAPI仕様のパス情報の取得、検索、管理を行うビジネスロジック層
 *
 * @example
 * ```typescript
 * const service = new PathBusinessLogicService();
 *
 * // パス一覧取得
 * const listResult = await service.getPathList('petstore');
 * if (listResult.success) {
 *   console.log('パス一覧:', listResult.data);
 * }
 *
 * // 特定パス情報取得
 * const pathResult = await service.getPathInformation('petstore', 'GET /pets');
 * if (pathResult.success) {
 *   console.log('パス情報:', pathResult.data);
 * }
 * ```
 *
 * @since 1.0.0
 */
export class PathBusinessLogicService {
    /**
     * OpenAPIリポジトリインスタンス
     * @description データベースアクセスを担当するリポジトリ
     * @private
     */
    private openAPIRepository = RepositoryFactory.createOpenAPIRepository();

    /**
     * パスリポジトリインスタンス
     * @description パス情報のデータベースアクセスを担当するリポジトリ
     * @private
     */
    private pathRepository = RepositoryFactory.createPathRepository();

    /**
     * パス一覧を取得
     * @description 指定されたOpenAPI仕様に定義されているパス一覧を取得する
     *
     * @param {string} name - OpenAPI仕様名
     * @returns {Promise<BusinessLogicResult<any[]>>} パス一覧の取得結果
     *
     * @example
     * ```typescript
     * const service = new PathBusinessLogicService();
     * const result = await service.getPathList('petstore');
     *
     * if (result.success) {
     *   result.data.forEach(path => {
     *     console.log(`パス: ${path.method} ${path.path} - ${path.summary}`);
     *   });
     * } else {
     *   console.error('エラー:', result.error);
     * }
     * ```
     *
     * @throws {Error} データベースアクセス時にエラーが発生した場合
     * @since 1.0.0
     */
    async getPathList(
        openAPIName: string
    ): Promise<BusinessLogicResult<PathListResult>> {
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

            // パス一覧を取得
            const paths = this.pathRepository.getPathsByOpenAPIId(openapi.id!);

            // 設計仕様に合わせてJSON形式で結果を整形
            const methodAndPaths = paths.map(
                (path: any) => `${path.method} ${path.path}`
            );

            return {
                success: true,
                data: { methodAndPaths },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "パス一覧取得中にエラーが発生しました",
            };
        }
    }

    /**
     * 特定のパスの詳細情報を取得
     * @param openAPIName - OpenAPI名
     * @param methodAndPath - "GET /users" 形式の文字列
     * @returns パス詳細情報
     */
    async getPathDetail(
        openAPIName: string,
        methodAndPath: string
    ): Promise<BusinessLogicResult<PathDetailResult>> {
        try {
            // methodAndPathを解析
            const parseResult = parseMethodAndPath(methodAndPath);
            if (!parseResult.success) {
                return {
                    success: false,
                    error: parseResult.error,
                };
            }

            const { method, path } = parseResult.data;

            // OpenAPIレコードを取得
            const openapi =
                this.openAPIRepository.getOpenAPIByName(openAPIName);
            if (!openapi) {
                return {
                    success: false,
                    error: `OpenAPI仕様 '${openAPIName}' が見つかりません。`,
                };
            }

            // 特定のパスを取得
            const pathRecord = this.pathRepository.getPathByMethodAndPath(
                openapi.id!,
                method,
                path
            );

            if (!pathRecord) {
                return {
                    success: false,
                    error: `パス '${method} ${path}' が見つかりません。`,
                };
            }

            // パラメータとレスポンスを解析
            const parameters = parseParameters(pathRecord.parameters);
            const responses = parseResponses(pathRecord.responses);
            const security = parseSecurity(pathRecord.security);

            return {
                success: true,
                data: {
                    method: pathRecord.method,
                    path: pathRecord.path,
                    summary: pathRecord.summary || undefined,
                    description: pathRecord.description || undefined,
                    security,
                    parameters,
                    responses,
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "パス詳細取得中にエラーが発生しました",
            };
        }
    }

    /**
     * パスのパラメータ情報を取得
     * @param openAPIName - OpenAPI名
     * @param methodAndPath - "GET /users" 形式の文字列
     * @returns パラメータ情報
     */
    async getPathParameters(
        openAPIName: string,
        methodAndPath: string
    ): Promise<BusinessLogicResult<{ parameters: any[] }>> {
        try {
            const pathDetailResult = await this.getPathDetail(
                openAPIName,
                methodAndPath
            );
            if (!pathDetailResult.success) {
                return pathDetailResult;
            }

            return {
                success: true,
                data: {
                    parameters: pathDetailResult.data.parameters,
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "パラメータ取得中にエラーが発生しました",
            };
        }
    }

    /**
     * パスのレスポンス情報を取得
     * @param openAPIName - OpenAPI名
     * @param methodAndPath - "GET /users" 形式の文字列
     * @returns レスポンス情報
     */
    async getPathResponses(
        openAPIName: string,
        methodAndPath: string
    ): Promise<BusinessLogicResult<{ responses: Record<string, any> }>> {
        try {
            const pathDetailResult = await this.getPathDetail(
                openAPIName,
                methodAndPath
            );
            if (!pathDetailResult.success) {
                return pathDetailResult;
            }

            return {
                success: true,
                data: {
                    responses: pathDetailResult.data.responses,
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "レスポンス取得中にエラーが発生しました",
            };
        }
    }

    /**
     * パスの説明情報を取得
     * @param openAPIName - OpenAPI名
     * @param methodAndPath - "GET /users" 形式の文字列
     * @returns 説明情報
     */
    async getPathDescription(
        openAPIName: string,
        methodAndPath: string
    ): Promise<
        BusinessLogicResult<{
            method: string;
            path: string;
            summary?: string;
            description?: string;
            security: any[];
        }>
    > {
        try {
            const pathDetailResult = await this.getPathDetail(
                openAPIName,
                methodAndPath
            );
            if (!pathDetailResult.success) {
                return pathDetailResult;
            }

            const { method, path, summary, description, security } =
                pathDetailResult.data;

            return {
                success: true,
                data: {
                    method,
                    path,
                    summary,
                    description,
                    security,
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "説明取得中にエラーが発生しました",
            };
        }
    }

    /**
     * パスのリクエストボディ情報を取得
     * リクエストボディは現在データベースに格納されていないため、parametersを返す
     * @param openAPIName - OpenAPI名
     * @param methodAndPath - "GET /users" 形式の文字列
     * @returns リクエストボディまたはパラメータ情報
     */
    async getPathRequestBody(
        openAPIName: string,
        methodAndPath: string
    ): Promise<BusinessLogicResult<{ parameters?: any[]; requestBody?: any }>> {
        try {
            const pathDetailResult = await this.getPathDetail(
                openAPIName,
                methodAndPath
            );
            if (!pathDetailResult.success) {
                return pathDetailResult;
            }

            const { parameters } = pathDetailResult.data;

            // リクエストボディがない場合はパラメータを返す
            if (parameters && parameters.length > 0) {
                return {
                    success: true,
                    data: { parameters },
                };
            }

            // 仮のリクエストボディ構造（実際のデータベース構造に依存）
            return {
                success: true,
                data: { parameters: [] },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "リクエストボディ取得中にエラーが発生しました",
            };
        }
    }
}
