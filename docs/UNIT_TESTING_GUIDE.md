# OpenAPI MCP Server ユニットテストガイド

このガイドでは、分割されたOpenAPI処理アーキテクチャでのユニットテストの手法について説明します。

## 🏗️ 分割されたアーキテクチャ

### 分割前の問題点

-   1つの巨大な関数（380行以上の`parseAndStoreOpenAPI`）
-   複数の責任を持つクラス（`OpenAPIParser`）
-   外部依存のハードコーディング
-   モック化が困難

### 分割後のアーキテクチャ

#### 1. Parser系（純粋関数群）

```
src/tools/openapi/parsers/
├── content-parser.ts    # コンテンツパース（純粋関数）
├── validator.ts         # バリデーション（純粋関数）
└── extractor.ts         # データ抽出（純粋関数）
```

#### 2. Service系（ビジネスロジック）

```
src/tools/openapi/services/
├── file-loader.ts       # ファイル読み込み
├── storage-service.ts   # データベース操作
└── openapi-processor.ts # 全体統合
```

#### 3. Testing

```
src/tools/openapi/tests/
├── content-parser.test.ts
├── validator.test.ts
└── storage-service.test.ts
```

## 🧪 ユニットテストの利点

### 1. 個別テストが可能

各クラスが単一責任を持つため、独立してテストできます：

```typescript
// コンテンツパースのみをテスト
describe("OpenAPIContentParser", () => {
    it("should parse valid JSON content", () => {
        const parser = new OpenAPIContentParser();
        const result = parser.parseContent(jsonContent, "test.json");
        expect(result.openapi).toBe("3.0.0");
    });
});
```

### 2. 純粋関数のテスト

副作用がない純粋関数は予測可能でテストしやすいです：

```typescript
// バリデーションの純粋関数をテスト
describe("OpenAPIValidator", () => {
    it("should validate OpenAPI spec", () => {
        const validator = new OpenAPIValidator();
        const result = validator.validate(openApiSpec);
        expect(result.isValid).toBe(true);
    });
});
```

### 3. 依存性注入とモック化

外部依存をモック化して分離テストが可能：

```typescript
// データベース操作をモック化
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

### 4. エラーハンドリングのテスト

各レイヤーでのエラー処理を個別にテスト：

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

## 📝 テストパターン

### 1. コンテンツパーサーのテスト

-   ✅ 有効なJSON/YAMLのパース
-   ✅ 無効なコンテンツのエラーハンドリング
-   ✅ フォーマット検出の正確性
-   ✅ フォールバック機能

### 2. バリデーターのテスト

-   ✅ 有効なOpenAPI仕様の検証
-   ✅ 必須フィールドの確認
-   ✅ 警告メッセージの生成
-   ✅ 異なるバージョンの対応

### 3. ストレージサービスのテスト

-   ✅ 正常なデータ保存
-   ✅ 既存データの置き換え
-   ✅ データベースエラーの処理
-   ✅ 部分的な失敗の処理

### 4. ファイルローダーのテスト

-   ✅ ファイルの正常読み込み
-   ✅ URL読み込み
-   ✅ タイムアウト処理
-   ✅ ディレクトリスキャン

## 🎯 テスト戦略

### 1. 単体テスト（Unit Tests）

各クラスの個別機能をテスト：

```bash
npm test -- content-parser.test.ts
npm test -- validator.test.ts
npm test -- storage-service.test.ts
```

### 2. 統合テスト（Integration Tests）

複数コンポーネントの連携をテスト：

```typescript
describe("OpenAPIProcessor Integration", () => {
    it("should process file end-to-end", async () => {
        const processor = new OpenAPIProcessor();
        const result = await processor.processFromFile("test.yaml");
        expect(result.success).toBe(true);
    });
});
```

### 3. モック戦略

外部依存をモック化：

-   データベース操作 → モック
-   ファイルシステム → モック
-   HTTPリクエスト → モック

## 📊 テストカバレッジ

### 分割前

-   巨大な関数により部分的なテストが困難
-   外部依存により統合テストのみ可能
-   エラーケースの網羅が困難

### 分割後

-   各クラスで100%近いカバレッジが可能
-   エラーパスの個別テスト
-   パフォーマンステストの分離

## 🚀 実行方法

### テスト環境のセットアップ

```bash
# Jest設定（package.jsonに追加）
npm install --save-dev jest @types/jest ts-jest

# テスト実行
npm test
```

### テストファイルの例

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

## 🎉 まとめ

### 分割の効果

1. **テスタビリティ向上**: 各コンポーネントが独立してテスト可能
2. **保守性向上**: 小さく理解しやすいクラス
3. **再利用性向上**: 各パーサーが他のプロジェクトでも利用可能
4. **デバッグ容易**: 問題の特定が迅速

### 推奨事項

-   新機能追加時は必ずunit testを作成
-   リファクタリング前にテストスイートを充実
-   CIパイプラインでのテスト自動実行
-   テストカバレッジ90%以上を目標

新しいアーキテクチャにより、OpenAPI処理が確実で保守可能なコードベースになりました。 🎯