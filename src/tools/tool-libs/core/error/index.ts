/**
 * @fileoverview 共通エラーハンドリングシステム
 * @description 統一されたエラー処理、分類、メッセージ生成機能を提供
 * @since 1.0.0
 */

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * エラーの種類
 */
export enum ErrorType {
    // システム系エラー
    DATABASE = "DATABASE",
    FILE_SYSTEM = "FILE_SYSTEM",
    NETWORK = "NETWORK",
    CONFIGURATION = "CONFIGURATION",

    // 入力・データ系エラー
    VALIDATION = "VALIDATION",
    PARSING = "PARSING",
    AUTHENTICATION = "AUTHENTICATION",
    AUTHORIZATION = "AUTHORIZATION",

    // ビジネスロジック系エラー
    NOT_FOUND = "NOT_FOUND",
    ALREADY_EXISTS = "ALREADY_EXISTS",
    BUSINESS_RULE = "BUSINESS_RULE",

    // 実行時エラー
    TIMEOUT = "TIMEOUT",
    MEMORY = "MEMORY",
    INTERNAL = "INTERNAL",
    EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
}

/**
 * エラーの重要度レベル
 */
export enum ErrorLevel {
    INFO = "INFO", // 情報提供
    WARNING = "WARNING", // 警告
    ERROR = "ERROR", // エラー
    CRITICAL = "CRITICAL", // 致命的エラー
}

/**
 * エラー詳細情報
 */
export interface ErrorDetails {
    /** エラーの種類 */
    type: ErrorType;
    /** エラーレベル */
    level: ErrorLevel;
    /** エラーコード */
    code: string;
    /** 日本語エラーメッセージ */
    message: string;
    /** 技術的な詳細 */
    technicalDetails?: string;
    /** 解決策の提案 */
    solution?: string;
    /** 関連するファイルパス */
    filePath?: string;
    /** 関連する設定項目 */
    configKey?: string;
    /** 実行時のコンテキスト */
    context?: Record<string, any>;
    /** 原因となったエラー */
    originalError?: Error;
    /** 発生タイムスタンプ */
    timestamp: Date;
}

/**
 * 詳細エラークラス
 */
export class DetailedError extends Error {
    public readonly details: ErrorDetails;

    constructor(details: Omit<ErrorDetails, "timestamp">) {
        super(details.message);
        this.name = "DetailedError";
        this.details = {
            ...details,
            timestamp: new Date(),
        };
    }

    /**
     * エラーの完全な文字列表現を取得
     */
    toString(): string {
        return `[${this.details.code}] ${this.details.message}`;
    }

    /**
     * 開発者向けの詳細情報を取得
     */
    toDebugString(): string {
        const parts = [
            `🚨 エラー詳細 [${this.details.code}]`,
            `📍 種類: ${this.details.type}`,
            `⚠️ レベル: ${this.details.level}`,
            `💬 メッセージ: ${this.details.message}`,
        ];

        if (this.details.technicalDetails) {
            parts.push(`🔧 技術詳細: ${this.details.technicalDetails}`);
        }

        if (this.details.solution) {
            parts.push(`💡 解決策: ${this.details.solution}`);
        }

        if (this.details.filePath) {
            parts.push(`📄 ファイル: ${this.details.filePath}`);
        }

        if (this.details.configKey) {
            parts.push(`⚙️ 設定項目: ${this.details.configKey}`);
        }

        if (
            this.details.context &&
            Object.keys(this.details.context).length > 0
        ) {
            parts.push(
                `📋 コンテキスト: ${JSON.stringify(
                    this.details.context,
                    null,
                    2
                )}`
            );
        }

        if (this.details.originalError) {
            parts.push(`🔗 元エラー: ${this.details.originalError.message}`);
            if (this.details.originalError.stack) {
                parts.push(
                    `📚 スタック: ${this.details.originalError.stack
                        .split("\n")
                        .slice(0, 3)
                        .join(" | ")}`
                );
            }
        }

        parts.push(`⏰ 発生時刻: ${this.details.timestamp.toISOString()}`);

        return parts.join("\n   ");
    }
}

/**
 * エラーハンドリングマネージャー
 */
export class ErrorManager {
    /**
     * データベース関連エラーを作成
     */
    static createDatabaseError(
        code: string,
        message: string,
        options: {
            technicalDetails?: string;
            filePath?: string;
            originalError?: Error;
            context?: Record<string, any>;
        } = {}
    ): DetailedError {
        return new DetailedError({
            type: ErrorType.DATABASE,
            level: ErrorLevel.ERROR,
            code: `DB_${code}`,
            message: `データベースエラー: ${message}`,
            technicalDetails: options.technicalDetails,
            solution: this.getDatabaseSolution(code),
            filePath: options.filePath,
            context: options.context,
            originalError: options.originalError,
        });
    }

    /**
     * ファイルシステム関連エラーを作成
     */
    static createFileSystemError(
        code: string,
        message: string,
        filePath: string,
        options: {
            technicalDetails?: string;
            originalError?: Error;
            context?: Record<string, any>;
        } = {}
    ): DetailedError {
        return new DetailedError({
            type: ErrorType.FILE_SYSTEM,
            level: ErrorLevel.ERROR,
            code: `FS_${code}`,
            message: `ファイルエラー: ${message}`,
            technicalDetails: options.technicalDetails,
            solution: this.getFileSystemSolution(code),
            filePath,
            context: options.context,
            originalError: options.originalError,
        });
    }

    /**
     * バリデーション関連エラーを作成
     */
    static createValidationError(
        code: string,
        message: string,
        options: {
            technicalDetails?: string;
            context?: Record<string, any>;
            originalError?: Error;
        } = {}
    ): DetailedError {
        return new DetailedError({
            type: ErrorType.VALIDATION,
            level: ErrorLevel.WARNING,
            code: `VAL_${code}`,
            message: `入力値エラー: ${message}`,
            technicalDetails: options.technicalDetails,
            solution: this.getValidationSolution(code),
            context: options.context,
            originalError: options.originalError,
        });
    }

    /**
     * 設定関連エラーを作成
     */
    static createConfigurationError(
        code: string,
        message: string,
        configKey?: string,
        options: {
            technicalDetails?: string;
            context?: Record<string, any>;
            originalError?: Error;
        } = {}
    ): DetailedError {
        return new DetailedError({
            type: ErrorType.CONFIGURATION,
            level: ErrorLevel.CRITICAL,
            code: `CFG_${code}`,
            message: `設定エラー: ${message}`,
            technicalDetails: options.technicalDetails,
            solution: this.getConfigurationSolution(code),
            configKey,
            context: options.context,
            originalError: options.originalError,
        });
    }

    /**
     * パース関連エラーを作成
     */
    static createParsingError(
        code: string,
        message: string,
        filePath?: string,
        options: {
            technicalDetails?: string;
            context?: Record<string, any>;
            originalError?: Error;
        } = {}
    ): DetailedError {
        return new DetailedError({
            type: ErrorType.PARSING,
            level: ErrorLevel.ERROR,
            code: `PARSE_${code}`,
            message: `解析エラー: ${message}`,
            technicalDetails: options.technicalDetails,
            solution: this.getParsingSolution(code),
            filePath,
            context: options.context,
            originalError: options.originalError,
        });
    }

    /**
     * 見つからないエラーを作成
     */
    static createNotFoundError(
        code: string,
        message: string,
        options: {
            technicalDetails?: string;
            context?: Record<string, any>;
        } = {}
    ): DetailedError {
        return new DetailedError({
            type: ErrorType.NOT_FOUND,
            level: ErrorLevel.WARNING,
            code: `NF_${code}`,
            message: `見つかりません: ${message}`,
            technicalDetails: options.technicalDetails,
            solution: this.getNotFoundSolution(code),
            context: options.context,
        });
    }

    /**
     * 内部エラーを作成
     */
    static createInternalError(
        code: string,
        message: string,
        options: {
            technicalDetails?: string;
            context?: Record<string, any>;
            originalError?: Error;
        } = {}
    ): DetailedError {
        return new DetailedError({
            type: ErrorType.INTERNAL,
            level: ErrorLevel.CRITICAL,
            code: `INT_${code}`,
            message: `内部エラー: ${message}`,
            technicalDetails: options.technicalDetails,
            solution:
                "システム管理者に連絡してください。ログファイルを確認し、必要に応じてサーバーを再起動してください。",
            context: options.context,
            originalError: options.originalError,
        });
    }

    /**
     * DetailedErrorをCallToolResultに変換
     */
    static toCallToolResult(error: DetailedError): CallToolResult {
        const errorInfo = {
            error: true,
            type: error.details.type,
            level: error.details.level,
            code: error.details.code,
            message: error.details.message,
            solution: error.details.solution,
            timestamp: error.details.timestamp.toISOString(),
            ...(error.details.filePath && { filePath: error.details.filePath }),
            ...(error.details.configKey && {
                configKey: error.details.configKey,
            }),
            ...(error.details.context && { context: error.details.context }),
        };

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(errorInfo, null, 2),
                },
            ],
            isError: true,
        };
    }

    /**
     * 汎用エラーをDetailedErrorに変換
     */
    static fromGenericError(
        error: unknown,
        context?: Record<string, any>
    ): DetailedError {
        if (error instanceof DetailedError) {
            return error;
        }

        if (error instanceof Error) {
            return this.createInternalError("GENERIC", error.message, {
                technicalDetails: error.stack,
                context,
                originalError: error,
            });
        }

        return this.createInternalError(
            "UNKNOWN",
            "不明なエラーが発生しました",
            {
                technicalDetails: String(error),
                context,
            }
        );
    }

    /**
     * エラーログを出力
     */
    static logError(error: DetailedError, prefix?: string): void {
        const logPrefix = prefix ? `[${prefix}] ` : "";

        switch (error.details.level) {
            case ErrorLevel.INFO:
                console.info(`${logPrefix}ℹ️ ${error.toDebugString()}`);
                break;
            case ErrorLevel.WARNING:
                console.warn(`${logPrefix}⚠️ ${error.toDebugString()}`);
                break;
            case ErrorLevel.ERROR:
                console.error(`${logPrefix}❌ ${error.toDebugString()}`);
                break;
            case ErrorLevel.CRITICAL:
                console.error(`${logPrefix}💥 ${error.toDebugString()}`);
                break;
        }
    }

    // プライベートメソッド: 解決策生成

    private static getDatabaseSolution(code: string): string {
        const solutions: Record<string, string> = {
            CONNECTION:
                "データベースファイルのパスと権限を確認してください。ディスクの空き容量も確認してください。",
            QUERY: "SQLクエリの構文を確認してください。テーブルとカラム名が正しいかチェックしてください。",
            TRANSACTION:
                "トランザクションが適切にコミットされているか確認してください。並行アクセスの問題がないかチェックしてください。",
            LOCK: "データベースファイルが他のプロセスに使用されていないか確認してください。",
            SCHEMA: "データベーススキーマが最新版に更新されているか確認してください。",
        };
        return (
            solutions[code] ||
            "データベース設定とファイルの権限を確認してください。"
        );
    }

    private static getFileSystemSolution(code: string): string {
        const solutions: Record<string, string> = {
            NOT_FOUND:
                "ファイルパスが正しいか確認してください。ファイルが存在するかチェックしてください。",
            PERMISSION:
                "ファイルとディレクトリの読み取り権限を確認してください。",
            READ: "ファイルが破損していないか、適切な形式かを確認してください。",
            WRITE: "書き込み権限とディスクの空き容量を確認してください。",
            SIZE: "ファイルサイズが適切な範囲内かを確認してください。",
        };
        return (
            solutions[code] || "ファイルの存在、権限、形式を確認してください。"
        );
    }

    private static getValidationSolution(code: string): string {
        const solutions: Record<string, string> = {
            REQUIRED: "必須フィールドに値を入力してください。",
            FORMAT: "正しい形式で入力値を指定してください。",
            RANGE: "指定された範囲内の値を入力してください。",
            TYPE: "正しいデータ型で値を指定してください。",
        };
        return solutions[code] || "入力値の形式と必須項目を確認してください。";
    }

    private static getConfigurationSolution(code: string): string {
        const solutions: Record<string, string> = {
            MISSING:
                "設定ファイルが存在するか、環境変数が設定されているかを確認してください。",
            INVALID: "設定値の形式が正しいかを確認してください。",
            PORT: "ポート番号が使用可能で、他のプロセスに占有されていないかを確認してください。",
        };
        return solutions[code] || "設定ファイルと環境変数を確認してください。";
    }

    private static getParsingSolution(code: string): string {
        const solutions: Record<string, string> = {
            YAML: "YAMLファイルの構文が正しいかを確認してください。インデントとコロンの使用方法をチェックしてください。",
            JSON: "JSON形式が正しいかを確認してください。括弧とカンマの配置をチェックしてください。",
            OPENAPI:
                "OpenAPI仕様書の形式が正しいかを確認してください。必須フィールドが含まれているかチェックしてください。",
        };
        return solutions[code] || "ファイルの構文と形式を確認してください。";
    }

    private static getNotFoundSolution(code: string): string {
        const solutions: Record<string, string> = {
            OPENAPI:
                "指定されたOpenAPI名が正しいか確認してください。利用可能なOpenAPI一覧を確認してください。",
            PATH: "指定されたパスが存在するか確認してください。OpenAPI仕様書にパスが定義されているかチェックしてください。",
            SCHEMA: "指定されたスキーマ名が正しいか確認してください。",
        };
        return (
            solutions[code] || "指定された項目が存在するかを確認してください。"
        );
    }
}

/**
 * 型安全なエラーハンドリングヘルパー
 */
export class ErrorHandler {
    /**
     * 安全にエラーを処理し、CallToolResultを返す
     */
    static async handleSafely<T>(
        operation: () => Promise<T>,
        errorContext: {
            operationName: string;
            context?: Record<string, any>;
        }
    ): Promise<T | CallToolResult> {
        try {
            return await operation();
        } catch (error) {
            const detailedError = ErrorManager.fromGenericError(error, {
                operation: errorContext.operationName,
                ...errorContext.context,
            });

            ErrorManager.logError(detailedError, errorContext.operationName);
            return ErrorManager.toCallToolResult(detailedError);
        }
    }

    /**
     * バリデーション結果をチェックし、エラーの場合はCallToolResultを返す
     */
    static checkValidation<T>(
        result: { success: boolean; data?: T; error?: string },
        context?: Record<string, any>
    ): T | CallToolResult {
        if (!result.success) {
            const error = ErrorManager.createValidationError(
                "INVALID_INPUT",
                result.error || "入力値が正しくありません",
                { context }
            );

            ErrorManager.logError(error, "Validation");
            return ErrorManager.toCallToolResult(error);
        }

        return result.data!;
    }
}
