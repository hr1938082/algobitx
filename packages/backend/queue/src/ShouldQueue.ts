import { ConsumerMeta, Job, QueueKey } from "@algobitx/queue-driver";
import DriverFactory from "./DriverFactory";

abstract class ShouldQueue implements Job {
    protected queue: QueueKey = 'default';
    private driver = DriverFactory.create<ShouldQueue>(this.queue);

    async start() {
        this.driver.topic = this.constructor.name;
        this.driver.group = this.constructor.name;
        await this.driver.pull(this.handle.bind(this));
    }

    abstract handle(job: ShouldQueue, meta: ConsumerMeta): void | Promise<void>

    static async dispatch<TArgs extends unknown[]>(
        this: new (...args: TArgs) => ShouldQueue,
        ...args: TArgs
    ) {
        const producer = new this(...args);
        producer.driver.topic = this.name;
        await producer.driver.push(producer);
    }
}

export default ShouldQueue;