import Config from "@algobitx/config-loader"
import { QueueKey } from "./DefineConfig"
import Driver, { Job } from "./Driver"
import RedisDriver from "./RedisDriver";

const DriverFactory = <TJob extends Job>(queue: QueueKey): Driver<TJob> => {
    const driver = Config(`queue.${queue}.driver`);
    switch (driver) {
        case 'redis':
            return new RedisDriver<TJob>(queue);
        case 'kafka':
            return new RedisDriver<TJob>(queue);
        default:
            throw new Error(`Unknown driver: ${driver}`);
    }
}

export default DriverFactory