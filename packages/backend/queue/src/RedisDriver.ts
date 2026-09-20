import Config from "@algobitx/config-loader";
import Driver, { ConsumerCallback, Job } from "./Driver";
import { QueueKey } from "./DefineConfig";
import Consumer from "./Consumer";
import Serializer from "./Serializer";

class RedisDriver<TJob extends Job> extends Driver<TJob> {
    private static client: any;
    protected override topic: string;
    protected override group: string;
    protected override retryInterval: number;
    private serializer = new Serializer<TJob>()

    constructor(queue: QueueKey) {
        super();
        this.topic = Config(`queue.${queue}.topic`);
        this.group = Config(`queue.${queue}.group`);
        this.retryInterval = Config(`queue.${queue}.retryInterval`);

    }


    override async push(job: TJob): Promise<void> {
        const fields = this.serializer.serialize(job);
        const redisFields = this.toRedisFields(fields);
        await RedisDriver.client.xadd(
            this.topic,
            "*",
            ...redisFields
        );
    }

    override async pull(consumer: ConsumerCallback<TJob>): Promise<void> {
        await this.ensureConsumerGroup();
        let lastRecovery = Date.now();

        while (true) {
            const result = await RedisDriver.client.xreadgroup(
                "GROUP",
                this.group,
                this.consumerId,
                "COUNT",
                1,
                "BLOCK",
                5000,
                "STREAMS",
                this.topic,
                ">"
            );

            const now = Date.now();

            if (
                now - lastRecovery >=
                this.retryInterval
            ) {
                await this.recover(consumer);
                lastRecovery = Date.now();
            }

            if (!result)
                continue;

            for (const [, messages] of result) {
                for (const [id, fields] of messages) {
                    await this.process(
                        id,
                        fields,
                        consumer,
                        1
                    );
                }
            }
        }
    }

    // override async pull(consumer: (job: TJob, meta: { attempt: number; }) => void | Promise<void>): Promise<void> {

    // }


    private async ensureConsumerGroup(): Promise<void> {
        try {
            await RedisDriver.client.xgroup(
                "CREATE",
                this.topic,
                this.group,
                "0",
                "MKSTREAM"
            );
        } catch (error) {
            if (
                error instanceof Error &&
                error.message.includes(
                    "BUSYGROUP"
                )
            ) {
                return;
            }

            throw error;
        }
    }

    private async process(
        id: string,
        fields: string[],
        consumer: ConsumerCallback<TJob>,
        attempt: number
    ): Promise<void> {
        const job = this.serializer.deserialize(this.fromRedisFields(fields));
        await consumer(job, { attempt });

        await RedisDriver.client.xack(
            this.topic,
            this.group,
            id
        );
    }

    private async recover(
        consumer: any
    ): Promise<void> {
        let cursor = "0-0";

        do {
            const result =
                await RedisDriver.client.xautoclaim(
                    this.topic,
                    this.group,
                    this.consumerId,
                    this.retryInterval,
                    cursor,
                    "COUNT",
                    10
                );

            const nextCursor = result[0];
            const messages = result[1];

            for (const [id, fields] of messages) {
                try {
                    const attempt =
                        await this.getAttempt(id);

                    await this.process(
                        id,
                        fields,
                        consumer,
                        attempt
                    );
                } catch {
                    // Keep the message pending.
                }
            }

            cursor = nextCursor;
        } while (cursor !== "0-0");
    }

    private async getAttempt(
        id: string
    ): Promise<number> {
        const result =
            await RedisDriver.client.xpending(
                this.topic,
                this.group,
                id,
                id,
                1
            );

        const entry = result[0];

        if (!entry)
            return 1;

        return entry[3];
    }

    private toRedisFields(
        data: Record<string, string>
    ): string[] {
        const fields: string[] = [];

        for (const [key, value] of Object.entries(data)) {
            fields.push(key, value);
        }

        return fields;

    }
    private fromRedisFields(
        fields: string[]
    ): Record<string, string> {
        const data: Record<string, string> = {};

        for (let index = 0; index < fields.length; index += 2) {
            const key = fields[index];
            const value = fields[index + 1];

            if (
                key === undefined ||
                value === undefined
            ) {
                throw new Error(
                    "Invalid Redis stream message."
                );
            }

            data[key] = value;
        }

        return data;
    }

}

export default RedisDriver