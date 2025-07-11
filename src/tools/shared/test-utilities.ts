import { RepositoryFactory } from "../tool-libs/core/index.js";
import { jest, expect } from "@jest/globals";

/**
 * @fileoverview テストユーティリティ
 * @description テスト用のモックとヘルパー関数を提供
 * @since 1.0.0
 */

/**
 * テスト用のモックファクトリー
 */
export class TestMockFactory {
    /**
     * OpenAPIリポジトリのモックを作成
     */
    static createMockOpenAPIRepository() {
        return {
            getOpenAPIByName: jest.fn(),
            getAllOpenAPIs: jest.fn(),
        };
    }

    /**
     * サーバーリポジトリのモックを作成
     */
    static createMockServerRepository() {
        return {
            getServersByOpenAPIId: jest.fn(),
        };
    }

    /**
     * セキュリティリポジトリのモックを作成
     */
    static createMockSecurityRepository() {
        return {
            getSecuritySchemesByOpenAPIId: jest.fn(),
            getSecuritySchemeByName: jest.fn(),
        };
    }

    /**
     * レスポンスリポジトリのモックを作成
     */
    static createMockResponseRepository() {
        return {
            getResponsesByOpenAPIId: jest.fn(),
            getResponseByName: jest.fn(),
        };
    }

    /**
     * スキーマリポジトリのモックを作成
     */
    static createMockSchemaRepository() {
        return {
            getSchemasByOpenAPIId: jest.fn(),
            getSchemaByName: jest.fn(),
        };
    }

    /**
     * パスリポジトリのモックを作成
     */
    static createMockPathRepository() {
        return {
            getPathsByOpenAPIId: jest.fn(),
            getPathByMethodAndPath: jest.fn(),
        };
    }
}

/**
 * 共通のテストデータファクトリー
 */
export class TestDataFactory {
    /**
     * モックOpenAPIオブジェクトを作成
     */
    static createMockOpenAPI(overrides: Partial<any> = {}) {
        return {
            id: 1,
            name: "test-api",
            title: "Test API",
            summary: "This is a test API",
            version: "1.0.0",
            ...overrides,
        };
    }

    /**
     * モックサーバーオブジェクトを作成
     */
    static createMockServer(overrides: Partial<any> = {}) {
        return {
            id: 1,
            openapi_id: 1,
            description: "Test Server",
            url: "http://test.example.com",
            ...overrides,
        };
    }

    /**
     * モックセキュリティスキームオブジェクトを作成
     */
    static createMockSecurityScheme(overrides: Partial<any> = {}) {
        return {
            id: 1,
            openapi_id: 1,
            name: "bearerAuth",
            type: "http",
            scheme: "bearer",
            description: "Bearer authentication",
            ...overrides,
        };
    }

    /**
     * モックレスポンスオブジェクトを作成
     */
    static createMockResponse(overrides: Partial<any> = {}) {
        return {
            id: 1,
            openapi_id: 1,
            name: "BadRequest",
            description: "Bad Request",
            content: JSON.stringify({
                "application/json": {
                    schema: {
                        $ref: "#/components/schemas/ErrorResponse",
                    },
                },
            }),
            ...overrides,
        };
    }
}

/**
 * テスト用のヘルパー関数
 */
export class TestHelpers {
    /**
     * RepositoryFactoryをモック化
     */
    static setupRepositoryFactoryMocks() {
        const mockRepositoryFactory = RepositoryFactory as jest.Mocked<
            typeof RepositoryFactory
        >;

        const mocks = {
            openAPIRepository: TestMockFactory.createMockOpenAPIRepository(),
            serverRepository: TestMockFactory.createMockServerRepository(),
            securityRepository: TestMockFactory.createMockSecurityRepository(),
            responseRepository: TestMockFactory.createMockResponseRepository(),
            schemaRepository: TestMockFactory.createMockSchemaRepository(),
            pathRepository: TestMockFactory.createMockPathRepository(),
        };

        mockRepositoryFactory.createOpenAPIRepository.mockReturnValue(
            mocks.openAPIRepository
        );
        mockRepositoryFactory.createServerRepository.mockReturnValue(
            mocks.serverRepository
        );
        mockRepositoryFactory.createSecurityRepository.mockReturnValue(
            mocks.securityRepository
        );
        mockRepositoryFactory.createResponseRepository.mockReturnValue(
            mocks.responseRepository
        );
        mockRepositoryFactory.createSchemaRepository.mockReturnValue(
            mocks.schemaRepository
        );
        mockRepositoryFactory.createPathRepository.mockReturnValue(
            mocks.pathRepository
        );

        return mocks;
    }

    /**
     * 有効なOpenAPI名のテストケース
     */
    static getValidOpenAPINames(): string[] {
        return [
            "simple-api",
            "complex_api_name",
            "api123",
            "API-V2",
            "my.api.v1",
        ];
    }

    /**
     * 無効なOpenAPI名のテストケース
     */
    static getInvalidOpenAPINames(): any[] {
        return ["", null, undefined, 123, [], {}];
    }

    /**
     * JSONレスポンスの整形一貫性をテスト
     */
    static testJSONConsistency(
        results: { content: Array<{ text: string }> }[]
    ) {
        results.forEach((result) => {
            expect(result.content).toHaveLength(1);
            expect(result.content[0].text).toContain("\n"); // インデント付きJSONであることを確認
        });
    }
}

/**
 * モックリポジトリの作成
 * @description 完全なインターフェースを満たすモックリポジトリを作成
 */
export function createMockRepositories() {
    return {
        openAPIRepository: {
            getOpenAPIByName: jest.fn(),
            getAllOpenAPIs: jest.fn(),
            insertOrUpdateOpenAPI: jest.fn().mockReturnValue(1),
            deleteOpenAPIData: jest.fn(),
        },
        serverRepository: {
            getServersByOpenAPIId: jest.fn(),
            insertServer: jest.fn().mockReturnValue(1),
        },
        securityRepository: {
            getSecuritySchemesByOpenAPIId: jest.fn(),
            getSecuritySchemeByName: jest.fn(),
            insertSecurityScheme: jest.fn().mockReturnValue(1),
        },
        responseRepository: {
            getResponsesByOpenAPIId: jest.fn(),
            getResponseByName: jest.fn(),
            insertResponse: jest.fn().mockReturnValue(1),
        },
        schemaRepository: {
            getSchemasByOpenAPIId: jest.fn(),
            getSchemaByName: jest.fn(),
            insertSchema: jest.fn().mockReturnValue(1),
        },
        pathRepository: {
            getPathsByOpenAPIId: jest.fn(),
            getPathByMethodAndPath: jest.fn(),
            insertPath: jest.fn().mockReturnValue(1),
        },
    };
}
