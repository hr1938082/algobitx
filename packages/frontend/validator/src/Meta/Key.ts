import { MetaRecord } from ".";
import AcceptedIf from "../Rules/Internal/AcceptedIf";
import DeclinedIf from "../Rules/Internal/DeclinedIf";
import RequiredIf from "../Rules/Internal/RequiredIf";

const Key = {
    accepted_if: { validate: AcceptedIf, params: 1, type: 'internal' },
    declined_if: { validate: DeclinedIf, params: 1, type: 'internal' },
    required_if: { validate: RequiredIf, params: 1, type: 'internal' },
    required_if_accepted: { validate: (value: unknown) => true, params: 1, type: 'internal' },
    required_if_any: { validate: (value: unknown) => true, params: 1, type: 'internal' },
    required_if_declined: { validate: (value: unknown) => true, params: 1, type: 'internal' },
    required_if_not: { validate: (value: unknown) => true, params: 1, type: 'internal' },
    required_if_not_any: { validate: (value: unknown) => true, params: 1, type: 'internal' },
    same: { validate: (value: unknown) => true, params: 1, type: 'internal' },
} as const satisfies MetaRecord;

export default Key