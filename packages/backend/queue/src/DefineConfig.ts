import { defineConfig } from "@bitx/config-loader";
import { DriverType } from "@bitx/queue-driver";

interface QueueConfig {
    driver: DriverType;
    connection: string;
    retryInterval: number;
    maxAttempt: number;
    processingTimeout: number;
}

interface QueueKeyConfig {
    default: QueueConfig;
    [key: string]: QueueConfig
}

const DefineConfig = (config: QueueKeyConfig) => {
    defineConfig({
        name: 'queue',
        values: config,
        rules: {
            "*.driver": { required: true, string: true, enum: ['redis', 'kafka'] },
            '*.connection': { required: true, string: true },
            '*.retryInterval': { required: true, integer: true, min: 1000 },
            '*.maxAttempt': { required: true, integer: true, min: 1 },
            '*.processingTimeout': { required: true, integer: true, min: 10000 }
        }
    });
}

export default DefineConfig