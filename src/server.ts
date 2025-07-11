/**
 * @fileoverview MCPサーバーメイン
 * @description OpenAPI MCP Server のメインエントリーポイント
 * @since 1.0.0
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { resolve } from "path";
import { ToolManager } from "./tools/index.js";
import { DirectoryWatcher } from "./tools/tool-libs/utils/index.js";
import { createOpenAPIProcessor } from "./tools/tool-libs/services/openapi-processor.js";
import { getPackageInfo, DEFAULT_CONFIG } from "./config.js";
import {
    ErrorManager,
    DetailedError,
    ErrorHandler,
} from "./tools/tool-libs/core/error/index.js";

/**
 * MCPメッセージの詳細をログ出力
 * @param message MCPメッセージ
 * @param messageIndex メッセージのインデックス
 * @param requestId リクエストID
 */
function logMCPMessage(
    message: any,
    messageIndex: number,
    requestId: string
): void {
    console.log(`   📝 Message ${messageIndex}:`);
    console.log(`      🔧 Method: ${message.method || "Unknown"}`);
    console.log(`      🆔 ID: ${message.id || "None"}`);
    console.log(`      📋 JSON-RPC: ${message.jsonrpc || "Unknown"}`);

    if (message.params) {
        console.log(`      📦 Parameters:`);

        // ツール呼び出しの場合
        if (message.method === "tools/call") {
            console.log(
                `         🛠️ Tool Name: ${message.params.name || "Unknown"}`
            );
            console.log(`         📋 Arguments:`);
            if (message.params.arguments) {
                Object.entries(message.params.arguments).forEach(
                    ([key, value]) => {
                        console.log(
                            `            ${key}: ${JSON.stringify(value)}`
                        );
                    }
                );
            }
        }
        // 初期化の場合
        else if (message.method === "initialize") {
            console.log(
                `         📱 Client: ${
                    message.params.clientInfo?.name || "Unknown"
                } v${message.params.clientInfo?.version || "Unknown"}`
            );
            console.log(
                `         🔌 Protocol Version: ${
                    message.params.protocolVersion || "Unknown"
                }`
            );
            if (message.params.capabilities) {
                console.log(
                    `         ⚙️ Client Capabilities: ${
                        Object.keys(message.params.capabilities).join(", ") ||
                        "None"
                    }`
                );
            }
        }
        // その他のメソッドの場合
        else {
            const paramKeys = Object.keys(message.params);
            if (paramKeys.length > 0) {
                console.log(`         📊 Keys: ${paramKeys.join(", ")}`);
            }
        }
    }

    console.log(`      🏷️ Request Type: ${getRequestType(message.method)}`);
}

/**
 * MCPメソッドからリクエストタイプを判定
 * @param method MCPメソッド名
 * @returns リクエストタイプの説明
 */
function getRequestType(method: string): string {
    const methodMap: { [key: string]: string } = {
        initialize: "🚀 初期化",
        initialized: "✅ 初期化完了",
        "tools/list": "📋 ツール一覧",
        "tools/call": "🛠️ ツール実行",
        "resources/list": "📁 リソース一覧",
        "resources/read": "📄 リソース読み込み",
        "prompts/list": "💬 プロンプト一覧",
        "prompts/get": "💬 プロンプト取得",
        "sampling/createMessage": "🤖 メッセージ作成",
        "notifications/message": "📢 通知メッセージ",
        "notifications/progress": "📊 進捗通知",
        "notifications/cancelled": "🚫 キャンセル通知",
        "notifications/initialized": "🎯 初期化通知",
        "notifications/tools/list_changed": "🔄 ツール変更通知",
        "notifications/resources/list_changed": "🔄 リソース変更通知",
        "notifications/prompts/list_changed": "🔄 プロンプト変更通知",
    };

    return methodMap[method] || "❓ 不明なメソッド";
}

/**
 * 初期データの読み込み
 * @description 起動時にdata/openapiディレクトリからOpenAPIファイルを読み込む
 * @param directoryPath 読み込み対象ディレクトリ（絶対パスに変換される）
 */
async function loadInitialData(directoryPath: string): Promise<void> {
    const startTime = Date.now();

    // 絶対パス: プロジェクトルートからの絶対パスを構築
    const absoluteDirectoryPath = resolve(
        process.cwd(),
        directoryPath.replace(/^\.\//, "")
    );

    console.log("📚 === 初期データ読み込み開始 ===");
    console.log(`📍 対象ディレクトリ: ${directoryPath}`);
    console.log(`📍 絶対パス: ${absoluteDirectoryPath}`);

    try {
        // OpenAPIプロセッサーを作成
        console.log("🔧 OpenAPIプロセッサーを初期化中...");
        const processor = createOpenAPIProcessor({
            enableLogging: true,
            enableValidation: true,
            skipInvalidFiles: false,
        });

        console.log("🔍 ディレクトリからOpenAPIファイルを処理中...");
        // 絶対パスでディレクトリを処理
        const results = await processor.processFromDirectory(
            absoluteDirectoryPath
        );

        // 結果の集計
        const successful = results.filter((r) => r.success);
        const failed = results.filter((r) => !r.success);

        const processingTime = Date.now() - startTime;

        console.log("📊 初期データ読み込み結果:");
        console.log(`   ✅ 成功: ${successful.length}件`);
        console.log(`   ❌ 失敗: ${failed.length}件`);
        console.log(`   ⏱️ 処理時間: ${processingTime}ms`);

        // 成功したファイルのログ
        if (successful.length > 0) {
            console.log("🎯 読み込み成功ファイル:");
            successful.forEach((result, index) => {
                console.log(
                    `   ${index + 1}. 📄 ${result.name || result.source}`
                );
            });
        }

        // 失敗したファイルのログ
        if (failed.length > 0) {
            console.log("⚠️ 読み込み失敗ファイル:");
            failed.forEach((result, index) => {
                console.log(
                    `   ${index + 1}. ❌ ${result.name || result.source}`
                );
                console.log(`      📝 理由: ${result.message}`);
            });
        }

        console.log("✅ 初期データ読み込み完了");
    } catch (error) {
        const processingTime = Date.now() - startTime;

        const detailedError = ErrorManager.createFileSystemError(
            "READ",
            `初期データディレクトリ '${directoryPath}' の読み込みに失敗しました`,
            absoluteDirectoryPath,
            {
                originalError:
                    error instanceof Error ? error : new Error(String(error)),
                technicalDetails: `処理時間: ${processingTime}ms\n対象ディレクトリ: ${directoryPath}\n絶対パス: ${absoluteDirectoryPath}`,
                context: {
                    operation: "loadInitialData",
                    directoryPath,
                    absoluteDirectoryPath,
                    processingTime,
                },
            }
        );

        ErrorManager.logError(detailedError, "InitialDataLoader");

        // エラーでも続行（ディレクトリが存在しない場合など）
        console.warn(
            "⚠️ 初期データ読み込みに失敗しましたが、サーバーを続行します"
        );
        console.warn(
            "💡 解決策: ディレクトリが存在するか、ファイルの権限を確認してください"
        );
    }
}

/**
 * MCPサーバーの初期化と起動
 * @description OpenAPI MCP Server を初期化し、Streamable HTTP通信で起動する
 *
 * @example
 * ```bash
 * # HTTPモードでサーバーの起動
 * node dist/server.js
 * ```
 *
 * @since 1.0.0
 */
async function main() {
    try {
        // パッケージ情報の取得
        console.log("📋 パッケージ情報を取得中...");
        const pkg = getPackageInfo();
        console.log(`🚀 ${pkg.name} v${pkg.version} を開始しています...`);

        // 設定情報の検証
        console.log("⚙️ 設定情報を検証中...");
        if (!DEFAULT_CONFIG.server.port) {
            throw ErrorManager.createConfigurationError(
                "MISSING",
                "サーバーポートが設定されていません",
                "server.port",
                {
                    context: {
                        config: DEFAULT_CONFIG,
                        operation: "server startup",
                    },
                }
            );
        }

        if (
            DEFAULT_CONFIG.server.port < 1 ||
            DEFAULT_CONFIG.server.port > 65535
        ) {
            throw ErrorManager.createConfigurationError(
                "INVALID",
                `無効なポート番号です: ${DEFAULT_CONFIG.server.port}`,
                "server.port",
                {
                    context: {
                        port: DEFAULT_CONFIG.server.port,
                        validRange: "1-65535",
                        operation: "server startup",
                    },
                }
            );
        }

        console.log(`✅ 設定検証完了: ポート ${DEFAULT_CONFIG.server.port}`);

        // ツールマネージャーの初期化
        console.log("🔧 ツールマネージャーを初期化中...");
        const toolManager = new ToolManager();
        console.log("✅ ツールマネージャー初期化完了");

        // MCPサーバーの作成
        console.log("🏗️ MCPサーバーを作成中...");
        const server = new Server(
            {
                name: pkg.name,
                version: pkg.version,
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );
        console.log("✅ MCPサーバー作成完了");

        // ツール一覧要求のハンドラー
        server.setRequestHandler(ListToolsRequestSchema, async () => {
            const handlerStartTime = Date.now();
            const handlerId = randomUUID().substring(0, 8);

            console.log(`📋 === Tools List Request [${handlerId}] ===`);
            console.log(`🕐 Handler開始時刻: ${new Date().toISOString()}`);

            try {
                const tools = toolManager.getToolList();
                const processingTime = Date.now() - handlerStartTime;

                console.log(`📊 ツール一覧取得結果:`);
                console.log(`   🔢 総ツール数: ${tools.length}個`);
                console.log(`   ⏱️ 取得時間: ${processingTime}ms`);

                if (tools.length > 0) {
                    console.log(`🛠️ 利用可能ツール一覧:`);
                    tools.forEach((tool, index) => {
                        console.log(`   ${index + 1}. 📦 ${tool.name}`);
                        console.log(
                            `      📝 説明: ${tool.description || "説明なし"}`
                        );
                        if (tool.inputSchema) {
                            const requiredFields =
                                tool.inputSchema.required || [];
                            console.log(
                                `      📋 必須パラメータ: ${
                                    requiredFields.length > 0
                                        ? requiredFields.join(", ")
                                        : "なし"
                                }`
                            );
                        }
                    });
                }

                console.log(
                    `✅ Tools List Request完了 [${handlerId}]: ${processingTime}ms`
                );
                return { tools };
            } catch (error) {
                const processingTime = Date.now() - handlerStartTime;

                const detailedError = ErrorManager.fromGenericError(error, {
                    operation: "tools list request",
                    handlerId,
                    processingTime,
                });

                ErrorManager.logError(detailedError, `ToolsList[${handlerId}]`);
                throw error;
            }
        });

        // ツール実行要求のハンドラー
        server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const handlerStartTime = Date.now();
            const handlerId = randomUUID().substring(0, 8);

            console.log(`🛠️ === Tool Execution Request [${handlerId}] ===`);
            console.log(`🕐 Handler開始時刻: ${new Date().toISOString()}`);
            console.log(`📦 ツール実行詳細:`);
            console.log(`   🏷️ ツール名: ${request.params.name}`);
            console.log(`   🆔 リクエストID: ${(request as any).id || "None"}`);

            // 引数の詳細ログ
            if (request.params.arguments) {
                console.log(`   📋 実行パラメータ:`);
                Object.entries(request.params.arguments).forEach(
                    ([key, value]) => {
                        const valueStr =
                            typeof value === "string"
                                ? value
                                : JSON.stringify(value);
                        const truncatedValue =
                            valueStr.length > 100
                                ? valueStr.substring(0, 100) + "..."
                                : valueStr;
                        console.log(`      ${key}: ${truncatedValue}`);
                    }
                );
            } else {
                console.log(`   📋 実行パラメータ: なし`);
            }

            try {
                console.log(`🚀 ツール実行開始: ${request.params.name}`);
                const result = await toolManager.executeTool(request);
                const processingTime = Date.now() - handlerStartTime;

                console.log(`📈 ツール実行結果:`);
                console.log(`   ✅ 実行ステータス: 成功`);
                console.log(`   ⏱️ 実行時間: ${processingTime}ms`);

                // 結果の詳細ログ
                if (result.content) {
                    console.log(`   📄 レスポンス内容:`);
                    result.content.forEach((content: any, index: number) => {
                        if (content.type === "text") {
                            const textLength = content.text?.length || 0;
                            const preview =
                                textLength > 200
                                    ? content.text.substring(0, 200) + "..."
                                    : content.text;
                            console.log(
                                `      ${
                                    index + 1
                                }. 📝 Text (${textLength} chars): ${preview}`
                            );
                        } else {
                            console.log(
                                `      ${index + 1}. 📄 ${
                                    content.type
                                }: ${JSON.stringify(content).substring(
                                    0,
                                    100
                                )}...`
                            );
                        }
                    });
                } else {
                    console.log(`   📄 レスポンス内容: なし`);
                }

                if (result.isError) {
                    console.log(`   ⚠️ エラーフラグ: ${result.isError}`);
                }

                console.log(
                    `🎉 Tool Execution Request完了 [${handlerId}]: ${processingTime}ms`
                );
                return result;
            } catch (error) {
                const processingTime = Date.now() - handlerStartTime;

                const detailedError = ErrorManager.fromGenericError(error, {
                    operation: "tool execution",
                    toolName: request.params.name,
                    arguments: request.params.arguments,
                    handlerId,
                    processingTime,
                });

                ErrorManager.logError(
                    detailedError,
                    `ToolExecution[${handlerId}]`
                );
                throw error;
            }
        });

        // 初期データの読み込み（絶対パス処理）
        console.log("📚 初期データを読み込み中...");
        await loadInitialData("./data/openapi");

        // ディレクトリ監視の開始（絶対パス処理）
        console.log("👀 ディレクトリ監視を開始中...");
        const openapiDirectoryPath = "./data/openapi";
        const absoluteWatchPath = resolve(
            process.cwd(),
            openapiDirectoryPath.replace(/^\.\//, "")
        );
        console.log("📍 監視対象ディレクトリ: ./data/openapi");
        console.log(`📍 監視絶対パス: ${absoluteWatchPath}`);

        let watcher: DirectoryWatcher | null = null;
        try {
            // 絶対パスでディレクトリ監視を開始
            watcher = new DirectoryWatcher(absoluteWatchPath);
            await watcher.start();
            console.log("✅ ディレクトリ監視が正常に開始されました");
        } catch (error) {
            console.warn(
                "⚠️ ディレクトリ監視の開始に失敗しました:",
                error instanceof Error ? error.message : String(error)
            );
            console.warn(
                "📝 ディレクトリが存在しない可能性があります。ファイル監視なしで続行します。"
            );
        }

        // Streamable HTTP トランスポートでサーバーを起動
        console.log("🌐 Streamable HTTPモードでサーバーを起動中...");
        await startStreamableHTTPMode(server, watcher);
    } catch (error) {
        // 詳細エラーオブジェクトを作成
        const detailedError = ErrorManager.fromGenericError(error, {
            operation: "server startup",
            config: DEFAULT_CONFIG,
            timestamp: new Date().toISOString(),
        });

        ErrorManager.logError(detailedError, "ServerMain");

        console.error("💥 サーバーの起動に失敗しました");
        console.error("🔧 トラブルシューティング:");
        console.error(
            "   1. ポート番号が他のプロセスに使用されていないか確認してください"
        );
        console.error("   2. 設定ファイルの内容が正しいかチェックしてください");
        console.error("   3. 必要な権限があるかを確認してください");
        console.error(
            "   4. データディレクトリが存在し、読み書き可能かチェックしてください"
        );

        process.exit(1);
    }
}

/**
 * Streamable HTTPモードでサーバーを起動（ステートレス）
 * @param server MCPサーバーインスタンス
 * @param watcher ディレクトリ監視インスタンス
 */
async function startStreamableHTTPMode(server: Server, watcher: any) {
    const app = express();
    const port = DEFAULT_CONFIG.server.port;

    // Expressの設定
    app.use(cors());
    app.use(express.json());

    // Streamable HTTP エンドポイント（ステートレスモード）
    const MCP_ENDPOINT = "/mcp";

    // POSTハンドラー - ステートレスでメッセージ処理
    app.post(MCP_ENDPOINT, async (req: Request, res: Response) => {
        const startTime = Date.now();
        const requestId = randomUUID().substring(0, 8);

        console.log(`📨 === MCP POST Request [${requestId}] ===`);
        console.log(`🕐 リクエスト時刻: ${new Date().toISOString()}`);
        console.log(`📋 Headers:`);
        console.log(
            `   🌐 User-Agent: ${req.headers["user-agent"] || "Unknown"}`
        );
        console.log(
            `   📦 Content-Type: ${req.headers["content-type"] || "Unknown"}`
        );
        console.log(
            `   📏 Content-Length: ${
                req.headers["content-length"] || "Unknown"
            }`
        );

        // リクエストボディの詳細ログ
        if (req.body) {
            console.log(`📄 MCP Message Details:`);

            if (Array.isArray(req.body)) {
                console.log(
                    `   📊 Batch Request: ${req.body.length}個のメッセージ`
                );
                req.body.forEach((msg, index) => {
                    logMCPMessage(msg, index + 1, requestId);
                });
            } else {
                logMCPMessage(req.body, 1, requestId);
            }
        } else {
            console.log(`⚠️ Empty request body`);
        }

        try {
            // ステートレスモードで新しいトランスポートを作成
            const transport = new StreamableHTTPServerTransport({
                // セッションIDは使用しない（完全にステートレス）
                sessionIdGenerator: undefined,
            });

            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);

            const processingTime = Date.now() - startTime;
            console.log(
                `✅ MCP Request処理完了 [${requestId}]: ${processingTime}ms`
            );
        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`💥 MCP Request処理エラー [${requestId}]:`, error);
            console.error(`   ⏱️ 失敗までの時間: ${processingTime}ms`);

            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Internal server error.",
                },
                id: randomUUID(),
            });
        }
    });

    // GETハンドラー - ステートレスでSSEストリーム
    app.get(MCP_ENDPOINT, async (req: Request, res: Response) => {
        const startTime = Date.now();
        const requestId = randomUUID().substring(0, 8);

        console.log(`📡 === MCP GET Request (SSE) [${requestId}] ===`);
        console.log(`🕐 リクエスト時刻: ${new Date().toISOString()}`);
        console.log(`📋 Headers:`);
        console.log(
            `   🌐 User-Agent: ${req.headers["user-agent"] || "Unknown"}`
        );
        console.log(
            `   🔗 Connection: ${req.headers["connection"] || "Unknown"}`
        );
        console.log(`   📦 Accept: ${req.headers["accept"] || "Unknown"}`);
        console.log(`   🎯 目的: SSEストリーム確立`);

        try {
            // ステートレスモードで新しいトランスポートを作成
            console.log(`🔧 SSE Transport作成中...`);
            const transport = new StreamableHTTPServerTransport({
                // セッションIDは使用しない（完全にステートレス）
                sessionIdGenerator: undefined,
            });

            console.log(`🔌 MCPサーバーに接続中...`);
            await server.connect(transport);

            console.log(`🌊 SSEストリーム確立開始...`);
            await transport.handleRequest(req, res);

            const processingTime = Date.now() - startTime;
            console.log(
                `✅ SSE Stream確立完了 [${requestId}]: ${processingTime}ms`
            );
        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`💥 SSE Stream確立エラー [${requestId}]:`);
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
            console.error(`   ⏱️ 失敗までの時間: ${processingTime}ms`);

            res.status(500).json({
                jsonrpc: "2.0",
                error: {
                    code: -32000,
                    message: "Internal server error.",
                },
                id: randomUUID(),
            });
        }
    });

    // サーバーの起動
    app.listen(port, () => {
        console.log("🎉 サーバーが正常に起動しました");
        console.log(
            `📡 Streamable HTTP モード（ステートレス）で通信を開始します (http://localhost:${port}${MCP_ENDPOINT})`
        );
    });

    // プロセス終了時の処理
    const cleanup = () => {
        console.log("🔄 サーバーを終了中...");
        if (watcher) {
            try {
                watcher.stop();
                console.log("✅ ディレクトリ監視を停止しました");
            } catch (error) {
                console.warn(
                    "⚠️ ディレクトリ監視の停止でエラーが発生:",
                    error instanceof Error ? error.message : String(error)
                );
            }
        }
        process.exit(0);
    };

    // シグナルハンドラーの設定
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    console.log(
        "✅ Streamable HTTP MCP サーバー（ステートレス）が起動完了しました"
    );
    console.log(
        "💡 ステートレスHTTP通信でMCPクライアントからの接続を待機中..."
    );
}

// プロセスレベルのエラーハンドリング
process.on("uncaughtException", (error) => {
    const detailedError = ErrorManager.createInternalError(
        "UNCAUGHT_EXCEPTION",
        "予期しない例外が発生しました",
        {
            originalError: error,
            context: {
                operation: "process uncaught exception",
                timestamp: new Date().toISOString(),
            },
        }
    );

    ErrorManager.logError(detailedError, "Process");
    console.error("💥 致命的エラー: アプリケーションを終了します");
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    const detailedError = ErrorManager.createInternalError(
        "UNHANDLED_REJECTION",
        "未処理のPromise拒否が発生しました",
        {
            originalError:
                reason instanceof Error ? reason : new Error(String(reason)),
            context: {
                operation: "process unhandled rejection",
                promise: promise.toString(),
                timestamp: new Date().toISOString(),
            },
        }
    );

    ErrorManager.logError(detailedError, "Process");
    console.error("💥 致命的エラー: アプリケーションを終了します");
    process.exit(1);
});

// メイン関数の実行
main().catch((error) => {
    console.error("❌ メイン関数でエラーが発生しました:", error);
    process.exit(1);
});
