import Config from "@algobitx/config-loader"
import { DriverConstructor, Job, QueueKey } from "@algobitx/queue-driver";

class DriverFactory {
    private static driver: Map<QueueKey, DriverConstructor> = new Map();

    static register(key: QueueKey, driver: DriverConstructor) {
        this.driver.set(key, driver);
    }

    static create<TJob extends Job>(key: QueueKey) {
        const type = Config(`queue.${key}.driver`);

        const driver = this.driver.get(key);
        if (!driver) throw new Error(`Driver [${type}] is not registered.`);

        return new driver<TJob>(key);
    }
}


export default DriverFactory