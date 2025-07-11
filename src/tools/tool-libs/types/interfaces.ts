/**
 * 後方互換性のための再エクスポートファイル
 * 新しいコードでは ./types.js から直接インポートすることを推奨
 * @deprecated 新しいコードでは ./types.js を使用してください
 */

// 全ての型定義を新しい types.ts から再エクスポート
export type {
    // 基盤型
    Result,
    BusinessLogicResult,
    ValidationResult,

    // データベース関連型
    IDatabaseConnection,
    IDatabaseManager,
    IDependencyConfig,
    DIContainerConfig,

    // リポジトリインターフェース
    IOpenAPIRepository,
    IServerRepository,
    IPathRepository,
    ISchemaRepository,
    ISecurityRepository,
    IResponseRepository,

    // OpenAPI仕様関連型
    OpenAPISpec,

    // ファイル処理関連型
    FileLoadResult,
    URLLoadResult,
    DirectoryScanResult,
    FileLoaderConfig,

    // バリデーション関連型
    OpenAPIValidationResult,

    // 抽出・処理関連型
    ExtractedOpenAPIData,
    ProcessingResult,
    ProcessorConfig,

    // ストレージ関連型
    StorageResult,
    StorageServiceConfig,

    // 外部ツール型参照
    OpenAPIRecord,
    ServerRecord,
    PathRecord,
    SchemaRecord,
    SecuritySchemeRecord,
    ResponseRecord,
} from "./index.js";
