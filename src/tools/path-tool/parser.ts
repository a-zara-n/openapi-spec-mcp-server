/**
 * methodAndPathから method と path を抽出する結果の型
 */
export interface ParsedMethodAndPath {
    method: string;
    path: string;
}

/**
 * パース結果の型
 */
export type ParseResult<T> =
    | {
          success: true;
          data: T;
      }
    | {
          success: false;
          error: string;
      };

/**
 * methodAndPathから method と path を抽出するユーティリティ関数
 * @param methodAndPath - "GET /users" のような形式の文字列
 * @returns 解析されたmethodとpath、またはエラー
 */
export function parseMethodAndPath(
    methodAndPath: string
): ParseResult<ParsedMethodAndPath> {
    try {
        const trimmed = methodAndPath.trim();
        if (!trimmed) {
            return {
                success: false,
                error: "methodAndPathが空です",
            };
        }

        const parts = trimmed.split(" ");
        if (parts.length !== 2) {
            return {
                success: false,
                error: `無効なmethodAndPath形式です: ${methodAndPath}. 正しい形式: 'GET /users'`,
            };
        }

        const [methodPart, pathPart] = parts;

        // methodの検証
        const method = methodPart.toUpperCase();
        const validMethods = [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "HEAD",
            "OPTIONS",
        ];
        if (!validMethods.includes(method)) {
            return {
                success: false,
                error: `無効なHTTPメソッドです: ${methodPart}. 有効なメソッド: ${validMethods.join(
                    ", "
                )}`,
            };
        }

        // pathの基本検証
        if (!pathPart.startsWith("/")) {
            return {
                success: false,
                error: `パスは'/'で始まる必要があります: ${pathPart}`,
            };
        }

        return {
            success: true,
            data: {
                method,
                path: pathPart,
            },
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "パース中に予期しないエラーが発生しました",
        };
    }
}

/**
 * JSON文字列を安全にパースする関数
 * @param jsonString - パースするJSON文字列
 * @param defaultValue - パースに失敗した場合のデフォルト値
 * @returns パース結果またはデフォルト値
 */
export function safeJsonParse<T>(
    jsonString: string | null | undefined,
    defaultValue: T
): T {
    if (!jsonString) {
        return defaultValue;
    }

    try {
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.warn("JSON解析に失敗:", { jsonString, error });
        return defaultValue;
    }
}

/**
 * パラメータ配列を解析する関数
 * @param parametersString - JSON文字列形式のパラメータ
 * @returns パースされたパラメータ配列
 */
export function parseParameters(
    parametersString: string | null | undefined
): any[] {
    return safeJsonParse(parametersString, []);
}

/**
 * レスポンス情報を解析する関数
 * @param responsesString - JSON文字列形式のレスポンス
 * @returns パースされたレスポンス情報
 */
export function parseResponses(
    responsesString: string | null | undefined
): Record<string, any> {
    return safeJsonParse(responsesString, {});
}

/**
 * セキュリティ情報を解析する関数
 * @param securityString - JSON文字列形式のセキュリティ情報
 * @returns パースされたセキュリティ情報
 */
export function parseSecurity(
    securityString: string | null | undefined
): any[] {
    return safeJsonParse(securityString, []);
}
