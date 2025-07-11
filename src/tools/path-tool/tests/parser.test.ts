import {
    parseMethodAndPath,
    safeJsonParse,
    parseParameters,
    parseResponses,
    parseSecurity,
} from "../parser.js";

/**
 * Parser関数のテスト
 */
describe("Parser Tests", () => {
    describe("parseMethodAndPath", () => {
        it("有効なmethodAndPath文字列を正しく解析するべき", () => {
            const testCases = [
                {
                    input: "GET /users",
                    expected: { method: "GET", path: "/users" },
                },
                {
                    input: "POST /users",
                    expected: { method: "POST", path: "/users" },
                },
                {
                    input: "PUT /users/{id}",
                    expected: { method: "PUT", path: "/users/{id}" },
                },
                {
                    input: "DELETE /users/{id}",
                    expected: { method: "DELETE", path: "/users/{id}" },
                },
                {
                    input: "PATCH /users/{id}",
                    expected: { method: "PATCH", path: "/users/{id}" },
                },
                {
                    input: "HEAD /users",
                    expected: { method: "HEAD", path: "/users" },
                },
                {
                    input: "OPTIONS /users",
                    expected: { method: "OPTIONS", path: "/users" },
                },
            ];

            testCases.forEach(({ input, expected }) => {
                const result = parseMethodAndPath(input);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.method).toBe(expected.method);
                    expect(result.data.path).toBe(expected.path);
                }
            });
        });

        it("小文字のメソッドを大文字に変換するべき", () => {
            const result = parseMethodAndPath("get /users");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.method).toBe("GET");
                expect(result.data.path).toBe("/users");
            }
        });

        it("前後の空白を除去するべき", () => {
            const result = parseMethodAndPath("  GET /users  ");
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.method).toBe("GET");
                expect(result.data.path).toBe("/users");
            }
        });

        it("複雑なパスを正しく解析するべき", () => {
            const testCases = [
                "GET /api/v1/users/{id}/posts",
                "POST /users/{userId}/comments/{commentId}",
                "PUT /api/v2/resources/{resourceId}",
            ];

            testCases.forEach((input) => {
                const result = parseMethodAndPath(input);
                expect(result.success).toBe(true);
            });
        });

        it("無効なHTTPメソッドを拒否するべき", () => {
            const invalidMethods = ["INVALID", "CUSTOM", "UNKNOWN"];

            invalidMethods.forEach((method) => {
                const result = parseMethodAndPath(`${method} /users`);
                expect(result.success).toBe(false);
                if (!result.success) {
                    expect(result.error).toContain("無効なHTTPメソッドです");
                }
            });
        });

        it("無効な形式を拒否するべき", () => {
            const invalidInputs = [
                "GET", // パスが欠けている
                "/users", // メソッドが欠けている
                "GET /users POST", // 余分な要素
                "GET  /users  POST", // 余分な要素（空白あり）
                "", // 空文字
                "   ", // 空白のみ
            ];

            invalidInputs.forEach((input) => {
                const result = parseMethodAndPath(input);
                expect(result.success).toBe(false);
            });
        });

        it("パスが'/'で始まらない場合を拒否するべき", () => {
            const result = parseMethodAndPath("GET users");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "パスは'/'で始まる必要があります"
                );
            }
        });

        it("空のmethodAndPathを拒否するべき", () => {
            const result = parseMethodAndPath("");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("methodAndPathが空です");
            }
        });

        it("空白のみのmethodAndPathを拒否するべき", () => {
            const result = parseMethodAndPath("   ");
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("methodAndPathが空です");
            }
        });
    });

    describe("safeJsonParse", () => {
        it("有効なJSON文字列を正しく解析するべき", () => {
            const jsonString = '{"name": "test", "value": 123}';
            const result = safeJsonParse(jsonString, {});
            expect(result).toEqual({ name: "test", value: 123 });
        });

        it("配列のJSON文字列を正しく解析するべき", () => {
            const jsonString = '[{"id": 1}, {"id": 2}]';
            const result = safeJsonParse(jsonString, []);
            expect(result).toEqual([{ id: 1 }, { id: 2 }]);
        });

        it("無効なJSON文字列の場合デフォルト値を返すべき", () => {
            const invalidJson = '{"invalid": json}';
            const defaultValue = { default: true };
            const result = safeJsonParse(invalidJson, defaultValue);
            expect(result).toEqual(defaultValue);
        });

        it("null入力の場合デフォルト値を返すべき", () => {
            const defaultValue = { default: true };
            const result = safeJsonParse(null, defaultValue);
            expect(result).toEqual(defaultValue);
        });

        it("undefined入力の場合デフォルト値を返すべき", () => {
            const defaultValue = { default: true };
            const result = safeJsonParse(undefined, defaultValue);
            expect(result).toEqual(defaultValue);
        });

        it("空文字列の場合デフォルト値を返すべき", () => {
            const defaultValue = { default: true };
            const result = safeJsonParse("", defaultValue);
            expect(result).toEqual(defaultValue);
        });

        it("異なるデータ型のデフォルト値でも正しく動作するべき", () => {
            expect(safeJsonParse(null, [])).toEqual([]);
            expect(safeJsonParse(null, 42)).toBe(42);
            expect(safeJsonParse(null, "default")).toBe("default");
            expect(safeJsonParse(null, true)).toBe(true);
        });
    });

    describe("parseParameters", () => {
        it("有効なパラメータJSON文字列を解析するべき", () => {
            const parametersJson = JSON.stringify([
                {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "integer" },
                },
                {
                    name: "limit",
                    in: "query",
                    required: false,
                    schema: { type: "integer" },
                },
            ]);

            const result = parseParameters(parametersJson);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0].name).toBe("id");
            expect(result[1].name).toBe("limit");
        });

        it("null入力の場合空配列を返すべき", () => {
            const result = parseParameters(null);
            expect(result).toEqual([]);
        });

        it("undefined入力の場合空配列を返すべき", () => {
            const result = parseParameters(undefined);
            expect(result).toEqual([]);
        });

        it("無効なJSON文字列の場合空配列を返すべき", () => {
            const result = parseParameters("invalid json");
            expect(result).toEqual([]);
        });
    });

    describe("parseResponses", () => {
        it("有効なレスポンスJSON文字列を解析するべき", () => {
            const responsesJson = JSON.stringify({
                "200": {
                    description: "成功",
                    content: {
                        "application/json": {
                            schema: { type: "object" },
                        },
                    },
                },
                "400": {
                    description: "不正なリクエスト",
                },
            });

            const result = parseResponses(responsesJson);
            expect(typeof result).toBe("object");
            expect(result["200"]).toBeDefined();
            expect(result["400"]).toBeDefined();
            expect(result["200"].description).toBe("成功");
        });

        it("null入力の場合空オブジェクトを返すべき", () => {
            const result = parseResponses(null);
            expect(result).toEqual({});
        });

        it("undefined入力の場合空オブジェクトを返すべき", () => {
            const result = parseResponses(undefined);
            expect(result).toEqual({});
        });

        it("無効なJSON文字列の場合空オブジェクトを返すべき", () => {
            const result = parseResponses("invalid json");
            expect(result).toEqual({});
        });
    });

    describe("parseSecurity", () => {
        it("有効なセキュリティJSON文字列を解析するべき", () => {
            const securityJson = JSON.stringify([
                { bearerAuth: [] },
                { apiKey: [] },
            ]);

            const result = parseSecurity(securityJson);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty("bearerAuth");
            expect(result[1]).toHaveProperty("apiKey");
        });

        it("null入力の場合空配列を返すべき", () => {
            const result = parseSecurity(null);
            expect(result).toEqual([]);
        });

        it("undefined入力の場合空配列を返すべき", () => {
            const result = parseSecurity(undefined);
            expect(result).toEqual([]);
        });

        it("無効なJSON文字列の場合空配列を返すべき", () => {
            const result = parseSecurity("invalid json");
            expect(result).toEqual([]);
        });
    });

    describe("コンソール警告の動作", () => {
        it("無効なJSONパースでコンソール警告が出力されるべき", () => {
            const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

            safeJsonParse("invalid json", {});

            expect(consoleSpy).toHaveBeenCalledWith(
                "JSON解析に失敗:",
                expect.objectContaining({
                    jsonString: "invalid json",
                    error: expect.any(Error),
                })
            );

            consoleSpy.mockRestore();
        });
    });
});
