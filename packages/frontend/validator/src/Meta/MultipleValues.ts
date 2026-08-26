import { MetaRecord } from ".";

const MultipleValues = {
    contains: { validate: (value: unknown) => true, params: Number.MAX_SAFE_INTEGER }
} as const satisfies MetaRecord;

export default MultipleValues