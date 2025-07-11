import { describe, it, expect } from "@jest/globals";
import { OpenAPIContentParser } from "../parsers/content-parser.js";

describe("OpenAPIContentParser", () => {
    let parser: OpenAPIContentParser;

    beforeEach(() => {
        parser = new OpenAPIContentParser();
    });

    describe("parseContent", () => {
        it("should parse valid JSON content", () => {
            const jsonContent = JSON.stringify({
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
            });

            const result = parser.parseContent(jsonContent, "test.json");

            expect(result.openapi).toBe("3.0.0");
            expect(result.info.title).toBe("Test API");
        });

        it("should parse valid YAML content", () => {
            const yamlContent = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
            `.trim();

            const result = parser.parseContent(yamlContent, "test.yaml");

            expect(result.openapi).toBe("3.0.0");
            expect(result.info.title).toBe("Test API");
        });

        it("should detect JSON format by file extension", () => {
            const jsonContent = JSON.stringify({
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
            });

            const result = parser.parseContent(jsonContent, "api.json");

            expect(result.openapi).toBe("3.0.0");
        });

        it("should detect JSON format by content structure", () => {
            const jsonContent = JSON.stringify({
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
            });

            const result = parser.parseContent(jsonContent, "unknown-file");

            expect(result.openapi).toBe("3.0.0");
        });

        it("should throw error for invalid JSON", () => {
            const invalidJson = "{ invalid json }";

            expect(() => {
                parser.parseContent(invalidJson, "test.json");
            }).toThrow(/OpenAPIコンテンツ解析エラー/);
        });

        it("should throw error for invalid YAML", () => {
            const invalidYaml = "invalid: yaml: content: {";

            expect(() => {
                parser.parseContent(invalidYaml, "test.yaml");
            }).toThrow(/OpenAPIコンテンツ解析エラー/);
        });
    });

    describe("parseWithFallback", () => {
        it("should parse YAML content successfully", () => {
            const yamlContent = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
            `.trim();

            const result = parser.parseWithFallback(yamlContent);

            expect(result.openapi).toBe("3.0.0");
            expect(result.info.title).toBe("Test API");
        });

        it("should fall back to JSON when YAML fails", () => {
            const jsonContent = JSON.stringify({
                openapi: "3.0.0",
                info: { title: "Test API", version: "1.0.0" },
            });

            const result = parser.parseWithFallback(jsonContent);

            expect(result.openapi).toBe("3.0.0");
            expect(result.info.title).toBe("Test API");
        });

        it("should throw detailed error when both YAML and JSON fail", () => {
            const invalidContent = "completely invalid content {[}]";

            expect(() => {
                parser.parseWithFallback(invalidContent);
            }).toThrow(/OpenAPIファイルの解析に失敗しました/);

            expect(() => {
                parser.parseWithFallback(invalidContent);
            }).toThrow(/YAML解析エラー/);

            expect(() => {
                parser.parseWithFallback(invalidContent);
            }).toThrow(/JSON解析エラー/);
        });
    });
});
