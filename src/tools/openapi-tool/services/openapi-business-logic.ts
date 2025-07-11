/**
 * @fileoverview OpenAPIビジネスロジックサービス
 * @description OpenAPI仕様に関するビジネスロジックを処理するサービス
 * @since 1.0.0
 */

import { resolve } from "path";
import { RepositoryFactory } from "@/tools/tool-libs/core/index.js";
import { openAPIParser } from "@/tools/tool-libs/utils/parser.js";
import { BusinessLogicResult } from "@/tools/tool-libs/types/index.js";

/**
 * OpenAPI一覧の結果型
 * @description OpenAPI一覧取得の成功時の結果データ構造
 *
 * @example
 * ```typescript
 * const result: OpenAPIListResult = {
 *   openapi_files: {
 *     "petstore": {
 *       title: "Swagger Petstore",
 *       summary: "ペットストアAPI",
 *       version: "1.0.0"
 *     }
 *   }
 * };
 * ```
 */
export interface OpenAPIListResult {
    /** OpenAPIファイル情報のマップ（キー：ファイル名、値：ファイル情報） */
    openapi_files: {
        [key: string]: {
            /** APIタイトル */
            title: string;
            /** API概要 */
            summary: string;
            /** APIバージョン */
            version: string;
        };
    };
}

/**
 * サーバー情報設定の結果型
 * @description サーバー情報設定の成功時の結果データ構造
 *
 * @example
 * ```typescript
 * const result: SetServerInfoResult = {
 *   status: "success",
 *   message: "3個のOpenAPIファイルを正常に読み込みました。"
 * };
 * ```
 */
export interface SetServerInfoResult {
    /** 処理ステータス（"success" | "error"） */
    status: string;
    /** 処理結果メッセージ */
    message: string;
}

/**
 * OpenAPIのビジネスロジックサービス
 * @description OpenAPI仕様の取得、設定、管理を行うビジネスロジック層
 *
 * @example
 * ```typescript
 * const service = new OpenAPIBusinessLogicService();
 *
 * // OpenAPI一覧取得
 * const listResult = await service.getOpenAPIList();
 * if (listResult.success) {
 *   console.log('OpenAPI一覧:', listResult.data.openapi_files);
 * }
 *
 * // サーバー情報設定
 * const setResult = await service.setServerInfo('./openapi/');
 * if (setResult.success) {
 *   console.log('設定完了:', setResult.data.message);
 * }
 * ```
 *
 * @since 1.0.0
 */
export class OpenAPIBusinessLogicService {
    /**
     * OpenAPIリポジトリインスタンス
     * @description データベースアクセスを担当するリポジトリ
     * @private
     */
    private openAPIRepository = RepositoryFactory.createOpenAPIRepository();

    /**
     * OpenAPI一覧を取得
     * @description データベースに登録されている全てのOpenAPI仕様の一覧を取得する
     *
     * @returns {Promise<BusinessLogicResult<OpenAPIListResult>>} OpenAPI一覧の取得結果
     *
     * @example
     * ```typescript
     * const service = new OpenAPIBusinessLogicService();
     * const result = await service.getOpenAPIList();
     *
     * if (result.success) {
     *   const openapis = result.data.openapi_files;
     *   Object.keys(openapis).forEach(name => {
     *     console.log(`${name}: ${openapis[name].title} v${openapis[name].version}`);
     *   });
     * } else {
     *   console.error('エラー:', result.error);
     * }
     * ```
     *
     * @throws {Error} データベースアクセス時にエラーが発生した場合
     * @since 1.0.0
     */
    async getOpenAPIList(): Promise<BusinessLogicResult<OpenAPIListResult>> {
        try {
            // OpenAPI一覧を取得
            const openapis = this.openAPIRepository.getAllOpenAPIs();

            // 設計仕様に合わせてJSON形式で結果を整形
            const openapi_files: {
                [key: string]: {
                    title: string;
                    summary: string;
                    version: string;
                };
            } = {};

            openapis.forEach((api: any) => {
                openapi_files[api.name] = {
                    title: api.title || "",
                    summary: api.summary || "",
                    version: api.version || "",
                };
            });

            return {
                success: true,
                data: { openapi_files },
            };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "OpenAPI一覧取得中にエラーが発生しました",
            };
        }
    }

    /**
     * サーバー情報を設定
     * @description 指定されたパスからOpenAPIファイルを読み込み、データベースに保存する
     *
     * @param {string} path - 読み込み対象のファイルパスまたはディレクトリパス
     * @returns {Promise<BusinessLogicResult<SetServerInfoResult>>} サーバー情報設定の実行結果
     *
     * @example
     * ```typescript
     * const service = new OpenAPIBusinessLogicService();
     *
     * // 単一ファイルの場合
     * const result1 = await service.setServerInfo('./openapi/petstore.yaml');
     *
     * // ディレクトリの場合
     * const result2 = await service.setServerInfo('./openapi/');
     *
     * if (result2.success) {
     *   console.log('ステータス:', result2.data.status);
     *   console.log('メッセージ:', result2.data.message);
     * }
     * ```
     *
     * @throws {Error} ファイル読み込み時やデータベース保存時にエラーが発生した場合
     * @since 1.0.0
     */
    async setServerInfo(
        path: string
    ): Promise<BusinessLogicResult<SetServerInfoResult>> {
        try {
            // 絶対パスに変換
            const absolutePath = resolve(path);

            console.log(`🔍 OpenAPIファイル読み込み開始: ${absolutePath}`);

            // ディレクトリからOpenAPIファイルを読み込み
            const results = await openAPIParser.loadOpenAPIFilesFromDirectory(
                absolutePath
            );

            // 結果の集計
            const successfulLoads = results.filter((r: any) => r.success);
            const failedLoads = results.filter((r: any) => !r.success);

            let message: string;
            let status: string;

            if (results.length === 0) {
                message =
                    "指定されたディレクトリにOpenAPIファイルが見つかりませんでした。";
                status = "error";
            } else if (failedLoads.length === 0) {
                message = `${successfulLoads.length}個のOpenAPIファイルを正常に読み込みました。`;
                status = "success";
                if (successfulLoads.length > 0) {
                    message += `\n読み込まれたファイル: ${successfulLoads
                        .map((r: any) => r.name)
                        .join(", ")}`;
                }
            } else {
                message = `${successfulLoads.length}個のファイルが成功、${failedLoads.length}個のファイルが失敗しました。`;
                status = successfulLoads.length > 0 ? "success" : "error";
                if (successfulLoads.length > 0) {
                    message += `\n成功: ${successfulLoads
                        .map((r: any) => r.name)
                        .join(", ")}`;
                }
                if (failedLoads.length > 0) {
                    message += `\n失敗: ${failedLoads
                        .map((r: any) => r.message)
                        .join("; ")}`;
                }
            }

            console.log(
                `✅ OpenAPIファイル読み込み完了: ${successfulLoads.length}個成功`
            );

            return {
                success: true,
                data: { status, message },
            };
        } catch (error) {
            console.error("❌ Set Server Info エラー:", error);

            const errorMessage = `OpenAPIファイル読み込みエラー: ${
                error instanceof Error ? error.message : "Unknown error"
            }`;

            return {
                success: true, // エラーでもレスポンスは返す
                data: {
                    status: "error",
                    message: errorMessage,
                },
            };
        }
    }
}
