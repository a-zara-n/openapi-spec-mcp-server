import {
    McpError,
    ErrorCode,
    type CallToolRequest,
    type CallToolResult,
    type Tool as MCPTool,
} from "@modelcontextprotocol/sdk/types.js";

// ベース機能
export {
    DatabaseManager,
    SQLiteDatabaseConnection,
} from "./tool-libs/core/database/index.js";
export { DIContainer, RepositoryFactory } from "./tool-libs/core/index.js";
export { openAPIParser } from "./tool-libs/utils/parser.js";

// 共通インターフェース
export type * from "./tool-libs/types/interfaces.js";

// OpenAPIツール
export * from "./openapi-tool/index.js";

// Serverツール
export * from "./server-tool/index.js";

// Pathツール
export * from "./path-tool/index.js";

// Schemaツール
export * from "./schema-tool/index.js";

// Securityツール
export * from "./security-tool/index.js";

// Responseツール
export * from "./response-tool/index.js";

// ツールとハンドラーのインポート
import {
    listOpenAPIsTool,
    setServerInfoTool,
    handleListOpenAPIs,
    handleSetServerInfo,
} from "./openapi-tool/index.js";
import {
    listApplicationServersTool,
    getServerInformationTool,
    handleListApplicationServers,
    handleGetServerInformation,
} from "./server-tool/index.js";
import {
    listPathsTool,
    getPathInformationTool,
    getPathParametersTool,
    getPathResponsesTool,
    getPathRequestBodyTool,
    getPathDescribeTool,
    handleListPaths,
    handleGetPathInformation,
    handleGetPathParameters,
    handleGetPathResponses,
    handleGetPathRequestBody,
    handleGetPathDescribe,
} from "./path-tool/index.js";
import {
    getSchemaListTool,
    getSchemaInformationTool,
    getSchemaDefinitionTool,
    getSchemaPropertiesTool,
    handleGetSchemaList,
    handleGetSchemaInformation,
    handleGetSchemaDefinition,
    handleGetSchemaProperties,
} from "./schema-tool/index.js";
import {
    listSecuritySchemesTool,
    getSecuritySchemeInformationTool,
    handleListSecuritySchemes,
    handleGetSecuritySchemeInformation,
} from "./security-tool/index.js";
import {
    listResponsesTool,
    getResponseInformationTool,
    handleListResponses,
    handleGetResponseInformation,
} from "./response-tool/index.js";

/**
 * MCPツールの配列
 * @description 利用可能な全てのMCPツールを格納する配列
 */
const tools: MCPTool[] = [
    // OpenAPI基本ツール
    setServerInfoTool,
    listOpenAPIsTool,
    // サーバー関連ツール
    listApplicationServersTool,
    getServerInformationTool,
    // パス関連ツール
    listPathsTool,
    getPathInformationTool,
    getPathParametersTool,
    getPathResponsesTool,
    getPathRequestBodyTool,
    getPathDescribeTool,
    // スキーマ関連ツール
    getSchemaListTool,
    getSchemaInformationTool,
    getSchemaDefinitionTool,
    getSchemaPropertiesTool,
    // セキュリティ関連ツール
    listSecuritySchemesTool,
    getSecuritySchemeInformationTool,
    // レスポンス関連ツール
    listResponsesTool,
    getResponseInformationTool,
];

/**
 * ツールハンドラーマップ
 * @description ツール名とハンドラー関数のマッピング
 */
const toolHandlers = new Map<
    string,
    (request: CallToolRequest) => Promise<CallToolResult>
>([
    // OpenAPI基本ツール
    [setServerInfoTool.name, handleSetServerInfo],
    [listOpenAPIsTool.name, handleListOpenAPIs],
    // サーバー関連ツール
    [listApplicationServersTool.name, handleListApplicationServers],
    [getServerInformationTool.name, handleGetServerInformation],
    // パス関連ツール
    [listPathsTool.name, handleListPaths],
    [getPathInformationTool.name, handleGetPathInformation],
    [getPathParametersTool.name, handleGetPathParameters],
    [getPathResponsesTool.name, handleGetPathResponses],
    [getPathRequestBodyTool.name, handleGetPathRequestBody],
    [getPathDescribeTool.name, handleGetPathDescribe],
    // スキーマ関連ツール
    [getSchemaListTool.name, handleGetSchemaList],
    [getSchemaInformationTool.name, handleGetSchemaInformation],
    [getSchemaDefinitionTool.name, handleGetSchemaDefinition],
    [getSchemaPropertiesTool.name, handleGetSchemaProperties],
    // セキュリティ関連ツール
    [listSecuritySchemesTool.name, handleListSecuritySchemes],
    [getSecuritySchemeInformationTool.name, handleGetSecuritySchemeInformation],
    // レスポンス関連ツール
    [listResponsesTool.name, handleListResponses],
    [getResponseInformationTool.name, handleGetResponseInformation],
]);

/**
 * ツールマネージャークラス
 * @description MCPサーバーで利用可能なすべてのツールを管理するクラス
 *
 * @example
 * ```typescript
 * const toolManager = new ToolManager();
 * const tools = toolManager.getToolList();
 * const result = await toolManager.executeTool(request);
 * ```
 *
 * @since 1.0.0
 */
export class ToolManager {
    /**
     * ToolManagerのコンストラクタ
     * @description 利用可能なツールを初期化し、登録状況をログ出力する
     */
    constructor() {
        console.log(`🔧 ${tools.length} 個のツールが登録されました`);
        tools.forEach((tool) => {
            console.log(`✅ ツール登録: ${tool.name} - ${tool.description}`);
        });
    }

    /**
     * MCPツールのリストを取得
     * @description 登録されている全てのMCPツールの配列を返す
     * @returns {MCPTool[]} MCPツールの配列
     *
     * @example
     * ```typescript
     * const toolManager = new ToolManager();
     * const tools = toolManager.getToolList();
     * console.log(`利用可能なツール数: ${tools.length}`);
     * ```
     */
    getToolList(): MCPTool[] {
        return tools;
    }

    /**
     * ツールが存在するかチェック
     * @description 指定された名前のツールが登録されているかを確認する
     * @param {string} name - チェックするツール名
     * @returns {boolean} ツールが存在する場合はtrue、そうでなければfalse
     *
     * @example
     * ```typescript
     * const toolManager = new ToolManager();
     * if (toolManager.hasTool('openapi_set_server_info')) {
     *   console.log('ツールが利用可能です');
     * }
     * ```
     */
    hasTool(name: string): boolean {
        return toolHandlers.has(name);
    }

    /**
     * ツールを実行
     * @description 指定されたリクエストに基づいてツールを実行する
     * @param {CallToolRequest} request - ツール実行リクエスト
     * @returns {Promise<CallToolResult>} ツールの実行結果
     * @throws {McpError} ツールが見つからない場合、または実行時にエラーが発生した場合
     *
     * @example
     * ```typescript
     * const toolManager = new ToolManager();
     * try {
     *   const result = await toolManager.executeTool({
     *     params: { name: 'openapi_list_openapis', arguments: {} }
     *   });
     *   console.log('実行結果:', result);
     * } catch (error) {
     *   console.error('エラー:', error.message);
     * }
     * ```
     */
    async executeTool(request: CallToolRequest): Promise<CallToolResult> {
        const startTime = Date.now();
        const toolName = request.params.name;
        const executionId = Math.random().toString(36).substring(2, 8);

        console.log(`🔧 === Tool Execution Start [${executionId}] ===`);
        console.log(`🛠️ ツール名: ${toolName}`);
        console.log(`🕐 実行開始時刻: ${new Date().toISOString()}`);

        // 引数の詳細ログ
        if (
            request.params.arguments &&
            Object.keys(request.params.arguments).length > 0
        ) {
            console.log(`📋 実行引数:`);
            Object.entries(request.params.arguments).forEach(([key, value]) => {
                const valueStr =
                    typeof value === "string" ? value : JSON.stringify(value);
                const displayValue =
                    valueStr.length > 150
                        ? valueStr.substring(0, 150) + "..."
                        : valueStr;
                console.log(`   ${key}: ${displayValue}`);
            });
        } else {
            console.log(`📋 実行引数: なし`);
        }

        const handler = toolHandlers.get(toolName);
        if (!handler) {
            console.error(`❌ Tool Not Found [${executionId}]: ${toolName}`);
            console.error(
                `📋 利用可能ツール: ${Array.from(toolHandlers.keys()).join(
                    ", "
                )}`
            );
            throw new McpError(
                ErrorCode.MethodNotFound,
                `Tool '${toolName}' not found`
            );
        }

        try {
            console.log(`🚀 ツール実行中: ${toolName}`);
            const result = await handler(request);
            const executionTime = Date.now() - startTime;

            console.log(`📊 実行結果サマリー [${executionId}]:`);
            console.log(`   ✅ ステータス: 成功`);
            console.log(`   ⏱️ 実行時間: ${executionTime}ms`);
            console.log(`   📦 コンテンツ数: ${result.content?.length || 0}個`);

            // 結果内容の詳細ログ
            if (result.content && result.content.length > 0) {
                console.log(`📄 結果内容:`);
                result.content.forEach((content, index) => {
                    if (content.type === "text") {
                        const textLength = content.text?.length || 0;
                        const preview =
                            textLength > 100
                                ? content.text?.substring(0, 100) + "..."
                                : content.text;
                        console.log(
                            `   ${
                                index + 1
                            }. 📝 Text (${textLength} chars): ${preview}`
                        );
                    } else {
                        console.log(
                            `   ${index + 1}. 📄 ${
                                content.type
                            }: ${JSON.stringify(content).substring(0, 50)}...`
                        );
                    }
                });
            }

            if (result.isError) {
                console.log(`   ⚠️ エラーフラグ: true`);
            }

            console.log(
                `🎉 Tool Execution Complete [${executionId}]: ${toolName} (${executionTime}ms)`
            );
            return result;
        } catch (error) {
            const executionTime = Date.now() - startTime;
            console.error(`💥 Tool Execution Error [${executionId}]:`);
            console.error(`   🛠️ ツール名: ${toolName}`);
            console.error(
                `   🚨 エラータイプ: ${
                    error instanceof Error ? error.name : "UnknownError"
                }`
            );
            console.error(
                `   📝 エラーメッセージ: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            console.error(`   ⏱️ 失敗までの時間: ${executionTime}ms`);

            if (error instanceof Error && error.stack) {
                console.error(
                    `   📚 スタックトレース: ${error.stack
                        .split("\n")
                        .slice(0, 3)
                        .join(" | ")}`
                );
            }

            if (error instanceof McpError) {
                console.error(`   🔢 MCPエラーコード: ${error.code}`);
                throw error;
            }

            throw new McpError(
                ErrorCode.InternalError,
                `Tool execution failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * 利用可能なツールの情報を取得
     * @description 登録されている全ツールの詳細情報を文字列として返す
     * @returns {string} ツール情報を含む整形された文字列
     *
     * @example
     * ```typescript
     * const toolManager = new ToolManager();
     * console.log(toolManager.getToolsInfo());
     * ```
     */
    getToolsInfo(): string {
        const toolList = tools.map((tool) => {
            return `- ${tool.name}: ${tool.description}`;
        });
        return `利用可能なツール (${tools.length}個):\n${toolList.join("\n")}`;
    }
}

// シングルトンのツールマネージャーインスタンス
export const toolManager = new ToolManager();
