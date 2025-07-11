import { RepositoryFactory } from "../../tool-libs/core/index.js";

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
 * スキーマ一覧の結果型
 */
export interface SchemaListResult {
    schemas: string[];
}

/**
 * スキーマ情報の結果型
 */
export interface SchemaInfoResult {
    description: string;
}

/**
 * スキーマ定義の結果型
 */
export interface SchemaDefinitionResult {
    description: string;
    schema: any;
}

/**
 * スキーマプロパティの結果型
 */
export interface SchemaPropertiesResult {
    schema: any;
}

/**
 * @fileoverview スキーマビジネスロジックサービス
 * @description OpenAPI仕様のスキーマ情報に関するビジネスロジックを処理するサービス
 * @since 1.0.0
 */
export class SchemaBusinessLogicService {
    /**
     * OpenAPIリポジトリインスタンス
     * @description データベースアクセスを担当するリポジトリ
     * @private
     */
    private openAPIRepository = RepositoryFactory.createOpenAPIRepository();

    /**
     * スキーマリポジトリインスタンス
     * @description スキーマ情報のデータベースアクセスを担当するリポジトリ
     * @private
     */
    private schemaRepository = RepositoryFactory.createSchemaRepository();

    /**
     * スキーマ一覧を取得
     * @description 指定されたOpenAPI仕様に定義されているスキーマ一覧を取得する
     *
     * @param {string} name - OpenAPI仕様名
     * @returns {Promise<BusinessLogicResult<any[]>>} スキーマ一覧の取得結果
     *
     * @example
     * ```typescript
     * const service = new SchemaBusinessLogicService();
     * const result = await service.getSchemaList('petstore');
     *
     * if (result.success) {
     *   result.data.forEach(schema => {
     *     console.log(`スキーマ: ${schema.name} - ${schema.description}`);
     *   });
     * } else {
     *   console.error('エラー:', result.error);
     * }
     * ```
     *
     * @throws {Error} データベースアクセス時にエラーが発生した場合
     * @since 1.0.0
     */
    async getSchemaList(
        openAPIName: string
    ): Promise<BusinessLogicResult<SchemaListResult>> {
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

            // スキーマ一覧を取得
            const schemas = this.schemaRepository.getSchemasByOpenAPIId(
                openapi.id!
            );

            // スキーマ名を抽出
            const schemaNames = schemas.map((schema: any) => schema.name);

            return {
                success: true,
                data: { schemas: schemaNames },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "スキーマ一覧取得中にエラーが発生しました",
            };
        }
    }

    /**
     * スキーマ情報を取得
     * @param openAPIName - OpenAPI名
     * @param schemaName - スキーマ名
     * @returns スキーマ情報
     */
    async getSchemaInformation(
        openAPIName: string,
        schemaName: string
    ): Promise<BusinessLogicResult<SchemaInfoResult>> {
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

            // 特定のスキーマを取得
            const schema = this.schemaRepository.getSchemaByName(
                openapi.id!,
                schemaName
            );
            if (!schema) {
                return {
                    success: false,
                    error: `スキーマ '${schemaName}' が見つかりません。`,
                };
            }

            return {
                success: true,
                data: {
                    description: schema.description || "",
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "スキーマ情報取得中にエラーが発生しました",
            };
        }
    }

    /**
     * スキーマ定義を取得
     * @param openAPIName - OpenAPI名
     * @param schemaName - スキーマ名
     * @returns スキーマ定義
     */
    async getSchemaDefinition(
        openAPIName: string,
        schemaName: string
    ): Promise<BusinessLogicResult<SchemaDefinitionResult>> {
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

            // 特定のスキーマを取得
            const schema = this.schemaRepository.getSchemaByName(
                openapi.id!,
                schemaName
            );
            if (!schema) {
                return {
                    success: false,
                    error: `スキーマ '${schemaName}' が見つかりません。`,
                };
            }

            // スキーマ定義を解析
            let schemaData = {};
            try {
                if (schema.schema) {
                    schemaData = JSON.parse(schema.schema);
                }
            } catch (parseError) {
                console.warn("スキーマ定義の解析に失敗:", parseError);
                // 解析に失敗した場合でも空オブジェクトで継続
            }

            return {
                success: true,
                data: {
                    description: schema.description || "",
                    schema: schemaData,
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "スキーマ定義取得中にエラーが発生しました",
            };
        }
    }

    /**
     * スキーマプロパティを取得
     * @param openAPIName - OpenAPI名
     * @param schemaName - スキーマ名
     * @returns スキーマプロパティ
     */
    async getSchemaProperties(
        openAPIName: string,
        schemaName: string
    ): Promise<BusinessLogicResult<SchemaPropertiesResult>> {
        try {
            // スキーマ定義を取得
            const definitionResult = await this.getSchemaDefinition(
                openAPIName,
                schemaName
            );
            if (!definitionResult.success) {
                return definitionResult;
            }

            return {
                success: true,
                data: {
                    schema: definitionResult.data.schema,
                },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "スキーマプロパティ取得中にエラーが発生しました",
            };
        }
    }
}
