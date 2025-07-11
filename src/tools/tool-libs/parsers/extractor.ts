// 型定義を新しい統合ファイルからインポート
import type { ExtractedOpenAPIData } from "../types/index.js";

/**
 * OpenAPIデータ抽出器
 * 純粋にデータ抽出処理のみを担当（副作用なし）
 */
export class OpenAPIExtractor {
    /**
     * パース済みOpenAPIオブジェクトからすべてのデータを抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @param name API名
     * @returns 抽出されたデータ
     */
    extractAll(parsedContent: any, name: string): ExtractedOpenAPIData {
        return {
            basic: this.extractBasicInfo(parsedContent, name),
            servers: this.extractServers(parsedContent),
            paths: this.extractPaths(parsedContent),
            schemas: this.extractSchemas(parsedContent),
            securitySchemes: this.extractSecuritySchemes(parsedContent),
            responses: this.extractResponses(parsedContent),
        };
    }

    /**
     * 基本情報を抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @param name API名
     * @returns 基本情報
     */
    extractBasicInfo(
        parsedContent: any,
        name: string
    ): ExtractedOpenAPIData["basic"] {
        const info = parsedContent.info || {};
        const openApiVersion =
            parsedContent.openapi || parsedContent.swagger || "unknown";

        return {
            name,
            title: info.title || name,
            summary: info.description || info.summary || "",
            version: info.version || "1.0.0",
            openApiVersion,
        };
    }

    /**
     * サーバー情報を抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns サーバー情報の配列
     */
    extractServers(parsedContent: any): ExtractedOpenAPIData["servers"] {
        const servers = parsedContent.servers;

        if (!Array.isArray(servers)) {
            return [];
        }

        return servers
            .map((server) => ({
                description: server.description || "",
                url: server.url || "",
            }))
            .filter((server) => server.url); // URLが空のものは除外
    }

    /**
     * パス情報を抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns パス情報の配列
     */
    extractPaths(parsedContent: any): ExtractedOpenAPIData["paths"] {
        const paths = parsedContent.paths;

        if (!paths || typeof paths !== "object") {
            return [];
        }

        const extractedPaths: ExtractedOpenAPIData["paths"] = [];
        const httpMethods = [
            "get",
            "post",
            "put",
            "delete",
            "patch",
            "options",
            "head",
            "trace",
        ];

        for (const [pathName, pathItem] of Object.entries(paths)) {
            if (!pathItem || typeof pathItem !== "object") continue;

            for (const method of httpMethods) {
                const operation = (pathItem as any)[method];
                if (!operation || typeof operation !== "object") continue;

                extractedPaths.push({
                    method: method.toUpperCase(),
                    path: pathName,
                    summary: operation.summary || "",
                    description: operation.description || "",
                    security: operation.security || undefined,
                    parameters: operation.parameters || undefined,
                    responses: operation.responses || undefined,
                    requestBody: operation.requestBody || undefined,
                });
            }
        }

        return extractedPaths;
    }

    /**
     * スキーマ情報を抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns スキーマ情報の配列
     */
    extractSchemas(parsedContent: any): ExtractedOpenAPIData["schemas"] {
        const schemas = parsedContent.components?.schemas;

        if (!schemas || typeof schemas !== "object") {
            return [];
        }

        const extractedSchemas: ExtractedOpenAPIData["schemas"] = [];

        for (const [schemaName, schemaDefinition] of Object.entries(schemas)) {
            if (!schemaDefinition || typeof schemaDefinition !== "object")
                continue;

            extractedSchemas.push({
                name: schemaName,
                description: (schemaDefinition as any).description || "",
                schema: schemaDefinition,
            });
        }

        return extractedSchemas;
    }

    /**
     * セキュリティスキーム情報を抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns セキュリティスキーム情報の配列
     */
    extractSecuritySchemes(
        parsedContent: any
    ): ExtractedOpenAPIData["securitySchemes"] {
        const securitySchemes = parsedContent.components?.securitySchemes;

        if (!securitySchemes || typeof securitySchemes !== "object") {
            return [];
        }

        const extractedSchemes: ExtractedOpenAPIData["securitySchemes"] = [];

        for (const [schemeName, schemeDefinition] of Object.entries(
            securitySchemes
        )) {
            if (!schemeDefinition || typeof schemeDefinition !== "object")
                continue;

            const scheme = schemeDefinition as any;
            extractedSchemes.push({
                name: schemeName,
                type: scheme.type || "unknown",
                scheme: scheme.scheme || undefined,
                description: scheme.description || "",
                content: schemeDefinition,
            });
        }

        return extractedSchemes;
    }

    /**
     * レスポンス情報を抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns レスポンス情報の配列
     */
    extractResponses(parsedContent: any): ExtractedOpenAPIData["responses"] {
        const responses = parsedContent.components?.responses;

        if (!responses || typeof responses !== "object") {
            return [];
        }

        const extractedResponses: ExtractedOpenAPIData["responses"] = [];

        for (const [responseName, responseDefinition] of Object.entries(
            responses
        )) {
            if (!responseDefinition || typeof responseDefinition !== "object")
                continue;

            extractedResponses.push({
                name: responseName,
                description: (responseDefinition as any).description || "",
                content: responseDefinition,
            });
        }

        return extractedResponses;
    }

    /**
     * 特定セクションのみを抽出（パフォーマンス用）
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @param sections 抽出したいセクション
     * @param name API名
     * @returns 指定されたセクションのデータ
     */
    extractSections(
        parsedContent: any,
        sections: Array<keyof ExtractedOpenAPIData>,
        name: string
    ): Partial<ExtractedOpenAPIData> {
        const result: Partial<ExtractedOpenAPIData> = {};

        for (const section of sections) {
            switch (section) {
                case "basic":
                    result.basic = this.extractBasicInfo(parsedContent, name);
                    break;
                case "servers":
                    result.servers = this.extractServers(parsedContent);
                    break;
                case "paths":
                    result.paths = this.extractPaths(parsedContent);
                    break;
                case "schemas":
                    result.schemas = this.extractSchemas(parsedContent);
                    break;
                case "securitySchemes":
                    result.securitySchemes =
                        this.extractSecuritySchemes(parsedContent);
                    break;
                case "responses":
                    result.responses = this.extractResponses(parsedContent);
                    break;
            }
        }

        return result;
    }

    /**
     * 統計情報を抽出
     * @param parsedContent パース済みのOpenAPIオブジェクト
     * @returns 統計情報
     */
    extractStats(parsedContent: any): {
        serverCount: number;
        pathCount: number;
        schemaCount: number;
        securitySchemeCount: number;
        responseCount: number;
    } {
        const servers = this.extractServers(parsedContent);
        const paths = this.extractPaths(parsedContent);
        const schemas = this.extractSchemas(parsedContent);
        const securitySchemes = this.extractSecuritySchemes(parsedContent);
        const responses = this.extractResponses(parsedContent);

        return {
            serverCount: servers.length,
            pathCount: paths.length,
            schemaCount: schemas.length,
            securitySchemeCount: securitySchemes.length,
            responseCount: responses.length,
        };
    }
}

/**
 * シングルトンインスタンス
 */
export const openAPIExtractor = new OpenAPIExtractor();

// 型定義も再エクスポート（後方互換性のため）
export type { ExtractedOpenAPIData };
