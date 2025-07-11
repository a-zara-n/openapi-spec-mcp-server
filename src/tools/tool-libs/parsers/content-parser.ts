import YAML from "yaml";
import type { OpenAPISpec } from "../types/index.js";

/**
 * OpenAPIコンテンツパーサー
 * 純粋にパース処理のみを担当（副作用なし）
 */
export class OpenAPIContentParser {
    /**
     * 文字列コンテンツをOpenAPIオブジェクトにパース
     * @param content ファイル内容
     * @param source ファイルパスまたはURL（エラー情報用）
     * @returns パースされたOpenAPIオブジェクト
     */
    parseContent(content: string, source: string): any {
        try {
            // JSON形式の判定と処理
            if (this.isJsonFormat(content, source)) {
                return JSON.parse(content);
            } else {
                // YAML形式として処理
                return YAML.parse(content);
            }
        } catch (error) {
            throw new Error(
                `OpenAPIコンテンツ解析エラー (${source}): ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * JSON形式かどうかを判定
     * @param content ファイル内容
     * @param source ファイルパスまたはURL
     * @returns JSON形式の場合true
     */
    private isJsonFormat(content: string, source: string): boolean {
        // ファイル拡張子で判定
        if (source.toLowerCase().endsWith(".json")) {
            return true;
        }

        // コンテンツの開始文字で判定
        const trimmedContent = content.trim();
        return trimmedContent.startsWith("{") || trimmedContent.startsWith("[");
    }

    /**
     * 複数のパース方法を試行（YAML → JSON）
     * @param content ファイル内容
     * @returns パースされたオブジェクト
     */
    parseWithFallback(content: string): any {
        const errors: string[] = [];

        // YAML解析を試行
        try {
            return YAML.parse(content);
        } catch (yamlError) {
            errors.push(
                `YAML解析エラー: ${
                    yamlError instanceof Error
                        ? yamlError.message
                        : "Unknown error"
                }`
            );
        }

        // JSON解析を試行
        try {
            return JSON.parse(content);
        } catch (jsonError) {
            errors.push(
                `JSON解析エラー: ${
                    jsonError instanceof Error
                        ? jsonError.message
                        : "Unknown error"
                }`
            );
        }

        // 両方失敗した場合
        throw new Error(
            `OpenAPIファイルの解析に失敗しました。サポートされている形式: YAML, JSON\n詳細:\n${errors.join(
                "\n"
            )}`
        );
    }
}

/**
 * シングルトンインスタンス
 */
export const openAPIContentParser = new OpenAPIContentParser();
