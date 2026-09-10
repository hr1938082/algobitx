import { basename, dirname, extname, join, resolve } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import ConfigData from "./ConfigData";
import { DotPath, PathValue } from ".";
import TypeGen from "@algobitx/type-gen";
import PlainObject from "@algobitx/validator/Rules/PlainObject";
import Validator, { Rules } from "@algobitx/validator";

class ConfigLoader {
    private static loaded = false;
    private static readonly READABLE_EXTENSIONS = [
        ".js",
        ".ts",
    ];

    private static config: ConfigData;

    private static getBaseDir() {
        const fileName = process.argv[1] && !process.argv[1].startsWith("-")
            ? process.argv[1]
            : require.main?.filename;

        if (!fileName) throw new Error('Could not determine executed file.');

        return dirname(resolve(fileName));
    }

    private static loadENV() {
        const basePath = this.getBaseDir();
        const envPath = join(basePath, '../.env');

        if (!existsSync(envPath)) {
            throw new Error(`.env file not found at path: ${envPath}`);
        }

        process.env['APP_DIR'] = basePath;

        const content = readFileSync(envPath, 'utf8');
        const lines = content.split('\n');

        for (const raw of lines) {
            const line = raw.trim();
            if (!line || line.startsWith('#')) continue;

            const m = line.match(/^([\w.-]+)\s*=\s*(.*)$/);
            if (!m) continue;

            let value = m[2].trim();

            const shouldTrimValue = (value.startsWith('"') && value.endsWith('"'))
                || (value.startsWith("'") && value.endsWith("'"));

            if (shouldTrimValue) {
                value = value.slice(1, -1);
            }

            const key = m[1];
            process.env[key] ??= value;
        }
    }

    private static deepFreeze(obj: unknown) {
        if (obj && PlainObject(obj) && !Object.isFrozen(obj)) {
            Object.freeze(obj);

            for (const value of Object.values(obj)) {
                ConfigLoader.deepFreeze(value);
            }
        }
    }

    static defineConfig<T extends object>(config: { name: string, values: T, rules?: Rules<T> }) {
        if (config.rules) {
            const validated = Validator.define({
                values: config.values,
                rules: config.rules
            }).validate();
            if (validated.failed) throw new Error(
                `Config validation failed: ${JSON.stringify(validated.errors)}`
            );
        }
        this.config[config.name] = config.values as unknown as ConfigData;
    }

    static loadConfig() {
        if (this.config) return;

        this.config = {};

        const appDir = process.env.APP_DIR;

        if (!appDir) throw new Error(
            "APP_DIR is not initialized. Call Load() first."
        );

        const configDir = join(appDir, 'configs');

        if (!existsSync(configDir)) {
            throw new Error(`ConfigLoader directory not found: ${configDir}`);
        }

        const files = readdirSync(configDir)
            .filter(file => this.READABLE_EXTENSIONS.includes(extname(file).toLowerCase()));

        for (const file of files) {
            const fullPath = join(configDir, file);
            const key = basename(file, extname(file));

            if (Object.hasOwn(this.config, key)) throw new Error(
                `Duplicate config name detected: ${key}`
            );

            require(fullPath);
        }

        this.config.app = { ...(this.config.app ?? {}), dir: appDir };

        this.deepFreeze(this.config);

    }

    static load() {
        if (this.loaded) return;

        this.loadENV()
        this.loadConfig();

        if (process.env.NODE_ENV !== 'production') {
            TypeGen.writeToFile(
                this.config,
                {
                    export: {
                        name: 'ConfigData',
                        default: true
                    },
                    write: {
                        path: __dirname,
                        comparison: true
                    }
                }
            )
        }

        this.loaded = true;
    }

    private static get<P extends DotPath<ConfigData>>(path: P): PathValue<ConfigData, P> {
        if (!this.config) throw new Error("ConfigLoader not initialized. Call ConfigLoader.load() first.");
        const parts = String(path).split(".");
        let cur: unknown = this.config;
        for (const seg of parts) {
            if (cur && typeof cur === "object" && Object.hasOwn(cur, seg)) {
                cur = (cur as Record<string, unknown>)[seg];
            }
            else {
                return undefined as PathValue<ConfigData, P>;
            }
        }
        return cur as PathValue<ConfigData, P>;
    }
}

export default ConfigLoader