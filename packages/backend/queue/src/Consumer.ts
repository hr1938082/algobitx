import { QueueKey } from "./DefineConfig";
import { ConsumerMeta, Job } from "./Driver";
import DriverFactory from "./DriverFactory";

abstract class Consumer<TJob extends Job> {
    protected queue: QueueKey = 'default';

    async start() {
        const driver = DriverFactory<TJob>(this.queue);
        await driver.pull(this.handle);
    }

    abstract handle(job: TJob, meta: ConsumerMeta): void | Promise<void>
}

export default Consumer;