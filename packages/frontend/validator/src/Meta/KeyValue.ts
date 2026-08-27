import { MetaRecord } from ".";
import AcceptedUnless from "../Rules/Internal/AcceptedUnless";

const KeyValue = {
    accepted_unless: { validate: AcceptedUnless, params: 2, type: 'internal' },
    declined_unless: { validate: (value: unknown, ...params: unknown[]) => true, params: 2, type: 'internal' },
    required_unless: { validate: (value: unknown, ...params: unknown[]) => true, params: 2, type: 'internal' },
} as const satisfies MetaRecord;

export default KeyValue

