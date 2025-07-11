import { ResponseFormatter } from "../formatters/response-formatter.js";

/**
 * ResponseFormatter関数のテスト
 */
describe("ResponseFormatter Tests", () => {
    describe("formatSuccess", () => {
        it("シンプルなオブジェクトを正しく整形するべき", () => {
            const data = { message: "success" };
            const result = ResponseFormatter.formatSuccess(data);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toBe(JSON.stringify(data, null, 2));
        });

        it("配列データを正しく整形するべき", () => {
            const data = [{ id: 1 }, { id: 2 }];
            const result = ResponseFormatter.formatSuccess(data);

            expect(result.content[0].text).toBe(JSON.stringify(data, null, 2));
        });

        it("null値を正しく整形するべき", () => {
            const result = ResponseFormatter.formatSuccess(null);

            expect(result.content[0].text).toBe("null");
        });

        it("複雑なネストされたオブジェクトを正しく整形するべき", () => {
            const data = {
                user: {
                    id: 1,
                    profile: {
                        name: "Test User",
                        settings: { theme: "dark" },
                    },
                },
            };
            const result = ResponseFormatter.formatSuccess(data);

            expect(result.content[0].text).toContain("Test User");
            expect(result.content[0].text).toContain("dark");
        });
    });

    describe("formatError", () => {
        it("エラーメッセージを正しく整形するべき", () => {
            const errorMessage = "データが見つかりません";
            const result = ResponseFormatter.formatError(errorMessage);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toBe(
                `エラーが発生しました: ${errorMessage}`
            );
        });

        it("空のエラーメッセージを正しく処理するべき", () => {
            const result = ResponseFormatter.formatError("");

            expect(result.content[0].text).toBe("エラーが発生しました: ");
        });

        it("特殊文字を含むエラーメッセージを正しく処理するべき", () => {
            const errorMessage = '無効な文字: "quotes" & <tags>';
            const result = ResponseFormatter.formatError(errorMessage);

            expect(result.content[0].text).toContain(errorMessage);
        });
    });

    describe("formatPathList", () => {
        it("パス一覧を正しく整形するべき", () => {
            const methodAndPaths = [
                "GET /users",
                "POST /users",
                "GET /users/{id}",
            ];
            const result = ResponseFormatter.formatPathList(methodAndPaths);

            const parsedResult = JSON.parse(result.content[0].text);
            expect(parsedResult).toHaveProperty("methodAndPaths");
            expect(parsedResult.methodAndPaths).toEqual(methodAndPaths);
        });

        it("空のパス一覧を正しく整形するべき", () => {
            const result = ResponseFormatter.formatPathList([]);

            const parsedResult = JSON.parse(result.content[0].text);
            expect(parsedResult.methodAndPaths).toEqual([]);
        });
    });

    describe("formatPathDetail", () => {
        it("パス詳細情報を正しく整形するべき", () => {
            const pathDetail = {
                method: "GET",
                path: "/users/{id}",
                summary: "ユーザー詳細取得",
                description: "指定されたIDのユーザー詳細を取得します",
                security: [{ bearerAuth: [] }],
                parameters: [{ name: "id", in: "path", required: true }],
                responses: { "200": { description: "成功" } },
            };

            const result = ResponseFormatter.formatPathDetail(pathDetail);
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult.method).toBe("GET");
            expect(parsedResult.path).toBe("/users/{id}");
            expect(parsedResult.summary).toBe("ユーザー詳細取得");
            expect(parsedResult.security).toEqual([{ bearerAuth: [] }]);
        });

        it("オプショナルフィールドがundefinedの場合も正しく処理するべき", () => {
            const pathDetail = {
                method: "POST",
                path: "/users",
                summary: undefined,
                description: undefined,
                security: [],
                parameters: [],
                responses: {},
            };

            const result = ResponseFormatter.formatPathDetail(pathDetail);
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult.method).toBe("POST");
            expect(parsedResult.path).toBe("/users");
            expect(parsedResult.summary).toBeUndefined();
            expect(parsedResult.description).toBeUndefined();
        });
    });

    describe("formatParameters", () => {
        it("パラメータ配列を正しく整形するべき", () => {
            const parameters = [
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
            ];

            const result = ResponseFormatter.formatParameters(parameters);
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult).toHaveProperty("parameters");
            expect(parsedResult.parameters).toEqual(parameters);
        });

        it("空のパラメータ配列を正しく整形するべき", () => {
            const result = ResponseFormatter.formatParameters([]);

            const parsedResult = JSON.parse(result.content[0].text);
            expect(parsedResult.parameters).toEqual([]);
        });
    });

    describe("formatResponses", () => {
        it("レスポンス情報を正しく整形するべき", () => {
            const responses = {
                "200": {
                    description: "成功",
                    content: {
                        "application/json": {
                            schema: { type: "object" },
                        },
                    },
                },
                "400": { description: "不正なリクエスト" },
            };

            const result = ResponseFormatter.formatResponses(responses);
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult).toHaveProperty("responses");
            expect(parsedResult.responses).toEqual(responses);
        });

        it("空のレスポンス情報を正しく整形するべき", () => {
            const result = ResponseFormatter.formatResponses({});

            const parsedResult = JSON.parse(result.content[0].text);
            expect(parsedResult.responses).toEqual({});
        });
    });

    describe("formatPathDescription", () => {
        it("パス説明情報を正しく整形するべき", () => {
            const description = {
                method: "DELETE",
                path: "/users/{id}",
                summary: "ユーザー削除",
                description: "指定されたIDのユーザーを削除します",
                security: [{ bearerAuth: [] }],
            };

            const result = ResponseFormatter.formatPathDescription(description);
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult).toEqual(description);
        });
    });

    describe("formatRequestBody", () => {
        it("パラメータを含むリクエストデータを正しく整形するべき", () => {
            const requestData = {
                parameters: [{ name: "body", in: "body", required: true }],
            };

            const result = ResponseFormatter.formatRequestBody(requestData);
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult).toEqual(requestData);
        });

        it("リクエストボディを含むデータを正しく整形するべき", () => {
            const requestData = {
                requestBody: {
                    description: "ユーザー作成用のデータ",
                    required: true,
                    content: {
                        "application/json": {
                            schema: { type: "object" },
                        },
                    },
                },
            };

            const result = ResponseFormatter.formatRequestBody(requestData);
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult).toEqual(requestData);
        });
    });

    describe("formatEmptyResult", () => {
        it("指定されたタイプで空の結果を正しく整形するべき", () => {
            const result =
                ResponseFormatter.formatEmptyResult("methodAndPaths");
            const parsedResult = JSON.parse(result.content[0].text);

            expect(parsedResult).toHaveProperty("methodAndPaths");
            expect(parsedResult.methodAndPaths).toEqual([]);
        });

        it("異なるタイプで空の結果を正しく整形するべき", () => {
            const types = ["parameters", "schemas", "responses"];

            types.forEach((type) => {
                const result = ResponseFormatter.formatEmptyResult(type);
                const parsedResult = JSON.parse(result.content[0].text);

                expect(parsedResult).toHaveProperty(type);
                expect(parsedResult[type]).toEqual([]);
            });
        });
    });

    describe("formatNotFoundError", () => {
        it("リソースが見つからないエラーを正しく整形するべき", () => {
            const result = ResponseFormatter.formatNotFoundError(
                "OpenAPI仕様",
                "example-api"
            );

            expect(result.content[0].text).toBe(
                "エラーが発生しました: OpenAPI仕様 'example-api' が見つかりません。"
            );
        });

        it("異なるリソースタイプでも正しく動作するべき", () => {
            const testCases = [
                { resourceType: "パス", identifier: "GET /users" },
                { resourceType: "スキーマ", identifier: "UserSchema" },
                { resourceType: "レスポンス", identifier: "ErrorResponse" },
            ];

            testCases.forEach(({ resourceType, identifier }) => {
                const result = ResponseFormatter.formatNotFoundError(
                    resourceType,
                    identifier
                );

                expect(result.content[0].text).toContain(resourceType);
                expect(result.content[0].text).toContain(identifier);
                expect(result.content[0].text).toContain("が見つかりません。");
            });
        });
    });

    describe("formatValidationError", () => {
        it("バリデーションエラーを正しく整形するべき", () => {
            const validationError = "name: OpenAPI名は必須です";
            const result =
                ResponseFormatter.formatValidationError(validationError);

            expect(result.content[0].text).toBe(
                "エラーが発生しました: バリデーションエラー: name: OpenAPI名は必須です"
            );
        });

        it("複雑なバリデーションエラーも正しく処理するべき", () => {
            const validationError =
                "name: String must contain at least 1 character(s), methodAndPath: Required";
            const result =
                ResponseFormatter.formatValidationError(validationError);

            expect(result.content[0].text).toContain("バリデーションエラー:");
            expect(result.content[0].text).toContain(validationError);
        });
    });

    describe("レスポンス構造の一貫性", () => {
        it("すべてのformat関数が一貫したCallToolResult構造を返すべき", () => {
            const methods = [
                () => ResponseFormatter.formatSuccess({}),
                () => ResponseFormatter.formatError("test"),
                () => ResponseFormatter.formatPathList([]),
                () =>
                    ResponseFormatter.formatPathDetail({
                        method: "GET",
                        path: "/test",
                        security: [],
                        parameters: [],
                        responses: {},
                    }),
                () => ResponseFormatter.formatParameters([]),
                () => ResponseFormatter.formatResponses({}),
                () =>
                    ResponseFormatter.formatPathDescription({
                        method: "GET",
                        path: "/test",
                        security: [],
                    }),
                () => ResponseFormatter.formatRequestBody({}),
                () => ResponseFormatter.formatEmptyResult("test"),
                () => ResponseFormatter.formatNotFoundError("test", "test"),
                () => ResponseFormatter.formatValidationError("test"),
            ];

            methods.forEach((method) => {
                const result = method();

                expect(result).toHaveProperty("content");
                expect(Array.isArray(result.content)).toBe(true);
                expect(result.content).toHaveLength(1);
                expect(result.content[0]).toHaveProperty("type");
                expect(result.content[0]).toHaveProperty("text");
                expect(result.content[0].type).toBe("text");
                expect(typeof result.content[0].text).toBe("string");
            });
        });
    });
});
