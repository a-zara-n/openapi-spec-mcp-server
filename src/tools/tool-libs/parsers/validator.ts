// 型定義を新しい統合ファイルからインポート
import type { OpenAPIValidationResult } from "../types/index.js";

// 後方互換性のためのエイリアス
export type ValidationResult = OpenAPIValidationResult;

/**
 * OpenAPIバリデーター
 * 純粋にバリデーション処理のみを担当（副作用なし）
 */
export class OpenAPIValidator {
    /**
     * OpenAPIオブジェクトの基本的なバリデーション
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns バリデーション結果
     */
    validate(parsedContent: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // nullまたはundefinedのチェック
        if (!parsedContent || typeof parsedContent !== "object") {
            return {
                isValid: false,
                errors: [
                    "OpenAPIオブジェクトが無効です（null、undefined、または非オブジェクト）",
                ],
                warnings: [],
            };
        }

        // OpenAPIバージョンの検証
        const versionResult = this.validateVersion(parsedContent);
        if (!versionResult.isValid) {
            errors.push(...versionResult.errors);
        }
        warnings.push(...versionResult.warnings);

        // info セクションの検証
        const infoResult = this.validateInfo(parsedContent.info);
        if (!infoResult.isValid) {
            errors.push(...infoResult.errors);
        }
        warnings.push(...infoResult.warnings);

        // paths セクションの検証（警告レベル）
        const pathsResult = this.validatePaths(parsedContent.paths);
        warnings.push(...pathsResult.warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            openApiVersion: versionResult.openApiVersion,
        };
    }

    /**
     * OpenAPIバージョンの検証
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns バージョン検証結果
     */
    private validateVersion(
        parsedContent: any
    ): ValidationResult & { openApiVersion?: string } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // OpenAPI または Swagger バージョンの存在確認
        const openApiVersion = parsedContent.openapi;
        const swaggerVersion = parsedContent.swagger;

        if (!openApiVersion && !swaggerVersion) {
            errors.push(
                "OpenAPIバージョンまたはSwaggerバージョンが指定されていません"
            );
            return { isValid: false, errors, warnings };
        }

        // バージョン文字列の検証
        const version = openApiVersion || swaggerVersion;
        if (typeof version !== "string") {
            errors.push(
                `バージョンは文字列である必要があります: ${typeof version}`
            );
            return { isValid: false, errors, warnings };
        }

        // Swagger 2.0の場合の警告
        if (swaggerVersion && !openApiVersion) {
            warnings.push(
                "Swagger 2.0 形式です。OpenAPI 3.0+ への移行を推奨します"
            );
        }

        // OpenAPI 3.0以降の場合のマイナーバージョンチェック
        if (openApiVersion) {
            const versionPattern = /^3\.\d+\.\d+$/;
            if (!versionPattern.test(openApiVersion)) {
                warnings.push(
                    `OpenAPIバージョン形式が標準的でない可能性があります: ${openApiVersion}`
                );
            }
        }

        return {
            isValid: true,
            errors,
            warnings,
            openApiVersion: version,
        };
    }

    /**
     * info セクションの検証
     * @param info infoオブジェクト
     * @returns info検証結果
     */
    private validateInfo(info: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // info セクション自体の存在確認
        if (!info || typeof info !== "object") {
            errors.push(
                "info セクションが存在しないか、オブジェクトではありません"
            );
            return { isValid: false, errors, warnings };
        }

        // title の検証（必須）
        if (!info.title) {
            errors.push("info.title が存在しません（必須項目）");
        } else if (typeof info.title !== "string") {
            errors.push(
                `info.title は文字列である必要があります: ${typeof info.title}`
            );
        } else if (info.title.trim().length === 0) {
            errors.push("info.title は空文字列にできません");
        }

        // version の検証（必須）
        if (!info.version) {
            errors.push("info.version が存在しません（必須項目）");
        } else if (typeof info.version !== "string") {
            errors.push(
                `info.version は文字列である必要があります: ${typeof info.version}`
            );
        }

        // description の検証（推奨）
        if (!info.description) {
            warnings.push("info.description の設定を推奨します");
        } else if (typeof info.description !== "string") {
            warnings.push(
                `info.description は文字列である必要があります: ${typeof info.description}`
            );
        }

        return { isValid: errors.length === 0, errors, warnings };
    }

    /**
     * paths セクションの検証
     * @param paths pathsオブジェクト
     * @returns paths検証結果
     */
    private validatePaths(paths: any): ValidationResult {
        const warnings: string[] = [];

        // paths セクションの存在確認（推奨）
        if (!paths || typeof paths !== "object") {
            warnings.push(
                "paths セクションが存在しないか、オブジェクトではありません"
            );
            return { isValid: true, errors: [], warnings };
        }

        // パスが空の場合の警告
        const pathKeys = Object.keys(paths);
        if (pathKeys.length === 0) {
            warnings.push("paths セクションが空です");
        }

        // 各パスの基本的なチェック
        for (const pathKey of pathKeys) {
            if (!pathKey.startsWith("/")) {
                warnings.push(
                    `パス "${pathKey}" は "/" で始まる必要があります`
                );
            }
        }

        return { isValid: true, errors: [], warnings };
    }

    /**
     * 軽量バリデーション（エラーのみチェック）
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns バリデーション成功かどうか
     */
    isValidOpenAPI(parsedContent: any): boolean {
        const result = this.validate(parsedContent);
        return result.isValid;
    }

    /**
     * OpenAPIかSwaggerかを判定
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns "openapi" | "swagger" | "unknown"
     */
    getSpecType(parsedContent: any): "openapi" | "swagger" | "unknown" {
        if (parsedContent?.openapi) return "openapi";
        if (parsedContent?.swagger) return "swagger";
        return "unknown";
    }
}

/**
 * シングルトンインスタンス
 */
export const openAPIValidator = new OpenAPIValidator();
