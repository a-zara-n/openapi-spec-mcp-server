import { OpenAPIBusinessLogicService } from "../services/openapi-business-logic.js";
import { RepositoryFactory } from "../../tool-libs/core/index.js";

// モック化
jest.mock("../../di-container.js");
jest.mock("../../parser.js");

const mockRepositoryFactory = RepositoryFactory as jest.Mocked<
    typeof RepositoryFactory
>;

describe("OpenAPIBusinessLogicService", () => {
    let service: OpenAPIBusinessLogicService;
    let mockOpenAPIRepository: any;

    beforeEach(() => {
        service = new OpenAPIBusinessLogicService();

        mockOpenAPIRepository = {
            getAllOpenAPIs: jest.fn(),
        };

        mockRepositoryFactory.createOpenAPIRepository.mockReturnValue(
            mockOpenAPIRepository
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getOpenAPIList", () => {
        it("OpenAPI一覧を正常に取得できること", async () => {
            // Arrange
            const mockOpenAPIs = [
                {
                    name: "api1",
                    title: "API 1",
                    summary: "Summary 1",
                    version: "1.0.0",
                },
                {
                    name: "api2",
                    title: "API 2",
                    summary: "Summary 2",
                    version: "2.0.0",
                },
            ];
            mockOpenAPIRepository.getAllOpenAPIs.mockReturnValue(mockOpenAPIs);

            // Act
            const result = await service.getOpenAPIList();

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.openapi_files).toEqual({
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
                });
            }
        });

        it("空の一覧も正常に処理できること", async () => {
            // Arrange
            mockOpenAPIRepository.getAllOpenAPIs.mockReturnValue([]);

            // Act
            const result = await service.getOpenAPIList();

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.openapi_files).toEqual({});
            }
        });

        it("リポジトリエラーを適切に処理すること", async () => {
            // Arrange
            mockOpenAPIRepository.getAllOpenAPIs.mockImplementation(() => {
                throw new Error("Database error");
            });

            // Act
            const result = await service.getOpenAPIList();

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Database error");
            }
        });

        it("null/undefined値を空文字列に変換すること", async () => {
            // Arrange
            const mockOpenAPIs = [
                {
                    name: "api1",
                    title: null,
                    summary: undefined,
                    version: "1.0.0",
                },
            ];
            mockOpenAPIRepository.getAllOpenAPIs.mockReturnValue(mockOpenAPIs);

            // Act
            const result = await service.getOpenAPIList();

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.openapi_files.api1).toEqual({
                    title: "",
                    summary: "",
                    version: "1.0.0",
                });
            }
        });
    });

    describe("setServerInfo", () => {
        let mockParser: any;

        beforeEach(() => {
            // parserのモック
            const { openAPIParser } = require("../../parser.js");
            mockParser = openAPIParser;
            mockParser.loadOpenAPIFilesFromDirectory = jest.fn();
        });

        it("ファイル読み込みが成功すること", async () => {
            // Arrange
            const mockResults = [
                { success: true, name: "api1" },
                { success: true, name: "api2" },
            ];
            mockParser.loadOpenAPIFilesFromDirectory.mockResolvedValue(
                mockResults
            );

            // Act
            const result = await service.setServerInfo("/test/path");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe("success");
                expect(result.data.message).toContain(
                    "2個のOpenAPIファイルを正常に読み込みました"
                );
            }
        });

        it("一部失敗した場合の処理", async () => {
            // Arrange
            const mockResults = [
                { success: true, name: "api1" },
                { success: false, message: "Parse error" },
            ];
            mockParser.loadOpenAPIFilesFromDirectory.mockResolvedValue(
                mockResults
            );

            // Act
            const result = await service.setServerInfo("/test/path");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe("success");
                expect(result.data.message).toContain(
                    "1個のファイルが成功、1個のファイルが失敗"
                );
            }
        });

        it("ファイルが見つからない場合", async () => {
            // Arrange
            mockParser.loadOpenAPIFilesFromDirectory.mockResolvedValue([]);

            // Act
            const result = await service.setServerInfo("/test/path");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.status).toBe("error");
                expect(result.data.message).toContain(
                    "OpenAPIファイルが見つかりませんでした"
                );
            }
        });

        it("パーサーエラーを適切に処理すること", async () => {
            // Arrange
            mockParser.loadOpenAPIFilesFromDirectory.mockRejectedValue(
                new Error("Parser error")
            );

            // Act
            const result = await service.setServerInfo("/test/path");

            // Assert
            expect(result.success).toBe(true); // エラーでもレスポンスは返す
            if (result.success) {
                expect(result.data.status).toBe("error");
                expect(result.data.message).toContain("Parser error");
            }
        });
    });
});
