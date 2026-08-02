import ConfigData from "./ConfigData";
import ConfigLoader from "./ConfigLoader";

export type DotPath<T> = T extends object ? { [K in Extract<keyof T, string>]: T[K] extends object ? K | `${K}.${DotPath<T[K]>}` : K }[Extract<keyof T, string>] : never;
export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}` ? K extends keyof T ? PathValue<T[K], Rest> : never : P extends keyof T ? T[P] : never;

/**
 * Loads the environment variables and configuration files.
 *
 * This method must be called once during application startup before using
 * any configuration values.
 *
 * What it does:
 * - Loads variables from the `.env` file.
 * - Loads all configuration files from the `configs` directory.
 * - Generates the `ConfigData` TypeScript interface in development mode.
 *
 * @throws {Error}
 * Thrown if the `.env` file or configuration directory cannot be found.
 *
 * @example
 * ```ts
 * import { Load } from "./ConfigLoader";
 *
 * Load();
 * ```
 */
const Load = () => ConfigLoader.load();

/**
 * Loads all configuration files from the `configs` directory.
 *
 * Every supported configuration file (`.js`, `.cjs`, `.mjs`, or `.ts`)
 * is loaded and exposed through the configuration system using its file
 * name as the configuration key.
 *
 * The `app.dir` property is automatically added and contains the
 * application's root directory.
 *
 * @throws {Error}
 * Thrown if the `configs` directory cannot be found.
 *
 * @example
 * Directory structure:
 * ```text
 * configs/
 * ├── app.ts
 * ├── database.ts
 * └── mail.ts
 * ```
 *
 * Results in:
 * ```ts
 * {
 *   app: { ... },
 *   database: { ... },
 *   mail: { ... }
 * }
 * ```
 */
const LoadConfig = () => ConfigLoader.loadConfig();

/**
 * Returns a configuration value using a dot-separated key.
 *
 * The key is fully type-safe and autocompleted based on the generated
 * `ConfigData` interface. The returned value is automatically inferred
 * from the selected configuration path.
 *
 * @typeParam P - A valid configuration path from {@link ConfigData}.
 * @param key Dot-separated configuration key.
 * @returns The configuration value associated with the specified key.
 *
 * @throws {Error}
 * - If {@link Load} has not been called.
 * - If the specified configuration key does not exist.
 *
 * @example
 * ```ts
 * const appName = Config("app.name");
 * // string
 * ```
 *
 * @example
 * ```ts
 * const host = Config("database.mysql.host");
 * // string
 * ```
 *
 * @example
 * ```ts
 * const debug = Config("app.debug");
 * // boolean
 * ```
 */

const Config = <P extends DotPath<ConfigData>>(key: P): PathValue<ConfigData, P> => {
    return (ConfigLoader as any).get(key) as PathValue<ConfigData, P>;
};

export { Load, LoadConfig, ConfigData }

export default Config