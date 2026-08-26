import { MetaRecord } from ".";

const Value = {
    contains: { validate: (value: unknown, params: string[]) => true, params: 1 },
    min: { validate: (value: unknown, params: string[]) => true, params: 1 },
    max: { validate: (value: unknown, params: string[]) => true, params: 1 },
    regex: { validate: (value: unknown, params: string[]) => true, params: 1 },
    date_equals_to: { validate: (value: unknown, params: string[]) => true, params: 1 },
    date_greater_than: { validate: (value: unknown, params: string[]) => true, params: 1 },
    date_greater_than_equals_to: { validate: (value: unknown, params: string[]) => true, params: 1 },
    date_less_than: { validate: (value: unknown, params: string[]) => true, params: 1 },
    date_less_than_equals_to: { validate: (value: unknown, params: string[]) => true, params: 1 },
} as const satisfies MetaRecord;

export default Value