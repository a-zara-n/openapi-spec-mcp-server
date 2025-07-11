/**
 * tool-libs 統合エクスポートファイル
 * 新しいディレクトリ構造で整理された共通実装と型定義を提供
 */

// =============================================================================
// 統合型定義（全ての型定義を一箇所から提供）
// =============================================================================
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
} from "./types/index.js";

// =============================================================================
// コア機能（データベース、DI、バリデーション）
// =============================================================================
export {
    // データベース関連
    DatabaseManager,
    SQLiteDatabaseConnection,

    // DI関連
    DIContainer,
    RepositoryFactory,

    // バリデーション関連
    validateArgs,
} from "./core/index.js";

// =============================================================================
// ユーティリティ（レスポンスフォーマッター、パーサー等）
// =============================================================================
export {
    // レスポンスフォーマッター
    BaseResponseFormatter,

    // パーサー関連
    OpenAPIParser,
    openAPIParser,
    parseAndStoreOpenAPI,

    // ディレクトリ監視
    DirectoryWatcher,
} from "./utils/index.js";

// =============================================================================
// パーサー関連（専門パーサー）
// =============================================================================
export {
    OpenAPIContentParser,
    openAPIContentParser,
} from "./parsers/content-parser.js";

export { OpenAPIValidator } from "./parsers/validator.js";

export { OpenAPIExtractor, openAPIExtractor } from "./parsers/extractor.js";

// =============================================================================
// サービス関連（高レベル処理）
// =============================================================================
export { OpenAPIFileLoader, createFileLoader } from "./services/file-loader.js";

export {
    OpenAPIProcessor,
    createOpenAPIProcessor,
} from "./services/openapi-processor.js";

export {
    OpenAPIStorageService,
    createStorageService,
} from "./services/storage-service.js";

// =============================================================================
// 後方互換性エクスポート（非推奨）
// =============================================================================

/** @deprecated 新しいコードでは型定義を types/index.js から直接インポートしてください */
export * from "./types/interfaces.js";
