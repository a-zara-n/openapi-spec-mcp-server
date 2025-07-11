import {
    validateArgs,
    ListPathsArgsSchema,
    GetPathInfoArgsSchema,
    GetPathParametersArgsSchema,
    GetPathResponsesArgsSchema,
    GetPathRequestBodyArgsSchema,
    GetPathDescribeArgsSchema,
} from "../validation.js";

/**
 * Validation関数のテスト
 */
describe("Validation Tests", () => {
    describe("validateArgs", () => {
        it("有効な引数の場合、成功を返すべき", () => {
            const validArgs = { name: "test-api" };
            const result = validateArgs(ListPathsArgsSchema, validArgs);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validArgs);
            }
        });

        it("無効な引数の場合、エラーを返すべき", () => {
            const invalidArgs = { name: "" }; // 空文字は無効
            const result = validateArgs(ListPathsArgsSchema, invalidArgs);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("OpenAPI名は必須です");
            }
        });

        it("必須フィールドが欠けている場合、エラーを返すべき", () => {
            const invalidArgs = {}; // nameフィールドが欠けている
            const result = validateArgs(ListPathsArgsSchema, invalidArgs);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Required");
            }
        });

        it("null引数の場合、エラーを返すべき", () => {
            const result = validateArgs(ListPathsArgsSchema, null);

            expect(result.success).toBe(false);
        });

        it("undefined引数の場合、エラーを返すべき", () => {
            const result = validateArgs(ListPathsArgsSchema, undefined);

            expect(result.success).toBe(false);
        });
    });

    describe("ListPathsArgsSchema", () => {
        it("有効なname引数を受け入れるべき", () => {
            const validArgs = { name: "example-api" };
            const result = validateArgs(ListPathsArgsSchema, validArgs);

            expect(result.success).toBe(true);
        });

        it("空のname引数を拒否するべき", () => {
            const invalidArgs = { name: "" };
            const result = validateArgs(ListPathsArgsSchema, invalidArgs);

            expect(result.success).toBe(false);
        });

        it("数値のname引数を拒否するべき", () => {
            const invalidArgs = { name: 123 };
            const result = validateArgs(ListPathsArgsSchema, invalidArgs);

            expect(result.success).toBe(false);
        });
    });

    describe("GetPathInfoArgsSchema", () => {
        it("有効な引数を受け入れるべき", () => {
            const validArgs = {
                name: "example-api",
                methodAndPath: "GET /users",
            };
            const result = validateArgs(GetPathInfoArgsSchema, validArgs);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("example-api");
                expect(result.data.methodAndPath).toBe("GET /users");
            }
        });

        it("methodAndPathが欠けている場合、エラーを返すべき", () => {
            const invalidArgs = { name: "example-api" };
            const result = validateArgs(GetPathInfoArgsSchema, invalidArgs);

            expect(result.success).toBe(false);
        });

        it("空のmethodAndPathを拒否するべき", () => {
            const invalidArgs = {
                name: "example-api",
                methodAndPath: "",
            };
            const result = validateArgs(GetPathInfoArgsSchema, invalidArgs);

            expect(result.success).toBe(false);
        });
    });

    describe("GetPathParametersArgsSchema", () => {
        it("有効な引数を受け入れるべき", () => {
            const validArgs = {
                name: "test-api",
                methodAndPath: "POST /users/{id}",
            };
            const result = validateArgs(GetPathParametersArgsSchema, validArgs);

            expect(result.success).toBe(true);
        });
    });

    describe("GetPathResponsesArgsSchema", () => {
        it("有効な引数を受け入れるべき", () => {
            const validArgs = {
                name: "test-api",
                methodAndPath: "DELETE /users/{id}",
            };
            const result = validateArgs(GetPathResponsesArgsSchema, validArgs);

            expect(result.success).toBe(true);
        });
    });

    describe("GetPathRequestBodyArgsSchema", () => {
        it("有効な引数を受け入れるべき", () => {
            const validArgs = {
                name: "test-api",
                methodAndPath: "PUT /users/{id}",
            };
            const result = validateArgs(
                GetPathRequestBodyArgsSchema,
                validArgs
            );

            expect(result.success).toBe(true);
        });
    });

    describe("GetPathDescribeArgsSchema", () => {
        it("有効な引数を受け入れるべき", () => {
            const validArgs = {
                name: "test-api",
                methodAndPath: "PATCH /users/{id}",
            };
            const result = validateArgs(GetPathDescribeArgsSchema, validArgs);

            expect(result.success).toBe(true);
        });
    });

    describe("エラーメッセージのフォーマット", () => {
        it("複数のバリデーションエラーを適切にフォーマットするべき", () => {
            const invalidArgs = { name: "", methodAndPath: "" };
            const result = validateArgs(GetPathInfoArgsSchema, invalidArgs);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("name");
                expect(result.error).toContain("methodAndPath");
            }
        });

        it("Zodエラー以外のエラーも適切に処理するべき", () => {
            // スキーマのparseがthrowした場合のテスト
            const mockSchema = {
                parse: () => {
                    throw new Error("Custom error");
                },
            };

            const result = validateArgs(mockSchema as any, {});

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Custom error");
            }
        });
    });
});
