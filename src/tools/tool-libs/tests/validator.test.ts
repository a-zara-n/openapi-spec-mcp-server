import { describe, it, expect } from "@jest/globals";
import { OpenAPIValidator } from "../parsers/validator.js";

describe("OpenAPIValidator", () => {
    let validator: OpenAPIValidator;

    beforeEach(() => {
        validator = new OpenAPIValidator();
    });

    describe("validate", () => {
        it("should validate a valid OpenAPI 3.0 spec", () => {
            const validSpec = {
                openapi: "3.0.0",
                info: {
                    title: "Test API",
                    version: "1.0.0",
                    description: "A test API",
                },
                paths: {
                    "/test": {
                        get: {
                            summary: "Test endpoint",
                        },
                    },
                },
            };

            const result = validator.validate(validSpec);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.openApiVersion).toBe("3.0.0");
        });

        it("should validate a valid Swagger 2.0 spec with warnings", () => {
            const swaggerSpec = {
                swagger: "2.0",
                info: {
                    title: "Test API",
                    version: "1.0.0",
                },
                paths: {},
            };

            const result = validator.validate(swaggerSpec);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toContain(
                "Swagger 2.0 形式です。OpenAPI 3.0+ への移行を推奨します"
            );
            expect(result.openApiVersion).toBe("2.0");
        });

        it("should fail validation for missing OpenAPI version", () => {
            const invalidSpec = {
                info: {
                    title: "Test API",
                    version: "1.0.0",
                },
            };

            const result = validator.validate(invalidSpec);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                "OpenAPIバージョンまたはSwaggerバージョンが指定されていません"
            );
        });

        it("should fail validation for missing info section", () => {
            const invalidSpec = {
                openapi: "3.0.0",
            };

            const result = validator.validate(invalidSpec);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                "info セクションが存在しないか、オブジェクトではありません"
            );
        });

        it("should fail validation for missing required info fields", () => {
            const invalidSpec = {
                openapi: "3.0.0",
                info: {
                    description: "Missing title and version",
                },
            };

            const result = validator.validate(invalidSpec);

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                "info.title が存在しません（必須項目）"
            );
            expect(result.errors).toContain(
                "info.version が存在しません（必須項目）"
            );
        });

        it("should warn for missing description", () => {
            const specWithoutDescription = {
                openapi: "3.0.0",
                info: {
                    title: "Test API",
                    version: "1.0.0",
                },
            };

            const result = validator.validate(specWithoutDescription);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain(
                "info.description の設定を推奨します"
            );
        });

        it("should validate paths and provide warnings", () => {
            const specWithBadPaths = {
                openapi: "3.0.0",
                info: {
                    title: "Test API",
                    version: "1.0.0",
                },
                paths: {
                    "bad-path": {
                        get: {},
                    },
                },
            };

            const result = validator.validate(specWithBadPaths);

            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain(
                'パス "bad-path" は "/" で始まる必要があります'
            );
        });

        it("should handle null or undefined input", () => {
            const result1 = validator.validate(null);
            const result2 = validator.validate(undefined);

            expect(result1.isValid).toBe(false);
            expect(result1.errors).toContain(
                "OpenAPIオブジェクトが無効です（null、undefined、または非オブジェクト）"
            );

            expect(result2.isValid).toBe(false);
            expect(result2.errors).toContain(
                "OpenAPIオブジェクトが無効です（null、undefined、または非オブジェクト）"
            );
        });
    });

    describe("isValidOpenAPI", () => {
        it("should return true for valid spec", () => {
            const validSpec = {
                openapi: "3.0.0",
                info: {
                    title: "Test API",
                    version: "1.0.0",
                },
            };

            expect(validator.isValidOpenAPI(validSpec)).toBe(true);
        });

        it("should return false for invalid spec", () => {
            const invalidSpec = {
                notOpenAPI: "3.0.0",
            };

            expect(validator.isValidOpenAPI(invalidSpec)).toBe(false);
        });
    });

    describe("getSpecType", () => {
        it("should detect OpenAPI spec", () => {
            const openApiSpec = { openapi: "3.0.0" };
            expect(validator.getSpecType(openApiSpec)).toBe("openapi");
        });

        it("should detect Swagger spec", () => {
            const swaggerSpec = { swagger: "2.0" };
            expect(validator.getSpecType(swaggerSpec)).toBe("swagger");
        });

        it("should return unknown for unrecognized spec", () => {
            const unknownSpec = { version: "1.0" };
            expect(validator.getSpecType(unknownSpec)).toBe("unknown");
        });
    });
});
