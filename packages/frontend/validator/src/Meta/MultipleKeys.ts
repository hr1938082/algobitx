import AcceptedIfAccepted from "../Rules/Private/AcceptedIfAccepted";
import DeclinedIfDeclined from "../Rules/Private/DeclinedIfDeclined";
import RequiredIfRequired from "../Rules/Private/RequiredIfRequired";
import RequiredIfAccepted from "../Rules/Private/RequiredIfAccepted";
import RequiredIfDeclined from "../Rules/Private/RequiredIfDeclined";
import RequiredIfNotRequired from "../Rules/Private/RequiredIfNotRequired";
import AcceptedIfRequired from "../Rules/Private/AcceptedIfRequired";
import AcceptedIfNotRequired from "../Rules/Private/AcceptedIfNotRequired";

export type MultipleKeyRuleValue<T extends Record<string, unknown>> = (keyof T)[];

const MultipleKeys = {
    required_if_required: RequiredIfRequired,
    required_if_not_required: RequiredIfNotRequired,
    required_if_accepted: RequiredIfAccepted,
    required_if_declined: RequiredIfDeclined,
    accepted_if_accepted: AcceptedIfAccepted,
    accepted_if_required: AcceptedIfRequired,
    accepted_if_not_required: AcceptedIfNotRequired,
    accepted_if_declined: '',
    declined_if_declined: DeclinedIfDeclined,
    declined_if_accepted: '',
    declined_if_required: '',
    declined_if_not_required: ''
} as const;

export default MultipleKeys