import DriverFactory from "./DriverFactory";
import { QueueKey } from '@algobitx/queue-driver'

abstract class Producer {
    protected queue: QueueKey = 'default';

    static async dispatch<TArgs extends unknown[]>(
        this: new (...args: TArgs) => Producer,
        ...args: TArgs
    ) {
        const producer = new this(...args);
        const driver = DriverFactory.create(producer.queue);
        await driver.push(producer);
    }

}

export default Producer