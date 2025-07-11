import { ServerResponseFormatter } from "../formatters/response-formatter.js";

describe("ServerResponseFormatter", () => {
    describe("formatSuccess", () => {
        it("データを正常にJSON形式で整形すること", () => {
            const data = { test: "value", number: 123 };
            const result = ServerResponseFormatter.formatSuccess(data);

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
            const result = ServerResponseFormatter.formatSuccess(complexData);

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual(complexData);
        });
    });

    describe("formatError", () => {
        it("エラーメッセージを正常に整形すること", () => {
            const errorMessage = "Test error message";
            const result = ServerResponseFormatter.formatError(errorMessage);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toBe(
                "エラーが発生しました: Test error message"
            );
        });

        it("空のエラーメッセージを処理すること", () => {
            const result = ServerResponseFormatter.formatError("");

            expect(result.content[0].text).toBe("エラーが発生しました: ");
        });
    });

    describe("formatApplicationServers", () => {
        it("サーバー一覧を正常に整形すること", () => {
            const servers = [
                {
                    description: "Development Server",
                    url: "http://dev.example.com",
                },
                {
                    description: "Production Server",
                    url: "https://api.example.com",
                },
            ];
            const result =
                ServerResponseFormatter.formatApplicationServers(servers);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual({ servers });
        });

        it("空のサーバー一覧を正常に整形すること", () => {
            const result = ServerResponseFormatter.formatApplicationServers([]);

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual({ servers: [] });
        });

        it("サーバー情報のデータ構造を維持すること", () => {
            const servers = [
                { description: "", url: "" },
                { description: "Test Server", url: "http://test.com" },
            ];
            const result =
                ServerResponseFormatter.formatApplicationServers(servers);

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText.servers).toHaveLength(2);
            expect(parsedText.servers[0]).toEqual({ description: "", url: "" });
            expect(parsedText.servers[1]).toEqual({
                description: "Test Server",
                url: "http://test.com",
            });
        });
    });

    describe("formatServerInformation", () => {
        it("サーバー情報を正常に整形すること", () => {
            const serverInfo = {
                title: "Test API",
                description: "This is a test API",
                version: "1.0.0",
            };
            const result =
                ServerResponseFormatter.formatServerInformation(serverInfo);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual(serverInfo);
        });

        it("空の値を含むサーバー情報を正常に整形すること", () => {
            const serverInfo = {
                title: "",
                description: "",
                version: "1.0.0",
            };
            const result =
                ServerResponseFormatter.formatServerInformation(serverInfo);

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toEqual(serverInfo);
        });

        it("必要なフィールドがすべて含まれていること", () => {
            const serverInfo = {
                title: "API Title",
                description: "API Description",
                version: "2.0.0",
            };
            const result =
                ServerResponseFormatter.formatServerInformation(serverInfo);

            const parsedText = JSON.parse(result.content[0].text);
            expect(parsedText).toHaveProperty("title");
            expect(parsedText).toHaveProperty("description");
            expect(parsedText).toHaveProperty("version");
        });
    });

    describe("formatValidationError", () => {
        it("バリデーションエラーを正常に整形すること", () => {
            const validationError = "Invalid input format";
            const result =
                ServerResponseFormatter.formatValidationError(validationError);

            expect(result.content).toHaveLength(1);
            expect(result.content[0].type).toBe("text");
            expect(result.content[0].text).toBe(
                "エラーが発生しました: バリデーションエラー: Invalid input format"
            );
        });

        it("空のバリデーションエラーを処理すること", () => {
            const result = ServerResponseFormatter.formatValidationError("");

            expect(result.content[0].text).toBe(
                "エラーが発生しました: バリデーションエラー: "
            );
        });
    });

    describe("JSON整形の一貫性", () => {
        it("全てのフォーマッターが同じJSON整形を使用すること", () => {
            const testData = { key: "value" };
            const testServers = [
                { description: "test", url: "http://test.com" },
            ];
            const testServerInfo = {
                title: "test",
                description: "test",
                version: "1.0",
            };

            const successResult =
                ServerResponseFormatter.formatSuccess(testData);
            const serversResult =
                ServerResponseFormatter.formatApplicationServers(testServers);
            const serverInfoResult =
                ServerResponseFormatter.formatServerInformation(testServerInfo);

            // 全て同じ形式（改行とインデント付き）であることを確認
            expect(successResult.content[0].text).toContain("\n");
            expect(serversResult.content[0].text).toContain("\n");
            expect(serverInfoResult.content[0].text).toContain("\n");
        });
    });
});
