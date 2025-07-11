import { OpenAPIContentParser } from "../parsers/content-parser.js";
import {
    OpenAPIValidator,
    type ValidationResult,
} from "../parsers/validator.js";
import { OpenAPIExtractor } from "../parsers/extractor.js";
import { OpenAPIStorageService } from "./storage-service.js";
import { OpenAPIFileLoader } from "./file-loader.js";
import { calculateContentHash, calculateShortHash } from "../utils/hash.js";

// 型定義を新しい統合ファイルからインポート
import type { ProcessingResult, ProcessorConfig } from "../types/index.js";

/**
 * OpenAPIプロセッサー
 * 各専門クラスを統合して、OpenAPIファイルの全処理を担当
 */
export class OpenAPIProcessor {
    private config: ProcessorConfig;
    private contentParser: OpenAPIContentParser;
    private validator: OpenAPIValidator;
    private extractor: OpenAPIExtractor;
    private storageService: OpenAPIStorageService;
    private fileLoader: OpenAPIFileLoader;

    constructor(config: ProcessorConfig = {}) {
        this.config = {
            enableLogging: true,
            enableValidation: true,
            skipInvalidFiles: false,
            ...config,
        };

        // 各コンポーネントを初期化
        this.contentParser = new OpenAPIContentParser();
        this.validator = new OpenAPIValidator();
        this.extractor = new OpenAPIExtractor();
        this.storageService = new OpenAPIStorageService(
            this.config.dependencyConfig,
            { enableLogging: this.config.enableLogging }
        );
        this.fileLoader = new OpenAPIFileLoader({
            enableLogging: this.config.enableLogging,
        });
    }

    /**
     * ファイルからOpenAPIを処理
     * @param filePath ファイルパス
     * @returns 処理結果
     */
    async processFromFile(filePath: string): Promise<ProcessingResult> {
        this.log(`🔍 OpenAPIファイル処理開始: ${filePath}`);

        try {
            // ファイル読み込み
            const loadResult = await this.fileLoader.loadFromFile(filePath);
            if (
                !loadResult.success ||
                !loadResult.content ||
                !loadResult.name
            ) {
                return {
                    success: false,
                    source: filePath,
                    message: loadResult.message,
                };
            }

            // コンテンツを処理
            return await this.processContent(
                loadResult.content,
                loadResult.name,
                loadResult.source
            );
        } catch (error) {
            const message = `ファイル処理エラー: ${
                error instanceof Error ? error.message : "Unknown error"
            }`;
            this.log(`❌ ${message}`, true);

            return {
                success: false,
                source: filePath,
                message,
            };
        }
    }

    /**
     * URLからOpenAPIを処理
     * @param url URL
     * @param name API名（省略可）
     * @returns 処理結果
     */
    async processFromURL(
        url: string,
        name?: string
    ): Promise<ProcessingResult> {
        this.log(`🌐 OpenAPI URL処理開始: ${url}`);

        try {
            // URL読み込み
            const loadResult = await this.fileLoader.loadFromURL(url, name);
            if (
                !loadResult.success ||
                !loadResult.content ||
                !loadResult.name
            ) {
                return {
                    success: false,
                    source: url,
                    message: loadResult.message,
                };
            }

            // コンテンツを処理
            return await this.processContent(
                loadResult.content,
                loadResult.name,
                loadResult.source
            );
        } catch (error) {
            const message = `URL処理エラー: ${
                error instanceof Error ? error.message : "Unknown error"
            }`;
            this.log(`❌ ${message}`, true);

            return {
                success: false,
                source: url,
                message,
            };
        }
    }

    /**
     * コンテンツ文字列からOpenAPIを処理
     * @param content OpenAPIコンテンツ
     * @param name API名
     * @param source ソース（ファイルパスまたはURL）
     * @returns 処理結果
     */
    async processContent(
        content: string,
        name: string,
        source: string
    ): Promise<ProcessingResult> {
        this.log(`🔍 OpenAPIコンテンツ処理開始: ${name}`);

        try {
            // 1. パース
            const parsedContent = this.contentParser.parseContent(
                content,
                source
            );
            this.log(`✅ パース完了: ${name}`);

            // 2. バリデーション（設定で有効な場合）
            let validation: ValidationResult | undefined;
            if (this.config.enableValidation) {
                validation = this.validator.validate(parsedContent);
                this.logValidationResult(validation);

                if (!validation.isValid) {
                    if (this.config.skipInvalidFiles) {
                        return {
                            success: false,
                            name,
                            source,
                            message: `バリデーションエラー（スキップ）: ${validation.errors.join(
                                ", "
                            )}`,
                            validation,
                        };
                    } else {
                        this.log(
                            `⚠️ バリデーションエラーがありますが処理を続行します`,
                            false
                        );
                    }
                }
            }

            // 3. データ抽出
            const extractedData = this.extractor.extractAll(
                parsedContent,
                name
            );
            this.log(
                `✅ データ抽出完了: ${name} (${this.extractDataSummary(
                    extractedData
                )})`
            );

            // 3.5. ハッシュ計算
            const fileHash = calculateContentHash(content);
            const shortHash = calculateShortHash(content);
            
            // 抽出データにハッシュ情報を追加
            extractedData.fileHash = fileHash;
            extractedData.shortHash = shortHash;
            
            this.log(`🔗 ファイルハッシュ計算完了: ${name} (${shortHash})`);

            // 4. データベース保存
            const storageResult = await this.storageService.store(
                extractedData
            );
            if (!storageResult.success) {
                return {
                    success: false,
                    name,
                    source,
                    message: storageResult.message,
                    validation,
                    storage: storageResult,
                };
            }

            this.log(`🎉 OpenAPI処理完了: ${name}`);

            return {
                success: true,
                name,
                source,
                message: `OpenAPI "${name}" の処理が完了しました`,
                validation,
                storage: storageResult,
            };
        } catch (error) {
            const message = `OpenAPI処理エラー: ${
                error instanceof Error ? error.message : "Unknown error"
            }`;
            this.log(`❌ ${message}`, true);

            return {
                success: false,
                name,
                source,
                message,
            };
        }
    }

    /**
     * ディレクトリ内の全OpenAPIファイルを処理
     * @param directoryPath ディレクトリパス
     * @returns 処理結果の配列
     */
    async processFromDirectory(
        directoryPath: string
    ): Promise<ProcessingResult[]> {
        this.log(`📁 ディレクトリ処理開始: ${directoryPath}`);

        try {
            const loadResults = await this.fileLoader.loadFromDirectory(
                directoryPath
            );
            const processingResults: ProcessingResult[] = [];

            for (const loadResult of loadResults) {
                if (
                    !loadResult.success ||
                    !loadResult.content ||
                    !loadResult.name
                ) {
                    processingResults.push({
                        success: false,
                        source: loadResult.source,
                        message: loadResult.message,
                    });
                    continue;
                }

                const result = await this.processContent(
                    loadResult.content,
                    loadResult.name,
                    loadResult.source
                );
                processingResults.push(result);
            }

            this.log(`✅ ディレクトリ処理完了: ${processingResults.length}件`);
            return processingResults;
        } catch (error) {
            const message = `ディレクトリ処理エラー: ${
                error instanceof Error ? error.message : "Unknown error"
            }`;
            this.log(`❌ ${message}`, true);

            return [
                {
                    success: false,
                    source: directoryPath,
                    message,
                },
            ];
        }
    }

    /**
     * バリデーション結果をログ出力
     * @param validation バリデーション結果
     */
    private logValidationResult(validation: ValidationResult): void {
        if (validation.isValid) {
            this.log(
                `✅ バリデーション成功 (OpenAPI ${validation.openApiVersion})`
            );
        } else {
            this.log(
                `❌ バリデーションエラー: ${validation.errors.join(", ")}`,
                true
            );
        }

        if (validation.warnings.length > 0) {
            this.log(`⚠️ 警告: ${validation.warnings.join(", ")}`, false);
        }
    }

    /**
     * 抽出データの概要を生成
     * @param extractedData 抽出されたデータ
     * @returns 概要文字列
     */
    private extractDataSummary(extractedData: any): string {
        const stats = this.extractor.extractStats(extractedData);
        return `${stats.pathCount}パス, ${stats.schemaCount}スキーマ, ${stats.serverCount}サーバー`;
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
    updateConfig(newConfig: Partial<ProcessorConfig>): void {
        this.config = { ...this.config, ...newConfig };

        // 子コンポーネントの設定も更新
        this.storageService.updateConfig({
            enableLogging: this.config.enableLogging,
        });
        this.fileLoader.updateConfig({
            enableLogging: this.config.enableLogging,
        });
    }

    /**
     * 処理統計を取得
     * @param results 処理結果の配列
     * @returns 統計情報
     */
    static getProcessingStats(results: ProcessingResult[]): {
        total: number;
        successful: number;
        failed: number;
        validationErrors: number;
        storageErrors: number;
    } {
        return {
            total: results.length,
            successful: results.filter((r) => r.success).length,
            failed: results.filter((r) => !r.success).length,
            validationErrors: results.filter(
                (r) => r.validation && !r.validation.isValid
            ).length,
            storageErrors: results.filter(
                (r) => r.storage && !r.storage.success
            ).length,
        };
    }
}

/**
 * デフォルトインスタンス作成関数
 */
export function createOpenAPIProcessor(
    config?: ProcessorConfig
): OpenAPIProcessor {
    return new OpenAPIProcessor(config);
}

/**
 * レガシー関数（後方互換性のため）
 * @deprecated 新しいOpenAPIProcessorクラスを使用してください
 */
export async function parseAndStoreOpenAPI(
    name: string,
    content: string
): Promise<void> {
    const processor = createOpenAPIProcessor();
    const result = await processor.processContent(
        content,
        name,
        `legacy-${name}`
    );

    if (!result.success) {
        throw new Error(result.message);
    }
}

// 型定義も再エクスポート（後方互換性のため）
export type { ProcessingResult, ProcessorConfig };
