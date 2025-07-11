import { OpenAPIResponseFormatter } from "../formatters/response-formatter.js";

describe("OpenAPIResponseFormatter", () => {
    describe("formatSuccess", () => {
        it("データを正常にJSON形式で整形すること", () => {
            const data = { test: "value", number: 123 };
            const result = OpenAPIResponseFormatter.formatSuccess(data);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual(data);
        });

        it("複雑なオブジェクトを正常に整形すること", () => {
            const complexData = {
                nested: { array: [1, 2, 3], object: { key: "value" } },
                null_value: null,
                boolean: true,
            };
            const result = OpenAPIResponseFormatter.formatSuccess(complexData);

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual(complexData);
        });
    });

    describe("formatError", () => {
        it("エラーメッセージを正常に整形すること", () => {
            const errorMessage = "Test error message";
            const result = OpenAPIResponseFormatter.formatError(errorMessage);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toBe(
                "エラーが発生しました: Test error message"
            );
        });

        it("空のエラーメッセージを処理すること", () => {
            const result = OpenAPIResponseFormatter.formatError("");

            expect(result.content[0].text).toBe("エラーが発生しました: ");
        });
    });

    describe("formatOpenAPIList", () => {
        it("OpenAPI一覧を正常に整形すること", () => {
            const openAPIFiles = {
                api1: {
                    title: "API 1",
                    summary: "Summary 1",
                    version: "1.0.0",
                },
                api2: {
                    title: "API 2",
                    summary: "Summary 2",
                    version: "2.0.0",
                },
            };
            const result =
                OpenAPIResponseFormatter.formatOpenAPIList(openAPIFiles);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual({ openapi_files: openAPIFiles });
        });

        it("空のOpenAPI一覧を正常に整形すること", () => {
            const result = OpenAPIResponseFormatter.formatOpenAPIList({});

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual({ openapi_files: {} });
        });
    });

    describe("formatSetServerInfo", () => {
        it("サーバー情報設定結果を正常に整形すること", () => {
            const serverInfo = {
                status: "success",
                message: "Files loaded successfully",
            };
            const result =
                OpenAPIResponseFormatter.formatSetServerInfo(serverInfo);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual(serverInfo);
        });

        it("エラー状態のサーバー情報を正常に整形すること", () => {
            const serverInfo = {
                status: "error",
                message: "No files found",
            };
            const result =
                OpenAPIResponseFormatter.formatSetServerInfo(serverInfo);

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual(serverInfo);
        });
    });

    describe("formatEmptyOpenAPIList", () => {
        it("空のOpenAPI一覧を正常に整形すること", () => {
            const result = OpenAPIResponseFormatter.formatEmptyOpenAPIList();

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual({ openapi_files: {} });
        });
    });

    describe("formatValidationError", () => {
        it("バリデーションエラーを正常に整形すること", () => {
            const validationError = "Invalid input format";
            const result =
                OpenAPIResponseFormatter.formatValidationError(validationError);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toBe(
                "エラーが発生しました: バリデーションエラー: Invalid input format"
            );
        });

        it("空のバリデーションエラーを処理すること", () => {
            const result = OpenAPIResponseFormatter.formatValidationError("");

            expect(result.content[0].text).toBe(
                "エラーが発生しました: バリデーションエラー: "
            );
        });
    });

    describe("JSON整形の一貫性", () => {
        it("全てのフォーマッターが同じJSON整形を使用すること", () => {
            const testData = { key: "value" };

            const successResult =
                OpenAPIResponseFormatter.formatSuccess(testData);
            const openAPIResult = OpenAPIResponseFormatter.formatOpenAPIList({
                api: { title: "test", summary: "test", version: "1.0" },
            });
            const serverResult = OpenAPIResponseFormatter.formatSetServerInfo({
                status: "success",
                message: "test",
            });

            // 全て同じ形式（改行とインデント付き）であることを確認
            expect(successResult.content[0].text).toContain("\n");
            expect(openAPIResult.content[0].text).toContain("\n");
            expect(serverResult.content[0].text).toContain("\n");
        });
    });
});
