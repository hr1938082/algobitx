import { randomUUID } from "node:crypto";

export type DriverType = 'redis' | 'kafka';

export interface Job { }

export interface ConsumerMeta {
    attempt: number
}

export type ConsumerCallback<TJob extends Job> =
    (job: TJob, meta: ConsumerMeta) => void | Promise<void>;

abstract class Driver<TJob extends Job> {
    protected abstract readonly topic: string;
    protected abstract readonly group: string;
    protected readonly consumerId: string = randomUUID();
    protected abstract readonly retryInterval: number;
    abstract push(job: TJob): Promise<void>
    abstract pull(consumer: ConsumerCallback<TJob>): Promise<void>
}

export default Driver