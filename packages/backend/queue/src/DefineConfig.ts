import { ConfigData, defineConfig, PathValue } from "@algobitx/config-loader";
import { DriverType } from "./Driver";

interface QueueConfig {
    driver: DriverType;
    topic: string;
    group: string;
    retryInterval: number
}

interface QueueKeyConfig {
    default: QueueConfig;
    [key: string]: QueueConfig
}

export type QueueKey = Extract<keyof PathValue<ConfigData, 'redis'>, string>

const DefineConfig = (config: QueueKeyConfig) => {
    defineConfig({
        name: 'queue',
        values: config,
        rules: {
            "*.driver": { required: true, string: true, enum: ['redis', 'kafka'] },
            '*.topic': { required: true, string: true },
            '*.group': { required: true, string: true },
            '*.retryInterval': { required: true, integer: true }
        }
    });
}

export default DefineConfig