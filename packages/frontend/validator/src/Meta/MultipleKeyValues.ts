import AcceptedIf from "../Rules/Private/AcceptedIf";
import AcceptedIfNot from "../Rules/Private/AcceptedIfNot";
import DeclinedIf from "../Rules/Private/DeclinedIf";
import DeclinedIfNot from "../Rules/Private/DeclinedIfNot";
import RequiredIf from "../Rules/Private/RequiredIf";
import RequiredIfNot from "../Rules/Private/RequiredIfNot";

export type MultipleKeyValuesRulesValue<T extends Record<string, unknown>> = [keyof T, unknown][] |
[keyof T, unknown];

const MultipleKeyValues = {
    required_if: RequiredIf,
    required_if_not: RequiredIfNot,
    accepted_if: AcceptedIf,
    accepted_if_not: AcceptedIfNot,
    declined_if: DeclinedIf,
    declined_if_not: DeclinedIfNot,
} as const;

export default MultipleKeyValues

