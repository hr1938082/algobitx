import { QueueKey } from "./DefineConfig";
import DriverFactory from "./DriverFactory";

abstract class Producer {
    protected queue: QueueKey = 'default';

    static async dispatch<TArgs extends unknown[]>(
        this: new (...args: TArgs) => Producer,
        ...args: TArgs
    ) {
        const producer = new this(...args);
        await DriverFactory(producer.queue).push(producer);
    }

}

export default Producer