import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * レスポンス整形サービス
 * MCPツールのレスポンス形式に統一して整形する
 */
export class SchemaResponseFormatter {
    /**
     * 成功レスポンスを作成
     * @param data - レスポンスデータ
     * @returns 整形されたCallToolResult
     */
    static formatSuccess(data: any): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(data, null, 2),
                },
            ],
        };
    }

    /**
     * エラーレスポンスを作成
     * @param errorMessage - エラーメッセージ
     * @returns 整形されたCallToolResult
     */
    static formatError(errorMessage: string): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: `エラーが発生しました: ${errorMessage}`,
                },
            ],
        };
    }

    /**
     * スキーマ一覧のレスポンスを整形
     * @param schemas - スキーマ名の配列
     * @returns 整形されたCallToolResult
     */
    static formatSchemaList(schemas: string[]): CallToolResult {
        const result = { schemas };
        return this.formatSuccess(result);
    }

    /**
     * スキーマ情報のレスポンスを整形
     * @param description - スキーマの説明
     * @returns 整形されたCallToolResult
     */
    static formatSchemaInformation(description: string): CallToolResult {
        const result = { description };
        return this.formatSuccess(result);
    }

    /**
     * スキーマ定義のレスポンスを整形
     * @param definition - スキーマ定義情報
     * @returns 整形されたCallToolResult
     */
    static formatSchemaDefinition(definition: {
        description: string;
        schema: any;
    }): CallToolResult {
        return this.formatSuccess(definition);
    }

    /**
     * スキーマプロパティのレスポンスを整形
     * @param schema - スキーマプロパティ情報
     * @returns 整形されたCallToolResult
     */
    static formatSchemaProperties(schema: any): CallToolResult {
        const result = { schema };
        return this.formatSuccess(result);
    }

    /**
     * 空の結果の場合のレスポンスを整形
     * @param type - データタイプ（"schemas" など）
     * @returns 整形されたCallToolResult
     */
    static formatEmptyResult(type: string): CallToolResult {
        const result: any = {};
        result[type] = [];
        return this.formatSuccess(result);
    }

    /**
     * データが見つからない場合のエラーレスポンスを整形
     * @param resourceType - リソースタイプ（"OpenAPI仕様", "スキーマ" など）
     * @param identifier - 識別子
     * @returns 整形されたCallToolResult
     */
    static formatNotFoundError(
        resourceType: string,
        identifier: string
    ): CallToolResult {
        return this.formatError(
            `${resourceType} '${identifier}' が見つかりません。`
        );
    }

    /**
     * バリデーションエラーのレスポンスを整形
     * @param validationError - バリデーションエラーメッセージ
     * @returns 整形されたCallToolResult
     */
    static formatValidationError(validationError: string): CallToolResult {
        return this.formatError(`バリデーションエラー: ${validationError}`);
    }

    /**
     * JSON解析エラーのレスポンスを整形
     * @param parseError - JSON解析エラーメッセージ
     * @returns 整形されたCallToolResult
     */
    static formatParseError(parseError: string): CallToolResult {
        return this.formatError(`JSON解析エラー: ${parseError}`);
    }
}
