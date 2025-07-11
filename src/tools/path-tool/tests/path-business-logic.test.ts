import { PathBusinessLogicService } from "../services/path-business-logic.js";

// モックの設定
jest.mock("../../di-container.js", () => ({
    RepositoryFactory: {
        createOpenAPIRepository: jest.fn(),
        createPathRepository: jest.fn(),
    },
}));

import { RepositoryFactory } from "../../tool-libs/core/index.js";

/**
 * PathBusinessLogicService のテスト
 */
describe("PathBusinessLogicService Tests", () => {
    let service: PathBusinessLogicService;
    let mockOpenAPIRepository: any;
    let mockPathRepository: any;

    beforeEach(() => {
        // モックオブジェクトの作成
        mockOpenAPIRepository = {
            getOpenAPIByName: jest.fn(),
        };

        mockPathRepository = {
            getPathsByOpenAPIId: jest.fn(),
            getPathByMethodAndPath: jest.fn(),
        };

        // RepositoryFactoryのモック設定
        (
            RepositoryFactory.createOpenAPIRepository as jest.Mock
        ).mockReturnValue(mockOpenAPIRepository);
        (RepositoryFactory.createPathRepository as jest.Mock).mockReturnValue(
            mockPathRepository
        );

        service = new PathBusinessLogicService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getPathList", () => {
        it("正常にパス一覧を取得できるべき", async () => {
            // モックデータの設定
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPaths = [
                { method: "GET", path: "/users" },
                { method: "POST", path: "/users" },
                { method: "GET", path: "/users/{id}" },
            ];

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathsByOpenAPIId.mockReturnValue(mockPaths);

            // テスト実行
            const result = await service.getPathList("test-api");

            // 検証
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.methodAndPaths).toEqual([
                    "GET /users",
                    "POST /users",
                    "GET /users/{id}",
                ]);
            }

            expect(mockOpenAPIRepository.getOpenAPIByName).toHaveBeenCalledWith(
                "test-api"
            );
            expect(mockPathRepository.getPathsByOpenAPIId).toHaveBeenCalledWith(
                1
            );
        });

        it("OpenAPIが見つからない場合、エラーを返すべき", async () => {
            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(null);

            const result = await service.getPathList("non-existent-api");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "OpenAPI仕様 'non-existent-api' が見つかりません。"
                );
            }
        });

        it("パスが空の場合、空の配列を返すべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathsByOpenAPIId.mockReturnValue([]);

            const result = await service.getPathList("test-api");

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.methodAndPaths).toEqual([]);
            }
        });

        it("リポジトリでエラーが発生した場合、エラーを返すべき", async () => {
            mockOpenAPIRepository.getOpenAPIByName.mockImplementation(() => {
                throw new Error("Database connection failed");
            });

            const result = await service.getPathList("test-api");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Database connection failed");
            }
        });
    });

    describe("getPathDetail", () => {
        it("正常にパス詳細を取得できるべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPathRecord = {
                method: "GET",
                path: "/users/{id}",
                summary: "ユーザー詳細取得",
                description: "指定されたIDのユーザー詳細を取得します",
                security: JSON.stringify([{ bearerAuth: [] }]),
                parameters: JSON.stringify([
                    { name: "id", in: "path", required: true },
                ]),
                responses: JSON.stringify({ "200": { description: "成功" } }),
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(
                mockPathRecord
            );

            const result = await service.getPathDetail(
                "test-api",
                "GET /users/{id}"
            );

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.method).toBe("GET");
                expect(result.data.path).toBe("/users/{id}");
                expect(result.data.summary).toBe("ユーザー詳細取得");
                expect(result.data.security).toEqual([{ bearerAuth: [] }]);
                expect(result.data.parameters).toEqual([
                    { name: "id", in: "path", required: true },
                ]);
                expect(result.data.responses).toEqual({
                    "200": { description: "成功" },
                });
            }
        });

        it("無効なmethodAndPath形式の場合、エラーを返すべき", async () => {
            const result = await service.getPathDetail(
                "test-api",
                "INVALID FORMAT"
            );

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("無効なmethodAndPath形式です");
            }
        });

        it("OpenAPIが見つからない場合、エラーを返すべき", async () => {
            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(null);

            const result = await service.getPathDetail(
                "non-existent-api",
                "GET /users"
            );

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "OpenAPI仕様 'non-existent-api' が見つかりません。"
                );
            }
        });

        it("パスが見つからない場合、エラーを返すべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(null);

            const result = await service.getPathDetail(
                "test-api",
                "GET /non-existent"
            );

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "パス 'GET /non-existent' が見つかりません。"
                );
            }
        });

        it("無効なHTTPメソッドの場合、エラーを返すべき", async () => {
            const result = await service.getPathDetail(
                "test-api",
                "INVALID /users"
            );

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain("無効なHTTPメソッドです");
            }
        });

        it("null/undefinedフィールドを適切に処理するべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPathRecord = {
                method: "POST",
                path: "/users",
                summary: null,
                description: null,
                security: null,
                parameters: null,
                responses: null,
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(
                mockPathRecord
            );

            const result = await service.getPathDetail(
                "test-api",
                "POST /users"
            );

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.method).toBe("POST");
                expect(result.data.path).toBe("/users");
                expect(result.data.summary).toBeUndefined();
                expect(result.data.description).toBeUndefined();
                expect(result.data.security).toEqual([]);
                expect(result.data.parameters).toEqual([]);
                expect(result.data.responses).toEqual({});
            }
        });
    });

    describe("getPathParameters", () => {
        it("正常にパラメータを取得できるべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPathRecord = {
                method: "GET",
                path: "/users/{id}",
                summary: "Test",
                description: "Test",
                security: "[]",
                parameters: JSON.stringify([
                    { name: "id", in: "path", required: true },
                ]),
                responses: "{}",
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(
                mockPathRecord
            );

            const result = await service.getPathParameters(
                "test-api",
                "GET /users/{id}"
            );

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.parameters).toEqual([
                    { name: "id", in: "path", required: true },
                ]);
            }
        });

        it("パス詳細取得でエラーが発生した場合、エラーを返すべき", async () => {
            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(null);

            const result = await service.getPathParameters(
                "non-existent-api",
                "GET /users"
            );

            expect(result.success).toBe(false);
        });
    });

    describe("getPathResponses", () => {
        it("正常にレスポンスを取得できるべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPathRecord = {
                method: "GET",
                path: "/users",
                summary: "Test",
                description: "Test",
                security: "[]",
                parameters: "[]",
                responses: JSON.stringify({ "200": { description: "成功" } }),
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(
                mockPathRecord
            );

            const result = await service.getPathResponses(
                "test-api",
                "GET /users"
            );

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.responses).toEqual({
                    "200": { description: "成功" },
                });
            }
        });
    });

    describe("getPathDescription", () => {
        it("正常に説明を取得できるべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPathRecord = {
                method: "DELETE",
                path: "/users/{id}",
                summary: "ユーザー削除",
                description: "指定されたIDのユーザーを削除します",
                security: JSON.stringify([{ bearerAuth: [] }]),
                parameters: "[]",
                responses: "{}",
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(
                mockPathRecord
            );

            const result = await service.getPathDescription(
                "test-api",
                "DELETE /users/{id}"
            );

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.method).toBe("DELETE");
                expect(result.data.path).toBe("/users/{id}");
                expect(result.data.summary).toBe("ユーザー削除");
                expect(result.data.description).toBe(
                    "指定されたIDのユーザーを削除します"
                );
                expect(result.data.security).toEqual([{ bearerAuth: [] }]);
            }
        });
    });

    describe("getPathRequestBody", () => {
        it("パラメータが存在する場合、パラメータを返すべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPathRecord = {
                method: "POST",
                path: "/users",
                summary: "Test",
                description: "Test",
                security: "[]",
                parameters: JSON.stringify([
                    { name: "body", in: "body", required: true },
                ]),
                responses: "{}",
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(
                mockPathRecord
            );

            const result = await service.getPathRequestBody(
                "test-api",
                "POST /users"
            );

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.parameters).toEqual([
                    { name: "body", in: "body", required: true },
                ]);
            }
        });

        it("パラメータが空の場合、空の配列を返すべき", async () => {
            const mockOpenAPI = { id: 1, name: "test-api" };
            const mockPathRecord = {
                method: "GET",
                path: "/users",
                summary: "Test",
                description: "Test",
                security: "[]",
                parameters: "[]",
                responses: "{}",
            };

            mockOpenAPIRepository.getOpenAPIByName.mockReturnValue(mockOpenAPI);
            mockPathRepository.getPathByMethodAndPath.mockReturnValue(
                mockPathRecord
            );

            const result = await service.getPathRequestBody(
                "test-api",
                "GET /users"
            );

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.parameters).toEqual([]);
            }
        });
    });

    describe("エラーハンドリング", () => {
        it("予期しないエラーが発生した場合、適切にハンドリングするべき", async () => {
            mockOpenAPIRepository.getOpenAPIByName.mockImplementation(() => {
                throw new Error("Unexpected error");
            });

            const result = await service.getPathList("test-api");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Unexpected error");
            }
        });

        it("非Errorオブジェクトの例外も適切にハンドリングするべき", async () => {
            mockOpenAPIRepository.getOpenAPIByName.mockImplementation(() => {
                throw "String error";
            });

            const result = await service.getPathList("test-api");

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toContain(
                    "パス一覧取得中にエラーが発生しました"
                );
            }
        });
    });
});
