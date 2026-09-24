import TimeoutException from "@algobitx/exception/server/TimeoutException";
import Driver, { ConsumerCallback, Job, QueueKey } from "@algobitx/queue-driver";
import Redis, { IORedis, RedisKeys } from "@algobitx/redis";

type RedisStreamMessage = [
    id: string,
    fields: string[]
];

type RedisStreamResult = [
    stream: string,
    messages: RedisStreamMessage[]
][];

type RedisAutoClaimResult = [
    nextCursor: string,
    messages: Array<
        [
            id: string,
            fields: string[]
        ]
    >
];

type PendingEntry = [
    id: string,
    consumer: string,
    idleTime: number,
    deliveryCount: number
];

type PendingResult = PendingEntry[];

class RedisDriver<TJob extends Job> extends Driver<TJob> {
    private client: IORedis;

    constructor(queue: QueueKey) {
        super(queue);
        this.client = Redis.connection(this.connection as RedisKeys);
    }

    override async push(job: TJob): Promise<void> {
        const fields = this.serializer.serialize(job);
        const redisFields = this.toRedisFields(fields);
        await this.client.xadd(
            this._topic,
            "*",
            ...redisFields
        );
    }

    override async pull(consumer: ConsumerCallback<TJob>): Promise<void> {
        await this.ensureConsumerGroup();
        let lastRecovery = Date.now();

        while (true) {
            const now = Date.now();
            if (
                now - lastRecovery >=
                this.retryInterval
            ) {
                await this.recover(consumer);
                lastRecovery = Date.now();
            }

            const result = await this.client.xreadgroup(
                "GROUP",
                this.group,
                this.consumerId,
                "COUNT",
                1,
                "BLOCK",
                5000,
                "STREAMS",
                this._topic,
                ">"
            ) as RedisStreamResult;

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

    private async ensureConsumerGroup(): Promise<void> {
        try {
            await this.client.xgroup(
                "CREATE",
                this._topic,
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
        try {
            await Promise.race([
                consumer(job, { attempt }),
                new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new TimeoutException(this.processingTimeout));
                    }, this.processingTimeout)
                })
            ])
        } catch (error) {
            if (error instanceof TimeoutException) {
                process.exit(1);
            }

            throw error;
        }

        await this.client.xack(
            this._topic,
            this.group,
            id
        );
    }

    private async recover(
        consumer: ConsumerCallback<TJob>
    ): Promise<void> {
        let cursor = "0-0";

        do {
            const result = await this.client.xautoclaim(
                this._topic,
                this.group,
                this.consumerId,
                this.processingTimeout,
                cursor,
                "COUNT",
                10
            ) as RedisAutoClaimResult;

            const nextCursor = result[0];
            const messages = result[1];

            for (const [id, fields] of messages) {
                const attempt = await this.getAttempt(id);

                if (attempt > this.maxAttempt) {
                    await this.fail(id, fields, attempt);
                    continue;
                }

                try {
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
        const result = await this.client.xpending(
            this._topic,
            this.group,
            id,
            id,
            1
        ) as PendingResult;

        const entry = result[0];

        if (!entry)
            return 1;

        return entry[3];
    }

    private async fail(id: string, fields: string[], attempt: number): Promise<void> {

        await this.client.xadd(
            `${this._topic}:failed`,
            "*",
            ...this.toRedisFields({
                ...this.fromRedisFields(fields),
                originalId: id,
                failedAttempt: attempt.toString()
            })
        );
        await this.client.xack(
            this._topic,
            this.group,
            id
        );
    }

    async retryFailed() {
        const failedTopic = `${this._topic}:failed`;

        const latest = await this.client.xrevrange(
            failedTopic,
            "+",
            "-",
            "COUNT",
            1
        ) as RedisStreamMessage[];

        if (latest.length === 0) return 0;

        const maxId = latest[0]?.[0];

        if (!maxId) return 0;

        let cursor = "0-0";
        let retried = 0;

        while (true) {
            const result = await this.client.xrange(
                failedTopic,
                cursor,
                maxId,
                "COUNT",
                100
            ) as RedisStreamMessage[];

            if (result.length === 0) break;

            for (const [failedId, fields] of result) {
                await this.client.multi()
                    .xadd(
                        this._topic,
                        "*",
                        ...fields
                    ).xdel(
                        failedTopic,
                        failedId
                    ).exec();

                retried++;
            }

            const lastId = result[result.length - 1]?.[0];

            if (!lastId || lastId === maxId) {
                break;
            }

            cursor = lastId;
        }

        return retried;
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