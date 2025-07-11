# OpenAPI MCP Server

**[English](README.en.md)** | 日本語

Model Context Protocol (MCP) サーバーで、OpenAPI仕様の分析、検証、操作のためのツールを提供します。このサーバーにより、AIアシスタントが構造化されたインターフェースを通じてAPIドキュメントを理解し、対話することが可能になります。

## 概要

OpenAPI MCP Serverは、AIアシスタント（特にClaude）がOpenAPI仕様を深く理解し、効果的に活用できるようにするための専門ツールです。このサーバーは、単なるAPIドキュメントの読み取りを超えて、AIがAPIの構造を理解し、開発者のニーズに応じた適切な提案ができるようサポートします。

主な特徴として、JSONとYAMLの両フォーマットに対応し、ファイルの変更をリアルタイムで検知して最新の状態を保ちます。これにより、開発中のAPIドキュメントとも連携しながら作業を進めることができます。

## アーキテクチャ

### ディレクトリ構造

```
openapi-mcp-server/
├── src/
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
│       └── shared/           # 共有ユーティリティ
├── data/                     # SQLiteデータベースストレージ
├── docs/                     # ドキュメント
└── build/                    # コンパイル済みJavaScript出力
```

### コアコンポーネント

1. **MCPサーバー** (`server.ts`)
   - Model Context Protocolの実装
   - ツールの登録と実行管理
   - クライアント通信の処理

2. **ツールマネージャー** (`tools/index.ts`)
   - 利用可能な全ツールの登録と管理
   - ツールの検出と実行

3. **データベースレイヤー** (`tool-libs/core/database.ts`)
   - OpenAPI仕様のSQLiteベースストレージ
   - データの永続化と取得管理

4. **OpenAPIプロセッサー** (`tool-libs/services/openapi-processor.ts`)
   - OpenAPI仕様の解析と検証
   - APIコンポーネントの抽出とインデックス化

5. **DIコンテナ** (`tool-libs/core/di-container.ts`)
   - 依存性注入の管理
   - 適切なサービス初期化の保証

## 機能

- **マルチフォーマット対応**: JSONとYAML形式のOpenAPI仕様に対応
- **リアルタイム監視**: OpenAPIファイルの変更を監視
- **包括的な検証**: OpenAPI標準に対する仕様の検証
- **コンポーネント分析**: パス、スキーマ、レスポンス、セキュリティの詳細検査
- **データベースストレージ**: 解析済み仕様の永続的な保存
- **TypeScript**: 完全な型付けによる開発体験の向上
- **Express.js統合**: ヘルスチェック用HTTPエンドポイント
- **SQLiteデータベース**: 軽量なファイルベースストレージ

## 利用可能なツール

### 1. OpenAPI管理
- **list_openapi_specs**: 保存されているすべてのOpenAPI仕様を一覧表示
- **load_openapi_from_file**: ファイルから仕様を読み込み
- **load_openapi_from_url**: URLから仕様を読み込み
- **delete_openapi_spec**: 保存された仕様を削除

### 2. パス分析
- **list_paths**: 仕様内のすべてのAPIパスを一覧表示
- **get_path_details**: 特定のパスの詳細情報を取得
- **search_paths**: 様々な条件でパスを検索

### 3. レスポンス分析
- **list_responses**: すべてのレスポンス定義を一覧表示
- **get_response_details**: 詳細なレスポンス情報を取得
- **search_responses**: 条件に基づいてレスポンスを検索

### 4. スキーマ管理
- **list_schemas**: すべてのスキーマコンポーネントを一覧表示
- **get_schema_details**: 詳細なスキーマ情報を取得
- **search_schemas**: 名前やプロパティでスキーマを検索

### 5. セキュリティ分析
- **list_security_schemes**: すべてのセキュリティスキームを一覧表示
- **get_security_details**: 詳細なセキュリティ情報を取得

### 6. サーバー管理
- **list_servers**: すべてのサーバー定義を一覧表示
- **get_server_details**: 詳細なサーバー情報を取得

## インストール

### 前提条件
- Node.js 18以上
- npmまたはyarn

### セットアップ

1. リポジトリをクローン:
```bash
git clone <repository-url>
cd openapi-mcp-server
```

2. 依存関係をインストール:
```bash
npm install
```

3. プロジェクトをビルド:
```bash
npm run build
```

4. MCPクライアント（例：Claude Desktop）の設定:
```json
{
  "mcpServers": {
    "openapi": {
      "command": "node",
      "args": ["/path/to/openapi-mcp-server/build/index.js"]
    }
  }
}
```

## 使用方法

### サーバーの起動

```bash
# 自動再起動付き開発モード
npm run dev

# 本番モード
npm start

# TypeScriptファイルのビルド
npm run build
```

### ワークフローの例

1. **OpenAPI仕様の読み込み**:
   - `load_openapi_from_file`を使用してローカルの仕様を読み込み
   - `load_openapi_from_url`を使用してURLから読み込み

2. **APIの探索**:
   - `list_paths`を使用してすべての利用可能なエンドポイントを確認
   - `get_path_details`を使用して特定のエンドポイントを検査
   - `list_schemas`を使用してデータモデルを探索

3. **セキュリティの分析**:
   - `list_security_schemes`を使用して認証方法を理解
   - 特定のパスのセキュリティ要件を確認

4. **検索とフィルタリング**:
   - 検索ツールを使用して特定のパス、スキーマ、レスポンスを検索
   - HTTPメソッド、タグ、プロパティでフィルタリング

## 開発

### 新しいツールの追加

1. `src/tools/`配下に新しいディレクトリを作成:
```
src/tools/your-tool/
├── index.ts          # ツール登録
├── tool.ts           # ツール実装
├── handler.ts        # ビジネスロジック
├── repository.ts     # データベース操作
├── types.ts          # TypeScript型定義
└── validation.ts     # 入力検証
```

2. ツールインターフェースの実装:
```typescript
export class YourTool extends ToolBase {
  name = "your_tool_name";
  description = "ツールの説明";
  
  inputSchema = {
    type: "object",
    properties: {
      // 入力パラメータの定義
    }
  };
  
  async execute(params: YourParams): Promise<YourResponse> {
    // 実装
  }
}
```

3. `src/tools/index.ts`にツールを登録

### テスト

```bash
# テストの実行
npm test

# カバレッジ付きテストの実行
npm run test:coverage
```

### コードスタイル

- TypeScriptストリクトモードを使用
- 適切な場所で関数型プログラミングの原則に従う
- テスタビリティのために依存性注入を実装
- 非同期操作にはasync/awaitを使用

## 設定

サーバーは環境変数と設定ファイルを使用します:

- `PORT`: HTTPサーバーポート（デフォルト: 3000）
- `LOG_LEVEL`: ログの詳細度（デフォルト: info）
- `DB_PATH`: データベースファイルの場所（デフォルト: ./data/openapi.db）
- `WATCH_ENABLED`: ファイル監視を有効化（デフォルト: true）

## トラブルシューティング

### よくある問題

1. **データベースロックエラー**:
   - サーバーのインスタンスが1つだけ実行されていることを確認
   - dataディレクトリのファイル権限を確認

2. **ファイル監視の制限**:
   - Linuxの場合、inotify監視を増やす: `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf`

3. **メモリの問題**:
   - 大規模な仕様の場合、Node.jsのメモリを増やす: `node --max-old-space-size=4096 build/index.js`

### デバッグモード

デバッグログを有効化:
```bash
LOG_LEVEL=debug npm start
```

## ライセンス

[ライセンスをここに記載]

## コントリビューション

1. リポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更を実施
4. 新機能のテストを追加
5. プルリクエストを送信

詳細は[CONTRIBUTING.md](./CONTRIBUTING.md)を参照してください