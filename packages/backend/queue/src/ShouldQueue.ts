import { ConsumerMeta, Job, QueueKey } from "@algobitx/queue-driver";
import DriverFactory from "./DriverFactory";

abstract class ShouldQueue<TJob extends Job> {
    protected queue: QueueKey = 'default';

    async start() {
        const driver = DriverFactory.create<TJob>(this.queue);
        await driver.pull(this.handle);
    }

    abstract handle(job: TJob, meta: ConsumerMeta): void | Promise<void>

    static async dispatch<TJob extends Job, TArgs extends unknown[]>(
        this: new (...args: TArgs) => ShouldQueue<TJob>,
        ...args: TArgs
    ) {
        const producer = new this(...args);
        const driver = DriverFactory.create(producer.queue);
        driver.topic = producer.constructor.name;
        await driver.push(producer);
    }
}

export default ShouldQueue;