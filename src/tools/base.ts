import {
    type CallToolRequest,
    type CallToolResult,
    type Tool as MCPTool,
    McpError,
    ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * ツールの結果タイプ（MCPのCallToolResultと同じ）
 */
export type ToolResult = CallToolResult;

/**
 * MCPツールのベースクラス
 * すべてのツールはこのクラスを継承する
 */
export abstract class BaseTool {
    /**
     * ツール名（一意である必要がある）
     */
    abstract readonly name: string;

    /**
     * ツールの説明
     */
    abstract readonly description: string;

    /**
     * ツールの入力スキーマ（JSON Schema形式）
     */
    abstract readonly inputSchema: {
        type: "object";
        properties?: { [key: string]: any };
        required?: string[];
        additionalProperties?: boolean;
        [key: string]: any;
    };

    /**
     * ツールのメイン処理
     * @param request MCP Call Tool Request
     * @returns ツールの実行結果
     */
    abstract execute(request: CallToolRequest): Promise<CallToolResult>;

    /**
     * MCPツール定義を取得
     * @returns MCP Tool definition
     */
    getMCPTool(): MCPTool {
        return {
            name: this.name,
            description: this.description,
            inputSchema: this.inputSchema,
        };
    }

    /**
     * ツールハンドラーを取得
     * @returns ツール実行ハンドラー
     */
    handler(request: CallToolRequest): Promise<CallToolResult> {
        try {
            return this.execute(request);
        } catch (error) {
            console.error(`[${this.name}] Tool execution error:`, error);

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred";

            return Promise.resolve({
                content: [
                    {
                        type: "text",
                        text: `Error: ${errorMessage}`,
                    },
                ],
                isError: true,
            });
        }
    }

    /**
     * 引数を安全に取得
     * @param request CallToolRequest
     * @param key 引数のキー
     * @param defaultValue デフォルト値
     * @returns 引数の値
     */
    protected getArgument<T>(
        request: CallToolRequest,
        key: string,
        defaultValue?: T
    ): T {
        const args = request.params.arguments as any;
        if (args && typeof args === "object" && key in args) {
            return args[key];
        }
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        throw new McpError(
            ErrorCode.InvalidParams,
            `Required argument '${key}' is missing`
        );
    }

    /**
     * 成功レスポンスを作成
     * @param text レスポンステキスト
     * @returns CallToolResult
     */
    protected createSuccessResponse(text: string): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: text,
                },
            ],
            isError: false,
        };
    }

    /**
     * エラーレスポンスを作成
     * @param message エラーメッセージ
     * @returns CallToolResult
     */
    protected createErrorResponse(message: string): CallToolResult {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${message}`,
                },
            ],
            isError: true,
        };
    }

    /**
     * 引数の妥当性を検証（サブクラスでオーバーライド可能）
     * @param args 引数オブジェクト
     */
    protected validateArguments(args: any): void {
        // デフォルトでは何もしない
        // サブクラスで必要に応じてオーバーライド
    }
}
