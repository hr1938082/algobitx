import { MetaRecord } from ".";
import AcceptedUnless from "../Rules/Internal/AcceptedUnless";
import DeclinedUnless from "../Rules/Internal/DeclinedUnless";
import RequiredUnless from "../Rules/Internal/RequiredUnless";

const KeyValue = {
    accepted_unless: { validate: AcceptedUnless, params: 2, type: 'internal' },
    declined_unless: { validate: DeclinedUnless, params: 2, type: 'internal' },
    required_unless: { validate: RequiredUnless, params: 2, type: 'internal' },
} as const satisfies MetaRecord;

export default KeyValue

