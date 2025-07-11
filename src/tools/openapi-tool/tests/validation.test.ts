import {
    validateArgs,
    ListOpenAPIsArgsSchema,
    SetServerInfoArgsSchema,
} from "../validation.js";

describe("OpenAPI Validation", () => {
    describe("validateArgs", () => {
        it("正常なバリデーションが成功すること", () => {
            const schema = ListOpenAPIsArgsSchema;
            const args = {};
            const result = validateArgs(schema, args);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({});
            }
        });

        it("バリデーションエラーが適切に処理されること", () => {
            const schema = SetServerInfoArgsSchema;
            const args = { path: "" }; // 空文字列はエラー
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("パスは必須です");
            }
        });

        it("型が間違っている場合のエラー処理", () => {
            const schema = SetServerInfoArgsSchema;
            const args = { path: 123 }; // 数値は無効
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
        });

        it("undefined引数の処理", () => {
            const schema = SetServerInfoArgsSchema;
            const args = undefined;
            const result = validateArgs(schema, args);

            expect(result.success).toBe(false);
        });
    });

    describe("ListOpenAPIsArgsSchema", () => {
        it("空のオブジェクトを受け入れること", () => {
            const result = ListOpenAPIsArgsSchema.safeParse({});
            expect(result.success).toBe(true);
        });

        it("追加プロパティを無視すること", () => {
            const result = ListOpenAPIsArgsSchema.safeParse({ extra: "value" });
            expect(result.success).toBe(true);
        });
    });

    describe("SetServerInfoArgsSchema", () => {
        it("有効なパスを受け入れること", () => {
            const validPaths = [
                "/absolute/path",
                "../relative/path",
                "./current/path",
                "simple/path",
            ];

            validPaths.forEach((path) => {
                const result = SetServerInfoArgsSchema.safeParse({ path });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.path).toBe(path);
                }
            });
        });

        it("無効なパスを拒否すること", () => {
            const invalidPaths = ["", null, undefined, 123, []];

            invalidPaths.forEach((path) => {
                const result = SetServerInfoArgsSchema.safeParse({ path });
                expect(result.success).toBe(false);
            });
        });

        it("pathが欠如している場合のエラー", () => {
            const result = SetServerInfoArgsSchema.safeParse({});
            expect(result.success).toBe(false);
        });
    });
});
