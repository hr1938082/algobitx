import { MetaRecord } from ".";
import AcceptedIfAccepted from "../Rules/Internal/AcceptedIfAccepted";
import DeclinedIfDeclined from "../Rules/Internal/DeclinedIfDeclined";
import RequiredIfRequired from "../Rules/Internal/RequiredIfRequired";
import RequiredIfAccepted from "../Rules/Internal/RequiredIfAccepted";
import RequiredIfDeclined from "../Rules/Internal/RequiredIfDeclined";
import Same from "../Rules/Internal/Same";

const Key = {
    accepted_if_accepted: { validate: AcceptedIfAccepted, params: 1, type: 'internal' },
    declined_if_declined: { validate: DeclinedIfDeclined, params: 1, type: 'internal' },
    required_if_required: { validate: RequiredIfRequired, params: 1, type: 'internal' },
    required_if_accepted: { validate: RequiredIfAccepted, params: 1, type: 'internal' },
    required_if_declined: { validate: RequiredIfDeclined, params: 1, type: 'internal' },
    same: { validate: Same, params: 1, type: 'internal' },
} as const satisfies MetaRecord;

export default Key