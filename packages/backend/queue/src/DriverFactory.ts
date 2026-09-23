import Config from "@algobitx/config-loader"
import Driver, { DriverConstructor, DriverType, Job, QueueKey } from "@algobitx/queue-driver";

class DriverFactory {
    private static driver: Map<DriverType, DriverConstructor> = new Map();
    private static driverConnection: Map<QueueKey, Driver<Job>> = new Map();

    static register(key: DriverType, driver: DriverConstructor) {
        if (this.driver.has(key)) throw new Error("Driver already Registered");
        this.driver.set(key, driver);
    }

    static create<TJob extends Job>(key: QueueKey) {
        const type = Config(`queue.${key}.driver`);

        let driverConnection = this.driverConnection.get(key);
        if (!driverConnection) {
            const driver = this.driver.get(type);
            if (!driver) throw new Error("Driver not Register");

            driverConnection = new driver<TJob>(key);
            this.driverConnection.set(key, driverConnection);
        }

        return driverConnection as Driver<TJob>;
    }
}


export default DriverFactory