import { promises as fs } from "fs";
import { basename, extname } from "path";

// 型定義を新しい統合ファイルからインポート
import type {
    FileLoadResult,
    URLLoadResult,
    DirectoryScanResult,
    FileLoaderConfig,
} from "../types/index.js";

// エラーハンドリングシステムをインポート
import { ErrorManager, DetailedError } from "../core/error/index.js";

/**
 * OpenAPIファイルローダー
 * ファイルシステムからの読み込み処理のみを担当（純粋関数群）
 */
export class OpenAPIFileLoader {
    private config: FileLoaderConfig;

    constructor(config: FileLoaderConfig = {}) {
        this.config = {
            enableLogging: true,
            timeout: 30000, // 30秒
            supportedExtensions: [".yaml", ".yml", ".json"],
            ...config,
        };
    }

    /**
     * ファイルから内容を読み込み
     * @param filePath ファイルパス
     * @returns 読み込み結果
     */
    async loadFromFile(filePath: string): Promise<FileLoadResult> {
        const startTime = Date.now();

        try {
            this.log(`📂 ファイル読み込み処理開始`);
            this.log(`📍 ファイルパス: ${filePath}`);

            // ファイルの存在確認
            this.log(`🔍 ファイル存在確認中...`);
            await fs.access(filePath);
            this.log(`✅ ファイル存在確認完了`);

            // ファイル統計情報の取得
            this.log(`📊 ファイル情報取得中...`);
            const stats = await fs.stat(filePath);

            // ファイル名の抽出
            const fileName = basename(filePath);
            const name = this.extractNameFromFilename(fileName);
            const fileExtension = extname(fileName);

            // ファイル詳細情報をログ出力
            this.log(`📋 ファイル詳細情報:`);
            this.log(`   📁 ファイル名: ${fileName}`);
            this.log(`   🏷️ 抽出名: ${name}`);
            this.log(
                `   📐 ファイルサイズ: ${this.formatFileSize(stats.size)}`
            );
            this.log(`   📅 最終更新: ${stats.mtime.toISOString()}`);
            this.log(`   🔖 拡張子: ${fileExtension}`);

            // 拡張子の確認
            this.log(`🔎 ファイル形式確認中...`);
            if (!this.isSupportedFile(fileName)) {
                const message = `サポートされていないファイル形式です。対応形式: ${this.config.supportedExtensions?.join(
                    ", "
                )}`;
                this.log(`❌ ${message}`, true);

                return {
                    success: false,
                    source: filePath,
                    message,
                };
            }
            this.log(
                `✅ ファイル形式確認完了: ${fileExtension} は対応形式です`
            );

            // ファイル内容を読み込み
            this.log(`📖 ファイル内容読み込み中...`);
            const content = await fs.readFile(filePath, "utf-8");

            if (!content.trim()) {
                const message = "ファイルが空です";
                this.log(`⚠️ ${message}`, true);

                return {
                    success: false,
                    source: filePath,
                    message,
                };
            }

            const processingTime = Date.now() - startTime;
            const contentLength = content.length;
            const lineCount = content.split("\n").length;

            this.log(`✅ ファイル内容読み込み完了:`);
            this.log(`   📏 文字数: ${contentLength.toLocaleString()}`);
            this.log(`   📄 行数: ${lineCount.toLocaleString()}`);
            this.log(`   ⏱️ 処理時間: ${processingTime}ms`);

            this.log(`🎉 ファイル読み込み処理完了: ${fileName}`);

            return {
                success: true,
                content,
                name,
                source: filePath,
                message: `ファイル "${fileName}" の読み込みが完了しました (${this.formatFileSize(
                    stats.size
                )}, ${processingTime}ms)`,
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;

            // 詳細エラーオブジェクトを作成
            const detailedError = this.createFileError(
                error,
                filePath,
                processingTime
            );

            // エラーログを出力
            ErrorManager.logError(detailedError, "FileLoader");

            return {
                success: false,
                source: filePath,
                message: detailedError.details.message,
            };
        }
    }

    /**
     * URLから内容を読み込み
     * @param url URL
     * @param name 保存時の名前（省略可）
     * @returns 読み込み結果
     */
    async loadFromURL(url: string, name?: string): Promise<URLLoadResult> {
        try {
            this.log(`🌐 URL読み込み開始: ${url}`);

            // AbortControllerでタイムアウト制御
            const controller = new AbortController();
            const timeoutId = setTimeout(
                () => controller.abort(),
                this.config.timeout
            );

            try {
                const response = await fetch(url, {
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    return {
                        success: false,
                        source: url,
                        message: `HTTP ${response.status}: ${response.statusText}`,
                    };
                }

                const content = await response.text();

                if (!content.trim()) {
                    return {
                        success: false,
                        source: url,
                        message: "URLから取得したコンテンツが空です",
                    };
                }

                // 名前が指定されていない場合はURLから生成
                const apiName = name || this.extractNameFromURL(url);

                this.log(
                    `✅ URL読み込み完了: ${url} (${content.length} chars)`
                );

                return {
                    success: true,
                    content,
                    name: apiName,
                    source: url,
                    message: `URL "${url}" からの読み込みが完了しました`,
                };
            } finally {
                clearTimeout(timeoutId);
            }
        } catch (error) {
            let message: string;
            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    message = `URL読み込みタイムアウト (${this.config.timeout}ms)`;
                } else {
                    message = `URL読み込みエラー: ${error.message}`;
                }
            } else {
                message = "URL読み込みエラー: Unknown error";
            }

            this.log(`❌ ${message}`, true);

            return {
                success: false,
                source: url,
                message,
            };
        }
    }

    /**
     * ディレクトリ内のOpenAPIファイルをスキャン
     * @param directoryPath ディレクトリパス
     * @returns スキャン結果
     */
    async scanDirectory(directoryPath: string): Promise<DirectoryScanResult> {
        const startTime = Date.now();

        try {
            this.log(`📂 ディレクトリスキャン処理開始`);
            this.log(`📍 ディレクトリパス: ${directoryPath}`);

            // ディレクトリの存在確認
            this.log(`🔍 ディレクトリ存在確認中...`);
            const stats = await fs.stat(directoryPath);

            if (!stats.isDirectory()) {
                const message = "指定されたパスはディレクトリではありません";
                this.log(`❌ ${message}`, true);
                return {
                    success: false,
                    files: [],
                    message,
                };
            }
            this.log(`✅ ディレクトリ存在確認完了`);

            // ディレクトリ詳細情報
            this.log(`📋 ディレクトリ詳細情報:`);
            this.log(`   📅 最終更新: ${stats.mtime.toISOString()}`);
            this.log(
                `   🔖 対応拡張子: ${this.config.supportedExtensions?.join(
                    ", "
                )}`
            );

            this.log(`📄 ファイル一覧取得中...`);
            const files = await fs.readdir(directoryPath);
            this.log(`📊 総ファイル数: ${files.length}個`);

            const openApiFiles: string[] = [];
            const skippedFiles: string[] = [];
            const errorFiles: string[] = [];

            this.log(`🔎 各ファイルを検査中...`);
            for (const file of files) {
                const filePath = `${directoryPath}/${file}`;

                try {
                    const fileStat = await fs.stat(filePath);

                    if (fileStat.isFile()) {
                        if (this.isSupportedFile(file)) {
                            openApiFiles.push(file);
                            this.log(
                                `   ✅ 対象ファイル: ${file} (${this.formatFileSize(
                                    fileStat.size
                                )})`
                            );
                        } else {
                            skippedFiles.push(file);
                            this.log(`   ⏭️ スキップ: ${file} (対象外拡張子)`);
                        }
                    } else if (fileStat.isDirectory()) {
                        this.log(`   📁 サブディレクトリ: ${file} (スキップ)`);
                    } else {
                        this.log(`   ❓ 不明なタイプ: ${file} (スキップ)`);
                    }
                } catch (error) {
                    errorFiles.push(file);
                    const errorDetails = this.getErrorDetails(error);
                    this.log(`   ❌ エラー: ${file} - ${errorDetails.message}`);
                }
            }

            const processingTime = Date.now() - startTime;

            this.log(`📈 スキャン結果サマリー:`);
            this.log(`   ✅ 対象ファイル: ${openApiFiles.length}個`);
            this.log(`   ⏭️ スキップファイル: ${skippedFiles.length}個`);
            this.log(`   ❌ エラーファイル: ${errorFiles.length}個`);
            this.log(`   ⏱️ 処理時間: ${processingTime}ms`);

            if (openApiFiles.length > 0) {
                this.log(`🎯 対象ファイル一覧:`);
                openApiFiles.forEach((file) => {
                    this.log(`   📄 ${file}`);
                });
            }

            this.log(`🎉 ディレクトリスキャン処理完了: ${directoryPath}`);

            return {
                success: true,
                files: openApiFiles,
                message: `${openApiFiles.length}個のOpenAPIファイルが見つかりました (${processingTime}ms)`,
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;
            const errorDetails = this.getErrorDetails(error);

            this.log(`💥 ディレクトリスキャンエラー詳細:`, true);
            this.log(`   📍 ディレクトリパス: ${directoryPath}`, true);
            this.log(`   🚨 エラータイプ: ${errorDetails.type}`, true);
            this.log(`   📝 エラーメッセージ: ${errorDetails.message}`, true);
            this.log(`   ⏱️ 失敗までの時間: ${processingTime}ms`, true);

            if (errorDetails.code) {
                this.log(`   🔢 エラーコード: ${errorDetails.code}`, true);
            }

            return {
                success: false,
                files: [],
                message: `ディレクトリスキャンエラー: ${errorDetails.message}`,
            };
        }
    }

    /**
     * 複数ファイルを並行読み込み
     * @param filePaths ファイルパスの配列
     * @returns 読み込み結果の配列
     */
    async loadMultipleFiles(filePaths: string[]): Promise<FileLoadResult[]> {
        this.log(`📚 複数ファイル読み込み開始: ${filePaths.length}個`);

        const promises = filePaths.map((filePath) =>
            this.loadFromFile(filePath)
        );
        const results = await Promise.allSettled(promises);

        return results.map((result, index) => {
            if (result.status === "fulfilled") {
                return result.value;
            } else {
                return {
                    success: false,
                    source: filePaths[index],
                    message: `並行読み込みエラー: ${result.reason}`,
                };
            }
        });
    }

    /**
     * ディレクトリから全ファイルを読み込み
     * @param directoryPath ディレクトリパス
     * @returns 読み込み結果の配列
     */
    async loadFromDirectory(directoryPath: string): Promise<FileLoadResult[]> {
        const scanResult = await this.scanDirectory(directoryPath);

        if (!scanResult.success) {
            return [
                {
                    success: false,
                    source: directoryPath,
                    message: scanResult.message,
                },
            ];
        }

        const filePaths = scanResult.files.map(
            (file) => `${directoryPath}/${file}`
        );
        return this.loadMultipleFiles(filePaths);
    }

    /**
     * サポートされているファイルかどうかを判定
     * @param fileName ファイル名
     * @returns サポートされている場合true
     */
    private isSupportedFile(fileName: string): boolean {
        const ext = extname(fileName).toLowerCase();
        return this.config.supportedExtensions?.includes(ext) ?? false;
    }

    /**
     * ファイル名からAPI名を抽出
     * @param fileName ファイル名
     * @returns API名
     */
    private extractNameFromFilename(fileName: string): string {
        return fileName.replace(/\.(yaml|yml|json)$/i, "");
    }

    /**
     * URLからAPI名を抽出
     * @param url URL文字列
     * @returns API名
     */
    private extractNameFromURL(url: string): string {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const fileName = basename(pathname);

            // 拡張子を除いた名前を返す
            if (fileName && fileName !== "/") {
                return (
                    fileName.replace(/\.(yaml|yml|json)$/i, "") ||
                    "api-from-url"
                );
            }

            // ホスト名から生成
            return urlObj.hostname.replace(/\./g, "-") + "-api";
        } catch {
            return "api-from-url";
        }
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
    updateConfig(newConfig: Partial<FileLoaderConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * エラー詳細を取得
     * @param error エラーオブジェクト
     * @returns エラー詳細オブジェクト
     */
    /**
     * ファイル操作エラーの詳細エラーオブジェクトを作成
     */
    private createFileError(
        error: unknown,
        filePath: string,
        processingTime: number
    ): DetailedError {
        const errorInfo = this.getErrorDetails(error);

        // エラーの種類に応じて適切なエラーコードを決定
        let errorCode: string;
        let errorMessage: string;

        if (errorInfo.code === "ENOENT") {
            errorCode = "NOT_FOUND";
            errorMessage = `ファイルが見つかりません: ${basename(filePath)}`;
        } else if (errorInfo.code === "EACCES" || errorInfo.code === "EPERM") {
            errorCode = "PERMISSION";
            errorMessage = `ファイルへのアクセス権限がありません: ${basename(
                filePath
            )}`;
        } else if (errorInfo.code === "EISDIR") {
            errorCode = "READ";
            errorMessage = `指定されたパスはディレクトリです: ${basename(
                filePath
            )}`;
        } else if (errorInfo.code === "EMFILE" || errorInfo.code === "ENFILE") {
            errorCode = "READ";
            errorMessage = `システムリソース不足によりファイルを開けません: ${basename(
                filePath
            )}`;
        } else if (errorInfo.code === "ENOSPC") {
            errorCode = "READ";
            errorMessage = `ディスクの空き容量が不足しています`;
        } else {
            errorCode = "READ";
            errorMessage = `ファイル読み込み中にエラーが発生しました: ${basename(
                filePath
            )}`;
        }

        return ErrorManager.createFileSystemError(
            errorCode,
            errorMessage,
            filePath,
            {
                originalError:
                    error instanceof Error ? error : new Error(String(error)),
                technicalDetails: `処理時間: ${processingTime}ms\nエラー詳細: ${
                    errorInfo.message
                }${errorInfo.code ? `\nエラーコード: ${errorInfo.code}` : ""}`,
                context: {
                    fileName: basename(filePath),
                    fileExtension: extname(filePath),
                    processingTime,
                    operation: "loadFromFile",
                },
            }
        );
    }

    private getErrorDetails(error: unknown): {
        type: string;
        message: string;
        code?: string;
    } {
        if (error instanceof Error) {
            const nodeError = error as any; // Node.jsのエラーオブジェクトの場合のcodeプロパティ
            return {
                type: error.name,
                message: error.message,
                code: nodeError.code || undefined,
            };
        }
        return {
            type: "UnknownError",
            message: String(error),
        };
    }

    /**
     * ファイルサイズを人間が読みやすい形式にフォーマット
     * @param bytes バイト数
     * @returns フォーマットされたサイズ
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
}

/**
 * デフォルトインスタンス作成関数
 */
export function createFileLoader(config?: FileLoaderConfig): OpenAPIFileLoader {
    return new OpenAPIFileLoader(config);
}

// 型定義も再エクスポート（後方互換性のため）
export type {
    FileLoadResult,
    URLLoadResult,
    DirectoryScanResult,
    FileLoaderConfig,
};
