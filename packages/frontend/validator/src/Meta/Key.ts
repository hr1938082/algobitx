import { MetaRecord } from ".";

const Key = {
    accepted_if: { validate: (value: unknown) => true, params: 1 },
    declined_if: { validate: (value: unknown) => true, params: 1 },
    required_if: { validate: (value: unknown) => true, params: 1 },
    required_if_accepted: { validate: (value: unknown) => true, params: 1 },
    required_if_any: { validate: (value: unknown) => true, params: 1 },
    required_if_declined: { validate: (value: unknown) => true, params: 1 },
    required_if_not: { validate: (value: unknown) => true, params: 1 },
    required_if_not_any: { validate: (value: unknown) => true, params: 1 },
    same: { validate: (value: unknown) => true, params: 1 },
} as const satisfies MetaRecord;

export default Key