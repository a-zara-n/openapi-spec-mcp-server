/**
 * @fileoverview DIコンテナ
 * @description 依存性注入（Dependency Injection）のためのコンテナクラス
 * @since 1.0.0
 */

/**
 * サービスファクトリー関数の型定義
 * @description DIコンテナでサービスを生成するファクトリー関数の型
 */
export type ServiceFactory = (container: DIContainer) => any;

/**
 * 依存性注入コンテナ
 * @description サービスやリポジトリの依存関係を管理し、インスタンスの生成と注入を行う
 *
 * @example
 * ```typescript
 * const container = new DIContainer();
 *
 * // サービスの登録
 * container.register('userRepository', () => new UserRepository());
 * container.register('userService', (c) => new UserService(c.get('userRepository')));
 *
 * // サービスの取得
 * const userService = container.get('userService');
 * ```
 *
 * @since 1.0.0
 */
export class DIContainer {
    /**
     * サービスファクトリーのマップ
     * @description 登録されたサービスの生成ファクトリー関数を格納
     * @private
     */
    private services: Map<string, ServiceFactory> = new Map();

    /**
     * インスタンスキャッシュ
     * @description 一度生成されたインスタンスをキャッシュ（シングルトン）
     * @private
     */
    private instances: Map<string, any> = new Map();

    /**
     * サービスを登録
     * @description 指定されたキーに対してサービスファクトリーを登録する
     *
     * @param {string} key - サービスのキー（一意識別子）
     * @param {ServiceFactory} factory - サービスを生成するファクトリー関数
     *
     * @example
     * ```typescript
     * const container = new DIContainer();
     *
     * // シンプルなサービス登録
     * container.register('logger', () => new Logger());
     *
     * // 依存関係のあるサービス登録
     * container.register('userService', (container) => {
     *   return new UserService(container.get('logger'));
     * });
     * ```
     *
     * @since 1.0.0
     */
    register(key: string, factory: ServiceFactory): void {
        this.services.set(key, factory);
    }

    /**
     * サービスを取得
     * @description 指定されたキーのサービスインスタンスを取得する（シングルトン）
     *
     * @template T - 取得するサービスの型
     * @param {string} key - サービスのキー
     * @returns {T} サービスインスタンス
     *
     * @throws {Error} 指定されたキーのサービスが登録されていない場合
     *
     * @example
     * ```typescript
     * const container = new DIContainer();
     * container.register('userService', () => new UserService());
     *
     * // サービスの取得（型安全）
     * const userService = container.get<UserService>('userService');
     *
     * // 2回目の取得では同じインスタンスが返される
     * const sameInstance = container.get<UserService>('userService');
     * console.log(userService === sameInstance); // true
     * ```
     *
     * @since 1.0.0
     */
    get<T>(key: string): T {
        // キャッシュから既存インスタンスを取得
        if (this.instances.has(key)) {
            return this.instances.get(key);
        }

        // ファクトリーを取得
        const factory = this.services.get(key);
        if (!factory) {
            throw new Error(`Service not found: ${key}`);
        }

        // インスタンスを生成
        const instance = factory(this);

        // キャッシュに保存
        this.instances.set(key, instance);

        return instance;
    }
}
