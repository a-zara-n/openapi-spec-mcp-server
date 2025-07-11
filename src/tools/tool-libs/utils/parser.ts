import { promises as fs } from "fs";
import { extname, basename } from "path";
import type { OpenAPISpec } from "../types/index.js";
import { createOpenAPIProcessor, type OpenAPIProcessor } from "../services/openapi-processor.js";

/**
 * @fileoverview OpenAPIパーサーユーティリティ
 * @description OpenAPI仕様ファイルの解析と処理を行うユーティリティクラス
 * @since 1.0.0
 */

/**
 * OpenAPIパーサークラス
 * @description OpenAPI仕様ファイルの読み込み、解析、データベース保存を担当するクラス
 *
 * @example
 * ```typescript
 * const parser = new OpenAPIParser();
 *
 * // ディレクトリからファイルを読み込み
 * const results = await parser.loadOpenAPIFilesFromDirectory('./openapi/');
 * results.forEach(result => {
 *   if (result.success) {
 *     console.log(`成功: ${result.name}`);
 *   } else {
 *     console.error(`失敗: ${result.message}`);
 *   }
 * });
 *
 * // 単一ファイルの読み込み
 * const result = await parser.loadOpenAPIFile('./openapi/petstore.yaml');
 * ```
 *
 * @since 1.0.0
 */
export class OpenAPIParser {
    private processor: OpenAPIProcessor;

    constructor() {
        this.processor = createOpenAPIProcessor({
            enableLogging: true,
            enableValidation: true,
            skipInvalidFiles: false,
        });
    }

    /**
     * OpenAPIファイルをディレクトリから読み込み
     * @description ディレクトリ内のOpenAPIファイルを検索し、処理する
     * @private
     */
    private async processDirectory(directoryPath: string): Promise<any[]> {
        console.log(`📂 ディレクトリ処理中: ${directoryPath}`);
        return [];
    }

    /**
     * ディレクトリからOpenAPIファイルを読み込み
     * @description 指定されたディレクトリからOpenAPI仕様ファイルを検索し、処理する
     *
     * @param {string} directoryPath - 検索対象のディレクトリパス
     * @returns {Promise<ProcessingResult[]>} 処理結果の配列
     *
     * @example
     * ```typescript
     * const parser = new OpenAPIParser();
     * const results = await parser.loadOpenAPIFilesFromDirectory('./api-specs/');
     *
     * const successful = results.filter(r => r.success);
     * const failed = results.filter(r => !r.success);
     *
     * console.log(`成功: ${successful.length}件, 失敗: ${failed.length}件`);
     * ```
     *
     * @throws {Error} ディレクトリアクセス時やファイル処理時にエラーが発生した場合
     * @since 1.0.0
     */
    async loadOpenAPIFilesFromDirectory(
        directoryPath: string
    ): Promise<Array<{ success: boolean; message: string; name?: string }>> {
        const results = await this.processor.processFromDirectory(
            directoryPath
        );
        return results.map((result: any) => ({
            success: result.success,
            message: result.message,
            name: result.name,
        }));
    }
}

/**
 * OpenAPIファイルを解析してデータベースに保存
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

// シングルトンインスタンス
export const openAPIParser = new OpenAPIParser();
