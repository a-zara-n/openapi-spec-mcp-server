# OpenAPI MCP Server ツールガイド

**[English](TOOLS_GUIDE.en.md)** | 日本語

このガイドでは、OpenAPI MCP Serverが提供する各ツールの詳細な機能と使用方法について説明します。

## 目次

1. [概要](#概要)
2. [OpenAPIツール](#openapi-tool-openapi仕様管理)
3. [Pathツール](#path-tool-apiパス分析)
4. [Responseツール](#response-tool-レスポンス定義分析)
5. [Schemaツール](#schema-tool-スキーマ管理)
6. [Securityツール](#security-tool-セキュリティスキーム分析)
7. [Serverツール](#server-tool-サーバー情報管理)
8. [ツール共通ライブラリ](#tool-libs-共通ライブラリ)

## 概要

OpenAPI MCP Serverは、OpenAPI仕様を包括的に管理・分析するための6つのカテゴリに分かれた18のツールを提供します。各ツールは独立したモジュールとして設計され、特定の責任範囲を持っています。

### ツールの共通構造

すべてのツールは以下の共通アーキテクチャに従います：

```
tool-name/
├── formatters/           # レスポンスフォーマッター
├── services/            # ビジネスロジック
├── tests/              # テストスイート
├── handler.ts          # リクエストハンドラー
├── repository.ts       # データアクセス層
├── tool.ts            # ツール定義
├── types.ts           # TypeScript型定義
└── validation.ts      # 入力検証
```

### 基本的なワークフロー

1. `openapi_set_server_info`でOpenAPI仕様をロード
2. `mcp_openapi_list_openapis`で利用可能な仕様名を取得
3. 取得した仕様名を使って各カテゴリのツールを利用

## openapi-tool: OpenAPI仕様管理

### 概要
OpenAPI仕様ファイルの読み込み、解析、保存、管理を行うコアツールです。

### 提供ツール

#### 1. `mcp_openapi_list_openapis`
登録されているOpenAPI仕様のリストを取得します。これは通常、利用可能なAPIを発見するために最初に呼び出すツールです。

**パラメータ:**
- なし（空のオブジェクト）

**レスポンス例:**
```json
{
  "specifications": [
    {
      "name": "petstore-api",
      "version": "1.0.0",
      "title": "Swagger Petstore"
    }
  ]
}
```

#### 2. `openapi_set_server_info`
OpenAPI仕様ファイルをシステムデータベースにロードして登録します。

**パラメータ:**
- `path` (string, 必須): OpenAPIファイル（.yaml, .yml, .json）またはOpenAPIファイルを含むディレクトリへのパス
  - 例: `./data/openapi/petstore.yaml`, `./specs/`, `/absolute/path/to/api.json`

**レスポンス例:**
```json
{
  "success": true,
  "message": "Successfully loaded 3 OpenAPI specifications",
  "details": [
    {
      "name": "petstore-api",
      "path": "./data/openapi/petstore.yaml"
    }
  ]
}
```

## path-tool: APIパス分析

### 概要
OpenAPI仕様内のAPIパス（エンドポイント）を分析・検索するツールです。

### 提供ツール

#### 1. `mcp_openapi_list_paths`
指定したOpenAPI仕様からAPIエンドポイントパスのリストを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前（`mcp_openapi_list_openapis`から取得）

**レスポンス例:**
```json
{
  "paths": [
    {
      "methodAndPath": "GET /users/{id}",
      "summary": "Get user by ID"
    },
    {
      "methodAndPath": "POST /users",
      "summary": "Create new user"
    }
  ]
}
```

#### 2. `mcp_openapi_get_path_information`
特定のAPIエンドポイントの包括的な詳細を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `methodAndPath` (string, 必須): HTTPメソッドとパスの組み合わせ（例: `GET /users/{id}`）

**レスポンス例:**
```json
{
  "methodAndPath": "GET /users/{id}",
  "summary": "Get user by ID",
  "description": "Returns a single user",
  "operationId": "getUserById",
  "tags": ["users"],
  "deprecated": false
}
```

#### 3. `mcp_openapi_get_path_parameters`
特定のエンドポイントのパラメータ定義を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `methodAndPath` (string, 必須): HTTPメソッドとパスの組み合わせ

**レスポンス例:**
```json
{
  "parameters": [
    {
      "name": "id",
      "in": "path",
      "required": true,
      "schema": {
        "type": "string",
        "format": "uuid"
      },
      "description": "User ID"
    }
  ]
}
```

#### 4. `mcp_openapi_get_path_responses`
特定のエンドポイントのレスポンス定義を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `methodAndPath` (string, 必須): HTTPメソッドとパスの組み合わせ

**レスポンス例:**
```json
{
  "responses": {
    "200": {
      "description": "Successful response",
      "content": {
        "application/json": {
          "schema": {
            "$ref": "#/components/schemas/User"
          }
        }
      }
    },
    "404": {
      "description": "User not found"
    }
  }
}
```

#### 5. `mcp_openapi_get_path_request_body`
データを受け付けるエンドポイント（POST、PUT、PATCH）のリクエストボディスキーマを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `methodAndPath` (string, 必須): HTTPメソッドとパスの組み合わせ

**レスポンス例:**
```json
{
  "requestBody": {
    "required": true,
    "content": {
      "application/json": {
        "schema": {
          "$ref": "#/components/schemas/CreateUserRequest"
        }
      }
    },
    "description": "User creation data"
  }
}
```

#### 6. `mcp_openapi_get_path_describe`
特定のAPIエンドポイントの人間が読める説明とドキュメントを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `methodAndPath` (string, 必須): HTTPメソッドとパスの組み合わせ

## response-tool: レスポンス定義分析

### 概要
API仕様で定義されている再利用可能なレスポンス定義を管理・分析するツールです。

### 提供ツール

#### 1. `mcp_openapi_list_responses`
OpenAPI仕様から再利用可能なレスポンス定義のリストを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前

**レスポンス例:**
```json
{
  "responses": [
    {
      "responseName": "NotFoundError",
      "description": "Resource not found"
    },
    {
      "responseName": "ValidationError",
      "description": "Request validation failed"
    }
  ]
}
```

#### 2. `mcp_openapi_get_response_information`
特定の再利用可能なレスポンス定義の詳細情報を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `responseName` (string, 必須): レスポンス定義の名前（`mcp_openapi_list_responses`から取得）

**レスポンス例:**
```json
{
  "responseName": "NotFoundError",
  "description": "Resource not found",
  "content": {
    "application/json": {
      "schema": {
        "$ref": "#/components/schemas/Error"
      }
    }
  },
  "headers": {
    "X-Rate-Limit-Remaining": {
      "schema": {
        "type": "integer"
      }
    }
  }
}
```

## schema-tool: スキーマ管理

### 概要
OpenAPI仕様で定義されているスキーマ（データモデル）を管理するツールです。

### 提供ツール

#### 1. `mcp_openapi_get_schema_list`
OpenAPI仕様で定義されているデータスキーマ/モデルのリストを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前

**レスポンス例:**
```json
{
  "schemas": [
    {
      "schemaName": "User",
      "type": "object",
      "description": "User model"
    },
    {
      "schemaName": "CreateUserRequest",
      "type": "object",
      "description": "Request body for creating a user"
    }
  ]
}
```

#### 2. `mcp_openapi_get_schema_information`
特定のスキーマの包括的なメタデータを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `schemaName` (string, 必須): スキーマの名前（`mcp_openapi_get_schema_list`から取得）

**レスポンス例:**
```json
{
  "schemaName": "User",
  "type": "object",
  "description": "User model",
  "required": ["id", "username", "email"],
  "additionalProperties": false
}
```

#### 3. `mcp_openapi_get_schema_definition`
特定のデータモデルの完全なJSONスキーマ定義を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `schemaName` (string, 必須): スキーマの名前

**レスポンス例:**
```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid"
    },
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20
    },
    "email": {
      "type": "string",
      "format": "email"
    }
  },
  "required": ["id", "username", "email"]
}
```

#### 4. `mcp_openapi_get_schema_properties`
特定のスキーマの詳細なプロパティ情報を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `schemaName` (string, 必須): スキーマの名前

**レスポンス例:**
```json
{
  "properties": {
    "id": {
      "name": "id",
      "type": "string",
      "format": "uuid",
      "required": true,
      "description": "Unique identifier"
    },
    "username": {
      "name": "username",
      "type": "string",
      "required": true,
      "minLength": 3,
      "maxLength": 20,
      "description": "User's username"
    }
  }
}
```

## security-tool: セキュリティスキーム分析

### 概要
API仕様で定義されているセキュリティメカニズムを分析するツールです。

### 提供ツール

#### 1. `mcp_openapi_list_security_schemes`
OpenAPI仕様で定義されている認証・認可メカニズムのリストを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前

**レスポンス例:**
```json
{
  "securitySchemes": [
    {
      "securitySchemeName": "ApiKeyAuth",
      "type": "apiKey",
      "description": "API Key Authentication"
    },
    {
      "securitySchemeName": "OAuth2",
      "type": "oauth2",
      "description": "OAuth 2.0 Authentication"
    }
  ]
}
```

#### 2. `mcp_openapi_get_security_scheme_information`
特定のセキュリティスキームの詳細な設定を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `securitySchemeName` (string, 必須): セキュリティスキームの名前（`mcp_openapi_list_security_schemes`から取得）

**レスポンス例:**
```json
{
  "securitySchemeName": "OAuth2",
  "type": "oauth2",
  "description": "OAuth 2.0 Authentication",
  "flows": {
    "authorizationCode": {
      "authorizationUrl": "https://api.example.com/oauth/authorize",
      "tokenUrl": "https://api.example.com/oauth/token",
      "scopes": {
        "read:users": "Read user information",
        "write:users": "Create and update users"
      }
    }
  }
}
```

## server-tool: サーバー情報管理

### 概要
OpenAPI仕様で定義されているサーバー情報を管理するツールです。

### 提供ツール

#### 1. `mcp_openapi_list_application_servers`
OpenAPI仕様で定義されているサーバー設定のリストを取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前

**レスポンス例:**
```json
{
  "servers": [
    {
      "server_url": "https://api.example.com/v1",
      "description": "Production server"
    },
    {
      "server_url": "https://staging-api.example.com",
      "description": "Staging server"
    },
    {
      "server_url": "{protocol}://api.{domain}/v2",
      "description": "Templated server URL"
    }
  ]
}
```

#### 2. `mcp_openapi_get_server_information`
特定のサーバーの詳細な設定を取得します。

**パラメータ:**
- `name` (string, 必須): OpenAPI仕様の名前
- `server_url` (string, 必須): サーバーURL（`mcp_openapi_list_application_servers`から取得）

**レスポンス例:**
```json
{
  "server_url": "{protocol}://api.{domain}/v2",
  "description": "Templated server URL",
  "variables": {
    "protocol": {
      "default": "https",
      "enum": ["http", "https"],
      "description": "Protocol to use"
    },
    "domain": {
      "default": "example.com",
      "description": "API domain"
    }
  }
}
```

## tool-libs: 共通ライブラリ

### 概要
すべてのツールで共有される基盤機能を提供するライブラリです。

### コアコンポーネント

#### 1. Database (`core/database/`)
- SQLite接続管理
- トランザクション処理
- マイグレーション

#### 2. DI Container (`core/di-container.ts`)
- 依存性注入
- サービスのライフサイクル管理
- リポジトリファクトリー

#### 3. Parsers (`parsers/`)
- **content-parser.ts**: YAML/JSONパース
- **validator.ts**: OpenAPI仕様検証
- **extractor.ts**: データ抽出ロジック

#### 4. Services (`services/`)
- **file-loader.ts**: ファイル/URL読み込み
- **openapi-processor.ts**: 統合処理
- **storage-service.ts**: データ永続化

#### 5. Utils (`utils/`)
- **hash.ts**: ファイルハッシュ計算
- **directory-watcher.ts**: ファイル監視
- **response-formatter.ts**: レスポンス整形
- **business-logic.ts**: 共通ビジネスロジック

### エラーハンドリング

統一されたエラー処理システム：
- カスタムエラークラス
- エラーコード体系
- スタックトレース保持
- ユーザーフレンドリーなメッセージ

### バリデーション

共通バリデーションスキーマ：
- 入力パラメータ検証
- OpenAPI仕様準拠チェック
- 型安全性の保証

## 使用例

### 完全なワークフローの例

```typescript
// 1. OpenAPI仕様をロード
await openapi_set_server_info({ 
  path: "./data/openapi/petstore.yaml" 
});

// 2. 利用可能な仕様を確認
const specs = await mcp_openapi_list_openapis();
// => { specifications: [{ name: "petstore-api", ... }] }

// 3. APIパスを探索
const paths = await mcp_openapi_list_paths({ 
  name: "petstore-api" 
});
// => { paths: [{ methodAndPath: "GET /pets/{id}", ... }] }

// 4. 特定のエンドポイントの詳細を取得
const pathInfo = await mcp_openapi_get_path_information({
  name: "petstore-api",
  methodAndPath: "GET /pets/{id}"
});

// 5. パラメータを確認
const params = await mcp_openapi_get_path_parameters({
  name: "petstore-api",
  methodAndPath: "GET /pets/{id}"
});

// 6. レスポンススキーマを確認
const responses = await mcp_openapi_get_path_responses({
  name: "petstore-api",
  methodAndPath: "GET /pets/{id}"
});

// 7. スキーマの詳細を取得
const schemas = await mcp_openapi_get_schema_list({
  name: "petstore-api"
});

const petSchema = await mcp_openapi_get_schema_definition({
  name: "petstore-api",
  schemaName: "Pet"
});

// 8. セキュリティ要件を確認
const security = await mcp_openapi_list_security_schemes({
  name: "petstore-api"
});

// 9. サーバー情報を取得
const servers = await mcp_openapi_list_application_servers({
  name: "petstore-api"
});
```

## ベストプラクティス

### 1. エラーハンドリング
すべてのツール呼び出しはtry-catchでラップ：
```typescript
try {
  const result = await mcp_openapi_list_paths({ name: "api-name" });
  // 成功処理
} catch (error) {
  // エラー処理
  console.error(error.message);
}
```

### 2. ツールの順序
正しい順序でツールを使用：
1. `openapi_set_server_info` → 仕様をロード
2. `mcp_openapi_list_openapis` → 利用可能な仕様名を取得
3. リストツール → 利用可能なリソースを確認
4. 詳細ツール → 特定のリソースの詳細を取得

### 3. パラメータの検証
ツールに渡すパラメータは必ず前のツールから取得：
```typescript
// 良い例
const specs = await mcp_openapi_list_openapis();
const specName = specs.specifications[0].name;
const paths = await mcp_openapi_list_paths({ name: specName });

// 悪い例
const paths = await mcp_openapi_list_paths({ name: "guessed-name" });
```

### 4. バッチ処理
複数の仕様を効率的に処理：
```typescript
// ディレクトリ内のすべての仕様をロード
await openapi_set_server_info({ 
  path: "./data/openapi/" 
});

// すべての仕様を処理
const specs = await mcp_openapi_list_openapis();
for (const spec of specs.specifications) {
  const paths = await mcp_openapi_list_paths({ name: spec.name });
  // 各仕様を処理
}
```

## まとめ

OpenAPI MCP Serverは18個の専門ツールを通じて、OpenAPI仕様の包括的な管理と分析を可能にします。各ツールは明確な責任範囲を持ち、他のツールと連携して動作します。適切なツールを選択し、正しい順序で使用することで、API仕様の理解、検証、ドキュメント生成など、様々なユースケースに対応できます。