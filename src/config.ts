/**
 * @fileoverview 設定管理
 * @description アプリケーション全体の設定を管理するモジュール
 * @since 1.0.0
 */

import { readFileSync } from "fs";
import { join } from "path";

/**
 * OpenAPIサーバー設定インターフェース
 * @description サーバー設定の型定義
 */
interface ServerConfig {
    /** サーバーポート番号 */
    port: number;
    /** サーバーホスト名 */
    host: string;
    /** データベースファイルパス（実行時に絶対パスに変換される） */
    dbPath: string;
}

/**
 * OpenAPI設定インターフェース
 * @description OpenAPI関連の設定の型定義
 */
interface OpenAPIConfig {
    /** OpenAPIファイル配置ディレクトリ（実行時に絶対パスに変換される） */
    directory: string;
    /** サポートする拡張子 */
    supportedExtensions: string[];
}

/**
 * アプリケーション設定インターフェース
 * @description アプリケーション全体の設定の型定義
 */
interface AppConfig {
    /** サーバー設定 */
    server: ServerConfig;
    /** OpenAPI設定 */
    openapi: OpenAPIConfig;
}

/**
 * デフォルト設定
 * @description アプリケーションのデフォルト設定値
 * 注意: これらのパスは相対パス表記ですが、実行時にprocess.cwd()ベースの絶対パスに変換されます
 *
 * @example
 * ```typescript
 * // デフォルト設定の取得
 * console.log('データベースパス:', DEFAULT_CONFIG.server.dbPath);
 * console.log('OpenAPIディレクトリ:', DEFAULT_CONFIG.openapi.directory);
 * ```
 */
export const DEFAULT_CONFIG: AppConfig = {
    server: {
        port: 3000,
        host: "localhost",
        dbPath: "./data/openapi.db", // プロジェクトルートからの相対パス → 絶対パス変換される
    },
    openapi: {
        directory: "./data/openapi", // プロジェクトルートからの相対パス → 絶対パス変換される
        supportedExtensions: [".yaml", ".yml", ".json"],
    },
};

/**
 * パッケージ情報を取得
 * @description package.jsonからアプリケーション情報を読み込む
 *
 * @returns {object} パッケージ情報
 * @returns {string} returns.name - アプリケーション名
 * @returns {string} returns.version - バージョン
 * @returns {string} returns.description - 説明
 *
 * @example
 * ```typescript
 * const pkg = getPackageInfo();
 * console.log(`${pkg.name} v${pkg.version}`);
 * console.log(pkg.description);
 * ```
 */
export function getPackageInfo() {
    try {
        const packagePath = join(__dirname, "../package.json");
        const packageJson = JSON.parse(readFileSync(packagePath, "utf-8"));
        return {
            name: packageJson.name || "openapi-mcp-server",
            version: packageJson.version || "1.0.0",
            description: packageJson.description || "OpenAPI MCP Server",
        };
    } catch (error) {
        return {
            name: "openapi-mcp-server",
            version: "1.0.0",
            description: "OpenAPI MCP Server",
        };
    }
}
