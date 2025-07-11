import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { OpenAPIStorageService } from "../services/storage-service.js";
import type { ExtractedOpenAPIData } from "../parsers/extractor.js";

// モックされたリポジトリの型定義
interface MockRepository {
    insertOrUpdateOpenAPI: jest.MockedFunction<any>;
    getOpenAPIByName: jest.MockedFunction<any>;
    deleteOpenAPIData: jest.MockedFunction<any>;
    insertServer: jest.MockedFunction<any>;
    insertPath: jest.MockedFunction<any>;
    insertSchema: jest.MockedFunction<any>;
    insertSecurityScheme: jest.MockedFunction<any>;
    insertResponse: jest.MockedFunction<any>;
}

// RepositoryFactoryのモック
jest.mock("../di-container.js", () => ({
    RepositoryFactory: {
        createRepositorySet: jest.fn(() => ({
            openapi: {
                insertOrUpdateOpenAPI: jest.fn().mockReturnValue(1),
                getOpenAPIByName: jest.fn().mockReturnValue(null),
                deleteOpenAPIData: jest.fn(),
            },
            server: {
                insertServer: jest.fn(),
            },
            path: {
                insertPath: jest.fn(),
            },
            schema: {
                insertSchema: jest.fn(),
            },
            security: {
                insertSecurityScheme: jest.fn(),
            },
            response: {
                insertResponse: jest.fn(),
            },
        })),
    },
}));

describe("OpenAPIStorageService", () => {
    let storageService: OpenAPIStorageService;
    let mockRepositories: any;

    beforeEach(() => {
        // 各テストでモックをリセット
        jest.clearAllMocks();

        storageService = new OpenAPIStorageService(
            { testMode: true },
            { enableLogging: false }
        );

        // モックされたリポジトリを取得
        const { RepositoryFactory } = require("../di-container.js");
        mockRepositories = RepositoryFactory.createRepositorySet();
    });

    describe("store", () => {
        it("should successfully store extracted OpenAPI data", async () => {
            const extractedData: ExtractedOpenAPIData = {
                basic: {
                    name: "test-api",
                    title: "Test API",
                    summary: "A test API",
                    version: "1.0.0",
                    openApiVersion: "3.0.0",
                },
                servers: [
                    { description: "Test Server", url: "https://api.test.com" },
                ],
                paths: [
                    {
                        method: "GET",
                        path: "/test",
                        summary: "Test endpoint",
                        description: "A test endpoint",
                        security: undefined,
                        parameters: undefined,
                        responses: undefined,
                        requestBody: undefined,
                    },
                ],
                schemas: [
                    {
                        name: "TestSchema",
                        description: "Test schema",
                        schema: { type: "object" },
                    },
                ],
                securitySchemes: [
                    {
                        name: "bearerAuth",
                        type: "http",
                        scheme: "bearer",
                        description: "Bearer authentication",
                        content: { type: "http", scheme: "bearer" },
                    },
                ],
                responses: [
                    {
                        name: "NotFound",
                        description: "Resource not found",
                        content: { description: "Not found" },
                    },
                ],
            };

            const result = await storageService.store(extractedData);

            expect(result.success).toBe(true);
            expect(result.openapiId).toBe(1);
            expect(result.message).toContain("test-api");
            expect(result.details).toEqual({
                serversStored: 1,
                pathsStored: 1,
                schemasStored: 1,
                securitySchemesStored: 1,
                responsesStored: 1,
            });

            // リポジトリメソッドが正しく呼ばれたことを確認
            expect(
                mockRepositories.openapi.insertOrUpdateOpenAPI
            ).toHaveBeenCalledWith({
                name: "test-api",
                title: "Test API",
                summary: "A test API",
                version: "1.0.0",
                content: expect.any(String),
            });

            expect(mockRepositories.server.insertServer).toHaveBeenCalledWith({
                openapi_id: 1,
                description: "Test Server",
                url: "https://api.test.com",
            });

            expect(mockRepositories.path.insertPath).toHaveBeenCalledWith({
                openapi_id: 1,
                method: "GET",
                path: "/test",
                summary: "Test endpoint",
                description: "A test endpoint",
                security: undefined,
                parameters: undefined,
                responses: undefined,
                requestBody: undefined,
            });
        });

        it("should handle existing data replacement", async () => {
            // 既存データがある場合のモック
            mockRepositories.openapi.getOpenAPIByName.mockReturnValue({
                id: 999,
                name: "test-api",
            });

            const extractedData: ExtractedOpenAPIData = {
                basic: {
                    name: "test-api",
                    title: "Test API",
                    summary: "A test API",
                    version: "1.0.0",
                    openApiVersion: "3.0.0",
                },
                servers: [],
                paths: [],
                schemas: [],
                securitySchemes: [],
                responses: [],
            };

            const result = await storageService.store(extractedData);

            expect(result.success).toBe(true);
            expect(
                mockRepositories.openapi.getOpenAPIByName
            ).toHaveBeenCalledWith("test-api");
            expect(
                mockRepositories.openapi.deleteOpenAPIData
            ).toHaveBeenCalledWith(999);
        });

        it("should handle storage errors gracefully", async () => {
            // insertOrUpdateOpenAPIでエラーを発生させる
            mockRepositories.openapi.insertOrUpdateOpenAPI.mockImplementation(
                () => {
                    throw new Error("Database error");
                }
            );

            const extractedData: ExtractedOpenAPIData = {
                basic: {
                    name: "test-api",
                    title: "Test API",
                    summary: "A test API",
                    version: "1.0.0",
                    openApiVersion: "3.0.0",
                },
                servers: [],
                paths: [],
                schemas: [],
                securitySchemes: [],
                responses: [],
            };

            const result = await storageService.store(extractedData);

            expect(result.success).toBe(false);
            expect(result.message).toContain("Database error");
            expect(result.openapiId).toBeUndefined();
        });

        it("should handle individual component storage errors", async () => {
            // サーバー保存でエラーを発生させるが、他は成功させる
            mockRepositories.server.insertServer.mockImplementation(() => {
                throw new Error("Server insertion failed");
            });

            const extractedData: ExtractedOpenAPIData = {
                basic: {
                    name: "test-api",
                    title: "Test API",
                    summary: "A test API",
                    version: "1.0.0",
                    openApiVersion: "3.0.0",
                },
                servers: [
                    { description: "Test Server", url: "https://api.test.com" },
                ],
                paths: [],
                schemas: [],
                securitySchemes: [],
                responses: [],
            };

            const result = await storageService.store(extractedData);

            expect(result.success).toBe(true);
            expect(result.details?.serversStored).toBe(0); // エラーなので0件
        });
    });

    describe("updateConfig", () => {
        it("should update service configuration", () => {
            storageService.updateConfig({
                enableLogging: true,
                replaceExisting: false,
            });

            // 設定が更新されたことは、次の操作で確認できる
            expect(() => {
                storageService.updateConfig({ enableLogging: false });
            }).not.toThrow();
        });
    });
});
