import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseResponseFormatter } from "../../tool-libs/utils/index.js";

/**
 * レスポンス整形サービス
 * MCPツールのレスポンス形式に統一して整形する
 */
export class ResponseResponseFormatter extends BaseResponseFormatter {
    /**
     * レスポンス一覧のレスポンスを整形
     * @param responseNames - レスポンス名の配列
     * @returns 整形されたCallToolResult
     */
    static formatResponses(responseNames: string[]): CallToolResult {
        const result = { responseNames };
        return BaseResponseFormatter.formatSuccess(result);
    }

    /**
     * レスポンス情報のレスポンスを整形
     * @param responseInfo - レスポンス情報
     * @returns 整形されたCallToolResult
     */
    static formatResponseInformation(responseInfo: {
        description: string;
        content?: any;
    }): CallToolResult {
        return BaseResponseFormatter.formatSuccess(responseInfo);
    }
}
