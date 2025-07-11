# OpenAPI Specification Docs MCP Server

**[English](README.en.md)** | 日本語

OpenAPI 仕様の分析、検証、管理のための知的ツールを提供する TypeScript ベースの Model Context Protocol (MCP)サーバーです。このサーバーにより、AI アシスタントが構造化されたインターフェースを通じて OpenAPI ドキュメントと対話することが可能になります。

## 目次

-   [概要](#概要)
-   [アーキテクチャ](#アーキテクチャ)
-   [機能](#機能)
-   [利用可能なツール](#利用可能なツール)
-   [インストール](#インストール)
-   [使用方法](#使用方法)
-   [設定](#設定)
-   [開発ガイドライン](#開発ガイドライン)
-   [API リファレンス](#apiリファレンス)
-   [トラブルシューティング](#トラブルシューティング)

## 概要

OpenAPI MCP Serverは、AIアシスタントとOpenAPI仕様の架け橋となるサーバーです。このサーバーを使用することで、AIモデルは以下のことができるようになります：

-   ローカルファイルやディレクトリからOpenAPI仕様を自動的に読み込み、解析
-   APIのパス、スキーマ、セキュリティ設定などの構造を詳細に分析
-   特定のAPIエンドポイントやパラメータについて自然言語でクエリ
-   OpenAPI標準に準拠しているかどうかの検証を実行
-   複数のAPI仕様を同時に管理し、相互参照

Model Context Protocol (MCP)を実装することで、ClaudeのようなAI開発ツールとシームレスに統合でき、APIドキュメントの理解と活用が飛躍的に向上します。

## アーキテクチャ

### ディレクトリ構造

```
openapi-mcp-server/
├── src/                      # ソースコード
│   ├── index.ts              # メインエントリーポイント
│   ├── server.ts             # MCPサーバー実装
│   ├── config.ts             # 設定管理
│   ├── resources/            # MCPリソース定義
│   └── tools/                # ツール実装
│       ├── openapi-tool/     # OpenAPI仕様管理
│       ├── path-tool/        # APIパス分析
│       ├── response-tool/    # レスポンススキーマ分析
│       ├── schema-tool/      # スキーマコンポーネント管理
│       ├── security-tool/    # セキュリティスキーム分析
│       ├── server-tool/      # サーバーエンドポイント管理
│       ├── tool-libs/        # 共有ツールライブラリ
│       │   ├── core/         # コア機能
│       │   ├── parsers/      # ファイルパーサー
│       │   ├── services/     # ビジネスロジックサービス
│       │   ├── types/        # TypeScript型定義
│       │   └── utils/        # ユーティリティ関数
│       └── shared/           # 共有ユーティリティ
├── data/                     # データストレージ
│   ├── openapi/              # OpenAPIファイル
│   └── openapi.db            # SQLiteデータベース
├── build/                    # コンパイル済みJS
├── docs/                     # ドキュメント
├── tests/                    # テストファイル
├── package.json              # Node.js依存関係
└── tsconfig.json            # TypeScript設定
```

### コアコンポーネント

#### 1. **サーバーコンポーネント** (`server.ts`)

-   MCP 通信のための Streamable HTTP トランスポートを実装
-   ステートレス操作のための POST と GET リクエストの両方を処理
-   ツールの登録と実行を管理
-   包括的なリクエスト/レスポンスロギングを提供
-   ファイル変更のための OpenAPI ディレクトリを監視

#### 2. **ツールマネージャー** (`tools/index.ts`)

-   集中型ツールレジストリと実行エンジン
-   ツール名をハンドラー関数にマップ
-   エラー処理と実行追跡を提供
-   現在 6 つのカテゴリにわたる 17 の異なるツールを管理

#### 3. **データベースレイヤー** (`tool-libs/core/database/`)

-   OpenAPI 仕様のための SQLite ベースのストレージ
-   仕様、パス、スキーマなどの間の関係を管理
-   効率的なクエリとキャッシングメカニズムを提供
-   完全な CRUD 操作をサポート

#### 4. **OpenAPI プロセッサー** (`tool-libs/services/openapi-processor.ts`)

-   YAML と JSON OpenAPI ファイルを解析
-   OpenAPI 標準に対して仕様を検証
-   API 情報を抽出して正規化
-   ハッシングによるファイル変更検出を処理

#### 5. **依存性注入コンテナ** (`tool-libs/core/di-container.ts`)

-   サービスの依存関係を管理
-   リポジトリのシングルトンインスタンスを提供
-   異なる環境（本番、テスト）に対して設定可能

## 機能

### コア機能

-   **マルチフォーマット対応**: YAML と JSON 形式の OpenAPI 3.0+仕様を処理
-   **リアルタイム監視**: 変更と更新のための OpenAPI ディレクトリを監視
-   **ステートレスアーキテクチャ**: 各リクエストは独立しており、スケーラビリティを確保
-   **包括的な検証**: ストレージ前に OpenAPI 仕様を検証
-   **詳細なロギング**: デバッグと監視のための広範なロギング
-   **エラー処理**: 詳細なエラーメッセージによる堅牢なエラー管理

### 技術的特徴

-   **TypeScript**: 完全な型安全性と IntelliSense サポート
-   **Express.js**: HTTP サーバー実装
-   **SQLite**: 軽量な組み込みデータベース
-   **MCP SDK**: 公式 Model Context Protocol 実装
-   **ホットリロード**: 仕様変更の自動検出

## 利用可能なツール

サーバーは 6 つのカテゴリに整理された 17 の専門ツールを提供します：

### 1. OpenAPI 管理ツール

-   **`openapi_set_server_info`**: OpenAPI 仕様をロードして登録
    -   個別のファイルまたはディレクトリ全体をサポート
    -   ストレージ前に仕様を検証
-   **`mcp_openapi_list_openapis`**: 登録されたすべての OpenAPI 仕様をリスト
    -   他のツールで使用するための仕様名を返す

### 2. サーバー情報ツール

-   **`mcp_openapi_list_servers`**: 仕様で定義されたすべてのサーバーをリスト
-   **`mcp_openapi_get_server_info`**: 特定のサーバーの詳細情報を取得

### 3. パス分析ツール

-   **`mcp_openapi_list_paths`**: 仕様内のすべての API パスをリスト
-   **`mcp_openapi_get_path_info`**: 特定のパスの詳細情報を取得
-   **`mcp_openapi_get_path_parameters`**: パスパラメータを抽出
-   **`mcp_openapi_get_path_responses`**: パスのレスポンス定義を取得
-   **`mcp_openapi_get_path_request_body`**: リクエストボディスキーマを取得
-   **`mcp_openapi_describe_path`**: エンドポイントの自然言語記述を取得

### 4. スキーマ検査ツール

-   **`mcp_openapi_list_schemas`**: 定義されたすべてのスキーマをリスト
-   **`mcp_openapi_get_schema_info`**: スキーマの詳細を取得
-   **`mcp_openapi_get_schema_definition`**: 完全なスキーマ定義を取得
-   **`mcp_openapi_get_schema_properties`**: スキーマプロパティを抽出

### 5. セキュリティツール

-   **`mcp_openapi_list_security_schemes`**: セキュリティスキームをリスト
-   **`mcp_openapi_get_security_scheme_info`**: セキュリティスキームの詳細を取得

### 6. レスポンスツール

-   **`mcp_openapi_list_responses`**: 再利用可能なレスポンス定義をリスト
-   **`mcp_openapi_get_response_info`**: レスポンス定義の詳細を取得

## インストール

### 前提条件

-   Node.js 18+ および npm
-   TypeScript 5.0+
-   Git

### セットアップ手順

1. **リポジトリをクローン**:

```bash
git clone <repository-url>
cd openapi-mcp-server
```

2. **依存関係をインストール**:

```bash
npm install
```

3. **プロジェクトをビルド**:

```bash
npm run build
```

4. **データディレクトリを作成**（存在しない場合）:

```bash
mkdir -p data/openapi
```

5. **OpenAPI ファイルを追加**:
   OpenAPI 仕様ファイル（`.yaml`、`.yml`、または`.json`）を`data/openapi`ディレクトリに配置します。

## 使用方法

### サーバーの起動

サーバーは複数の実行モードをサポートしています：

```bash
# 開発モード（自動再起動付き）
npm run dev

# 本番モード
npm start

# TypeScriptファイルをビルド
npm run build
```

### MCP クライアントとの統合

Claude デスクトップアプリまたは MCP 対応クライアントで：

```json
{
    "mcpServers": {
        "openapi-server": {
            "command": "node",
            "args": ["/path/to/openapi-mcp-server/build/index.js"]
        }
    }
}
```

### ワークフローの例

1. **OpenAPI 仕様をロード**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "openapi_set_server_info",
        "arguments": {
            "path": "./data/openapi/petstore.yaml"
        }
    }
}
```

2. **利用可能な API をリスト**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "mcp_openapi_list_openapis",
        "arguments": {}
    }
}
```

3. **API パスを探索**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "mcp_openapi_list_paths",
        "arguments": {
            "name": "petstore"
        }
    }
}
```

4. **特定のエンドポイントを検査**:

```json
{
    "method": "tools/call",
    "params": {
        "name": "mcp_openapi_get_path_info",
        "arguments": {
            "name": "petstore",
            "path": "/pets/{petId}",
            "method": "get"
        }
    }
}
```

## 設定

### 環境変数

環境変数を使用してデフォルト設定を上書きできます：

-   `PORT`: サーバーポート（デフォルト: 3000）
-   `DB_PATH`: データベースファイルパス
-   `OPENAPI_DIR`: OpenAPI ファイルディレクトリ

## 開発ガイドライン

### 新しいツールの追加

1. **ツールディレクトリを作成**: `src/tools/`の下に新しいディレクトリを作成
2. **ツールインターフェースを定義**: MCP ツール定義で`tool.ts`を作成
3. **ハンドラーを実装**: ビジネスロジックで`handler.ts`を作成
4. **検証を追加**: 入力検証のための`validation.ts`を作成
5. **ツールを登録**: `src/tools/index.ts`に追加

ツール構造の例：

```
src/tools/my-tool/
├── tool.ts          # ツール定義
├── handler.ts       # リクエストハンドラー
├── validation.ts    # 入力検証
├── types.ts         # TypeScript型
└── index.ts         # エクスポート
```

### コードスタイル

-   TypeScript ストリクトモードを使用
-   ESLint ルールに従う
-   すべてのパブリック API に JSDoc コメントを追加
-   ビジネスロジックのユニットテストを書く
-   意味のある変数名と関数名を使用

### テスト

テストを実行：

```bash
npm test
```

テストは`src/tools/*/tests/`ディレクトリにあります。

### ビルド

プロジェクトをビルド：

```bash
npm run build
```

出力は`build/`ディレクトリに生成されます。

## API リファレンス

### ツールリクエスト形式

すべてのツールは MCP 標準形式に従います：

```typescript
{
    method: "tools/call",
    params: {
        name: string,      // ツール名
        arguments: object  // ツール固有の引数
    }
}
```

### レスポンス形式

```typescript
{
    content: [
        {
            type: "text",
            text: string, // レスポンスデータ
        },
    ];
}
```

## トラブルシューティング

### よくある問題

1. **サーバーが起動しない**:

    - ポート 3000 が既に使用されていないか確認
    - すべての依存関係がインストールされていることを確認
    - TypeScript ビルドが正常に完了したことを確認

2. **OpenAPI ファイルがロードされない**:

    - `data/openapi/`のファイル権限を確認
    - ファイルが有効な YAML/JSON であることを確認
    - 検証エラーのサーバーログを確認

3. **データベースエラー**:

    - `data/`ディレクトリが存在し、書き込み可能であることを確認
    - データベースをリセットするには`openapi.db`を削除
    - ディスク容量の可用性を確認

4. **ツール実行の失敗**:
    - ツール名が正しいことを確認
    - 必要な引数が提供されていることを確認
    - 詳細なエラーメッセージのサーバーログを確認

### デバッグモード

詳細なロギングを有効にする：

```typescript
enableLogging: true; // 様々な設定オブジェクトで
```

### サポート

問題や質問がある場合：

-   詳細なエラー情報のサーバーログを確認
-   `/docs`の既存のドキュメントを確認
-   使用例のテストファイルを確認

## ライセンス

ISC ライセンス - 詳細は[LICENSE ファイル](LICENSE)を参照してください。

## コントリビューション

コントリビューションは歓迎します！開発ガイドラインに従い、プルリクエストを送信する前にすべてのテストが合格することを確認してください。
