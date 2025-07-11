import {
    validateArgs,
    ListApplicationServersArgsSchema,
    GetServerInformationArgsSchema,
} from "../validation.js";

describe("Server Validation", () => {
    describe("validateArgs", () => {
        it("正常なバリデーションが成功すること", () => {
            const schema = ListApplicationServersArgsSchema;
            const args = { name: "test-api" };
            const result = validateArgs(schema, args);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("test-api");
            }
        });

        it("バリデーションエラーが適切に処理されること", () => {
            const schema = ListApplicationServersArgsSchema;
            const args = { name: "" }; // 空文字列はエラー
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("OpenAPI名は必須です");
            }
        });

        it("型が間違っている場合のエラー処理", () => {
            const schema = ListApplicationServersArgsSchema;
            const args = { name: 123 }; // 数値は無効
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
        });

        it("undefined引数の処理", () => {
            const schema = ListApplicationServersArgsSchema;
            const args = undefined;
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
        });
    });

    describe("ListApplicationServersArgsSchema", () => {
        it("有効なOpenAPI名を受け入れること", () => {
            const validNames = [
                "simple-api",
                "complex_api_name",
                "api123",
                "API-V2",
                "my.api.v1",
            ];

            validNames.forEach((name) => {
                const result = ListApplicationServersArgsSchema.safeParse({
                    name,
                });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.name).toBe(name);
                }
            });
        });

        it("無効なOpenAPI名を拒否すること", () => {
            const invalidNames = ["", null, undefined, 123, [], {}];

            invalidNames.forEach((name) => {
                const result = ListApplicationServersArgsSchema.safeParse({
                    name,
                });
                expect(result.success).toBe(false);
            });
        });

        it("nameが欠如している場合のエラー", () => {
            const result = ListApplicationServersArgsSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("追加プロパティを無視すること", () => {
            const result = ListApplicationServersArgsSchema.safeParse({
                name: "test-api",
                extra: "value",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("test-api");
                expect(result.data).not.toHaveProperty("extra");
            }
        });
    });

    describe("GetServerInformationArgsSchema", () => {
        it("有効なOpenAPI名を受け入れること", () => {
            const validNames = [
                "simple-api",
                "complex_api_name",
                "api123",
                "API-V2",
                "my.api.v1",
            ];

            validNames.forEach((name) => {
                const result = GetServerInformationArgsSchema.safeParse({
                    name,
                });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.name).toBe(name);
                }
            });
        });

        it("無効なOpenAPI名を拒否すること", () => {
            const invalidNames = ["", null, undefined, 123, [], {}];

            invalidNames.forEach((name) => {
                const result = GetServerInformationArgsSchema.safeParse({
                    name,
                });
                expect(result.success).toBe(false);
            });
        });

        it("nameが欠如している場合のエラー", () => {
            const result = GetServerInformationArgsSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });

    describe("スキーマ一貫性テスト", () => {
        it("全てのスキーマが同じname検証ルールを使用すること", () => {
            const testName = "test-api";

            const listResult = ListApplicationServersArgsSchema.safeParse({
                name: testName,
            });
            const getResult = GetServerInformationArgsSchema.safeParse({
                name: testName,
            });

            expect(listResult.success).toBe(true);
            expect(getResult.success).toBe(true);

            if (listResult.success && getResult.success) {
                expect(listResult.data.name).toBe(testName);
                expect(getResult.data.name).toBe(testName);
            }
        });

        it("全てのスキーマが同じエラーメッセージを使用すること", () => {
            const invalidName = "";

            const listResult = ListApplicationServersArgsSchema.safeParse({
                name: invalidName,
            });
            const getResult = GetServerInformationArgsSchema.safeParse({
                name: invalidName,
            });

            expect(listResult.success).toBe(false);
            expect(getResult.success).toBe(false);

            if (!listResult.success && !getResult.success) {
                const listError = listResult.error.errors[0].message;
                const getError = getResult.error.errors[0].message;
                expect(listError).toBe(getError);
                expect(listError).toContain("OpenAPI名は必須です");
            }
        });
    });
});
