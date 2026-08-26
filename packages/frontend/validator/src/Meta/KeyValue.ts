import { MetaRecord } from ".";

const KeyValue = {
    accepted_unless: { validate: (value: unknown) => true, params: 2 },
    declined_unless: { validate: (value: unknown) => true, params: 2 },
    required_unless: { validate: (value: unknown) => true, params: 2 },
} as const satisfies MetaRecord;

export default KeyValue

