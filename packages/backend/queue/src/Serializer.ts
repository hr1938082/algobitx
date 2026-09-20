import { Job } from "./Driver";

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

export default Serializer;