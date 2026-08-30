import AcceptedIfAccepted from "../Rules/Private/AcceptedIfAccepted";
import DeclinedIfDeclined from "../Rules/Private/DeclinedIfDeclined";
import RequiredIfRequired from "../Rules/Private/RequiredIfRequired";
import RequiredIfAccepted from "../Rules/Private/RequiredIfAccepted";
import RequiredIfDeclined from "../Rules/Private/RequiredIfDeclined";

export type MultipleKeyRuleValue<T extends Record<string, unknown>> = (keyof T)[];

const MultipleKeys = {
    accepted_if_accepted: AcceptedIfAccepted,
    declined_if_declined: DeclinedIfDeclined,
    required_if_required: RequiredIfRequired,
    required_if_accepted: RequiredIfAccepted,
    required_if_declined: RequiredIfDeclined,
} as const;

export default MultipleKeys