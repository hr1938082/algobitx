import { basename, dirname, extname, join, resolve } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import ConfigData from "./ConfigData";
import { DotPath, PathValue } from ".";
import TypeGen from "@algobitx/type-gen";

class ConfigLoader {
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

            process.env[key] = value;
        }
    }

    private static deepFreeze<T>(obj: T): T {
        if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
            Object.freeze(obj);

            for (const value of Object.values(obj)) {
                ConfigLoader.deepFreeze(value);
            }
        }

        return obj;
    }

    static loadConfig() {
        let configDir = join(process.env.APP_DIR as string, 'configs');

        if (!existsSync(configDir)) {
            throw new Error(`ConfigLoader directory not found: ${configDir}`);
        }

        const files = readdirSync(configDir)
            .filter(file => this.READABLE_EXTENSIONS.includes(extname(file).toLowerCase()));

        const cfg: ConfigData = {};

        for (const file of files) {
            const fullPath = join(configDir, file);
            const key = basename(file, extname(file));
            const mod = require(fullPath);
            cfg[key] = "default" in mod ? mod.default : mod;
        }

        cfg.app = { ...(cfg.app ?? {}), dir: process.env["APP_DIR"] };

        this.config = this.deepFreeze(cfg);
    }

    static load() {
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
    }

    private static get<P extends DotPath<ConfigData>>(path: P): PathValue<ConfigData, P> {
        if (!this.config) throw new Error("ConfigLoader not initialized. Call ConfigLoader.load() first.");
        const parts = String(path).split(".");
        let cur: any = this.config;
        for (const seg of parts) {
            if (cur && typeof cur === "object" && seg in cur) {
                cur = cur[seg];
            }
            else {
                return undefined as PathValue<ConfigData, P>;
            }
        }
        return cur;
    }
}

export default ConfigLoader