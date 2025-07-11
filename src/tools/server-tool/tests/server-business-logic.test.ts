import { ServerBusinessLogicService } from "../services/server-business-logic.js";
import { RepositoryFactory } from "../../tool-libs/core/index.js";

// モック化
jest.mock("../../tool-libs/di-container.js");

const mockRepositoryFactory = RepositoryFactory as jest.Mocked<
    typeof RepositoryFactory
>;

describe("ServerBusinessLogicService", () => {
    let service: ServerBusinessLogicService;
    let mockOpenAPIRepository: any;
    let mockServerRepository: any;

    beforeEach(() => {
        service = new ServerBusinessLogicService();

        mockOpenAPIRepository = {
            getOpenAPIByName: jest.fn(),
        };

        mockServerRepository = {
            getServersByOpenAPIId: jest.fn(),
        };

        mockRepositoryFactory.createOpenAPIRepository.mockReturnValue(
            mockOpenAPIRepository
        );
        mockRepositoryFactory.createServerRepository.mockReturnValue(
            mockServerRepository
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getApplicationServers", () => {
        it("サーバー一覧を正常に取得できること", async () => {
            // Arrange
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockServers = [
                {
                    description: "Development Server",
                    url: "http://dev.example.com",
                },
                {
                    description: "Production Server",
                    url: "https://api.example.com",
                },
            ];

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockServerRepository.getServersByOpenAPIId.mockReturnValue(
                mockServers
            );

            // Act
            const result = await service.getApplicationServers("test-api");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.servers).toEqual([
                    {
                        description: "Development Server",
                        url: "http://dev.example.com",
                    },
                    {
                        description: "Production Server",
                        url: "https://api.example.com",
                    },
                ]);
            }
            expect(mockOpenAPIRepository.getOpenAPIByName).toHaveBeenCalledWith(
                "test-api"
            );
            expect(
                mockServerRepository.getServersByOpenAPIId
            ).toHaveBeenCalledWith(1);
        });

        it("空のサーバー一覧も正常に処理できること", async () => {
            // Arrange
            const mockOpenAPI = { id: 1, name: "test-api" };
            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockServerRepository.getServersByOpenAPIId.mockReturnValue([]);

            // Act
            const result = await service.getApplicationServers("test-api");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.servers).toEqual([]);
            }
        });

        it("OpenAPIが見つからない場合のエラー処理", async () => {
            // Arrange
            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(null);

            // Act
            const result = await service.getApplicationServers(
                "nonexistent-api"
            );

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "OpenAPI仕様 'nonexistent-api' が見つかりません"
                );
            }
        });

        it("リポジトリエラーを適切に処理すること", async () => {
            // Arrange
            mockOpenAPIRepository.getOpenAPIByName.mockImplementation(() => {
                throw new Error("Database connection error");
            });

            // Act
            const result = await service.getApplicationServers("test-api");

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Database connection error");
            }
        });

        it("null/undefined値を空文字列に変換すること", async () => {
            // Arrange
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockServers = [
                { description: null, url: undefined },
                { description: "Valid Server", url: "http://valid.com" },
            ];

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockServerRepository.getServersByOpenAPIId.mockReturnValue(
                mockServers
            );

            // Act
            const result = await service.getApplicationServers("test-api");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.servers).toEqual([
                    { description: "", url: "" },
                    { description: "Valid Server", url: "http://valid.com" },
                ]);
            }
        });
    });

    describe("getServerInformation", () => {
        it("サーバー情報を正常に取得できること", async () => {
            // Arrange
            const mockOpenAPI = {
                id: 1,
                name: "test-api",
                title: "Test API",
                summary: "This is a test API",
                version: "1.0.0",
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);

            // Act
            const result = await service.getServerInformation("test-api");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    title: "Test API",
                    description: "This is a test API",
                    version: "1.0.0",
                });
            }
            expect(mockOpenAPIRepository.getOpenAPIByName).toHaveBeenCalledWith(
                "test-api"
            );
        });

        it("OpenAPIが見つからない場合のエラー処理", async () => {
            // Arrange
            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(null);

            // Act
            const result = await service.getServerInformation(
                "nonexistent-api"
            );

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "OpenAPI仕様 'nonexistent-api' が見つかりません"
                );
            }
        });

        it("null/undefined値を空文字列に変換すること", async () => {
            // Arrange
            const mockOpenAPI = {
                id: 1,
                name: "test-api",
                title: null,
                summary: undefined,
                version: "1.0.0",
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);

            // Act
            const result = await service.getServerInformation("test-api");

            // Assert
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({
                    title: "",
                    description: "",
                    version: "1.0.0",
                });
            }
        });

        it("リポジトリエラーを適切に処理すること", async () => {
            // Arrange
            mockOpenAPIRepository.getOpenAPIByName.mockImplementation(() => {
                throw new Error("Database connection error");
            });

            // Act
            const result = await service.getServerInformation("test-api");

            // Assert
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("Database connection error");
            }
        });
    });
});
