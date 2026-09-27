import DefineConfig from "@algobitx/queue/defineConfig";

DefineConfig({
    default: {
        driver: 'redis',
        connection: 'queue',
        retryInterval: 5000,
        maxAttempt: 3,
        processingTimeout: 10000
    }
})