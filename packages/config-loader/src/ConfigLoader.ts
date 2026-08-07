import { basename, dirname, extname, join, resolve } from "node:path";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import ConfigData from "./ConfigData";
import { DotPath, PathValue } from ".";
import TypeGen from "@algobitx/type-gen";

class ConfigLoader {

    private static config: Record<string, any> = {};

    private static getBaseDir() {
        let baseFileName: string | null = null;
        if (require.main?.filename) baseFileName = resolve(require.main.filename);

        if (process.argv[1] && !process.argv[1].startsWith("-")) baseFileName = resolve(process.argv[1]);

        if (!baseFileName) throw new Error('Could not determine executed file.');

        return dirname(baseFileName);
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

            if (shouldTrimValue) value.slice(1, -1);

            const key = m[1];

            process.env[key] = value;
        }
    }

    static loadConfig() {
        let configDir = join(process.env.APP_DIR as string, 'configs');

        if (!existsSync(configDir)) {
            throw new Error(`ConfigLoader directory not found: ${configDir}`);
        }

        const readableEXT = [".js", ".cjs", ".mjs", ".ts"];

        const files = readdirSync(configDir).filter(file => readableEXT.includes(extname(file).toLowerCase()));

        const cfg: Record<string, any> = {};

        for (const file of files) {
            const fullPath = join(configDir, file);
            const key = basename(file, extname(file));
            const mod = require(fullPath);
            cfg[key] = mod.default || mod;
        }

        cfg.app = { ...(cfg.app ?? {}), dir: process.env["APP_DIR"] };

        this.config = cfg as ConfigData;
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
                        type: 'interface',
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
        if (!Object.keys(this.config).length) throw new Error("ConfigLoader not initialized. Call ConfigLoader.load() first.");
        const parts = String(path).split(".");
        let cur: any = this.config;
        let msg = ``;
        for (const seg of parts) {
            msg += msg.length === 0 ? seg : ` ${seg}`;
            if (cur && typeof cur === "object" && seg in cur) {
                cur = cur[seg];
            }
            else {
                cur = undefined;
            }
        }
        return cur;
    }
}

export default ConfigLoader