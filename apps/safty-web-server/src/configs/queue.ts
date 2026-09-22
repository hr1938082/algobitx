import DefineConfig from "@algobitx/queue/defineConfig";

DefineConfig({
    default: {
        driver: 'redis',
        connection: 'queue',
        topic: 'default',
        group: 'default-group',
        retryInterval: 5000,
        maxAttempt: 3,
        processingTimeout: 10000
    }
})