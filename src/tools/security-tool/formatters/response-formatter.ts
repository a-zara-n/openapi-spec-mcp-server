import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseResponseFormatter } from "../../tool-libs/utils/index.js";

/**
 * レスポンス整形サービス
 * MCPツールのレスポンス形式に統一して整形する
 */
export class SecurityResponseFormatter extends BaseResponseFormatter {
    /**
     * セキュリティスキーム一覧のレスポンスを整形
     * @param securitySchemes - セキュリティスキーム名の配列
     * @returns 整形されたCallToolResult
     */
    static formatSecuritySchemes(securitySchemes: string[]): CallToolResult {
        const result = { securitySchemes };
        return BaseResponseFormatter.formatSuccess(result);
    }

    /**
     * セキュリティスキーム情報のレスポンスを整形
     * @param schemeInfo - セキュリティスキーム情報
     * @returns 整形されたCallToolResult
     */
    static formatSecuritySchemeInformation(schemeInfo: {
        type: string;
        scheme?: string;
        description: string;
    }): CallToolResult {
        return BaseResponseFormatter.formatSuccess(schemeInfo);
    }
}
