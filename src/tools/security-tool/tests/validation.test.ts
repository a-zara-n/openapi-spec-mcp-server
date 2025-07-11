import {
    validateArgs,
    ListSecuritySchemesArgsSchema,
    GetSecuritySchemeInfoArgsSchema,
} from "../validation.js";

describe("Security Validation", () => {
    describe("validateArgs", () => {
        it("正常なバリデーションが成功すること", () => {
            const schema = ListSecuritySchemesArgsSchema;
            const args = { name: "test-api" };
            const result = validateArgs(schema, args);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("test-api");
            }
        });

        it("バリデーションエラーが適切に処理されること", () => {
            const schema = GetSecuritySchemeInformationArgsSchema;
            const args = { name: "test-api", securitySchemeName: "" }; // 空文字列はエラー
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "セキュリティスキーム名は必須です"
                );
            }
        });

        it("型が間違っている場合のエラー処理", () => {
            const schema = ListSecuritySchemesArgsSchema;
            const args = { name: 123 }; // 数値は無効
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
        });

        it("undefined引数の処理", () => {
            const schema = ListSecuritySchemesArgsSchema;
            const args = undefined;
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
        });
    });

    describe("ListSecuritySchemesArgsSchema", () => {
        it("有効なOpenAPI名を受け入れること", () => {
            const validNames = [
                "simple-api",
                "complex_api_name",
                "api123",
                "API-V2",
                "my.api.v1",
            ];

            validNames.forEach((name) => {
                const result = ListSecuritySchemesArgsSchema.safeParse({
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
                const result = ListSecuritySchemesArgsSchema.safeParse({
                    name,
                });
                expect(result.success).toBe(false);
            });
        });

        it("nameが欠如している場合のエラー", () => {
            const result = ListSecuritySchemesArgsSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("追加プロパティを無視すること", () => {
            const result = ListSecuritySchemesArgsSchema.safeParse({
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

    describe("GetSecuritySchemeInformationArgsSchema", () => {
        it("有効な引数を受け入れること", () => {
            const validInputs = [
                { name: "simple-api", securitySchemeName: "bearerAuth" },
                { name: "complex_api_name", securitySchemeName: "oauth2" },
                { name: "api123", securitySchemeName: "apiKey" },
                { name: "API-V2", securitySchemeName: "basic-auth" },
            ];

            validInputs.forEach((input) => {
                const result =
                    GetSecuritySchemeInformationArgsSchema.safeParse(input);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.name).toBe(input.name);
                    expect(result.data.securitySchemeName).toBe(
                        input.securitySchemeName
                    );
                }
            });
        });

        it("無効なOpenAPI名を拒否すること", () => {
            const invalidNames = ["", null, undefined, 123, [], {}];

            invalidNames.forEach((name) => {
                const result = GetSecuritySchemeInformationArgsSchema.safeParse(
                    {
                        name,
                        securitySchemeName: "bearerAuth",
                    }
                );
                expect(result.success).toBe(false);
            });
        });

        it("無効なセキュリティスキーム名を拒否すること", () => {
            const invalidSchemeNames = ["", null, undefined, 123, [], {}];

            invalidSchemeNames.forEach((securitySchemeName) => {
                const result = GetSecuritySchemeInformationArgsSchema.safeParse(
                    {
                        name: "test-api",
                        securitySchemeName,
                    }
                );
                expect(result.success).toBe(false);
            });
        });

        it("必須フィールドが欠如している場合のエラー", () => {
            // nameが欠如
            const resultMissingName =
                GetSecuritySchemeInformationArgsSchema.safeParse({
                    securitySchemeName: "bearerAuth",
                });
            expect(resultMissingName.success).toBe(false);

            // securitySchemeNameが欠如
            const resultMissingSchemeName =
                GetSecuritySchemeInformationArgsSchema.safeParse({
                    name: "test-api",
                });
            expect(resultMissingSchemeName.success).toBe(false);

            // 両方が欠如
            const resultMissingBoth =
                GetSecuritySchemeInformationArgsSchema.safeParse({});
            expect(resultMissingBoth.success).toBe(false);
        });

        it("追加プロパティを無視すること", () => {
            const result = GetSecuritySchemeInformationArgsSchema.safeParse({
                name: "test-api",
                securitySchemeName: "bearerAuth",
                extra: "value",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe("test-api");
                expect(result.data.securitySchemeName).toBe("bearerAuth");
                expect(result.data).not.toHaveProperty("extra");
            }
        });
    });

    describe("スキーマ一貫性テスト", () => {
        it("全てのスキーマが同じname検証ルールを使用すること", () => {
            const testName = "test-api";

            const listResult = ListSecuritySchemesArgsSchema.safeParse({
                name: testName,
            });
            const getResult = GetSecuritySchemeInformationArgsSchema.safeParse({
                name: testName,
                securitySchemeName: "bearerAuth",
            });

            expect(listResult.success).toBe(true);
            expect(getResult.success).toBe(true);

            if (listResult.success && getResult.success) {
                expect(listResult.data.name).toBe(testName);
                expect(getResult.data.name).toBe(testName);
            }
        });

        it("全てのスキーマが同じname エラーメッセージを使用すること", () => {
            const invalidName = "";

            const listResult = ListSecuritySchemesArgsSchema.safeParse({
                name: invalidName,
            });
            const getResult = GetSecuritySchemeInformationArgsSchema.safeParse({
                name: invalidName,
                securitySchemeName: "bearerAuth",
            });

            expect(listResult.success).toBe(false);
            expect(getResult.success).toBe(false);

            if (!listResult.success && !getResult.success) {
                const listError = listResult.error.errors.find((e) =>
                    e.path.includes("name")
                )?.message;
                const getError = getResult.error.errors.find((e) =>
                    e.path.includes("name")
                )?.message;
                expect(listError).toBe(getError);
                expect(listError).toContain("OpenAPI名は必須です");
            }
        });
    });
});
