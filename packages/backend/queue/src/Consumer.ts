import { ConsumerMeta, Job, QueueKey } from "@algobitx/queue-driver";
import DriverFactory from "./DriverFactory";

abstract class Consumer<TJob extends Job> {
    protected queue: QueueKey = 'default';
    protected topic: string = this.constructor.name;
    private driver = DriverFactory.create<TJob>(this.queue);

    async start() {
        this.driver.topic = this.topic;
        this.driver.group = this.constructor.name;
        await this.driver.pull(this.handle.bind(this));
    }


    abstract handle(job: TJob, meta: ConsumerMeta): void | Promise<void>
}

export default Consumer;