import AcceptedIfAccepted from "../Rules/Private/AcceptedIfAccepted";
import DeclinedIfDeclined from "../Rules/Private/DeclinedIfDeclined";
import RequiredIfRequired from "../Rules/Private/RequiredIfRequired";
import RequiredIfAccepted from "../Rules/Private/RequiredIfAccepted";
import RequiredIfDeclined from "../Rules/Private/RequiredIfDeclined";
import RequiredIfNotRequired from "../Rules/Private/RequiredIfNotRequired";
import AcceptedIfRequired from "../Rules/Private/AcceptedIfRequired";
import AcceptedIfNotRequired from "../Rules/Private/AcceptedIfNotRequired";
import AcceptedIfDeclined from "../Rules/Private/AcceptedIfDeclined";
import DeclinedIfAccepted from "../Rules/Private/DeclinedIfAccepted";
import DeclinedIfRequired from "../Rules/Private/DeclinedIfRequired";
import DeclinedIfNotRequired from "../Rules/Private/DeclinedIfNotRequired";
import { Path } from "..";
import Same from "../Rules/Private/Same";

export type MultipleKeyRuleValue<T extends object> = Path<T> | Path<T>[];

const MultipleKeys = {
    accepted_if_accepted: AcceptedIfAccepted,
    accepted_if_required: AcceptedIfRequired,
    accepted_if_not_required: AcceptedIfNotRequired,
    accepted_if_declined: AcceptedIfDeclined,
    declined_if_declined: DeclinedIfDeclined,
    declined_if_accepted: DeclinedIfAccepted,
    declined_if_required: DeclinedIfRequired,
    declined_if_not_required: DeclinedIfNotRequired,
    required_if_required: RequiredIfRequired,
    required_if_not_required: RequiredIfNotRequired,
    required_if_accepted: RequiredIfAccepted,
    required_if_declined: RequiredIfDeclined,
    same: Same
} as const;

export default MultipleKeys