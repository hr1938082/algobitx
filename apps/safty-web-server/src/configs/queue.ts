import DefineConfig from "@algobitx/queue/defineConfig";

DefineConfig({
    default: {
        driver: 'redis',
        topic: 'default',
        group: 'default-group',
        retryInterval: 5000
    }
})