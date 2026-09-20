import { PathValue, ConfigData } from "@algobitx/config-loader";
import { randomUUID } from "node:crypto";

export type DriverType = 'redis' | 'kafka';

export interface Job { }

export interface ConsumerMeta {
    attempt: number
}

export type ConsumerCallback<TJob extends Job> =
    (job: TJob, meta: ConsumerMeta) => void | Promise<void>;

export type QueueKey = Extract<keyof PathValue<ConfigData, 'queue'>, string>

export type DriverConstructor = {
    new <TJob extends Job>(
        queue: QueueKey
    ): Driver<TJob>;
};

class Serializer<TJob extends Job> {
    serialize(job: TJob) {
        const fields: Record<string, string> = {};

        for (const [key, value] of Object.entries(job)) {
            if (value === undefined) continue;

            fields[key] = JSON.stringify(value);
        }

        return fields;
    }

    deserialize(data: Record<string, string>): TJob {
        const job: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(data)) {
            job[key] = JSON.parse(value);
        }

        return job as TJob;
    }
}

abstract class Driver<TJob extends Job> {
    protected abstract readonly topic: string;
    protected abstract readonly group: string;
    protected readonly consumerId: string = randomUUID();
    protected abstract readonly retryInterval: number;
    protected serializer = new Serializer<TJob>()
    abstract push(job: TJob): Promise<void>
    abstract pull(consumer: ConsumerCallback<TJob>): Promise<void>
}

export default Driver