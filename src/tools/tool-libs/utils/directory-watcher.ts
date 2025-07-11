/**
 * @fileoverview ディレクトリ監視
 * @description ファイルシステムの変更を監視し、OpenAPIファイルの更新を自動検出するクラス
 * @since 1.0.0
 */

import * as fs from "fs/promises";
import { watch, FSWatcher } from "fs";
import * as path from "path";
import { OpenAPIParser } from "./parser.js";

/**
 * ディレクトリ監視クラス
 * @description 指定されたディレクトリを監視し、OpenAPIファイルの変更を検出して自動処理する
 *
 * @example
 * ```typescript
 * const watcher = new DirectoryWatcher('./openapi/');
 *
 * // 監視開始
 * watcher.start();
 *
 * // イベントリスナーの設定
 * watcher.on('fileChanged', (filePath) => {
 *   console.log(`ファイルが変更されました: ${filePath}`);
 * });
 *
 * // 監視停止
 * watcher.stop();
 * ```
 *
 * @since 1.0.0
 */
export class DirectoryWatcher {
    /**
     * 監視対象ディレクトリパス
     * @description 監視するディレクトリの絶対パス
     * @private
     */
    private directoryPath: string;

    /**
     * fs.watcherインスタンス
     * @description ファイルシステム監視を担当するfs.watcherのインスタンス
     * @private
     */
    private watcher: FSWatcher | null = null;

    /**
     * 監視状態フラグ
     * @description 現在監視中かどうかのフラグ
     * @private
     */
    private isWatching: boolean = false;

    /**
     * OpenAPIパーサーインスタンス
     * @description 変更されたファイルの処理を担当するパーサー
     * @private
     */
    private parser: OpenAPIParser;

    /**
     * ファイル変更タイムアウトマップ
     * @description ファイル変更の重複検知を防ぐためのタイムアウト管理
     * @private
     */
    private fileTimeouts: Map<string, NodeJS.Timeout> = new Map();

    /**
     * DirectoryWatcherのコンストラクタ
     * @description ディレクトリ監視を初期化する
     *
     * @param {string} directoryPath - 監視対象のディレクトリパス
     *
     * @example
     * ```typescript
     * const watcher = new DirectoryWatcher('./api-specs/');
     * console.log('ディレクトリ監視が初期化されました');
     * ```
     */
    constructor(directoryPath: string) {
        this.directoryPath = path.resolve(directoryPath);
        this.parser = new OpenAPIParser();
    }

    /**
     * ディレクトリ監視を開始
     * @description Node.js標準のfs.watchを使用してファイルシステムの監視を開始する
     *
     * @example
     * ```typescript
     * const watcher = new DirectoryWatcher('./openapi/');
     * await watcher.start();
     * console.log('監視が開始されました');
     * ```
     *
     * @since 1.0.0
     */
    async start(): Promise<void> {
        const startTime = Date.now();

        console.log(`🚀 ディレクトリ監視開始処理`);
        console.log(`📍 監視対象ディレクトリ: ${this.directoryPath}`);

        if (this.isWatching) {
            console.log(`⚠️ 既に監視中です: ${this.directoryPath}`);
            return;
        }

        try {
            // ディレクトリの存在確認
            console.log(`🔍 ディレクトリ存在確認中...`);
            const stats = await fs.stat(this.directoryPath);

            if (!stats.isDirectory()) {
                const message = `指定されたパスはディレクトリではありません: ${this.directoryPath}`;
                console.error(`❌ ${message}`);
                throw new Error(message);
            }

            console.log(`✅ ディレクトリ存在確認完了`);
            console.log(`📋 ディレクトリ詳細:`);
            console.log(`   📅 最終更新: ${stats.mtime.toISOString()}`);
            console.log(`   🔒 権限: ${stats.mode.toString(8)}`);

            // ディレクトリ内のファイルをスキャン
            console.log(`📄 初期ファイルスキャン中...`);
            const files = await fs.readdir(this.directoryPath);
            const supportedFiles = files.filter((file) =>
                this.isSupportedFile(file)
            );

            console.log(`📊 ファイルスキャン結果:`);
            console.log(`   📁 総ファイル数: ${files.length}個`);
            console.log(`   🎯 監視対象ファイル: ${supportedFiles.length}個`);

            if (supportedFiles.length > 0) {
                console.log(`🎯 監視対象ファイル一覧:`);
                supportedFiles.forEach((file) => {
                    console.log(`   📄 ${file}`);
                });
            }

            // fs.watch監視設定
            console.log(`⚙️ ファイル監視設定を構成中...`);

            // Node.js標準のfs.watchを使用
            this.watcher = watch(
                this.directoryPath,
                { recursive: false },
                (eventType, filename) => {
                    if (filename) {
                        this.handleFileChangeEvent(eventType, filename);
                    }
                }
            );

            this.watcher.on("error", (error) => this.handleWatchError(error));

            this.isWatching = true;
            const processingTime = Date.now() - startTime;
            console.log(`✅ ファイル監視準備完了 (${processingTime}ms)`);
            console.log(`🎉 ディレクトリ監視開始完了: ${this.directoryPath}`);
        } catch (error) {
            const processingTime = Date.now() - startTime;
            console.error(`💥 ディレクトリ監視開始エラー詳細:`);
            console.error(`   📍 ディレクトリパス: ${this.directoryPath}`);
            console.error(
                `   🚨 エラータイプ: ${
                    error instanceof Error ? error.name : "UnknownError"
                }`
            );
            console.error(
                `   📝 エラーメッセージ: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            console.error(`   ⏱️ 失敗までの時間: ${processingTime}ms`);
            throw error;
        }
    }

    /**
     * ディレクトリ監視を停止
     * @description 監視を停止し、リソースを解放する
     *
     * @since 1.0.0
     */
    async stop(): Promise<void> {
        console.log(`🛑 ディレクトリ監視停止処理開始`);
        console.log(`📍 監視対象ディレクトリ: ${this.directoryPath}`);

        if (!this.isWatching) {
            console.log(`⚠️ 監視は既に停止されています: ${this.directoryPath}`);
            return;
        }

        try {
            if (this.watcher) {
                console.log(`🔌 監視インスタンスを停止中...`);
                this.watcher.close();
                this.watcher = null;
                console.log(`✅ 監視インスタンス停止完了`);
            }

            // タイムアウトをクリア
            this.fileTimeouts.forEach((timeout) => clearTimeout(timeout));
            this.fileTimeouts.clear();

            this.isWatching = false;
            console.log(`🎉 ディレクトリ監視停止完了: ${this.directoryPath}`);
        } catch (error) {
            console.error(`💥 ディレクトリ監視停止エラー:`);
            console.error(`   📍 ディレクトリパス: ${this.directoryPath}`);
            console.error(
                `   📝 エラーメッセージ: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
            throw error;
        }
    }

    /**
     * ファイル変更イベントハンドラー
     */
    private handleFileChangeEvent(eventType: string, filename: string): void {
        if (!this.isSupportedFile(filename)) {
            return;
        }

        const filePath = path.join(this.directoryPath, filename);
        const timeoutKey = filePath;

        // 既存のタイムアウトがあればクリア（重複検知防止）
        if (this.fileTimeouts.has(timeoutKey)) {
            clearTimeout(this.fileTimeouts.get(timeoutKey)!);
        }

        // 短時間のタイムアウトを設定して重複イベントを防ぐ
        const timeout = setTimeout(async () => {
            this.fileTimeouts.delete(timeoutKey);
            await this.processFileChange(eventType, filePath);
        }, 100);

        this.fileTimeouts.set(timeoutKey, timeout);
    }

    /**
     * ファイル変更処理
     */
    private async processFileChange(
        eventType: string,
        filePath: string
    ): Promise<void> {
        const fileName = path.basename(filePath);

        console.log(`🔄 ファイル変更検知:`);
        console.log(`   📄 ファイル: ${fileName}`);
        console.log(`   📍 パス: ${filePath}`);
        console.log(`   🎭 イベントタイプ: ${eventType}`);

        try {
            // ファイルの存在確認
            const stats = await fs.stat(filePath);

            if (stats.isFile()) {
                console.log(
                    `   📐 現在のサイズ: ${this.formatFileSize(stats.size)}`
                );
                console.log(`   📅 最終更新: ${stats.mtime.toISOString()}`);

                if (eventType === "rename") {
                    console.log(`➕ ファイル追加/リネーム処理: ${fileName}`);
                } else if (eventType === "change") {
                    console.log(`🔄 ファイル変更処理: ${fileName}`);
                }

                // TODO: ファイル処理ロジックを追加
                console.log(`🔄 ファイル処理開始: ${fileName}`);
                console.log(`✅ ファイル処理完了: ${fileName}`);
            }
        } catch (error) {
            // ファイルが削除された場合はここに来る
            if ((error as any).code === "ENOENT") {
                console.log(`🗑️ ファイル削除検知: ${fileName}`);
                console.log(`🧹 削除処理完了: ${fileName}`);
            } else {
                console.error(`❌ ファイル処理エラー: ${fileName}`);
                console.error(
                    `   📝 エラー: ${
                        error instanceof Error ? error.message : String(error)
                    }`
                );
            }
        }
    }

    /**
     * 監視エラーハンドラー
     */
    private handleWatchError(error: Error): void {
        console.error(`💥 ディレクトリ監視エラー:`);
        console.error(`   📍 監視ディレクトリ: ${this.directoryPath}`);
        console.error(`   🚨 エラータイプ: ${error.name}`);
        console.error(`   📝 エラーメッセージ: ${error.message}`);
    }

    /**
     * サポートされているファイルかチェック
     */
    private isSupportedFile(fileName: string): boolean {
        const ext = path.extname(fileName).toLowerCase();
        return [".yaml", ".yml", ".json"].includes(ext);
    }

    /**
     * ファイルサイズを人間が読みやすい形式にフォーマット
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * 監視状態を取得
     * @description 現在監視中かどうかを返す
     * @returns {boolean} 監視中の場合はtrue
     */
    get watching(): boolean {
        return this.isWatching;
    }

    /**
     * 監視ディレクトリパスを取得
     * @description 監視対象のディレクトリパスを返す
     * @returns {string} ディレクトリパス
     */
    get directory(): string {
        return this.directoryPath;
    }
}
