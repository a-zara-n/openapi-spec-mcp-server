# OpenAPI MCP Server プロジェクト作成プロンプト

以下のディレクトリ構造とファイルを持つTypeScriptプロジェクトを作成してください。

## プロジェクト概要
- プロジェクト名: openapi-mcp-server
- タイプ: MCP (Model Context Protocol) サーバー
- 言語: TypeScript (ES Modules)
- 主要技術: Express, SQLite, Jest

## ディレクトリ構造

```
openapi-mcp-server/
├── src/
│   ├── config.ts
│   ├── index.ts
│   ├── server.ts
│   ├── resources/
│   │   ├── base.ts
│   │   └── index.ts
│   └── tools/
│       ├── base.ts
│       ├── index.ts
│       ├── openapi-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── openapi-business-logic.ts
│       │   ├── tests/
│       │   │   ├── openapi-business-logic.test.ts
│       │   │   ├── response-formatter.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── path-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── parser.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── path-business-logic.ts
│       │   ├── tests/
│       │   │   ├── parser.test.ts
│       │   │   ├── path-business-logic.test.ts
│       │   │   ├── response-formatter.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── response-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── response-business-logic.ts
│       │   ├── tests/
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── schema-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── schema-business-logic.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── security-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── security-business-logic.ts
│       │   ├── tests/
│       │   │   ├── security-business-logic.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── server-tool/
│       │   ├── formatters/
│       │   │   └── response-formatter.ts
│       │   ├── handler.ts
│       │   ├── index.ts
│       │   ├── repository.ts
│       │   ├── services/
│       │   │   └── server-business-logic.ts
│       │   ├── tests/
│       │   │   ├── response-formatter.test.ts
│       │   │   ├── server-business-logic.test.ts
│       │   │   └── validation.test.ts
│       │   ├── tool.ts
│       │   ├── types.ts
│       │   └── validation.ts
│       ├── shared/
│       │   ├── index.ts
│       │   ├── test-utilities.ts
│       │   └── validation-schemas.ts
│       └── tool-libs/
│           ├── core/
│           │   ├── database.ts
│           │   ├── database/
│           │   │   └── index.ts
│           │   ├── di-container.ts
│           │   ├── di/
│           │   │   └── index.ts
│           │   ├── error/
│           │   │   └── index.ts
│           │   ├── index.ts
│           │   └── validation/
│           │       └── index.ts
│           ├── index.ts
│           ├── parsers/
│           │   ├── content-parser.ts
│           │   ├── extractor.ts
│           │   ├── index.ts
│           │   └── validator.ts
│           ├── services/
│           │   ├── file-loader.ts
│           │   ├── index.ts
│           │   ├── openapi-processor.ts
│           │   └── storage-service.ts
│           ├── tests/
│           │   ├── content-parser.test.ts
│           │   ├── storage-service.test.ts
│           │   └── validator.test.ts
│           ├── types/
│           │   ├── index.ts
│           │   └── interfaces.ts
│           └── utils/
│               ├── business-logic.ts
│               ├── directory-watcher.ts
│               ├── hash.ts
│               ├── index.ts
│               ├── parser.ts
│               └── response-formatter.ts
├── data/
│   ├── openapi.db
│   └── openapi/
├── package.json
├── tsconfig.json
├── README.md
├── UNIT_TESTING_GUIDE.md
└── 機能設計.md
```

## package.json

```json
{
    "name": "openapi-mcp-server",
    "version": "1.0.0",
    "description": "OpenAPI MCP Server",
    "main": "build/server.js",
    "type": "module",
    "scripts": {
        "http": "npm run build && node build/server.js",
        "streamable": "npm run build && node build/server.js",
        "build": "tsc --noCheck && tsc-alias",
        "typecheck": "tsc --noEmit",
        "start": "node build/index.js",
        "dev": "tsx src/index.ts",
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "keywords": [
        "mcp",
        "server",
        "openapi"
    ],
    "author": "",
    "license": "ISC",
    "dependencies": {
        "@modelcontextprotocol/sdk": "^1.15.0",
        "better-sqlite3": "^12.2.0",
        "cors": "^2.8.5",
        "express": "^5.1.0",
        "jest": "^29.7.0",
        "mcp-proxy": "^5.3.0",
        "npx": "^3.0.0",
        "yaml": "^2.8.0"
    },
    "devDependencies": {
        "@types/better-sqlite3": "^7.6.13",
        "@types/cors": "^2.8.17",
        "@types/express": "^5.0.0",
        "@types/jest": "^30.0.0",
        "@types/node": "^22.13.10",
        "tsc-alias": "^1.8.16",
        "tsconfig-paths": "^4.2.0",
        "tsx": "^4.19.3",
        "typescript": "^5.8.3"
    }
}
```

## tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "node",
        "outDir": "build",
        "rootDir": "src",
        "baseUrl": ".",
        "paths": {
            "@/*": ["src/*"]
        },
        "strict": true,
        "esModuleInterop": true,
        "allowSyntheticDefaultImports": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "declaration": true,
        "declarationMap": true,
        "sourceMap": true,
        "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "build"]
}
```

## 各ツールの構成パターン

各ツール（openapi-tool, path-tool, response-tool, schema-tool, security-tool, server-tool）は以下の共通構造を持ちます：

- `formatters/response-formatter.ts`: レスポンスのフォーマット処理
- `handler.ts`: リクエストハンドリング
- `index.ts`: エクスポート定義
- `repository.ts`: データアクセス層
- `services/*-business-logic.ts`: ビジネスロジック
- `tests/`: テストファイル
- `tool.ts`: ツールのメイン定義
- `types.ts`: 型定義
- `validation.ts`: バリデーション処理

## 主要な機能

1. **OpenAPI仕様の管理**: OpenAPI仕様ファイルの読み込み、解析、保存
2. **MCPサーバー**: Model Context Protocolに準拠したサーバー実装
3. **データベース**: SQLite（better-sqlite3）を使用したデータ永続化
4. **ツール群**: OpenAPI仕様の各要素（パス、レスポンス、スキーマ、セキュリティ、サーバー）を扱うツール
5. **テスト**: Jestを使用した単体テスト

## 実装手順

1. プロジェクトディレクトリを作成
2. `npm init -y`でpackage.jsonを生成し、上記の内容で更新
3. 必要な依存関係をインストール: `npm install`
4. TypeScript設定ファイル（tsconfig.json）を作成
5. ディレクトリ構造に従ってフォルダを作成
6. 各ツールのbase classやinterfaceを実装
7. 各ツールの具体的な実装を追加
8. テストファイルを作成

このプロジェクトは、OpenAPI仕様を管理・処理するMCPサーバーとして機能し、各ツールが独立したモジュールとして実装されています。