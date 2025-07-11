# Unit Testing Guide for OpenAPI MCP Server

English | **[日本語](UNIT_TESTING_GUIDE.md)**

This guide explains unit testing approaches in the refactored OpenAPI processing architecture.

## 🏗️ Refactored Architecture

### Problems Before Refactoring

-   One massive function (380+ lines of `parseAndStoreOpenAPI`)
-   Classes with multiple responsibilities (`OpenAPIParser`)
-   Hard-coded external dependencies
-   Difficult to mock

### Architecture After Refactoring

#### 1. Parser System (Pure Functions)

```
src/tools/openapi/parsers/
├── content-parser.ts    # Content parsing (pure function)
├── validator.ts         # Validation (pure function)
└── extractor.ts         # Data extraction (pure function)
```

#### 2. Service System (Business Logic)

```
src/tools/openapi/services/
├── file-loader.ts       # File loading
├── storage-service.ts   # Database operations
└── openapi-processor.ts # Overall integration
```

#### 3. Testing

```
src/tools/openapi/tests/
├── content-parser.test.ts
├── validator.test.ts
└── storage-service.test.ts
```

## 🧪 Benefits of Unit Testing

### 1. Individual Testing Possible

Each class has a single responsibility, allowing independent testing:

```typescript
// Test only content parsing
describe("OpenAPIContentParser", () => {
    it("should parse valid JSON content", () => {
        const parser = new OpenAPIContentParser();
        const result = parser.parseContent(jsonContent, "test.json");
        expect(result.openapi).toBe("3.0.0");
    });
});
```

### 2. Testing Pure Functions

Pure functions without side effects are predictable and easy to test:

```typescript
// Test validation pure function
describe("OpenAPIValidator", () => {
    it("should validate OpenAPI spec", () => {
        const validator = new OpenAPIValidator();
        const result = validator.validate(openApiSpec);
        expect(result.isValid).toBe(true);
    });
});
```

### 3. Dependency Injection and Mocking

External dependencies can be mocked for isolated testing:

```typescript
// Mock database operations
jest.mock("../di-container.js", () => ({
    RepositoryFactory: {
        createRepositorySet: jest.fn(() => ({
            openapi: {
                insertOrUpdateOpenAPI: jest.fn().mockReturnValue(1),
            },
        })),
    },
}));
```

### 4. Testing Error Handling

Test error handling at each layer individually:

```typescript
it("should handle storage errors gracefully", async () => {
    mockRepositories.openapi.insertOrUpdateOpenAPI.mockImplementation(() => {
        throw new Error("Database error");
    });

    const result = await storageService.store(extractedData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("Database error");
});
```

## 📝 Test Patterns

### 1. Content Parser Tests

-   ✅ Parse valid JSON/YAML
-   ✅ Error handling for invalid content
-   ✅ Format detection accuracy
-   ✅ Fallback functionality

### 2. Validator Tests

-   ✅ Validate valid OpenAPI specifications
-   ✅ Check required fields
-   ✅ Generate warning messages
-   ✅ Support different versions

### 3. Storage Service Tests

-   ✅ Normal data storage
-   ✅ Replace existing data
-   ✅ Handle database errors
-   ✅ Handle partial failures

### 4. File Loader Tests

-   ✅ Normal file loading
-   ✅ URL loading
-   ✅ Timeout handling
-   ✅ Directory scanning

## 🎯 Testing Strategy

### 1. Unit Tests

Test individual functionality of each class:

```bash
npm test -- content-parser.test.ts
npm test -- validator.test.ts
npm test -- storage-service.test.ts
```

### 2. Integration Tests

Test coordination between multiple components:

```typescript
describe("OpenAPIProcessor Integration", () => {
    it("should process file end-to-end", async () => {
        const processor = new OpenAPIProcessor();
        const result = await processor.processFromFile("test.yaml");
        expect(result.success).toBe(true);
    });
});
```

### 3. Mocking Strategy

Mock external dependencies:

-   Database operations → Mock
-   File system → Mock
-   HTTP requests → Mock

## 📊 Test Coverage

### Before Refactoring

-   Partial testing difficult due to large functions
-   Only integration tests possible due to external dependencies
-   Difficult to cover error cases comprehensively

### After Refactoring

-   Near 100% coverage possible for each class
-   Individual testing of error paths
-   Isolated performance testing

## 🚀 How to Run

### Setting Up Test Environment

```bash
# Jest configuration (add to package.json)
npm install --save-dev jest @types/jest ts-jest

# Run tests
npm test
```

### Example Test File

```typescript
// src/tools/openapi/tests/content-parser.test.ts
import { OpenAPIContentParser } from "../parsers/content-parser.js";

describe("OpenAPIContentParser", () => {
    let parser: OpenAPIContentParser;

    beforeEach(() => {
        parser = new OpenAPIContentParser();
    });

    it("should parse valid JSON", () => {
        const result = parser.parseContent(validJson, "test.json");
        expect(result).toBeDefined();
    });
});
```

## 🎉 Summary

### Effects of Refactoring

1. **Improved Testability**: Each component can be tested independently
2. **Improved Maintainability**: Small, understandable classes
3. **Improved Reusability**: Each parser can be used in other projects
4. **Easy Debugging**: Quick problem identification

### Recommendations

-   Always create unit tests when adding new features
-   Enhance test suite before refactoring
-   Automate test execution in CI pipeline
-   Aim for 90%+ test coverage

The new architecture has made OpenAPI processing a reliable and maintainable codebase. 🎯