import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * レスポンス整形サービス
 * MCPツールのレスポンス形式に統一して整形する
 */
export class ResponseFormatter {
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
     * パス一覧のレスポンスを整形
     * @param methodAndPaths - パス一覧
     * @returns 整形されたCallToolResult
     */
    static formatPathList(methodAndPaths: string[]): CallToolResult {
        const result = { methodAndPaths };
        return this.formatSuccess(result);
    }

    /**
     * パス詳細情報のレスポンスを整形
     * @param pathDetail - パス詳細情報
     * @returns 整形されたCallToolResult
     */
    static formatPathDetail(pathDetail: {
        method: string;
        path: string;
        summary?: string;
        description?: string;
        security: any[];
        parameters: any[];
        responses: Record<string, any>;
    }): CallToolResult {
        return this.formatSuccess(pathDetail);
    }

    /**
     * パラメータ情報のレスポンスを整形
     * @param parameters - パラメータ配列
     * @returns 整形されたCallToolResult
     */
    static formatParameters(parameters: any[]): CallToolResult {
        const result = { parameters };
        return this.formatSuccess(result);
    }

    /**
     * レスポンス情報のレスポンスを整形
     * @param responses - レスポンス情報
     * @returns 整形されたCallToolResult
     */
    static formatResponses(responses: Record<string, any>): CallToolResult {
        const result = { responses };
        return this.formatSuccess(result);
    }

    /**
     * パス説明のレスポンスを整形
     * @param description - 説明情報
     * @returns 整形されたCallToolResult
     */
    static formatPathDescription(description: {
        method: string;
        path: string;
        summary?: string;
        description?: string;
        security: any[];
    }): CallToolResult {
        return this.formatSuccess(description);
    }

    /**
     * リクエストボディのレスポンスを整形
     * @param requestData - リクエストボディまたはパラメータ情報
     * @returns 整形されたCallToolResult
     */
    static formatRequestBody(requestData: {
        parameters?: any[];
        requestBody?: any;
    }): CallToolResult {
        return this.formatSuccess(requestData);
    }

    /**
     * 空の結果の場合のレスポンスを整形
     * @param type - データタイプ（"methodAndPaths", "parameters" など）
     * @returns 整形されたCallToolResult
     */
    static formatEmptyResult(type: string): CallToolResult {
        const result: any = {};
        result[type] = [];
        return this.formatSuccess(result);
    }

    /**
     * データが見つからない場合のエラーレスポンスを整形
     * @param resourceType - リソースタイプ（"OpenAPI仕様", "パス" など）
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
}
